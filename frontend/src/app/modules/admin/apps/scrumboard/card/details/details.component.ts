import { Component, Inject, OnInit, OnDestroy, ChangeDetectorRef, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { Card, TipoServicio, Equipo } from '../../scrumboard.models';
import { ScrumboardService } from '../../scrumboard.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, Subject, takeUntil, delay } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmationDialogComponent } from '../../dialogs/confirmation-dialog.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
    selector: 'scrumboard-card-details',
    templateUrl: './details.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDialogModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatTooltipModule,
        MatAutocompleteModule,
        MatCardModule
    ]
})
export class ScrumboardCardDetailsComponent implements OnInit, OnDestroy {
    cardForm: FormGroup;
    tiposServicio = Object.values(TipoServicio);
    actualizando = false;
    private _unsubscribeAll: Subject<void> = new Subject<void>();
    searchEquipoCtrl = new FormControl('');
    filteredEquipos: Equipo[] = [];
    bienes: any = null;
    isOptionSelected = false;
    filtredEquipos: { equipos_id: number; codigo: string }[] = [];
    showDropdown = false;

    @ViewChild('searchInput') searchInput: ElementRef;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { card: Card; isNew: boolean },
        private dialogRef: MatDialogRef<ScrumboardCardDetailsComponent>,
        private _formBuilder: FormBuilder,
        private _scrumboardService: ScrumboardService,
        private _snackBar: MatSnackBar,
        private _dialog: MatDialog,
        private _changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        // Inicializar el formulario sin validadores inicialmente
        this.cardForm = this._formBuilder.group({
            solicitante: [''],
            carnet: [''],
            cargoSolicitante: [''],
            tipoSolicitante: [''],
            oficina: [''],
            telefono: [''],
            tipoServicio: [''],
            estado: ['SIN ASIGNAR'],
            tecnicoRegistro: [''],
            fechaRegistro: [null],
            fechaInicio: [null],
            fechaTerminado: [null],
            problema: [''],
            observaciones: [''],
            informe: [''],
            equipo: [''],
            tipoHardware: [''],
            nombreResponsableEgreso: [''],
            cargoResponsableEgreso: [''],
            telefonoResponsableEgreso: [''],
            gestion: [3],
            tecnicoAsignado: [3],
            tipoResponsableEgreso: [''],
            oficinaResponsableEgreso: [''],
            numero: [464],
            fechaEgreso: [''],
            tecnicoEgreso: [''],
            ciResponsableEgreso: ['']
        });

        // Si no es nuevo, cargar los datos de la tarjeta
        if (!this.data.isNew && this.data.card) {
            console.log('Cargando datos de la tarjeta:', this.data.card);
            
            // Primero cargar los datos básicos
            this.cardForm.patchValue({
                solicitante: this.data.card.nombreSolicitante || '',
                carnet: this.data.card.carnet || '',
                cargoSolicitante: this.data.card.cargo || '',
                tipoSolicitante: this.data.card.tipoSolicitante || '',
                oficina: this.data.card.oficinaSolicitante || '',
                telefono: this.data.card.telefonoSolicitante || '',
                tipoServicio: this.data.card.tipo || '',
                estado: this.data.card.estado || 'SIN ASIGNAR',
                tecnicoRegistro: this.data.card.tecnicoAsignado || 3,
                fechaRegistro: this.data.card.fechaRegistro || new Date().toISOString(),
                fechaInicio: this.data.card.fechaInicio || null,
                fechaTerminado: this.data.card.fechaTerminado || null,
                problema: this.data.card.problema || '',
                observaciones: this.data.card.observacionesProblema || '',
                informe: this.data.card.informe || '',
                equipo: this.data.card.codigoBienes || ''
            });

            // Si hay un equipo_id, buscar su código
            if (this.data.card.codigoBienes) {
                this._scrumboardService.buscarEquipos(1, 100, '')
                    .subscribe({
                        next: (equipos) => {
                            const equipo = equipos.find(e => e.equipos_id === parseInt(this.data.card.codigoBienes));
                            if (equipo) {
                                this.searchEquipoCtrl.setValue(equipo.codigo, { emitEvent: false });
                                this.cardForm.controls['equipo'].setValue(equipo.equipos_id);
                                // También obtener la información del bien
                                this._scrumboardService.getBienes(equipo.codigo)
                                    .subscribe({
                                        next: (response) => {
                                            this.bienes = response;
                                        },
                                        error: (err) => {
                                            console.error('Error al obtener bienes:', err);
                                            this.bienes = null;
                                        }
                                    });
                            }
                        },
                        error: (err) => {
                            console.error('Error al buscar equipo:', err);
                        }
                    });
            }
        }

