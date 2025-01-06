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

interface ServiceResponse {
    message: string;
    data: {
        total: number;
        perPage: number;
        currentPage: number;
        totalPages: number;
        data: Array<{
            servicios_id: number;
            nombreResponsableEgreso: string;
            cargoSolicitante: string;
            informe: string;
            cargoResponsableEgreso: string;
            oficinaSolicitante: string;
            fechaRegistro: string;
            equipo: string;
            problema: string;
            telefonoResponsableEgreso: string;
            gestion: number;
            telefonoSolicitante: string;
            tecnicoAsignado: number;
            observaciones: string;
            tipoResponsableEgreso: string;
            estado: string;
            tipoSolicitante: string;
            fechaTerminado: string;
            oficinaResponsableEgreso: string;
            numero: number;
            fechaInicio: string;
            fechaEgreso: string;
            ciSolicitante: string;
            nombreSolicitante: string;
            tipo: string;
            tecnicoRegistro: number;
            tecnicoEgreso: string;
            ciResponsableEgreso: string;
        }>;
    };
}

@Injectable({providedIn: 'root'})
export class ScrumboardService {
    private readonly apiUrl = environment.baseUrl;
    private _cards = new BehaviorSubject<Card[]>([]);

    constructor(private _httpClient: HttpClient) {}

