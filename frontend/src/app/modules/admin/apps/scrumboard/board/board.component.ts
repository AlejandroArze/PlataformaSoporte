import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { Board, Card, EstadoServicio, TipoServicio } from '../scrumboard.models';
import { ScrumboardService } from '../scrumboard.service';
import { BoardFiltersComponent } from './board-filters/board-filters.component';
import { ScrumboardCardComponent } from '../card/card.component';
import { AddCardComponent } from './add-card/add-card.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ScrumboardCardDetailsComponent } from '../card/details/details.component';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

interface ListState {
    page: number;
    limit: number;
    total: number;
    loading: boolean;
}

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
        ScrumboardCardComponent,
        MatTooltipModule,
        MatSnackBarModule
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
    selectedTecnicoId: string | null = null;

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

    listStates: { [key: string]: ListState } = {
        'sin-asignar': { page: 1, limit: 10, total: 0, loading: false },
        'pendiente': { page: 1, limit: 10, total: 0, loading: false },
        'en-progreso': { page: 1, limit: 10, total: 0, loading: false },
        'terminado': { page: 1, limit: 10, total: 0, loading: false }
    };

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _dialog: MatDialog,
        private _scrumboardService: ScrumboardService,
        private _snackBar: MatSnackBar
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

            // Cargar todas las tarjetas inicialmente
            this.loadAllCards();

            // Cargar técnicos
            this._scrumboardService.getTecnicos()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(tecnicos => {
                    this.tecnicos = tecnicos;
                    this._changeDetectorRef.markForCheck();
                });

            // Suscribirse a los cambios en las tarjetas
            this._scrumboardService.cards$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(cards => {
                    if (cards.length > 0) {
                        this.filteredCards = cards;
                        this.distributeCards(cards);
                        this._changeDetectorRef.markForCheck();
                    }
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
        this.selectedTecnicoId = tecnicoId ? tecnicoId.toString() : null;
        this.reloadAllLists();
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
            autoFocus: false,
            data: {
                card: {
                    tipo: this.getTipoServicio(this.board.id),
                    estado: 'SIN ASIGNAR',
                    fechaRegistro: new Date().toISOString()
                },
                isEdit: false
            },
            backdropClass: 'cursor-pointer'
        });

        dialogRef.backdropClick().subscribe(() => {
            dialogRef.close();
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.reloadAllLists();
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
            // Obtener la tarjeta y el nuevo estado
            const card = event.previousContainer.data[event.previousIndex];
            const newStatus = this.lists.find(list => list.id === event.container.id)?.title;

            if (newStatus) {
                // Actualizar inmediatamente en la UI
                card.estado = newStatus as EstadoServicio;
                
                // Mover la tarjeta a la nueva lista
                transferArrayItem(
                    event.previousContainer.data,
                    event.container.data,
                    event.previousIndex,
                    event.currentIndex
                );

                // Luego actualizar en el backend
                this._scrumboardService.updateServiceStatus(card.id, newStatus as EstadoServicio)
                    .subscribe({
                        error: (error) => {
                            // Mostrar notificación de error
                            this._snackBar.open(
                                'Error al actualizar el estado. El sistema seguirá intentando sincronizar...', 
                                'Cerrar', 
                                {
                                    duration: 5000,
                                    horizontalPosition: 'end',
                                    verticalPosition: 'top',
                                    panelClass: ['error-snackbar']
                                }
                            );

                            // Intentar actualizar nuevamente en segundo plano
                            this.retryUpdateStatus(card.id, newStatus as EstadoServicio);
                        },
                        complete: () => {
                            // Recargar las listas después de la actualización exitosa
                            this.reloadAllLists();
                        }
                    });
            }
        }
    }

    /**
     * Reintentar actualización de estado
     */
    private retryUpdateStatus(cardId: string, newStatus: EstadoServicio): void {
        // Esperar 3 segundos antes de reintentar
        setTimeout(() => {
            this._scrumboardService.updateServiceStatus(cardId, newStatus)
                .subscribe({
                    error: () => this.retryUpdateStatus(cardId, newStatus), // Reintentar indefinidamente
                    complete: () => this.reloadAllLists()
                });
        }, 3000);
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
                console.error('ID de tablero no válido:', boardId);
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
        if (!this.hiddenLists.includes(listId)) {
            this.hiddenLists.push(listId);
            this.saveHiddenListsToStorage();
            this._changeDetectorRef.markForCheck();
        }
    }

    /**
     * Mostrar lista
     */
    showList(listId: string): void {
        const index = this.hiddenLists.indexOf(listId);
        if (index !== -1) {
            this.hiddenLists.splice(index, 1);
            this.saveHiddenListsToStorage();
            this._changeDetectorRef.markForCheck();
        }
    }

    /**
     * Verificar si una lista está oculta
     */
    isListHidden(listId: string): boolean {
        return this.hiddenLists.includes(listId);
    }

    /**
     * Obtener título de una lista
     */
    getListTitle(listId: string): string {
        const list = this.lists.find(l => l.id === listId);
        return list ? list.title : '';
    }

    /**
     * Obtener total de páginas para una lista
     */
    getTotalPages(listId: string): number {
        const state = this.listStates[listId];
        return Math.ceil(state.total / state.limit);
    }

    /**
     * Ir a una página específica
     */
    goToPage(listId: string, page: number): void {
        const state = this.listStates[listId];
        const totalPages = this.getTotalPages(listId);

        if (page < 1 || page > totalPages || state.loading) {
            return;
        }

        state.page = page;
        this.loadCardsForList(listId, true);
    }

    /**
     * Cargar tarjetas para una lista específica
     */
    loadCardsForList(listId: string, reset: boolean = false): void {
        const state = this.listStates[listId];
        if (state.loading) return;

        state.loading = true;
        const list = this.lists.find(l => l.id === listId);
        
        console.log('Cargando tarjetas para lista:', {
            listId,
            estado: list.title,
            tipoServicio: this.getTipoServicio(this.board.id),
            tecnicoId: this.selectedTecnicoId,
            page: state.page,
            limit: state.limit
        });

        this._scrumboardService.getCardsByStatus(
            this.getTipoServicio(this.board.id),
            list.title as EstadoServicio,
            this.selectedTecnicoId,
            state.page,
            state.limit
        ).pipe(
            takeUntil(this._unsubscribeAll)
        ).subscribe({
            next: (response) => {
                list.cards = response.cards;
                state.total = response.total;
                state.loading = false;
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error al cargar tarjetas:', error);
                state.loading = false;
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    /**
     * Recargar todas las listas
     */
    reloadAllLists(): void {
        Object.keys(this.listStates).forEach(listId => {
            this.listStates[listId].page = 1;
            this.loadCardsForList(listId, true);
        });
    }

    /**
     * Obtener índice inicial de los items mostrados
     */
    getStartIndex(listId: string): number {
        const state = this.listStates[listId];
        return ((state.page - 1) * state.limit) + 1;
    }

    /**
     * Obtener índice final de los items mostrados
     */
    getEndIndex(listId: string): number {
        const state = this.listStates[listId];
        const endIndex = state.page * state.limit;
        return Math.min(endIndex, state.total);
    }

    /**
     * Abrir diálogo de nuevo servicio
     */
    openNewServiceDialog(): void {
        const dialogRef = this._dialog.open(AddCardComponent, {
            data: {
                card: {
                    tipo: this.getTipoServicio(this.board.id),
                    estado: 'SIN ASIGNAR',
                    fechaRegistro: new Date().toISOString()
                },
                isEdit: false
            },
            width: '700px',
            height: 'auto',
            maxHeight: '90vh',
            panelClass: ['service-dialog', 'dark'],
            autoFocus: false,
            disableClose: false,
            backdropClass: 'cursor-pointer'
        });

        dialogRef.backdropClick().subscribe(() => {
            dialogRef.close();
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.reloadAllLists();
            }
        });
    }

    /**
     * Obtener IDs de listas conectadas para drag&drop
     */
    getConnectedLists(): string[] {
        return this.lists.map(list => list.id);
    }

    /**
     * Cargar todas las tarjetas
     */
    private loadAllCards(): void {
        const estados = [
            EstadoServicio.SIN_ASIGNAR,
            EstadoServicio.PENDIENTE,
            EstadoServicio.EN_PROGRESO,
            EstadoServicio.TERMINADO
        ];

        // Crear un array de observables para cada estado
        const observables = estados.map(estado =>
            this._scrumboardService.getCardsByStatus(
                this.getTipoServicio(this.board.id),
                estado,
                this.selectedTecnicoId,
                1,
                100 // Aumentar el límite para obtener más tarjetas
            )
        );

        // Combinar todos los observables
        forkJoin(observables)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(results => {
                // Combinar todas las tarjetas
                const allCards = results.reduce((acc, curr) => [...acc, ...curr.cards], []);
                this.filteredCards = allCards;
                this.distributeCards(allCards);
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Crear nuevo servicio directamente
     */
    createNewService(): void {
        // Usar board.id en lugar de board.title
        const tipoServicio = this.getTipoServicio(this.board.id);
        
        console.log('Tipo de servicio:', {
            boardId: this.board.id,
            boardTitle: this.board.title,
            tipoServicio: tipoServicio
        });

        if (!tipoServicio) {
            this._snackBar.open('Error: Tipo de servicio no válido', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['error-snackbar']
            });
            return;
        }

        this._scrumboardService.createService({}, tipoServicio)
            .subscribe({
                next: (response) => {
                    this._snackBar.open('Servicio creado correctamente', 'Cerrar', {
                        duration: 3000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top',
                        panelClass: ['success-snackbar']
                    });
                    // Recargar las listas después de crear
                    this.reloadAllLists();
                },
                error: (error) => {
                    console.error('Error al crear servicio:', error);
                    this._snackBar.open('Error al crear el servicio', 'Cerrar', {
                        duration: 3000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top',
                        panelClass: ['error-snackbar']
                    });
                }
            });
    }
}
