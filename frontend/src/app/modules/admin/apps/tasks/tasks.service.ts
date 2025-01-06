import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Tag, Task, Servicio, InventoryPagination, InventoryEquipment } from 'app/modules/admin/apps/tasks/tasks.types';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError,catchError } from 'rxjs';
import { environment } from 'environments/environment'; 
import { forkJoin } from 'rxjs';

const now = new Date();
//const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

const formattedDate: string = new Date().toISOString();

// Agregar la interfaz Empleado
export interface Empleado {
    id: number;
    nombre_completo: string;
    numdocumento: string;
    cargo: string;
    tipo_contrato: string;
    unidad: string;
    telefono?: string;
    telefono_coorp?: string;
    nro_item?: string;
    // ... otros campos
}

@Injectable({providedIn: 'root'})
export class TasksService
{
    // Private
    private _tags: BehaviorSubject<Tag[] | null> = new BehaviorSubject(null);
    private _task: BehaviorSubject<Task | null> = new BehaviorSubject(null);
    private _tasks: BehaviorSubject<Task[] | null> = new BehaviorSubject(null);
    private _services: BehaviorSubject<Servicio[]| null> = new BehaviorSubject(null);
    private _equipments: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private baseUrl = environment.baseUrl;//llamamos a los enviment de la url
    private _pagination: BehaviorSubject<InventoryPagination | null> = new BehaviorSubject(null);
    

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for tags
     */
    get tags$(): Observable<Tag[]>
    {
        return this._tags.asObservable();
    }

    /**
     * Getter for task
     */
    get task$(): Observable<Task>
    {
        return this._task.asObservable();
    }

    /**
     * Getter for tasks
     */
    get tasks$(): Observable<Task[]>
    {
        return this._tasks.asObservable();
    }
    get service$(): Observable<Servicio>
    {
        return this._services.asObservable().pipe(
            map(services => services?.[0])
        );
    }


    get services$(): Observable<Servicio[]>
        {
            return this._services.asObservable();
        }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get tags
     */
    getTags(): Observable<Tag[]>
    {
        return this._httpClient.get<Tag[]>('api/apps/tasks/tags').pipe(
            tap((response: any) =>
            {
                this._tags.next(response);
            }),
        );
    }