    /**
     * Obtener tarjetas por estado
     */
    getCardsByStatus(
        tipoServicio: TipoServicio, 
        estado: EstadoServicio, 
        tecnicoId?: string, 
        page: number = 1, 
        limit: number = 10
    ): Observable<{cards: Card[], total: number}> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString())
            .set('tipo', tipoServicio)
            .set('estado', estado);
        
        if (tecnicoId) {
            params = params.set('tecnicoAsignado', tecnicoId);
        }

        console.log('Llamando API con params:', {
            url: `${this.apiUrl}/service/board`,
            params: params.toString(),
            tipoServicio,
            estado
        });

        return this._httpClient.get<ServiceResponse>(`${this.apiUrl}/service/board`, { params }).pipe(
            tap(response => {
                console.log('Respuesta de API:', response);
            }),
            map(response => {
                const mappedCards = response.data.data.map(item => {
                    if (typeof item === 'number') {
                        console.error('Item inesperado:', item);
                        return null;
                    }

                    return {
                        id: item.servicios_id.toString(),
                        nombreSolicitante: item.nombreSolicitante || '',
                        solicitante: item.nombreSolicitante || '',
                        carnet: item.ciSolicitante || '',
                        cargo: item.cargoSolicitante || '',
                        tipoSolicitante: item.tipoSolicitante || '',
                        problema: item.problema || '',
                        tipo: item.tipo as TipoServicio,
                        estado: item.estado as EstadoServicio,
                        tecnicoAsignado: item.tecnicoAsignado || 0,
                        fechaRegistro: item.fechaRegistro || '',
                        fechaInicio: item.fechaInicio || '',
                        fechaTerminado: item.fechaTerminado || '',
                        informe: item.informe || '',
                        observacionesProblema: item.observaciones || '',
                        codigoBienes: item.equipo || '',
                        oficinaSolicitante: item.oficinaSolicitante || '',
                        telefonoSolicitante: item.telefonoSolicitante || '',
                        listId: '',
                        position: 0
                    } as Card;
                }).filter(card => card !== null);

                console.log('Tarjetas mapeadas:', mappedCards);
                return {
                    cards: mappedCards,
                    total: response.data.total
                };
            })
        );
    }

    /**
     * Obtener técnicos
     */
    getTecnicos(search = ''): Observable<any[]> {
        const params = new HttpParams()
            .set('page', '1')
            .set('limit', '1000')
            .set('search', search);

        return this._httpClient.get<UserResponse>(`${this.apiUrl}/user`, { params }).pipe(
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
     * Actualizar estado del servicio
     */
    updateServiceStatus(serviceId: string, newStatus: EstadoServicio): Observable<Card> {
        return this._httpClient.patch<Card>(`${this.apiUrl}/servicios/${serviceId}/estado`, {
            estado: newStatus
        });
    }

    /**
     * Obtener servicios
     */
    getServices(tipoServicio: TipoServicio, tecnicoId?: string): Observable<Card[]> {
        let params = new HttpParams()
            .set('page', '1')
            .set('limit', '100')
            .set('tipo', tipoServicio)
            .set('search', '');
        
        if (tecnicoId) {
            params = params.set('tecnicoAsignado', tecnicoId);
        }

        return this._httpClient.get<ServiceResponse>(`${this.apiUrl}/service/board`, { params }).pipe(
            map(response => response.data.data.map(item => {
                if (typeof item === 'number') {
                    console.error('Item inesperado:', item);
                    return null;
                }

                return {
                    id: item.servicios_id.toString(),
                    nombreSolicitante: item.nombreSolicitante || '',
                    solicitante: item.nombreSolicitante || '',
                    carnet: item.ciSolicitante || '',
                    cargo: item.cargoSolicitante || '',
                    tipoSolicitante: item.tipoSolicitante || '',
                    problema: item.problema || '',
                    tipo: item.tipo as TipoServicio,
                    estado: item.estado as EstadoServicio,
                    tecnicoAsignado: item.tecnicoAsignado || 0,
                    fechaRegistro: item.fechaRegistro || '',
                    fechaInicio: item.fechaInicio || '',
                    fechaTerminado: item.fechaTerminado || '',
                    informe: item.informe || '',
                    observacionesProblema: item.observaciones || '',
                    codigoBienes: item.equipo || '',
                    oficinaSolicitante: item.oficinaSolicitante || '',
                    telefonoSolicitante: item.telefonoSolicitante || '',
                    listId: '',
                    position: 0
                } as Card;
            }).filter(card => card !== null)),
            tap(cards => {
                this._cards.next(cards);
            })
        );
    }

    /**
     * Obtener detalles de un servicio
     */
    getServiceDetails(serviceId: string): Observable<Card> {
        return this._httpClient.get<ServiceResponse>(`${this.apiUrl}/servicios/${serviceId}`).pipe(
            map(response => {
                const item = response.data.data[0];
                if (typeof item === 'number') {
                    throw new Error('Formato de respuesta inválido');
                }

                return {
                    id: item.servicios_id.toString(),
                    nombreSolicitante: item.nombreSolicitante || '',
                    solicitante: item.nombreSolicitante || '',
                    carnet: item.ciSolicitante || '',
                    cargo: item.cargoSolicitante || '',
                    tipoSolicitante: item.tipoSolicitante || '',
                    problema: item.problema || '',
                    tipo: item.tipo as TipoServicio,
                    estado: item.estado as EstadoServicio,
                    tecnicoAsignado: item.tecnicoAsignado || 0,
                    fechaRegistro: item.fechaRegistro || '',
                    fechaInicio: item.fechaInicio || '',
                    fechaTerminado: item.fechaTerminado || '',
                    informe: item.informe || '',
                    observacionesProblema: item.observaciones || '',
                    codigoBienes: item.equipo || '',
                    oficinaSolicitante: item.oficinaSolicitante || '',
                    telefonoSolicitante: item.telefonoSolicitante || '',
                    listId: '',
                    position: 0
                } as Card;
            })
        );
    }

    /**
     * Actualizar servicio
     */
    updateService(card: Card): Observable<Card> {
        return this._httpClient.put<Card>(`${this.apiUrl}/servicios/${card.id}`, card).pipe(
            tap(updatedCard => {
                const cards = this._cards.value;
                const index = cards.findIndex(c => c.id === updatedCard.id);
                if (index !== -1) {
                    cards[index] = updatedCard;
                    this._cards.next([...cards]);
                }
            })
        );
    }

    /**
     * Crear servicio
     */
    createService(card: Partial<Card>): Observable<Card> {
        return this._httpClient.post<Card>(`${this.apiUrl}/servicios`, card).pipe(
            tap(newCard => {
                const cards = this._cards.value;
                this._cards.next([...cards, newCard]);
            })
        );
    }

    /**
     * Obtener servicio por ID
     */
    getServiceById(id: string): Observable<Card> {
        return this._httpClient.get<Card>(`${this.apiUrl}/servicios/${id}`);
    }
}

