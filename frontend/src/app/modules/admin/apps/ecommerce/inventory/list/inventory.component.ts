// Importaciones necesarias desde Angular y otras dependencias
import { AsyncPipe, CurrencyPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { InventoryBrand, InventoryCategory, InventoryEquipment, InventoryPagination, InventoryProduct, InventoryTag, InventoryVendor } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';

import {MatDatepickerModule} from '@angular/material/datepicker';
import { NativeDateAdapter, DateAdapter } from '@angular/material/core';

import {MatCardModule} from '@angular/material/card';


import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MatNativeDateModule } from '@angular/material/core'; // Usamos el adaptador nativo de fecha de Angular
import { MAT_DATE_FORMATS } from '@angular/material/core';




export const MY_DATE_FORMATS = {
    parse: {
      dateInput: 'DD/MM/YYYY',  // Formato de entrada (día/mes/año)
    },
    display: {
      dateInput: 'DD',  // Formato de salida (día mes año)
      monthYearLabel: 'MMMM YYYY', // Para mostrar el mes y el año en el selector
      dateA11yLabel: 'LL',
      monthDayA11yLabel: 'DD MMMM',
    },
  };


// Decorador @Component para definir un componente de Angular
@Component({
    selector       : 'inventory-list', // Selector HTML para identificar el componente
    templateUrl    : './inventory.component.html', // Ruta al archivo de plantilla HTML
    styles         : [
        /* language=SCSS */
        `
            .inventory-grid {
                grid-template-columns: 48px auto 40px;

                @screen sm {
                    grid-template-columns: 48px auto 112px 72px;
                }

                @screen md {
                    grid-template-columns: 48px 112px auto 112px 72px;
                }

                @screen lg {
                    grid-template-columns: 48px 112px auto 112px 96px 96px 72px;
                }
            }
        `,
    ],
    encapsulation  : ViewEncapsulation.None, // Define la encapsulación CSS
    changeDetection: ChangeDetectionStrategy.OnPush, // Define la estrategia de detección de cambios
    animations     : fuseAnimations, // Incluye las animaciones definidas en fuse
    standalone     : true, // Especifica que este componente puede ser usado de forma independiente
    imports        : [NgIf,MatCardModule, MatProgressBarModule, MatFormFieldModule, MatIconModule, MatDatepickerModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe], // Módulos que se importan para el uso en el componente  
    providers: [
        
        { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    ]
   
  
  


})

// Clase del componente InventoryListComponent que implementa tres interfaces de ciclo de vida de Angular
export class InventoryListComponent implements OnInit, AfterViewInit, OnDestroy {
    // Decorador @ViewChild para acceder a los componentes hijos dentro del template
    @ViewChild(MatPaginator) private _paginator: MatPaginator; // Referencia al paginador
    @ViewChild(MatSort) private _sort: MatSort; // Referencia a la ordenación

    //products$: Observable<InventoryProduct[]>; // Observable para obtener los productos
    equipments$: Observable<InventoryEquipment[]>;
    
    brands: InventoryBrand[]; // Arreglo de marcas
    categories: InventoryCategory[]; // Arreglo de categorías
    filteredTags: InventoryTag[]; // Arreglo de etiquetas filtradas
    flashMessage: 'success' | 'error' | null = null; // Mensaje flash para mostrar el estado (éxito o error)
    isLoading: boolean = false; // Indicador de carga
    pagination: InventoryPagination; // Datos de paginación
    searchInputControl: UntypedFormControl = new UntypedFormControl(); // Control de formulario no tipado para la búsqueda
    //selectedProduct: InventoryProduct | null = null; // Producto seleccionado, inicializado como null
    selectedEquipment: InventoryEquipment | null = null;//equipment seleccionado, inicializado como null
    selectedEquipmentForm: UntypedFormGroup; // Formulario no tipado para el producto seleccionado
    tags: InventoryTag[]; // Arreglo de etiquetas
    tagsEditMode: boolean = false; // Modo de edición de etiquetas
    vendors: InventoryVendor[]; // Arreglo de vendedores
    private _unsubscribeAll: Subject<any> = new Subject<any>(); // Observable para manejar la destrucción de suscripciones

    /**
     * Constructor del componente
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef, // Referencia para forzar la detección de cambios
        private _fuseConfirmationService: FuseConfirmationService, // Servicio para mostrar diálogos de confirmación
        private _formBuilder: UntypedFormBuilder, // Constructor de formularios
        private _inventoryService: InventoryService, // Servicio para manejar inventario
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Ciclos de vida
    // -----------------------------------------------------------------------------------------------------

    /**
     * Método que se ejecuta al inicializar el componente
     */
    ngOnInit(): void {
        // Crear el formulario del producto seleccionado
        this.selectedEquipmentForm = this._formBuilder.group({
        equipos_id          : [0], // Equipos_id es la clave primaria
        ip                  : [null], // Dirección IP del equipo
        procesador          : [null], // Tipo de procesador
        funcionariousuario  : [null], // Usuario asignado al equipo
        lector              : [null], // Lector de tarjetas, CDs, etc.
        tarjetavideo        : [null], // Información sobre la tarjeta de video
        funcionarioasignado : [null], // Funcionario al que se asigna el equipo
        oficina             : [null], // Oficina donde se encuentra el equipo
        fecharegistro       : [null], // Fecha de registro del equipo
        codigo              : [null], // Código del equipo
        memoria             : [null], // Información de la memoria RAM
        tarjetamadre        : [null], // Información de la tarjeta madre
        antivirus           : [null], // Software antivirus instalado
        garantia            : [null], // Garantía del equipo
        discoduro           : [null], // Información sobre el disco duro
        marca               : [null], // Marca del equipo
        tipo                : [null], // Tipo de equipo (PC, Laptop, etc.)
        modelo              : [null], // Modelo del equipo
        serie               : [null], // Número de serie
        so                  : [null], // Sistema operativo
        responsable         : [null], // ID del responsable
        mac                 : [null], // Dirección MAC de la tarjeta de red
        active: [true], // Asegúrate de incluir este control
        });

        // Obtener las marcas del servicio de inventario
        this._inventoryService.brands$
            .pipe(takeUntil(this._unsubscribeAll)) // Desuscribirse cuando se destruye el componente
            .subscribe((brands: InventoryBrand[]) => {
                this.brands = brands; // Actualizar las marcas
                this._changeDetectorRef.markForCheck(); // Marcar para detección de cambios
            });

        // Obtener las categorías
        this._inventoryService.categories$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((categories: InventoryCategory[]) => {
                this.categories = categories; // Actualizar las categorías
                this._changeDetectorRef.markForCheck(); // Marcar para detección de cambios
            });

        
         // Obtener los productos
         this.equipments$ = this._inventoryService.equipments$;
         console.log('Equipments loaded:', this.equipments$)

        this._inventoryService.equipments$.pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (equipments) => console.log('Equipments loaded:', equipments),
            error: (err) => console.error('Error loading equipments:', err),
        });
        this._inventoryService.equipments$.pipe(
            takeUntil(this._unsubscribeAll)
        ).subscribe((equipments) => {
            console.log('Equipments from service:', equipments);
            if (Array.isArray(equipments)) {
                console.log('Equipments length:', equipments.length);
            } else {
                console.error('Equipments is not an array');
            }
        });
            

        // Obtener los datos de paginación
        this._inventoryService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: InventoryPagination) => {
                this.pagination = pagination; // Actualizar la paginación
                this._changeDetectorRef.markForCheck(); // Marcar para detección de cambios
            });

        // Obtener los productos
        //this.products$ = this._inventoryService.products$;
        
        
        // Obtener las etiquetas
        this._inventoryService.tags$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tags: InventoryTag[]) => {
                this.tags = tags; // Actualizar etiquetas
                this.filteredTags = tags; // Actualizar etiquetas filtradas
                this._changeDetectorRef.markForCheck(); // Marcar para detección de cambios
            });

        // Obtener los vendedores
        this._inventoryService.vendors$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((vendors: InventoryVendor[]) => {
                this.vendors = vendors; // Actualizar vendedores
                this._changeDetectorRef.markForCheck(); // Marcar para detección de cambios
            });

        // Suscribirse a los cambios en el campo de búsqueda
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300), // Agregar un retraso de 300ms para optimizar la búsqueda
                switchMap((query) => {
                    this.closeDetails(); // Cerrar los detalles del producto
                    this.isLoading = true; // Indicar que la carga está en progreso
                    return this._inventoryService.getEquipments(0, 10, 'name', 'asc', query); // Obtener productos
                }),
                map(() => {
                    this.isLoading = false; // Indicar que la carga ha finalizado
                }),
            )
            .subscribe();
    }

    /**
     * Método que se ejecuta después de que la vista se ha inicializado
     */
    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            // Establecer el orden inicial
            this._sort.sort({
                id          : 'name',
                start       : 'asc',
                disableClear: true,
            });

            // Marcar para detección de cambios
            this._changeDetectorRef.markForCheck();

            // Cuando el usuario cambia el orden de la tabla
            this._sort.sortChange
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => {
                    this._paginator.pageIndex = 0; // Reiniciar a la primera página
                    this.closeDetails(); // Cerrar los detalles del producto
                });

            // Obtener productos si el orden o la página cambian
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.closeDetails(); // Cerrar los detalles del producto
                    this.isLoading = true; // Indicar que está cargando
                    return this._inventoryService.getEquipments(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction); // Obtener productos
                }),
                map(() => {
                    this.isLoading = false; // Indicar que la carga ha finalizado
                }),
            ).subscribe();
        }
    }

    /**
     * Método que se ejecuta al destruir el componente
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next(null); // Desuscribirse de todas las suscripciones
        this._unsubscribeAll.complete(); // Completar la desuscripción
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos públicos
    // -----------------------------------------------------------------------------------------------------

    /**
     * Alternar los detalles de un producto
     * @param equipos_id
     */
    toggleDetails2(equipos_id: number): void {
        // Si el producto ya está seleccionado, cerrar los detalles
        if (this.selectedEquipment && this.selectedEquipment.equipos_id === equipos_id) {
            this.closeDetails();
            return;
        }

        // Obtener el producto por ID
        this._inventoryService.getEquipmentById(equipos_id)
            .subscribe((equipment) => {
               // this.selectedEquipment = equipment; // Establecer el producto seleccionado
               // this.selectedEquipmentForm.patchValue(equipment); // Rellenar el formulario con los datos del producto
                this._changeDetectorRef.markForCheck(); // Marcar para detección de cambios
            });
    }
    toggleDetails(equipos_id: number): void {
        // Si el producto ya está seleccionado, cerrar los detalles
        if (this.selectedEquipment && this.selectedEquipment.equipos_id === equipos_id) {
            this.closeDetails();
            return;
        }
        
        this._inventoryService.getEquipmentById(equipos_id).subscribe({
            next: (response) => {
                console.log('Equipo recibido: toggleDetails', response); // Depuración
                this.selectedEquipment = response.data; // Extrae `data` de la respuesta
                this.selectedEquipmentForm.patchValue(response.data);
                this._changeDetectorRef.markForCheck(); // Forzar la detección de cambios
            },
            error: (err) => {
                console.error('Error al obtener el equipo:', err);
            },
        });
    }

    /**
     * Cerrar los detalles del producto
     */
    closeDetails(): void {
        this.selectedEquipment = null; // Restablecer el producto seleccionado
    }

    /**
     * Ciclar a través de las imágenes del producto seleccionado
     */
    cycleImages(forward: boolean = true): void {
        const count = this.selectedEquipmentForm.get('images').value.length; // Número de imágenes
        const currentIndex = this.selectedEquipmentForm.get('currentImageIndex').value; // Índice de la imagen actual

        const nextIndex = currentIndex + 1 === count ? 0 : currentIndex + 1; // Índice siguiente
        const prevIndex = currentIndex - 1 < 0 ? count - 1 : currentIndex - 1; // Índice anterior

        // Si se cicla hacia adelante
        if (forward) {
            this.selectedEquipmentForm.get('currentImageIndex').setValue(nextIndex); // Actualizar al índice siguiente
        } else {
            this.selectedEquipmentForm.get('currentImageIndex').setValue(prevIndex); // Actualizar al índice anterior
        }
    }

    /**
     * Alternar el modo de edición de etiquetas
     */
    toggleTagsEditMode(): void {
        this.tagsEditMode = !this.tagsEditMode; // Alternar el modo de edición de etiquetas
    }

    /**
     * Filtrar etiquetas
     * @param event
     */
    filterTags(event): void {
        const value = event.target.value.toLowerCase(); // Convertir el valor ingresado a minúsculas
        this.filteredTags = this.tags.filter(tag => tag.title.toLowerCase().includes(value)); // Filtrar las etiquetas
    }

    /*
     * Manejar el evento de teclado en el filtro de etiquetas
     * @param event
     
    filterTagsInputKeyDown(event): void {
        // Retornar si la tecla presionada no es 'Enter'
        if (event.key !== 'Enter') {
            return;
        }

        // Si no hay etiquetas disponibles, crear una nueva
        if (this.filteredTags.length === 0) {
            this.createTag(event.target.value); // Crear una nueva etiqueta
            event.target.value = ''; // Limpiar el campo de entrada
            return;
        }

        const tag = this.filteredTags[0]; // Obtener la primera etiqueta filtrada
        const isTagApplied = this.selectedEquipment.tags.find(id => id === tag.id); // Verificar si la etiqueta ya está aplicada

        // Si la etiqueta ya está aplicada al producto, eliminarla
        if (isTagApplied) {
            this.removeTagFromProduct(tag);
        } else {
            // De lo contrario, agregar la etiqueta al producto
            this.addTagToProduct(tag);
        }
    }
        */

    /*
     * Crear una nueva etiqueta
     * @param title
    
    createTag(title: string): void {
        const tag = {
            title,
        };

        this._inventoryService.createTag(tag) // Crear etiqueta en el servidor
            .subscribe((response) => {
                this.addTagToProduct(response); // Agregar la etiqueta al producto
            });
    }
             */

    /**
     * Actualizar el título de una etiqueta
     * @param tag
     * @param event
     */
    updateTagTitle(tag: InventoryTag, event): void {
        tag.title = event.target.value; // Actualizar el título de la etiqueta

        this._inventoryService.updateTag(tag.id, tag) // Actualizar la etiqueta en el servidor
            .pipe(debounceTime(300))
            .subscribe();

        this._changeDetectorRef.markForCheck(); // Marcar para detección de cambios
    }

    /**
     * Eliminar una etiqueta
     * @param tag
     */
    deleteTag(tag: InventoryTag): void {
        //this._inventoryService.deleteTag(tag.id).subscribe(); // Eliminar la etiqueta en el servidor
        this._changeDetectorRef.markForCheck(); // Marcar para detección de cambios
    }

    /*
     * Agregar una etiqueta al producto
     * @param tag
    
    addTagToProduct(tag: InventoryTag): void {
        this.selectedProduct.tags.unshift(tag.id); // Agregar la etiqueta al inicio del arreglo
        this.selectedEquipmentForm.get('tags').patchValue(this.selectedProduct.tags); // Actualizar el formulario
        this._changeDetectorRef.markForCheck(); // Marcar para detección de cambios
    }
         */

    /*
     * Eliminar una etiqueta del producto
     * @param tag
     
    removeTagFromProduct(tag: InventoryTag): void {
        this.selectedProduct.tags.splice(this.selectedProduct.tags.findIndex(item => item === tag.id), 1); // Eliminar la etiqueta
        this.selectedEquipmentForm.get('tags').patchValue(this.selectedProduct.tags); // Actualizar el formulario
        this._changeDetectorRef.markForCheck(); // Marcar para detección de cambios
    }
        */

    /*
     * Alternar el estado de una etiqueta del producto
     * @param tag
     * @param change
     
    toggleProductTag(tag: InventoryTag, change: MatCheckboxChange): void {
        if (change.checked) {
            this.addTagToProduct(tag); // Agregar etiqueta
        } else {
            this.removeTagFromProduct(tag); // Eliminar etiqueta
        }
    }
        */

    /**
     * Verificar si el botón para crear una nueva etiqueta debe mostrarse
     * @param inputValue
     */
    shouldShowCreateTagButton(inputValue: string): boolean {
        return !!!(inputValue === '' || this.tags.findIndex(tag => tag.title.toLowerCase() === inputValue.toLowerCase()) > -1); // Verificar si no hay etiquetas con ese nombre
    }

    /**
     * Crear un nuevo producto
     */
    createEquipment(): void 
    {
        this._inventoryService.createEquipment().subscribe((newEquipment) => {
            this.selectedEquipment = newEquipment; // Establecer el producto como seleccionado
            this.selectedEquipmentForm.patchValue(newEquipment); // Rellenar el formulario con los datos del nuevo producto
            this._changeDetectorRef.markForCheck(); // Marcar para detección de cambios
            console.log("Nuevo equipo creado y formulario abierto.");
        });
    }

    /**
     * Actualizar el producto seleccionado usando los datos del formulario
     */
    updateSelectedEquipment(): void {
        const  equipment = this.selectedEquipmentForm.getRawValue(); // Obtener los valores del formulario
        delete equipment.currentImageIndex; // Eliminar el índice de imagen actual, ya que no es necesario para el servidor

        this._inventoryService.updateEquipment(this.selectedEquipment.equipos_id, equipment).subscribe(() => {
            this.showFlashMessage('success'); // Mostrar mensaje de éxito
        });
    }

    /**
     * Eliminar el producto seleccionado usando los datos del formulario
     */
    deleteSelectedEquipment(): void {
        const confirmation = this._fuseConfirmationService.open({ // Abrir diálogo de confirmación
            title  : 'Delete product', // Título del diálogo
            message: 'Are you sure you want to remove this product? This action cannot be undone!', // Mensaje del diálogo
            actions: {
                confirm: {
                    label: 'Delete', // Etiqueta del botón de confirmación
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                const equipment = this.selectedEquipmentForm.getRawValue(); // Obtener los valores del formulario
                this._inventoryService.deleteEquipment(equipment.equipos_id).subscribe(() => { // Eliminar el producto en el servidor
                    this.closeDetails(); // Cerrar los detalles del producto
                });
            }
        });
    }

    /**
     * Mostrar un mensaje flash
     */
    showFlashMessage(type: 'success' | 'error'): void {
        this.flashMessage = type; // Establecer el tipo de mensaje (éxito o error)
        this._changeDetectorRef.markForCheck(); // Marcar para detección de cambios

        setTimeout(() => { // Ocultar el mensaje después de 3 segundos
            this.flashMessage = null; // Restablecer el mensaje flash
            this._changeDetectorRef.markForCheck(); // Marcar para detección de cambios
        }, 3000);
    }

    /**
     * Función trackBy para optimizar el rendimiento de las listas en *ngFor
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index; // Devolver el ID del item o el índice si no tiene ID
    }
    
    
}
