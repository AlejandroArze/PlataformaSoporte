// Importación de componentes y módulos necesarios de Angular
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'; // Módulos para manejo de formularios
import { MatButtonModule } from '@angular/material/button'; // Módulo para botones de Material
import { MatFormFieldModule } from '@angular/material/form-field'; // Módulo para campos de formulario Material
import { MatInputModule } from '@angular/material/input'; // Módulo para inputs de Material
import { MatSelectModule } from '@angular/material/select'; // Módulo para selects de Material
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog'; // Módulos para diálogos
import { MatIconModule } from '@angular/material/icon'; // Módulo para iconos de Material
import { MatDatepickerModule } from '@angular/material/datepicker'; // Módulo para selector de fechas
import { MatNativeDateModule } from '@angular/material/core'; // Módulo para manejo de fechas nativas
import { NgIf, NgFor, DatePipe } from '@angular/common'; // Directivas comunes y pipe de fecha
import { Card, EstadoServicio, TipoServicio } from '../../scrumboard.models'; // Modelos personalizados

// Decorador del componente con sus metadatos
@Component({
    selector: 'scrumboard-board-add-card', // Selector para usar el componente
    templateUrl: './add-card.component.html', // Plantilla HTML asociada
    styleUrls: ['./add-card.component.scss'], // Estilos asociados
    standalone: true, // Indica que es un componente independiente
    imports: [ // Array de módulos importados para usar en el componente
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
export class AddCardComponent {
    cardForm: FormGroup; // Formulario reactivo para la tarjeta
    tiposServicio = Object.values(TipoServicio); // Array con los tipos de servicio disponibles

    // Constructor del componente
    constructor(
        private _formBuilder: FormBuilder, // Servicio para crear formularios
        private _dialogRef: MatDialogRef<AddCardComponent> // Referencia al diálogo actual
    ) {
        // Inicialización del formulario con sus campos
        this.cardForm = this._formBuilder.group({
            solicitante: [''], // Campo para el nombre del solicitante
            carnet: [''], // Campo para el número de carnet
            cargo: [''], // Campo para el cargo del solicitante
            tipoSolicitante: [''], // Campo para el tipo de solicitante
            oficina: [''], // Campo para la oficina
            telefono: [''], // Campo para el teléfono
            tipoServicio: [''], // Campo para el tipo de servicio
            estado: [EstadoServicio.SIN_ASIGNAR], // Estado inicial del servicio
            tecnicoRegistro: [''], // Campo para el técnico que registra
            fechaRegistro: [new Date()], // Fecha actual como fecha de registro
            fechaInicio: [null], // Fecha de inicio del servicio
            fechaTerminado: [null], // Fecha de finalización del servicio
            problema: [''], // Descripción del problema
            observaciones: [''], // Campo para observaciones
            informe: [''], // Campo para el informe
            equipo: [''], // Campo para el equipo
            tipoHardware: [''], // Tipo de hardware
            descripcion: [''] // Descripción general
        });
    }

    // Método que se ejecuta al enviar el formulario
    onSubmit(): void {
        const newCard: Partial<Card> = {
            ...this.cardForm.value, // Copia todos los valores del formulario
            estado: EstadoServicio.SIN_ASIGNAR // Establece el estado inicial
        };
        this._dialogRef.close(newCard); // Cierra el diálogo y envía la nueva tarjeta
    }

    // Método para cancelar la operación
    onCancel(): void {
        this._dialogRef.close(); // Cierra el diálogo sin enviar datos
    }
}
