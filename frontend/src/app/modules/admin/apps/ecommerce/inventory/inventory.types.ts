export interface InventoryProduct
{
    id: string;
    category?: string;
    name: string;
    description?: string;
    tags?: string[];
    sku?: string | null;
    barcode?: string | null;
    brand?: string | null;
    vendor: string | null;
    stock: number;
    reserved: number;
    cost: number;
    basePrice: number;
    taxPercent: number;
    price: number;
    weight: number;
    thumbnail: string;
    images: string[];
    active: boolean;
}

export interface InventoryPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface InventoryCategory
{
    id: string;
    parentId: string;
    name: string;
    slug: string;
}

export interface InventoryBrand
{
    id: string;
    name: string;
    slug: string;
}

export interface InventoryTag
{
    id?: string;
    title?: string;
}

export interface InventoryVendor
{
    id: string;
    name: string;
    slug: string;
}



export interface InventoryEquipment {
    equiposId: number; // Equipos_id es la clave primaria
    ip?: string | null; // Dirección IP del equipo
    procesador?: string | null; // Tipo de procesador
    funcionariousuario?: string | null; // Usuario asignado al equipo
    lector?: string | null; // Lector de tarjetas, CDs, etc.
    tarjetavideo?: string | null; // Información sobre la tarjeta de video
    funcionarioasignado?: string | null; // Funcionario al que se asigna el equipo
    oficina?: string | null; // Oficina donde se encuentra el equipo
    fecharegistro?: string | null; // Fecha de registro del equipo
    codigo?: string | null; // Código del equipo
    memoria?: string | null; // Información de la memoria RAM
    tarjetamadre?: string | null; // Información de la tarjeta madre
    antivirus?: string | null; // Software antivirus instalado
    garantia?: string | null; // Garantía del equipo
    discoduro?: string | null; // Información sobre el disco duro
    marca?: string | null; // Marca del equipo
    tipo?: number | null; // Tipo de equipo (PC, Laptop, etc.)
    modelo?: string | null; // Modelo del equipo
    serie?: string | null; // Número de serie
    so?: string | null; // Sistema operativo
    responsable?: number | null; // ID del responsable
    mac?: string | null; // Dirección MAC de la tarjeta de red
}
