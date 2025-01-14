import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap, switchMap, catchError, forkJoin, of, Subject } from 'rxjs';
import { Board, Card, EstadoServicio, TipoServicio, Equipo } from './scrumboard.models';
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
    private readonly _apiUrl = environment.baseUrl;
    readonly cards$ = new BehaviorSubject<Card[]>([]);
    private _cardUpdates = new Subject<{type: 'update' | 'delete' | 'create', cardId?: number, listId?: string}>();
    
    // Observable que otros componentes pueden suscribirse
    cardUpdates$ = this._cardUpdates.asObservable();

    // Método para emitir actualizaciones
    notifyCardUpdate(type: 'update' | 'delete' | 'create', cardId?: number, listId?: string): void {
        this._cardUpdates.next({ type, cardId, listId });
    }

    get apiUrl(): string {
        return this._apiUrl;
    }

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

        console.log('Obteniendo tarjetas:', {
            tipoServicio,
            estado,
            tecnicoId,
            page,
            limit
        });

        return this._httpClient.get<ServiceResponse>(`${this.apiUrl}/service/board`, { params }).pipe(
            map(response => {
                const newCards = response.data.data.map(item => ({
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
                } as Card));

                // Mantener las tarjetas existentes de otros estados
                const currentCards = this.cards$.value;
                const otherCards = currentCards.filter(c => c.estado !== estado);
                this.cards$.next([...otherCards, ...newCards]);

                return {
                    cards: newCards,
                    total: response.data.total
                };
            }),
            tap(result => {
                console.log('Tarjetas obtenidas para estado', estado, ':', result);
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
            map(response => 
                response.data.data
                    .filter(item => item.usuarios_id.role === 'TECNICO')
                    .map(item => ({
                        id: item.usuarios_id.usuarios_id,
                        nombre: `${item.usuarios_id.nombres} ${item.usuarios_id.apellidos}`
                    }))
            )
        );
    }

    /**
     * Actualizar estado del servicio
     */
    updateServiceStatus(serviceId: string, newStatus: EstadoServicio): Observable<Card> {
        console.log(`Iniciando actualización de estado para servicio ${serviceId} a ${newStatus}`);
        
        return this._httpClient.get<any>(`${this.apiUrl}/service/${serviceId}`)
            .pipe(
                tap({
                    next: (response) => console.log('GET response:', response),
                    error: (error) => console.error('Error en GET inicial:', error)
                }),
                switchMap(response => {
                    if (!response?.data) {
                        console.error('Respuesta GET inválida:', response);
                        throw new Error('Respuesta inválida del servidor');
                    }

                    const currentService = response.data;
                    console.log('Servicio actual obtenido:', currentService);

                    // Determinar las fechas según el estado
                    let fechaInicio = " ";
                    let fechaTerminado = " ";

                    switch (newStatus) {
                        case EstadoServicio.SIN_ASIGNAR:
                        case EstadoServicio.PENDIENTE:
                            // Ambas fechas en blanco
                            fechaInicio = " ";
                            fechaTerminado = " ";
                            break;
                        case EstadoServicio.EN_PROGRESO:
                            // Fecha de inicio = fecha actual, término en blanco
                            fechaInicio = new Date().toISOString();
                            fechaTerminado = " ";
                            break;
                        case EstadoServicio.TERMINADO:
                            // Mantener fecha de inicio, actualizar término
                            fechaInicio = currentService.fechaInicio || " ";
                            fechaTerminado = new Date().toISOString();
                            break;
                    }

                    const updateData = {
                        ...currentService,
                        estado: newStatus,
                        fechaInicio: fechaInicio,
                        fechaTerminado: fechaTerminado
                    };
                    
                    console.log('URL de actualización:', `${this.apiUrl}/service/${serviceId}`);
                    console.log('Datos a actualizar:', updateData);
                    
                    return this._httpClient.put<Card>(`${this.apiUrl}/service/${serviceId}`, updateData)
                        .pipe(
                            tap({
                                next: (response) => console.log('Actualización exitosa:', response),
                                error: (error) => console.error('Error en PUT:', {
                                    status: error.status,
                                    message: error.message,
                                    error: error,
                                    url: `${this.apiUrl}/service/${serviceId}`,
                                    data: updateData
                                })
                            }),
                            catchError(error => {
                                console.error('Error capturado en PUT:', error);
                                throw error;
                            })
                        );
                }),
                catchError(error => {
                    console.error('Error capturado en pipeline principal:', error);
                    throw error;
                })
            );
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
                this.cards$.next(cards);
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
    updateService(serviceId: string | Card, updateData?: any): Observable<any> {
        if (typeof serviceId === 'string') {
            // Mapear los campos del formulario a los nombres correctos de la API
            const mappedUpdateData = {
                ...updateData,
                ciSolicitante: updateData.carnet || updateData.ciSolicitante || " ",
                cargoSolicitante: updateData.cargo || updateData.cargoSolicitante || " ",
                equipo: updateData.equipo || updateData.codigoBienes || null,
                nombreSolicitante: updateData.solicitante || updateData.nombreSolicitante || " ",
                oficinaSolicitante: updateData.oficina || updateData.oficinaSolicitante || " ",
                telefonoSolicitante: updateData.telefono || updateData.telefonoSolicitante || " ",
                tipo: updateData.tipoServicio || updateData.tipo || "ASISTENCIA",
                problema: updateData.problema || " ",
                observaciones: updateData.observaciones || " ",
                informe: updateData.informe || " ",
                estado: updateData.estado || "SIN ASIGNAR",
                tecnicoAsignado: updateData.tecnicoAsignado || 3,
                fechaRegistro: updateData.fechaRegistro || new Date().toISOString(),
                fechaInicio: updateData.fechaInicio || null,
                fechaTerminado: updateData.fechaTerminado || null,
                nombreResponsableEgreso: updateData.nombreResponsableEgreso || " ",
                cargoResponsableEgreso: updateData.cargoResponsableEgreso || " ",
                telefonoResponsableEgreso: updateData.telefonoResponsableEgreso || " ",
                tipoResponsableEgreso: updateData.tipoResponsableEgreso || " ",
                oficinaResponsableEgreso: updateData.oficinaResponsableEgreso || " ",
                gestion: updateData.gestion || 3,
                numero: updateData.numero || 464,
                fechaEgreso: updateData.fechaEgreso || " ",
                tecnicoRegistro: updateData.tecnicoRegistro || 3,
                tecnicoEgreso: updateData.tecnicoEgreso || " ",
                ciResponsableEgreso: updateData.ciResponsableEgreso || " "
            };

            console.log('Datos mapeados para actualización:', mappedUpdateData);

            return this._httpClient.put<any>(`${this._apiUrl}/service/${serviceId}`, mappedUpdateData)
                .pipe(
                    tap({
                        next: (response) => {
                            console.log('Actualización exitosa:', response);
                            // Actualizar solo la tarjeta modificada
                            const currentCards = this.cards$.value;
                            const updatedCards = currentCards.map(card => {
                                if (card.id === serviceId) {
                                    return {
                                        ...card,
                                        carnet: mappedUpdateData.ciSolicitante,
                                        cargo: mappedUpdateData.cargoSolicitante,
                                        codigoBienes: mappedUpdateData.equipo,
                                        nombreSolicitante: mappedUpdateData.nombreSolicitante,
                                        oficinaSolicitante: mappedUpdateData.oficinaSolicitante,
                                        telefonoSolicitante: mappedUpdateData.telefonoSolicitante,
                                        tipo: mappedUpdateData.tipo,
                                        problema: mappedUpdateData.problema,
                                        observacionesProblema: mappedUpdateData.observaciones,
                                        informe: mappedUpdateData.informe,
                                        estado: mappedUpdateData.estado,
                                        tecnicoAsignado: mappedUpdateData.tecnicoAsignado,
                                        fechaRegistro: mappedUpdateData.fechaRegistro,
                                        fechaInicio: mappedUpdateData.fechaInicio,
                                        fechaTerminado: mappedUpdateData.fechaTerminado
                                    };
                                }
                                return card;
                            });
                            this.cards$.next(updatedCards);

                            // Recargar solo el estado nuevo si cambió el estado
                            const cardToUpdate = currentCards.find(c => c.id === serviceId);
                            if (cardToUpdate && cardToUpdate.estado !== mappedUpdateData.estado) {
                                this.getCardsByStatus(
                                    mappedUpdateData.tipo,
                                    mappedUpdateData.estado,
                                    null,
                                    1,
                                    100
                                ).subscribe();
                            }
                }
            })
        );
        }

        // Si es un objeto Card, usar la implementación antigua
        const card = serviceId as Card;
        return this._httpClient.put<Card>(`${this._apiUrl}/servicios/${card.id}`, card);
    }

    /**
     * Crear servicio
     */
    createService(formData: any, tipoServicio: string): Observable<any> {
        const currentDate = new Date().toISOString(); // Usar la fecha actual
        const serviceData = {
            nombreResponsableEgreso: " ",
            cargoSolicitante: " ",
            informe: " ",
            cargoResponsableEgreso: " ",
            oficinaSolicitante: " ",
            fechaRegistro: currentDate,
            equipo: null,
            problema: " ",
            telefonoResponsableEgreso: " ",
            gestion: 3,
            telefonoSolicitante: " ",
            tecnicoAsignado: 3,
            observaciones: " ",
            tipoResponsableEgreso: " ",
            estado: "SIN ASIGNAR",
            tipoSolicitante: " ",
            fechaTerminado: " ",
            oficinaResponsableEgreso: " ",
            numero: 464,
            fechaInicio:" ",
            fechaEgreso: " ",
            ciSolicitante: " ",
            nombreSolicitante: " ",
            tipo: tipoServicio,
            tecnicoRegistro: 3,
            tecnicoEgreso: " ",
            ciResponsableEgreso: " ",
            cargo: " "
        };

        console.log('Enviando datos para crear servicio:', serviceData);

        return this._httpClient.post<any>(`${this._apiUrl}/service`, serviceData).pipe(
            tap({
                next: (response) => {
                    console.log('Servicio creado exitosamente:', response);
                    // Actualizar el estado local
                    const currentCards = this.cards$.value;
                    if (response.data) {
                        const newCard = {
                            id: response.data.servicios_id.toString(),
                            nombreSolicitante: response.data.nombreSolicitante,
                            solicitante: response.data.nombreSolicitante,
                            carnet: response.data.ciSolicitante,
                            cargo: response.data.cargoSolicitante || response.data.cargo,
                            tipoSolicitante: response.data.tipoSolicitante,
                            problema: response.data.problema,
                            tipo: response.data.tipo,
                            estado: response.data.estado,
                            tecnicoAsignado: response.data.tecnicoAsignado,
                            fechaRegistro: response.data.fechaRegistro,
                            fechaInicio: response.data.fechaInicio,
                            fechaTerminado: response.data.fechaTerminado,
                            informe: response.data.informe,
                            observacionesProblema: response.data.observaciones,
                            codigoBienes: response.data.equipo,
                            oficinaSolicitante: response.data.oficinaSolicitante,
                            telefonoSolicitante: response.data.telefonoSolicitante,
                            listId: '',
                            position: 0
                        } as Card;
                        this.cards$.next([...currentCards, newCard]);
                    }
                },
                error: (error) => {
                    console.error('Error al crear servicio:', error);
                    throw error;
                }
            })
        );
    }

    /**
     * Obtener servicio por ID
     */
    getServiceById(id: string): Observable<Card> {
        return this._httpClient.get<Card>(`${this.apiUrl}/servicios/${id}`);
    }

    /**
     * Recargar el tablero actual
     */
    private reloadCurrentBoard(): void {
        const currentCards = this.cards$.value;
        this.cards$.next([...currentCards]);
    }

    /**
     * Eliminar servicio
     */
    deleteService(serviceId: string): Observable<any> {
        return this._httpClient.delete<any>(`${this._apiUrl}/service/${serviceId}`).pipe(
            tap({
                next: (response) => {
                    // Actualizar el estado local removiendo la tarjeta eliminada
                    const currentCards = this.cards$.value;
                    const updatedCards = currentCards.filter(card => card.id !== serviceId);
                    this.cards$.next(updatedCards);
                }
            })
        );
    }

    /**
     * Buscar equipos
     */
    buscarEquipos(page: number, limit: number, search: string): Observable<{ equipos_id: number; codigo: string }[]> {
        const url = `${this._apiUrl}/equipment?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;

        return this._httpClient.get<any>(url).pipe(
            map((response) => {
                if (response?.data?.data) {
                    return response.data.data
                        .map((equipment: any) => ({
                            equipos_id: equipment.equipos_id.equipos_id || 0,
                            codigo: equipment.equipos_id.codigo?.trim() || '',
                        }))
                        .filter(equipo => equipo.codigo !== ''); // Filtrar equipos con código vacío
                } else {
                    console.warn('Respuesta inesperada de la API:', response);
                    return [];
                }
            }),
            catchError((err) => {
                console.error('Error al buscar equipos:', err);
                return of([]); // Devuelve un array vacío en caso de error
            })
        );
    }

    /**
     * Obtener bienes
     */
    getBienes(codBienes: string): Observable<any> {
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        const body = `cod_bienes=${encodeURIComponent(codBienes)}`;

        return this._httpClient.post<any>('http://localhost:3001/api/proxy', body, { headers }).pipe(
            tap((response) => {
                if (response && response.data) {
                    console.log('Bienes encontrados:', response.data);
                }
            })
        );
    }
}

