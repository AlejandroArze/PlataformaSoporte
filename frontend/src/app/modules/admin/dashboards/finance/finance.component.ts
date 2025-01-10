import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FinanceService } from 'app/modules/admin/dashboards/finance/finance.service';

@Component({
    selector: 'finance',
    templateUrl: './finance.component.html',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatSelectModule,
        MatButtonModule,
        MatTableModule,
        MatFormFieldModule
    ],
})
export class FinanceComponent implements OnInit {
    fechaInicio: string;
    fechaFin: string;
    tipoServicio: string = 'TODOS';
    tecnico: string = 'TODOS';
    
    tecnicos = [
        { id: '1', nombre: 'Mauricio Gabriel Sandoval Thames' },
        // Agregar más técnicos según necesites
    ];

    // Definición de columnas para la tabla
    displayedColumns: string[] = [
        'numero',
        'tipoServicio',
        'tecnicoAsignado',
        'fechaInicio',
        'fechaTerminado',
        'solicitante'
    ];
    
    dataSource = new MatTableDataSource([]);

    constructor(private _financeService: FinanceService) {
        // Inicializar fechas con el mes actual
        const hoy = new Date();
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        
        this.fechaInicio = this.formatDate(primerDia);
        this.fechaFin = this.formatDate(ultimoDia);
    }

    ngOnInit(): void {
        this.consultar();
    }

    consultar(): void {
        // Implementar la lógica de consulta aquí
        this._financeService.consultarServicios({
            fechaInicio: this.fechaInicio,
            fechaFin: this.fechaFin,
            tipoServicio: this.tipoServicio,
            tecnico: this.tecnico
        }).subscribe(data => {
            this.dataSource.data = data;
        });
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
