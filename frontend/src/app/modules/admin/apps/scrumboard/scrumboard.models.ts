export interface Board {
    id: string;
    title: string;
    description: string;
    icon: string;
    lists: List[];
}

export interface List {
    id: string;
    title: EstadoServicio;
    position: number;
    cards: Card[];
}

export interface Card {
    id: string;
    nombreSolicitante: string;
    solicitante: string;
    carnet: string;
    cargo: string;
    tipoSolicitante: string;
    problema: string;
    tipo: TipoServicio;
    estado: EstadoServicio;
    tecnicoAsignado: number;
    fechaRegistro: string;
    fechaInicio: string;
    fechaTerminado: string;
    informe: string;
    observacionesProblema: string;
    codigoBienes: string;
    oficinaSolicitante: string;
    telefonoSolicitante: string;
    listId?: string;
    position?: number;
}

export enum EstadoServicio {
    SIN_ASIGNAR = 'Sin asignar',
    PENDIENTE = 'Pendiente',
    EN_PROGRESO = 'En progreso',
    TERMINADO = 'Terminado'
}

export enum TipoServicio {
    ASISTENCIA_SITIO = 'Asistencia en sitio',
    SERVICIO_LABORATORIO = 'Servicio en laboratorio',
    ASISTENCIA_REMOTA = 'Asistencia remota'
}
