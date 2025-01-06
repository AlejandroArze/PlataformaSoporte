import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { Card, TipoServicio } from '../../scrumboard.models';
import { ScrumboardService } from '../../scrumboard.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmationDialogComponent } from '../../dialogs/confirmation-dialog.component';

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
        MatTooltipModule
    ]
})
export class ScrumboardCardDetailsComponent implements OnInit, OnDestroy {
    cardForm: FormGroup;
    tiposServicio = Object.values(TipoServicio);
    actualizando = false;
    private _unsubscribeAll: Subject<void> = new Subject<void>();

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { card: Card; isNew: boolean },
        private dialogRef: MatDialogRef<ScrumboardCardDetailsComponent>,
        private _formBuilder: FormBuilder,
        private _scrumboardService: ScrumboardService,
        private _snackBar: MatSnackBar,
        private _dialog: MatDialog
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
        }

        // Suscribirse a cambios en el formulario para actualización automática
        this.cardForm.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(2000)
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

        // Marcar todos los campos como touched para activar la validación
        Object.keys(this.cardForm.controls).forEach(key => {
            const control = this.cardForm.get(key);
            control.markAsTouched();
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    onSubmit(): void {
        console.log('onSubmit llamado');
        if (this.actualizando) {
            console.log('Ya actualizando, ignorando submit');
            return;
        }

        this.actualizando = true;
        console.log('Iniciando actualización');

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
            .subscribe({
                next: (response) => {
                    console.log('Actualización exitosa:', response);
                    this._snackBar.open('Servicio actualizado correctamente', 'Cerrar', {
                        duration: 3000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top',
                        panelClass: ['success-snackbar']
                    });
                    this.actualizando = false;
                    this.cardForm.markAsPristine(); // Marcar el formulario como no modificado
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
        // Mostrar diálogo de confirmación
        const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                title: 'Confirmar eliminación',
                message: '¿Está seguro que desea eliminar este servicio?',
                confirmButton: 'Eliminar',
                cancelButton: 'Cancelar'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this._scrumboardService.deleteService(this.data.card.id)
                    .subscribe({
                        next: () => {
                            this._snackBar.open('Servicio eliminado correctamente', 'Cerrar', {
                                duration: 3000,
                                horizontalPosition: 'end',
                                verticalPosition: 'top',
                                panelClass: ['success-snackbar']
                            });
                            this.dialogRef.close(true);
                        },
                        error: (error) => {
                            console.error('Error al eliminar:', error);
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
}