    /**
     * Crate tag
     *
     * @param tag
     */
    createTag(tag: Tag): Observable<Tag>
    {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.post<Tag>('api/apps/tasks/tag', {tag}).pipe(
                map((newTag) =>
                {
                    // Update the tags with the new tag
                    this._tags.next([...tags, newTag]);

                    // Return new tag from observable
                    return newTag;
                }),
            )),
        );
    }

    /**
     * Update the tag
     *
     * @param id
     * @param tag
     */
    updateTag(id: string, tag: Tag): Observable<Tag>
    {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.patch<Tag>('api/apps/tasks/tag', {
                id,
                tag,
            }).pipe(
                map((updatedTag) =>
                {
                    // Find the index of the updated tag
                    const index = tags.findIndex(item => item.id === id);

                    // Update the tag
                    tags[index] = updatedTag;

                    // Update the tags
                    this._tags.next(tags);

                    // Return the updated tag
                    return updatedTag;
                }),
            )),
        );
    }

    /**
     * Delete the tag
     *
     * @param id
     */
    deleteTag(id: string): Observable<boolean>
    {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.delete('api/apps/tasks/tag', {params: {id}}).pipe(
                map((isDeleted: boolean) =>
                {
                    // Find the index of the deleted tag
                    const index = tags.findIndex(item => item.id === id);

                    // Delete the tag
                    tags.splice(index, 1);

                    // Update the tags
                    this._tags.next(tags);

                    // Return the deleted status
                    return isDeleted;
                }),
                filter(isDeleted => isDeleted),
                switchMap(isDeleted => this.tasks$.pipe(
                    take(1),
                    map((tasks) =>
                    {
                        // Iterate through the tasks
                        tasks.forEach((task) =>
                        {
                            const tagIndex = task.tags.findIndex(tag => tag === id);

                            // If the task has a tag, remove it
                            if ( tagIndex > -1 )
                            {
                                task.tags.splice(tagIndex, 1);
                            }
                        });

                        // Return the deleted status
                        return isDeleted;
                    }),
                )),
            )),
        );
    }

    /**
     * Get tasks
     */
    getTasksO(): Observable<Task[]>
    {
        return this._httpClient.get<Task[]>('api/apps/tasks/all').pipe(
            tap((response) =>
            {
                this._tasks.next(response);
            }),
        );
    }



    
        /**
         * Obtiene la lista de productos con paginación, ordenación y búsqueda
         *
         * @param page - Número de página (por defecto es 0)
         * @param size - Tamaño de página, es decir, el número de productos por página (por defecto es 10)
         * @param sort - Campo de ordenación (por defecto es 'name')
         * @param order - Orden ascendente o descendente (por defecto es 'asc')
         * @param search - Término de búsqueda para filtrar productos (por defecto es una cadena vacía)
         * @returns Observable que emite un objeto con la paginación (`InventoryPagination`) y la lista de productos (`InventoryProduct[]`)
         */
        
    
        
        getTasks(
            page: number = 0,
            size: number = 100,
            sort: string = 'name',
            order: 'asc' | 'desc' | '' = 'desc',
            search: string = 'SIN ASIGNAR',
            count2: number = 0,
        ): Observable<{ pagination: InventoryPagination; services: Servicio[] }> {
            return this._httpClient.get<any>(`${this.baseUrl}/service?page=${page}&limit=${size}&search=${search}`).pipe(
                map((response) => {
                    console.log('API Response:', response);
                    console.log('API search:', search);
        
                    // Crear objeto de paginación
                    const pagination: InventoryPagination = {
                        length: response.data.total,
                        size: response.data.perPage,
                        page: response.data.currentPage,
                        lastPage: response.data.totalPages,
                        startIndex: ((response.data.currentPage) * response.data.perPage),
                        endIndex: response.data.currentPage * response.data.perPage,
                    };
        
                    // Desanidar los datos y convertir 'lector' a booleano
                    const services = response.data.data.map((item: any) => {
                        // Asegurarse de que 'lector' sea un valor booleano
                        if (typeof item.lector === 'string') {
                            if (item.lector === 'true') {
                                item.lector = true;  // Convertir 'true' a booleano true
                            } else {
                                item.lector = false; // Convertir todo lo demás a booleano false
                            }
                        }
                        console.log("lector: get equipmet ",item.servicios_id);
                       
    
                        
                        console.log("lector: get equipmet ",item.servicios_id);
                        console.log("tipo: get equipmet ",item.servicios_id.tipoDescripcion);
                        return item.servicios_id;
                    });
        
                    // Emitir los datos de paginación y equipos
                    this._pagination.next(pagination);
                    this._services.next(services);
        
                    return { pagination, services };
                })
            );
        }
        
    


    /**
     * Update tasks orders
     *
     * @param tasks
     */
    updateTasksOrders(tasks: Task[]): Observable<Task[]>
    {
        return this._httpClient.patch<Task[]>('api/apps/tasks/order', {tasks});
    }

    /**
     * Search tasks with given query
     *
     * @param query
     */
    searchTasks(query: string): Observable<Task[] | null>
    {
        return this._httpClient.get<Task[] | null>('api/apps/tasks/search', {params: {query}});
    }

    /**
     * Get task by id
     */
    getTaskByIdO(id: string): Observable<Task>
    {
        return this._tasks.pipe(
            take(1),
            map((tasks) =>
            {
                // Find the task
                const task = tasks.find(item => item.id === id) || null;

                // Update the task
                this._task.next(task);

                // Return the task
                return task;
            }),
            switchMap((task) =>
            {
                if ( !task )
                {
                    return throwError('Could not found task with id of ' + id + '!');
                }

                return of(task);
            }),
        );
    }



    
     /**
     * Obtiene un servicio por su ID del servidor
     *
     * @param servicios_id - ID del servicio a obtener
     * @returns Observable que emite el servicio con información adicional procesada
     */
     getTaskById(servicios_id: number): Observable<{ message: string; data: Servicio }> {
        console.log('Enviando solicitud a la API con ID:', servicios_id);
    
        return this._httpClient.get<{ message: string; data: Servicio }>(`${this.baseUrl}/service/${servicios_id}`).pipe(
            switchMap((response) => {
                const service = response.data;
                const requests: Observable<any>[] = [];

                // Consulta para el técnico
                if (service.tecnicoRegistro) {
                    const tecnicoId = Number(service.tecnicoRegistro);
                    if (!isNaN(tecnicoId)) {
                        requests.push(
                            this._httpClient.get<{ message: string; data: { nombres: string; apellidos: string } }>(
                                `${this.baseUrl}/user/${tecnicoId}`
                            ).pipe(
                                map((userResponse) => {
                                    console.log('Respuesta del usuario técnico:', userResponse);
                                    service.tecnicoRegistroString = `${userResponse.data.nombres} ${userResponse.data.apellidos}`;
                                    console.log('tecnicoRegistroString asignado:', service.tecnicoRegistroString);
                                })
                            )
                        );
                    }
                }

                // Consulta para obtener el código del equipo
                if (service.equipo) {  // equipo contiene el equipos_id
                    requests.push(
                        this._httpClient.get<any>(`${this.baseUrl}/equipment/${service.equipo}`).pipe(
                            map((equipoResponse) => {
                                if (equipoResponse && equipoResponse.data) {
                                    service.codigo = equipoResponse.data.codigo;  // Guardamos el código del equipo
                                    console.log('Código de equipo obtenido:', service.codigo);
                                }
                            })
                        )
                    );
                }

                return requests.length > 0
                    ? forkJoin(requests).pipe(
                        map(() => ({ message: 'Service fetched successfully', data: service }))
                    )
                    : of({ message: 'Service fetched successfully', data: service });
            })
        );
    }
    
    

    /**
     * Create task
     *
     * @param type
     */
    createTaskO(type: string): Observable<Task>
    {
        return this.tasks$.pipe(
            take(1),
            switchMap(tasks => this._httpClient.post<Task>('api/apps/tasks/task', {type}).pipe(
                map((newTask) =>
                {
                    // Update the tasks with the new task
                    this._tasks.next([newTask, ...tasks]);

                    // Return the new task
                    return newTask;
                }),
            )),
        );
    }

    
     /**
     * Crea un nuevo servicio en el servidor
     *
     * @returns Observable que emite el nuevo servicio creado (`Servicio`)
     */
    createTask(serviceData: any = {}): Observable<Servicio> {
        const defaultData2: Servicio = {
            nombreResponsableEgreso: " ",
            cargoSolicitante: " ",
            informe: " ",
            cargoResponsableEgreso: " ",
            oficinaSolicitante: " ",
            fechaRegistro: formattedDate,
            equipo: null,
            problema: " ",
            telefonoResponsableEgreso: " ",
            gestion: 3,
            telefonoSolicitante: " ",
            tecnicoAsignado: null,
            observaciones: " ",
            tipoResponsableEgreso: " ",
            estado: "SIN ASIGNAR",
            tipoSolicitante: " ",
            fechaTerminado: " ",
            oficinaResponsableEgreso: " ",
            numero: 464,
            fechaInicio: " ",
            fechaEgreso: " ",
            ciSolicitante: " ",
            nombreSolicitante: " ",
            tipo: " ",
            tecnicoRegistro: 3,
            tecnicoEgreso: " ",
            ciResponsableEgreso: " ",
            ...serviceData
        };

        // Asegurarse de que tecnicoAsignado sea null si no es un número válido
        if (defaultData2.tecnicoAsignado === undefined || 
            defaultData2.tecnicoAsignado === null || 
            isNaN(Number(defaultData2.tecnicoAsignado))) {
            defaultData2.tecnicoAsignado = null;
        }

        return this._httpClient.post<{ message: string, data: Servicio }>(`${this.baseUrl}/service`, defaultData2)
            .pipe(
                map(response => {
                    // Mapea y devuelve solo el objeto Servicio desde la respuesta
                    return response.data;
                }),
                tap(newService => {
                    // Actualiza la lista actual de servicios con el nuevo servicio
                    const currentServices = this._services.getValue();
                    this._services.next([newService, ...currentServices]);
                }),
                catchError(error => {
                    // Manejo de errores
                    console.error('Error al crear el servicio:', error);
                    return throwError(() => new Error('No se pudo crear el servicio debido a un error en el servidor.'));
                })
            );
    }

    /**
     * Update task
     *
     * @param id
     * @param task
     */
    updateTaskO(id: string, task: Task): Observable<Task>
    {
        return this.tasks$
            .pipe(
                take(1),
                switchMap(tasks => this._httpClient.patch<Task>('api/apps/tasks/task', {
                    id,
                    task,
                }).pipe(
                    map((updatedTask) =>
                    {
                        // Find the index of the updated task
                        const index = tasks.findIndex(item => item.id === id);

                        // Update the task
                        tasks[index] = updatedTask;

                        // Update the tasks
                        this._tasks.next(tasks);

                        // Return the updated task
                        return updatedTask;
                    }),
                    switchMap(updatedTask => this.task$.pipe(
                        take(1),
                        filter(item => item && item.id === id),
                        tap(() =>
                        {
                            // Update the task if it's selected
                            this._task.next(updatedTask);

                            // Return the updated task
                            return updatedTask;
                        }),
                    )),
                )),
            );
    }

    /**
     * Actualiza un servicio en el servidor
     *
     * @param servicios_id - ID del servicio a actualizar
     * @param service - Objeto `Servicio` con los datos actualizados del servicio
     * @returns Observable que emite el servicio actualizado (`Servicio`)
     */
    updateTask(id: number, task: any): Observable<any> {
        const servicioId = Number(id);
        
        // Asegurarse de que equipo sea null si está vacío
        const taskToUpdate = {
            ...task,
            equipo: task.equipo === '' ? null : task.equipo,
            equipos_id: task.equipo === '' ? null : task.equipo
        };
        
        console.log('Actualizando servicio:', {
            url: `${this.baseUrl}/service/${servicioId}`,
            data: taskToUpdate,
            equipo: taskToUpdate.equipo,
            equipos_id: taskToUpdate.equipos_id
        });

        return this._httpClient.put<any>(
            `${this.baseUrl}/service/${servicioId}`, 
            taskToUpdate
        ).pipe(
            tap((response) => {
                console.log('Servicio actualizado exitosamente:', response);
                
                // Actualizar la lista de servicios
                const currentServices = this._services.getValue();
                if (currentServices) {
                    const index = currentServices.findIndex(s => s.servicios_id === servicioId);
                    if (index !== -1) {
                        const updatedServices = [...currentServices];
                        updatedServices[index] = {
                            ...updatedServices[index],
                            ...taskToUpdate
                        };
                        this._services.next(updatedServices);
                    }
                }
            }),
            catchError(err => {
                console.error('Error al actualizar el servicio:', err);
                return throwError(() => new Error(`Error al actualizar el servicio ${servicioId}: ${err.message}`));
            })
        );
    }
    
    

    /**
     * Delete the task
     *
     * @param id
     */
    deleteTaskO(id: string): Observable<boolean>
    {
        return this.tasks$.pipe(
            take(1),
            switchMap(tasks => this._httpClient.delete('api/apps/tasks/task', {params: {id}}).pipe(
                map((isDeleted: boolean) =>
                {
                    // Find the index of the deleted task
                    const index = tasks.findIndex(item => item.id === id);

                    // Delete the task
                    tasks.splice(index, 1);

                    // Update the tasks
                    this._tasks.next(tasks);

                    // Return the deleted status
                    return isDeleted;
                }),
            )),
        );
    }

    
   /**
     * Elimina un servicio en el servidor
     *
     * @param servicios_id - ID del servicio a eliminar
     * @returns Observable que emite un booleano indicando el estado de la eliminación (`true` si fue eliminado)
     */
    deleteTask(servicios_id: number): Observable<boolean> {
        return this.services$.pipe(
            take(1), // Toma el valor actual de `services$` y completa la suscripción
            switchMap(services => 
                this._httpClient.delete(`${this.baseUrl}/service/${servicios_id}`, { params: { servicios_id: servicios_id.toString() } }).pipe(
                    map((isDeleted: boolean) => {
                        // Encuentra el índice del servicio eliminado en la lista de servicios
                        const index = services.findIndex(item => item.servicios_id === servicios_id);

                        // Elimina el servicio de la lista si existe
                        if (index !== -1) {
                            services.splice(index, 1);
                        }

                        // Emite la lista de servicios actualizada
                        this._services.next(services);

                        // Retorna el estado de eliminación (`true` si fue eliminado)
                        return isDeleted;
                    }),
                )
            ),
        );
    }

    /**
     * Obtiene la lista de equipos
     */
    getEquipos(): Observable<any[]> {
        return this._httpClient.get<any[]>(`${this.baseUrl}/equipos`);
    }

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

    buscarEquipos3(query: string): Observable<any[]> {
        return this._httpClient.get<any>(`${this.baseUrl}/equipment`, {
            params: { 
                search: query,
                page: '0',
                size: '10'
            }
        }).pipe(
            map(response => {
                // Verifica si la respuesta tiene la estructura esperada
                if (response && response.data && Array.isArray(response.data)) {
                    return response.data.map(equipo => ({
                        equipos_id: equipo.equipos_id,
                        codigo: equipo.codigo
                    }));
                }
                // Si no tiene la estructura esperada, retorna un array vacío
                console.warn('Respuesta inesperada del servidor:', response);
                return [];
            })
        );
    }

    /**
     * Obtiene la lista de productos con paginación, ordenación y búsqueda
     *
     * @param page - Número de página (por defecto es 0)
     * @param size - Tamaño de página, es decir, el número de productos por página (por defecto es 10)
     * @param sort - Campo de ordenación (por defecto es 'name')
     * @param order - Orden ascendente o descendente (por defecto es 'asc')
     * @param search - Término de búsqueda para filtrar productos (por defecto es una cadena vacía)
     * @returns Observable que emite un objeto con la paginación (`InventoryPagination`) y la lista de productos (`InventoryProduct[]`)
     */
    buscarEquipos(
        page: number = 0,
        size: number = 15,
        sort: string = 'name',
        order: 'asc' | 'desc' | '' = 'asc',
        search: string = '',
    ): Observable<{ pagination: InventoryPagination; equipments: InventoryEquipment[] }> {
        console.log('Buscando equipos con término:', search);
        
        return this._httpClient.get<any>(`${this.baseUrl}/equipment?page=${page}&limit=${size}`, {
            params: { 
                page: '' + page, 
                size: '' + size, 
                sort, 
                order, 
                search 
            },
        }).pipe(
            map((response) => {
                console.log('Respuesta de búsqueda de equipos:', response);

                const pagination: InventoryPagination = {
                    length: response.data.total,
                    size: response.data.perPage,
                    page: response.data.currentPage,
                    lastPage: response.data.totalPages,
                    startIndex: ((response.data.currentPage) * response.data.perPage),
                    endIndex: response.data.currentPage * response.data.perPage,
                };

                // Filtrar y mapear los equipos
                const equipments = response.data.data
                    .filter((item: any) => item?.equipos_id?.codigo && item.equipos_id.codigo.trim() !== '')
                    .map((item: any) => ({
                        equipos_id: item.equipos_id.equipos_id,
                        codigo: item.equipos_id.codigo.trim(),
                        tipo: item.equipos_id.tipo,
                        tipoDescripcion: item.equipos_id.tipoDescripcion,
                        lector: typeof item.equipos_id.lector === 'string' 
                            ? item.equipos_id.lector === 'true'
                            : !!item.equipos_id.lector
                    }))
                    .filter((item: any, index: number, self: any[]) =>
                        index === self.findIndex((t) => t.codigo === item.codigo)
                    );

                return { pagination, equipments };
            })
        );
    }

    getEquipoById(equipos_id: number): Observable<any> {
        return this._httpClient.get<any>(`${this.baseUrl}/equipment/${equipos_id}`).pipe(
            map(response => {
                if (response && response.data) {
                    return {
                        equipos_id: response.data.equipos_id,
                        codigo: response.data.codigo
                    };
                }
                return null;
            })
        );
    }

    buscarEmpleados(nombreCompleto: string): Observable<Empleado[] | null> {
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        const body = `nombre_completo=${encodeURIComponent(nombreCompleto)}`;

        console.log('Buscando empleados con término:', nombreCompleto);

        return this._httpClient.post<{ status: boolean; data: Empleado[] }>(
            'http://localhost:3001/api/empleados', 
            body, 
            { headers }
        ).pipe(
            map(response => {
                console.log('Respuesta completa de la API:', response);
                if (response && response.status && Array.isArray(response.data)) {
                    return response.data;
                }
                return null;
            }),
            catchError(error => {
                console.error('Error en la búsqueda de empleados:', error);
                return of(null);
            })
        );
    }

    buscarEmpleadosPorCI(ci: string): Observable<any> {
        const formData = new FormData();
        formData.append('dato', ci);
        formData.append('tipo', 'D');

        console.log('Enviando búsqueda de CI:', ci); // Debug

        return this._httpClient.post(
            `${this.baseUrl}/proxy/buscar-empleados-ci`,
            formData
        ).pipe(
            tap(response => console.log('Respuesta de la API:', response)), // Debug
            map(response => {
                if (response && response['data']) {
                    // La API devuelve los datos en response.data
                    return Array.isArray(response['data']) ? response['data'] : [response['data']];
                }
                return [];
            }),
            catchError(error => {
                console.error('Error en buscarEmpleadosPorCI:', error);
                return of([]);
            })
        );
    }

}
