import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Board, Card, EstadoServicio, TipoServicio } from '../scrumboard.models';
import { ScrumboardService } from '../scrumboard.service';
import { BoardFiltersComponent } from './board-filters/board-filters.component';
import { ScrumboardCardComponent } from '../card/card.component';
import { AddCardComponent } from './add-card/add-card.component';

@Component({
    selector: 'scrumboard-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        RouterLink,
        NgFor,
        NgIf,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatMenuModule,
        DragDropModule,
        BoardFiltersComponent,
        ScrumboardCardComponent
    ]
})
export class ScrumboardBoardComponent implements OnInit, OnDestroy {
    board: Board = {
        id: '',
        title: '',
        description: '',
        icon: '',
        lists: []
    };
    
    filteredCards: Card[] = [];
    tecnicos: any[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    hiddenLists: string[] = [];

    private readonly HIDDEN_LISTS_KEY = 'scrumboard_hidden_lists';

    lists = [
        {
            id: 'sin-asignar',
            title: EstadoServicio.SIN_ASIGNAR,
            position: 1,
            cards: []
        },
        {
            id: 'pendiente',
            title: EstadoServicio.PENDIENTE,
            position: 2,
            cards: []
        },
        {
            id: 'en-progreso',
            title: EstadoServicio.EN_PROGRESO,
            position: 3,
            cards: []
        },
        {
            id: 'terminado',
            title: EstadoServicio.TERMINADO,
            position: 4,
            cards: []
        }
    ];

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _dialog: MatDialog,
        private _scrumboardService: ScrumboardService
    ) {
        // Cargar listas ocultas del localStorage
        this.loadHiddenListsFromStorage();
    }

    ngOnInit(): void {
        // Obtener el ID del tablero de la URL
        const boardId = this._activatedRoute.snapshot.paramMap.get('boardId');
        if (boardId) {
            // Inicializar el tablero con las listas
            this.board = {
                id: boardId,
                title: this.getTipoServicio(boardId),
                description: '',
                icon: '',
                lists: this.lists
            };

            // Obtener los servicios
            this._scrumboardService.getServices(this.getTipoServicio(boardId))
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(cards => {
                    this.distributeCards(cards);
                    this._changeDetectorRef.markForCheck();
                });

            // Cargar técnicos usando el método unificado
            this._scrumboardService.getTecnicos()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(tecnicos => {
                    this.tecnicos = tecnicos;
                    this._changeDetectorRef.markForCheck();
                });
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Cargar tarjetas
     */
    loadCards(boardId: string): void {
        this._scrumboardService.getServices(this.getTipoServicio(boardId))
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(cards => {
                this.filteredCards = cards;
                this.distributeCards(cards);
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Manejar cambio de filtro de técnico
     */
    onTecnicoFilterChange(tecnicoId: number): void {
        const boardId = this._activatedRoute.snapshot.paramMap.get('boardId');
        if (boardId) {
            this._scrumboardService.getServices(
                this.getTipoServicio(boardId), 
                tecnicoId ? tecnicoId.toString() : undefined
            )
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(cards => {
                this.filteredCards = cards;
                this.distributeCards(cards);
                this._changeDetectorRef.markForCheck();
            });
        }
    }

    /**
     * Filtrar tarjetas
     */
    filterCards(cards: Card[]): void {
        this.filteredCards = cards;
        this.distributeCards(cards);
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Abrir diálogo de nueva tarjeta
     */
    openNewCardDialog(): void {
        const dialogRef = this._dialog.open(AddCardComponent, {
            width: '700px',
            maxHeight: '90vh',
            disableClose: false,
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe((result: Partial<Card>) => {
            if (result) {
                this._scrumboardService.createService(result)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe(() => {
                        const boardId = this._activatedRoute.snapshot.paramMap.get('boardId');
                        if (boardId) {
                            this.loadCards(boardId);
                        }
                    });
            }
        });
    }

    /**
     * Manejar el drop de una tarjeta
     */
    cardDropped(event: CdkDragDrop<Card[]>): void {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );

            const newStatus = this.lists.find(l => l.id === event.container.id)?.title as EstadoServicio;
            const card = event.container.data[event.currentIndex];

            this._scrumboardService.updateServiceStatus(card.id, newStatus)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => {
                    const boardId = this._activatedRoute.snapshot.paramMap.get('boardId');
                    if (boardId) {
                        this.loadCards(boardId);
                    }
                });
        }
    }

    /**
     * Distribuir tarjetas en las listas
     */
    private distributeCards(cards: Card[]): void {
        // Limpiar las listas existentes
        this.lists.forEach(list => list.cards = []);
        
        // Distribuir las tarjetas según su estado
        cards.forEach(card => {
            const list = this.lists.find(l => l.title === card.estado);
            if (list) {
                list.cards.push(card);
            }
        });
    }

    private getTipoServicio(boardId: string): TipoServicio {
        switch (boardId) {
            case 'asistencia-sitio':
                return TipoServicio.ASISTENCIA_SITIO;
            case 'servicio-laboratorio':
                return TipoServicio.SERVICIO_LABORATORIO;
            case 'asistencia-remota':
                return TipoServicio.ASISTENCIA_REMOTA;
            default:
                return null;
        }
    }

    /**
     * Cargar listas ocultas del localStorage
     */
    private loadHiddenListsFromStorage(): void {
        const boardId = this._activatedRoute.snapshot.paramMap.get('boardId');
        if (boardId) {
            const storedLists = localStorage.getItem(`${this.HIDDEN_LISTS_KEY}_${boardId}`);
            if (storedLists) {
                this.hiddenLists = JSON.parse(storedLists);
            }
        }
    }

    /**
     * Guardar listas ocultas en localStorage
     */
    private saveHiddenListsToStorage(): void {
        const boardId = this._activatedRoute.snapshot.paramMap.get('boardId');
        if (boardId) {
            localStorage.setItem(
                `${this.HIDDEN_LISTS_KEY}_${boardId}`, 
                JSON.stringify(this.hiddenLists)
            );
        }
    }

    /**
     * Ocultar lista
     */
    hideList(listId: string): void {
        this.hiddenLists.push(listId);
        this.saveHiddenListsToStorage();
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Mostrar lista
     */
    showList(listId: string): void {
        this.hiddenLists = this.hiddenLists.filter(id => id !== listId);
        this.saveHiddenListsToStorage();
        this._changeDetectorRef.markForCheck();
    }

    isListHidden(listId: string): boolean {
        return this.hiddenLists.includes(listId);
    }

    getListTitle(listId: string): string {
        const list = this.lists.find(l => l.id === listId);
        return list ? list.title : '';
    }
}