        // Marcar todos los campos como touched para activar la validación
        Object.keys(this.cardForm.controls).forEach(key => {
            const control = this.cardForm.get(key);
            control.markAsTouched();
        });

        // Suscribirse a los cambios del input
        this.searchEquipoCtrl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(value => {
                if (typeof value === 'string') {
                    this.onSearchEquipos(value);
                }
            });

        // Si no es nuevo y hay un equipo_id, buscar y cargar su información
        if (!this.data.isNew && this.data.card?.codigoBienes) {
            console.log('Buscando equipo con ID:', this.data.card.codigoBienes);
            
            // Primero buscar el equipo por su ID
            this._scrumboardService.buscarEquipos(1, 100, '')
                .subscribe({
                    next: (equipos) => {
                        // Encontrar el equipo que coincida con el ID
                        const equipo = equipos.find(e => e.equipos_id === parseInt(this.data.card.codigoBienes));
                        if (equipo) {
                            console.log('Equipo encontrado:', equipo);
                            
                            // Establecer el código en el input y el ID en el formulario
                            this.searchEquipoCtrl.setValue(equipo.codigo, { emitEvent: false });
                            this.cardForm.controls['equipo'].setValue(equipo.equipos_id);

                            // Cargar la información de bienes
                            this._scrumboardService.getBienes(equipo.codigo)
                                .subscribe({
                                    next: (response) => {
                                        this.bienes = response;
                                        console.log('Información de bienes cargada:', this.bienes);
                                    },
                                    error: (err) => {
                                        console.error('Error al obtener bienes:', err);
                                        this.bienes = null;
                                    }
                                });

                            // También cargar los equipos filtrados para el dropdown
                            this.filtredEquipos = equipos
                                .filter(e => e.codigo && e.codigo.trim() !== '')
                                .reduce((acc, current) => {
                                    const exists = acc.find(item => item.codigo === current.codigo);
                                    if (!exists) {
                                        return [...acc, current];
                                    }
                                    return acc;
                                }, []);
                        } else {
                            console.warn('No se encontró el equipo con ID:', this.data.card.codigoBienes);
                        }
                    },
                    error: (err) => {
                        console.error('Error al buscar equipo:', err);
                    }
                });
        }

