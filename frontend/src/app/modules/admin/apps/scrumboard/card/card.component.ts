import { Component, Input } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Card, EstadoServicio } from '../scrumboard.models';

@Component({
    selector: 'scrumboard-card',
    templateUrl: './card.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgClass,
        MatIconModule
    ]
})
export class ScrumboardCardComponent {
    @Input() card: Card;
    @Input() boardId: string;

    // Hacer el enum disponible en el template
    protected EstadoServicio = EstadoServicio;

    /**
     * Devuelve el color de estado para la tarjeta
     */
    getStatusColor(): string {
        switch (this.card.estado) {
            case EstadoServicio.SIN_ASIGNAR:
                return 'bg-gray-500';
            case EstadoServicio.PENDIENTE:
                return 'bg-orange-500';
            case EstadoServicio.EN_PROGRESO:
                return 'bg-blue-500';
            case EstadoServicio.TERMINADO:
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
    }

    /**
     * Formatea la fecha en formato relativo
     */
    getRelativeDate(date: Date): string {
        if (!date) {
            return '';
        }
        // Aquí podrías usar una librería como date-fns o moment para formatear la fecha
        return new Date(date).toLocaleDateString();
    }
}
