import { Component, Input } from '@angular/core';
import { NgClass, NgIf, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Card, EstadoServicio } from '../scrumboard.models';
import { AddCardComponent } from '../board/add-card/add-card.component';

@Component({
    selector: 'scrumboard-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        NgClass,
        DatePipe,
        MatIconModule,
        MatButtonModule
    ]
})
export class ScrumboardCardComponent {
    @Input() card: Card;
    protected EstadoServicio = EstadoServicio;

    constructor(private _dialog: MatDialog) {}

    openCardDetails(): void {
        this._dialog.open(AddCardComponent, {
            data: {
                card: this.card,
                isEdit: true
            },
            width: '700px',
            height: 'auto',
            maxHeight: '90vh',
            panelClass: ['service-dialog', 'dark'],
            autoFocus: false,
            disableClose: true
        });
    }
}
