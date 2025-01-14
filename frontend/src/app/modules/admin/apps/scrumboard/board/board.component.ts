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
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

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
        FormsModule,
        MatFormFieldModule,
        MatSelectModule,
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
    selectedTecnicoId: string = 'TODOS';

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
        this.selectedTecnicoId = 'TODOS';
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

            // Inicializar las listas con arrays vacíos
            this.lists.forEach(list => {
                list.cards = [];
            });

            // Forzar detección de cambios inicial
            this._changeDetectorRef.detectChanges();

            // Cargar datos
            this.reloadAllLists();

            // Cargar técnicos
            this._scrumboardService.getTecnicos()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe({
                    next: (response) => {
                        // Asegurarnos de que los técnicos tengan el formato correcto
                        this.tecnicos = response.map(tecnico => ({
                            id: tecnico.id,
                            nombre: tecnico.nombre || 'Sin nombre'
                        }));
                        
                        // Mantener 'TODOS' como valor seleccionado
                        this.selectedTecnicoId = 'TODOS';
                        this._changeDetectorRef.detectChanges();
                    },
                    error: (error) => {
                        console.error('Error al cargar técnicos:', error);
                        this.tecnicos = [];
                        this.selectedTecnicoId = 'TODOS';
                        this._changeDetectorRef.detectChanges();
                    }
                });

            // Suscribirse a las actualizaciones de tarjetas
            this._scrumboardService.cardUpdates$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(update => {
                    if (update.type === 'update') {
                        // Recargar solo la lista afectada
                        if (update.listId) {
                            const list = this.lists.find(l => l.id === update.listId);
                            if (list) {
                                const currentCards = [...list.cards];
                                this.loadCardsForList(list.id, true, currentCards);
                            }
                        } else {
                            // Si no hay listId, recargar todas las listas
                            this.reloadAllLists();
                        }
                    } else if (update.type === 'delete') {
                        // Recargar la lista específica donde estaba la tarjeta
                        if (update.listId) {
                            const list = this.lists.find(l => l.id === update.listId);
                            if (list) {
                                // Eliminar la tarjeta de la lista actual
                                list.cards = list.cards.filter(card => card.id !== update.cardId);
                                this.listStates[list.id].total--;
                                
                                // Recargar la lista para asegurar sincronización
                                const currentCards = [...list.cards];
                                this.loadCardsForList(list.id, true, currentCards);
                            }
                        } else {
                            // Si no hay listId, recargar todas las listas
                            this.reloadAllLists();
                        }
                        
                        // Forzar actualización de la vista
                        this._changeDetectorRef.markForCheck();
                        this._changeDetectorRef.detectChanges();
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
    onTecnicoFilterChange(tecnicoId: string): void {
        this.selectedTecnicoId = tecnicoId;
        // Pasar null al servicio cuando se selecciona 'TODOS'
        const filterId = tecnicoId === 'TODOS' ? null : tecnicoId;
        
        // Recargar todas las listas con el nuevo filtro
        this._changeDetectorRef.detectChanges();
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
            const card = event.previousContainer.data[event.previousIndex];
            const newStatus = this.lists.find(list => list.id === event.container.id)?.title;

            if (newStatus) {
                // Mantener copias de las listas originales
                const sourceList = [...event.previousContainer.data];
                const targetList = [...event.container.data];

                // Realizar el movimiento en la UI
                transferArrayItem(
                    event.previousContainer.data,
                    event.container.data,
                    event.previousIndex,
                    event.currentIndex
                );

                // Actualizar contadores inmediatamente
                this.listStates[event.previousContainer.id].total -= 1;
                this.listStates[event.container.id].total += 1;

                // Actualizar el estado y fechas de la tarjeta movida
                const movedCard = event.container.data[event.currentIndex];
                movedCard.estado = newStatus as EstadoServicio;

                // Actualizar fechas según el estado
                switch (newStatus) {
                    case EstadoServicio.SIN_ASIGNAR:
                    case EstadoServicio.PENDIENTE:
                        movedCard.fechaInicio = " ";
                        movedCard.fechaTerminado = " ";
                        break;
                    case EstadoServicio.EN_PROGRESO:
                        movedCard.fechaInicio = new Date().toISOString();
                        movedCard.fechaTerminado = " ";
                        break;
                    case EstadoServicio.TERMINADO:
                        movedCard.fechaTerminado = new Date().toISOString();
                        break;
                }

                // Forzar actualización de la UI
                this._changeDetectorRef.detectChanges();

                // Actualizar en el backend
                this._scrumboardService.updateServiceStatus(card.id, newStatus as EstadoServicio)
                    .subscribe({
                        next: (updatedCard) => {
                            // Actualizar la tarjeta con los datos del servidor
                            Object.assign(movedCard, updatedCard);
                            this._changeDetectorRef.detectChanges();
                        },
                        error: (error) => {
                            console.error('Error al actualizar el estado:', error);
                            
                            // Revertir contadores y cambios en caso de error
                            this.listStates[event.previousContainer.id].total += 1;
                            this.listStates[event.container.id].total -= 1;
                            event.previousContainer.data = sourceList;
                            event.container.data = targetList;
                            
                            this._snackBar.open(
                                'Error al actualizar el estado. Intente nuevamente.',
                                'Cerrar',
                                {
                                    duration: 3000,
                                    horizontalPosition: 'end',
                                    verticalPosition: 'top',
                                    panelClass: ['error-snackbar']
                                }
                            );
                            
                            this._changeDetectorRef.detectChanges();
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
    loadCardsForList(listId: string, reset: boolean = false, currentCards: Card[] = []): void {
        const state = this.listStates[listId];
        if (state.loading) return;

        state.loading = true;
        const list = this.lists.find(l => l.id === listId);
        
        // Convertir 'TODOS' a null para la consulta al backend
        const tecnicoId = this.selectedTecnicoId === 'TODOS' ? null : this.selectedTecnicoId;

        this._scrumboardService.getCardsByStatus(
            this.getTipoServicio(this.board.id),
            list.title as EstadoServicio,
            tecnicoId,
            state.page,
            state.limit
        ).pipe(
            takeUntil(this._unsubscribeAll)
        ).subscribe({
            next: (response) => {
                if (reset) {
                    // Mantener el orden actual de las tarjetas
                    const updatedCards = response.cards.map(newCard => {
                        const existingCard = currentCards.find(card => card.id === newCard.id);
                        return existingCard || newCard;
                    });
                    
                    // Mantener el orden original
                    list.cards = updatedCards.sort((a, b) => {
                        const indexA = currentCards.findIndex(card => card.id === a.id);
                        const indexB = currentCards.findIndex(card => card.id === b.id);
                        return indexA - indexB;
                    });
                } else {
                    // Para paginación, agregar solo las nuevas tarjetas al final
                    const newCards = response.cards.filter(newCard => 
                        !list.cards.some(existingCard => existingCard.id === newCard.id)
                    );
                    list.cards = [...list.cards, ...newCards];
                }
                
                state.total = response.total;
                state.loading = false;
                this._changeDetectorRef.detectChanges();
            },
            error: (error) => {
                console.error('Error al cargar tarjetas:', error);
                state.loading = false;
                list.cards = currentCards;
                this._changeDetectorRef.detectChanges();
            }
        });
    }

    /**
     * Recargar todas las listas
     */
    reloadAllLists(): void {
        // Guardar el estado actual de todas las listas
        const currentLists = this.lists.map(list => ({
            ...list,
            cards: [...(list.cards || [])]
        }));

        // Resetear los estados de paginación
        Object.keys(this.listStates).forEach(listId => {
            this.listStates[listId].page = 1;
        });

        // Cargar las nuevas tarjetas manteniendo las existentes mientras se cargan
        Object.keys(this.listStates).forEach(listId => {
            const list = this.lists.find(l => l.id === listId);
            if (list) {
                list.cards = currentLists.find(l => l.id === listId)?.cards || [];
                this.loadCardsForList(listId, true);
            }
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
                // Mantener las tarjetas existentes mientras se cargan las nuevas
                const currentCards = this.lists.map(list => ({
                    id: list.id,
                    cards: [...(list.cards || [])]
                }));

                // Resetear solo la lista "SIN ASIGNAR" ya que el nuevo servicio irá allí
                const sinAsignarList = this.lists.find(l => l.id === 'sin-asignar');
                if (sinAsignarList) {
                    this.listStates['sin-asignar'].page = 1;
                    this.loadCardsForList('sin-asignar', true);
                }

                // Forzar la detección de cambios
                this._changeDetectorRef.detectChanges();
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
        const tipoServicio = this.getTipoServicio(this.board.id);
        
        if (!tipoServicio) {
            this._snackBar.open('Error: Tipo de servicio no válido', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['error-snackbar']
            });
            return;
        }

        // Crear el servicio solo con los datos mínimos necesarios
        const serviceData = {
            tipo: tipoServicio,
            estado: EstadoServicio.SIN_ASIGNAR,
            fechaRegistro: new Date().toISOString(),
            // Campos requeridos con valores por defecto
            nombreResponsableEgreso: ' ',
            cargoResponsableEgreso: ' ',
            oficinaResponsableEgreso: ' ',
            telefonoResponsableEgreso: ' ',
            tipoResponsableEgreso: ' ',
            ciResponsableEgreso: ' ',
            tecnicoEgreso: ' ',
            fechaEgreso: ' ',
            observaciones: ' ',
            gestion: 3,
            tecnicoRegistro: 3,
            tecnicoAsignado: 3,
            numero: 0, // Se asignará automáticamente en el backend
            equipo: null
        };

        this._scrumboardService.createService(serviceData, tipoServicio)
            .subscribe({
                next: (response) => {
                    this._snackBar.open('Servicio creado correctamente', 'Cerrar', {
                        duration: 3000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top',
                        panelClass: ['success-snackbar']
                    });

                    // Actualizar solo la lista "SIN ASIGNAR"
                    const sinAsignarList = this.lists.find(l => l.id === 'sin-asignar');
                    if (sinAsignarList) {
                        // Crear una nueva tarjeta con los datos de respuesta
                        const newCard: Card = {
                            id: response.data.servicios_id,
                            tipo: tipoServicio,
                            estado: EstadoServicio.SIN_ASIGNAR,
                            fechaRegistro: new Date().toISOString(),
                            nombreSolicitante: '',
                            solicitante: '',
                            carnet: '',
                            cargo: '',
                            tipoSolicitante: '',
                            oficinaSolicitante: '',
                            telefonoSolicitante: '',
                            tecnicoAsignado: null,
                            fechaInicio: null,
                            fechaTerminado: null,
                            problema: '',
                            observacionesProblema: '',
                            informe: '',
                            codigoBienes: '',
                            tipoHardware: '',
                            descripcion: '',
                            listId: 'sin-asignar',
                            position: 0
                        };

                        // Agregar la nueva tarjeta al principio de la lista
                        sinAsignarList.cards = [newCard, ...(sinAsignarList.cards || [])];
                        
                        // Actualizar el total inmediatamente
                        this.listStates['sin-asignar'].total += 1;
                        
                        // Forzar actualización de la vista
                        this._changeDetectorRef.detectChanges();
                        
                        // Recargar la lista después de asegurarnos que se guardó
                        setTimeout(() => {
                            this.reloadAllLists();
                        }, 500);
                    }
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

    getSelectedTecnicoDisplay(): string {
        return this.selectedTecnicoId === 'TODOS' ? 'TODOS' : 
            (this.tecnicos.find(t => t.id === this.selectedTecnicoId)?.nombre || 'TODOS');
    }
}
