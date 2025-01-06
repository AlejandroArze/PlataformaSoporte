import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Board, Card, EstadoServicio, TipoServicio } from './scrumboard.models';
import { environment } from 'environments/environment';

interface UserResponse {
    message: string;
    data: {
        total: number;
        perPage: number;
        currentPage: number;
        totalPages: number;
        data: {
            usuarios_id: {
                usuarios_id: number;
                email: string;
                usuario: string;
                nombres: string;
                apellidos: string;
                role: string;
                estado: number;
            }
        }[]
    }
}

@Injectable({providedIn: 'root'})
export class ScrumboardService {
    private readonly apiUrl = environment.baseUrl;

    // Private
    private _board: BehaviorSubject<Board | null> = new BehaviorSubject(null);
    private _cards: BehaviorSubject<Card[]> = new BehaviorSubject<Card[]>([]);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter para board
     */
    get board$(): Observable<Board> {
        return this._board.asObservable();
    }

    /**
     * Getter para cards
     */
    get cards$(): Observable<Card[]> {
        return this._cards.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Obtener servicios según tipo y técnico
     */
    getServices(tipoServicio: TipoServicio, tecnicoId?: string): Observable<Card[]> {
        // Construir parámetros de consulta
        let params = new HttpParams()
            .set('page', '1')
            .set('limit', '100')
            .set('tipo', tipoServicio)
            .set('search', '');
        
        // Agregar tecnicoAsignado solo si se proporciona
        if (tecnicoId) {
            params = params.set('tecnicoAsignado', tecnicoId);
        }

        return this._httpClient.get<ServiceResponse>(`${this.apiUrl}/service/board`, { params })
            .pipe(
                map(response => response.data.data.map(item => ({
                    id: item.servicios_id.servicios_id.toString(),
                    nombreSolicitante: item.servicios_id.nombreSolicitante,
                    solicitante: item.servicios_id.nombreSolicitante,
                    carnet: item.servicios_id.ciSolicitante,
                    cargo: item.servicios_id.cargoSolicitante,
                    tipoSolicitante: item.servicios_id.tipoSolicitante,
                    problema: item.servicios_id.problema,
                    tipo: item.servicios_id.tipo as TipoServicio,
                    estado: item.servicios_id.estado as EstadoServicio || EstadoServicio.SIN_ASIGNAR,
                    tecnicoAsignado: item.servicios_id.tecnicoAsignado,
                    fechaRegistro: item.servicios_id.fechaRegistro,
                    fechaInicio: item.servicios_id.fechaInicio,
                    fechaTerminado: item.servicios_id.fechaTerminado,
                    informe: item.servicios_id.informe,
                    observacionesProblema: item.servicios_id.observaciones || '',
                    codigoBienes: item.servicios_id.equipo || '',
                    listId: '',
                    position: 0
                }) as unknown as Card)),
                tap((cards: Card[]) => {
                    this._cards.next(cards);
                })
            );
    }

    /**
     * Actualizar el estado de un servicio
     */
    updateServiceStatus(serviceId: string, newStatus: EstadoServicio): Observable<Card> {
        return this._httpClient.patch<Card>(`${this.apiUrl}/servicios/${serviceId}/estado`, {
            estado: newStatus
            }).pipe(
            tap(updatedService => {
                // Actualizar el servicio en el estado local
                const currentCards = this._cards.value;
                const index = currentCards.findIndex(card => card.id === serviceId);
                if (index !== -1) {
                    currentCards[index] = updatedService;
                    this._cards.next([...currentCards]);
                }
            })
        );
    }

    /**
     * Obtener técnicos disponibles
     */
    getTecnicos(search: string = ''): Observable<any[]> {
        const params = new HttpParams()
            .set('page', '1')
            .set('limit', '1000')
            .set('search', search);

        return this._httpClient.get<UserResponse>(`${this.apiUrl}/user`, { params })
            .pipe(
                map(response => [
                    { id: null, nombre: 'Todos' },
                    ...response.data.data
                        .filter(item => item.usuarios_id.role === 'TECNICO')
                        .map(item => ({
                            id: item.usuarios_id.usuarios_id,
                            nombre: `${item.usuarios_id.nombres} ${item.usuarios_id.apellidos}`
                        }))
                ])
            );
    }

    /**
     * Obtener detalles de un servicio específico
     */
    getServiceDetails(serviceId: string): Observable<Card> {
        return this._httpClient.get<Card>(`${this.apiUrl}/servicios/${serviceId}`);
    }

    /**
     * Actualizar servicio completo
     */
    updateService(card: Card): Observable<Card> {
        return this._httpClient.put<Card>(`${this.apiUrl}/servicios/${card.id}`, card)
            .pipe(
                tap(() => {
                    // Actualizar la lista de tarjetas
                    const cards = this._cards.value;
                    const index = cards.findIndex(c => c.id === card.id);
                    if (index !== -1) {
                        cards[index] = card;
                        this._cards.next([...cards]);
                    }
                })
        );
    }

    /**
     * Crear nuevo servicio
     */
    createService(card: Partial<Card>): Observable<Card> {
        return this._httpClient.post<Card>(`${this.apiUrl}/servicios`, card)
            .pipe(
                tap(newCard => {
                    const cards = this._cards.value;
                    this._cards.next([...cards, newCard]);
                })
            );
    }
}

interface ServiceResponse {
    message: string;
    data: {
        total: number;
        perPage: number;
        currentPage: number;
        totalPages: number;
        data: {
            servicios_id: {
                servicios_id: number;
                nombreSolicitante: string;
                ciSolicitante: string;
                cargoSolicitante: string;
                tipoSolicitante: string;
                problema: string;
                tipo: string;
                estado: string;
                tecnicoAsignado: number;
                fechaRegistro: string;
                fechaInicio: string;
                fechaTerminado: string;
                equipo: string;
                observaciones: string;
                informe: string;
                oficinaSolicitante: string;
            }
        }[]
    }
}
