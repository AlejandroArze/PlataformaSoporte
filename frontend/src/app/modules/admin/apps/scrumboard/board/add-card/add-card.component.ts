import { Component, Inject, OnInit } from '@angular/core';
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

@Component({
    selector: 'scrumboard-add-card',
    templateUrl: './add-card.component.html',
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
        ReactiveFormsModule
    ]
})
export class AddCardComponent implements OnInit {
    cardForm: FormGroup;
    tiposServicio = Object.values(TipoServicio);
    isEdit: boolean;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { card: Card; isEdit: boolean },
        private dialogRef: MatDialogRef<AddCardComponent>,
        private _formBuilder: FormBuilder
    ) {
        this.isEdit = data.isEdit;
    }

    ngOnInit(): void {
        // Inicializar el formulario
        this.cardForm = this._formBuilder.group({
            solicitante: [''],
            carnet: [''],
            cargo: [''],
            tipoSolicitante: [''],
            oficina: [''],
            telefono: [''],
            tipoServicio: [''],
            estado: ['SIN ASIGNAR'],
            tecnicoRegistro: [''],
            fechaRegistro: [new Date()],
            fechaInicio: [null],
            fechaTerminado: [null],
            problema: [''],
            observaciones: [''],
            informe: [''],
            equipo: [''],
            tipoHardware: [''],
            descripcion: ['']
        });

        // Si estamos en modo edición, cargar los datos de la tarjeta
        if (this.isEdit && this.data.card) {
            this.cardForm.patchValue({
                solicitante: this.data.card.nombreSolicitante,
                carnet: this.data.card.carnet,
                cargo: this.data.card.cargo,
                tipoSolicitante: this.data.card.tipoSolicitante,
                oficina: this.data.card.oficinaSolicitante,
                telefono: this.data.card.telefonoSolicitante,
                tipoServicio: this.data.card.tipo,
                estado: this.data.card.estado,
                tecnicoRegistro: this.data.card.tecnicoAsignado,
                fechaRegistro: this.data.card.fechaRegistro,
                fechaInicio: this.data.card.fechaInicio || null,
                fechaTerminado: this.data.card.fechaTerminado || null,
                problema: this.data.card.problema,
                observaciones: this.data.card.observacionesProblema,
                informe: this.data.card.informe,
                equipo: this.data.card.codigoBienes,
                tipoHardware: this.data.card.tipoHardware,
                descripcion: this.data.card.descripcion
            });
        }
    }

    onSubmit(): void {
        const formData = this.cardForm.getRawValue();
        // Asegurarse de que las fechas vacías se envíen como null
        formData.fechaInicio = formData.fechaInicio || null;
        formData.fechaTerminado = formData.fechaTerminado || null;
        
        this.dialogRef.close(formData);
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