        // Suscribirse a cambios en el formulario para actualización automática
        this.cardForm.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(2000)  // Esperar 2 segundos después del último cambio
            )
            .subscribe(formValue => {
                console.log('Detectado cambio en el formulario:', {
                    formValue,
                    isDirty: this.cardForm.dirty,
                    isValid: this.cardForm.valid,
                    actualizando: this.actualizando
                });

                if (!this.actualizando && this.cardForm.dirty) {
                    console.log('Iniciando actualización automática...');
                    this.onSubmit();
                }
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    onSubmit(): void {
        if (this.actualizando) {
            return;
        }

        this.actualizando = true;
        const formData = this.cardForm.getRawValue();
        const updateData = {
            servicios_id: parseInt(this.data.card.id),
            nombreResponsableEgreso: " edit",
            cargoSolicitante: formData.cargoSolicitante || " ",
            informe: formData.informe || "SE ACTIVO EL OFFICE",
            cargoResponsableEgreso: " ",
            oficinaSolicitante: formData.oficina || "SECRETARIA DE DESARROLLO HUMANO",
            fechaRegistro: formData.fechaRegistro || "2020-04-16T12:20:58.420Z",
            equipo: formData.equipo || 1,
            problema: formData.problema || "ACTIVAR OFFICE",
            telefonoResponsableEgreso: " ",
            gestion: 3,
            telefonoSolicitante: formData.telefono || "4460697",
            tecnicoAsignado: 3,
            observaciones: formData.observaciones || " ",
            tipoResponsableEgreso: " ",
            estado: formData.estado || "TERMINADO",
            tipoSolicitante: formData.tipoSolicitante || "INDEFINIDO - ITEM",
            fechaTerminado: formData.fechaTerminado || "2020-04-16T12:20:58.420Z",
            oficinaResponsableEgreso: " ",
            numero: 464,
            fechaInicio: formData.fechaInicio || "2020-04-16T12:20:58.420Z",
            fechaEgreso: " ",
            ciSolicitante: formData.carnet || "5676174",
            nombreSolicitante: formData.solicitante || "JASSEL GABRIELA ENCINAS NAVIA",
            tipo: formData.tipoServicio || "ASISTENCIA",
            tecnicoRegistro: 3,
            tecnicoEgreso: " ",
            ciResponsableEgreso: " "
        };

        this._scrumboardService.updateService(this.data.card.id, updateData)
            .pipe(delay(700))
            .subscribe({
                next: (response) => {
                    // Notificar la actualización
                    this._scrumboardService.notifyCardUpdate('update', Number(this.data.card.id), this.data.card.listId);
                    
                    this._snackBar.open('Servicio actualizado correctamente', 'Cerrar', {
                        duration: 3000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top',
                        panelClass: ['success-snackbar']
                    });
                    
                    this.actualizando = false;
                    this.cardForm.markAsPristine();
                },
                error: (error) => {
                    console.error('Error en actualización:', error);
                    this._snackBar.open('Error al actualizar el servicio', 'Cerrar', {
                        duration: 3000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top',
                        panelClass: ['error-snackbar']
                    });
                    this.actualizando = false;
                }
            });
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    buscarBien(): void {
        // Aquí implementar la búsqueda del bien
        console.log('Buscando bien...');
        // Cuando se encuentre el bien, actualizar el tipo de hardware
        // this.cardForm.patchValue({ tipoHardware: 'Tipo encontrado' });
    }

    onDelete(): void {
        const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
            data: {
                title: 'Eliminar servicio',
                message: '¿Está seguro de eliminar este servicio?'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this._scrumboardService.deleteService(this.data.card.id)
                    .subscribe({
                        next: () => {
                            // Notificar la eliminación con el listId
                            this._scrumboardService.notifyCardUpdate('delete', Number(this.data.card.id), this.data.card.listId);
                            
                            this._snackBar.open('Servicio eliminado correctamente', 'Cerrar', {
                                duration: 3000,
                                horizontalPosition: 'end',
                                verticalPosition: 'top',
                                panelClass: ['success-snackbar']
                            });
                            
                            this.dialogRef.close('deleted');
                        },
                        error: (error) => {
                            console.error('Error al eliminar servicio:', error);
                            this._snackBar.open('Error al eliminar el servicio', 'Cerrar', {
                                duration: 3000,
                                horizontalPosition: 'end',
                                verticalPosition: 'top',
                                panelClass: ['error-snackbar']
                            });
                        }
                    });
            }
        });
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        
        // Verificar si el clic fue en el input o en el dropdown
        const isInputClick = target.closest('input') !== null;
        const isDropdownClick = target.closest('.dropdown-container') !== null;
        
        // Solo cerrar si el clic fue fuera de ambos
        if (!isInputClick && !isDropdownClick) {
            this.showDropdown = false;
            this._changeDetectorRef.detectChanges();
        }
    }

    onSearchEquipos(event: any): void {
        let query = '';
        
        // Manejar tanto el caso cuando recibimos el evento como cuando recibimos el string directamente
        if (typeof event === 'string') {
            query = event;
        } else if (event?.target?.value !== undefined) {
            query = event.target.value;
        }

        // Solo mostrar el dropdown y buscar si hay un query
        if (query.trim() !== '') {
            this.showDropdown = true;
            
            this._scrumboardService.buscarEquipos(1, 100, query)
                .subscribe({
                    next: (equipos: { equipos_id: number; codigo: string }[]) => {
                        // Filtrar equipos que coincidan con la búsqueda
                        this.filtredEquipos = equipos
                            .filter(equipo => 
                                equipo.codigo && 
                                equipo.codigo.trim() !== '' &&
                                equipo.codigo.toLowerCase().includes(query.toLowerCase())
                            )
                            .reduce((acc, current) => {
                                // Eliminar duplicados
                                const exists = acc.find(item => item.codigo === current.codigo);
                                if (!exists) {
                                    return [...acc, current];
                                }
                                return acc;
                            }, []);

                        this.showDropdown = this.filtredEquipos.length > 0;
                        this._changeDetectorRef.detectChanges();
                    },
                    error: (err) => {
                        console.error('Error al buscar equipos:', err);
                        this.filtredEquipos = [];
                        this.showDropdown = false;
                        this._changeDetectorRef.detectChanges();
                    },
                });
        } else {
            // Si no hay query, limpiar resultados
            this.filtredEquipos = [];
            this.showDropdown = false;
            this._changeDetectorRef.detectChanges();
        }
    }

    onEquipoSelected(event: MatAutocompleteSelectedEvent): void {
        const equipo = event.option.value as Equipo;
        console.log('Equipo seleccionado:', equipo);
        this.selectEquipo(equipo);
    }

    selectEquipo(equipo: { equipos_id: number; codigo: string }): void {
        this.cardForm.controls['equipo'].setValue(equipo.equipos_id); // Guarda el ID del equipo
        this.searchEquipoCtrl.setValue(equipo.codigo, { emitEvent: false }); // Evitar que se dispare la búsqueda
        this.showDropdown = false;
        
        // Obtener información del bien después de seleccionar
        if (equipo.codigo) {
            this._scrumboardService.getBienes(equipo.codigo)
                .subscribe({
                    next: (response) => {
                        this.bienes = response;
                        // Forzar la actualización después de obtener los bienes
                        this.onSubmit();
                    },
                    error: (err) => {
                        console.error('Error al obtener bienes:', err);
                        this.bienes = null;
                    }
                });
        }
        
        this._changeDetectorRef.detectChanges();
    }

    displayFn = (equipo: Equipo): string => {
        return equipo ? equipo.codigo : '';
    }

    getBienes(): void {
        const codigoBienes = this.searchEquipoCtrl.value;
        if (codigoBienes) {
            this._scrumboardService.getBienes(codigoBienes)
                .subscribe({
                    next: (response) => {
                        this.bienes = response;
                        console.log('Bienes encontrados:', this.bienes);
                    },
                    error: (err) => {
                        console.error('Error al obtener bienes:', err);
                        this.bienes = null;
                    }
            });
        }
    }

    // Agregar método para manejar el focus
    onFocus(): void {
        // Mostrar todos los equipos al hacer focus
        this._scrumboardService.buscarEquipos(1, 100, '')
            .subscribe({
                next: (equipos: { equipos_id: number; codigo: string }[]) => {
                    this.filtredEquipos = equipos.filter(equipo => 
                        equipo.codigo && equipo.codigo.trim() !== ''
                    );
                    this.showDropdown = this.filtredEquipos.length > 0;
                    this._changeDetectorRef.detectChanges();
                },
                error: (err) => {
                    console.error('Error al buscar equipos:', err);
                    this.filtredEquipos = [];
                    this.showDropdown = false;
                    this._changeDetectorRef.detectChanges();
                }
            });
    }
}

