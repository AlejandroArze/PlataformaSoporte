import { TextFieldModule } from '@angular/cdk/text-field';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { Card, EstadoServicio } from '../../scrumboard.models';
import { ScrumboardService } from '../../scrumboard.service';

@Component({
    selector: 'scrumboard-card-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatButtonModule,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        TextFieldModule,
        NgClass,
        NgIf,
        NgFor,
        DatePipe,
        MatSelectModule,
        MatDialogModule
    ]
})
export class ScrumboardCardDetailsComponent {
    form: FormGroup;
    card: Card;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { card: Card; isNew: boolean },
        public dialogRef: MatDialogRef<ScrumboardCardDetailsComponent>,
        private _formBuilder: FormBuilder,
        private _scrumboardService: ScrumboardService
    ) {
        this.card = data.card;
    }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            nombreSolicitante: [this.card?.nombreSolicitante || '', Validators.required],
            carnet: [this.card?.carnet || '', Validators.required],
            cargo: [this.card?.cargo || ''],
            tipoSolicitante: [this.card?.tipoSolicitante || ''],
            problema: [this.card?.problema || '', Validators.required],
            tipo: [this.card?.tipo || '', Validators.required],
            estado: [this.card?.estado || EstadoServicio.SIN_ASIGNAR],
            tecnicoAsignado: [this.card?.tecnicoAsignado || null],
            oficinaSolicitante: [this.card?.oficinaSolicitante || ''],
            telefonoSolicitante: [this.card?.telefonoSolicitante || ''],
            codigoBienes: [this.card?.codigoBienes || ''],
            observacionesProblema: [this.card?.observacionesProblema || '']
        });

        if (!this.data.isNew) {
            this.form.get('nombreSolicitante').disable();
            this.form.get('carnet').disable();
        }
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    save(): void {
        if (this.form.invalid) {
            return;
        }

        const cardData = this.form.getRawValue();
        
        if (this.data.isNew) {
            this._scrumboardService.createService(cardData).subscribe(() => {
                this.dialogRef.close(true);
            });
        } else {
            this._scrumboardService.updateService({
                ...this.card,
                ...cardData
            }).subscribe(() => {
                this.dialogRef.close(true);
            });
        }
    }
}
