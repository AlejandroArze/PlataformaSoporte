import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FinanceService } from './finance.service';
import { ScrumboardService } from 'app/modules/admin/apps/scrumboard/scrumboard.service';
import { Subject, takeUntil } from 'rxjs';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

// Extender el tipo jsPDF para incluir autoTable
interface jsPDFWithPlugin extends jsPDF {
    autoTable: (options: any) => jsPDF;
    internal: any;
}

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
        MatFormFieldModule,
        MatPaginatorModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        MatIconModule
    ],
})
export class FinanceComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) paginator: MatPaginator;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    
    // Variables para mostrar en el datepicker
    fechaInicioDisplay: Date;
    fechaFinDisplay: Date;
    
    // Variables para la API
    fechaInicio: string;
    fechaFin: string;
    tipoServicio: string = 'TODOS';
    tecnico: string = 'TODOS';
    
    tecnicos: any[] = [];
    totalItems: number = 0;
    pageSize: number = 10;
    currentPage: number = 0;

    displayedColumns: string[] = [
        'index',
        'numero',
        'tipoServicio',
        'tecnicoAsignado',
        'fechaInicio',
        'fechaTerminado',
        'solicitante'
    ];
    
    dataSource = new MatTableDataSource([]);

    private tecnicosMap: Map<number, string> = new Map();
    
    constructor(
        private _financeService: FinanceService,
        private _scrumboardService: ScrumboardService
    ) {
        const hoy = new Date();
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        
        // Inicializar las fechas para mostrar
        this.fechaInicioDisplay = primerDia;
        this.fechaFinDisplay = ultimoDia;
        
        // Inicializar las fechas para la API
        this.fechaInicio = this.formatDateForApi(primerDia);
        this.fechaFin = this.formatDateForApi(ultimoDia);
    }

    ngOnInit(): void {
        this._scrumboardService.getTecnicos()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tecnicos) => {
                this.tecnicos = tecnicos;
                tecnicos.forEach(tecnico => {
                    if (tecnico.id) {
                        this.tecnicosMap.set(tecnico.id, tecnico.nombre);
                    }
                });
            });

        this.consultar();
    }

    ngAfterViewInit() {
        this.paginator.page
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.loadPage();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    consultar(): void {
        this.currentPage = 0;
        if (this.paginator) {
            this.paginator.pageIndex = 0;
        }
        this.loadPage();
    }

    loadPage(): void {
        this._financeService.consultarServicios({
            fechaInicio: this.fechaInicio,
            fechaFin: this.fechaFin,
            tipoServicio: this.tipoServicio,
            tecnico: this.tecnico,
            page: this.paginator ? this.paginator.pageIndex + 1 : 1,
            limit: this.pageSize
        }).subscribe(response => {
            this.dataSource.data = response.data.data;
            this.totalItems = response.data.total;
        });
    }

    private formatDateForApi(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    getTecnicoNombre(tecnicoId: number): string {
        return this.tecnicosMap.get(tecnicoId) || 'No asignado';
    }

    onFechaInicioChange(event: MatDatepickerInputEvent<Date>): void {
        if (event.value) {
            this.fechaInicio = this.formatDateForApi(event.value);
        }
    }

    onFechaFinChange(event: MatDatepickerInputEvent<Date>): void {
        if (event.value) {
            this.fechaFin = this.formatDateForApi(event.value);
        }
    }

    generarPDF(): void {
        const doc = new jsPDF() as jsPDFWithPlugin;
        const pageWidth = doc.internal.pageSize.width;
        const today = new Date();

        // Configurar el encabezado
        doc.setFontSize(16);
        doc.text('Sistema de Soporte Técnico - Alcaldía de Cochabamba', pageWidth/2, 15, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Fecha de generación: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`, pageWidth/2, 25, { align: 'center' });

        // Título del reporte con parámetros
        doc.setFontSize(14);
        const titulo = 'Reporte de Servicios';
        doc.text(titulo, pageWidth/2, 35, { align: 'center' });

        // Parámetros de la consulta
        const parametros = [
            `Fecha Inicio: ${this.fechaInicio}`,
            `Fecha Fin: ${this.fechaFin}`,
            `Tipo de Servicio: ${this.tipoServicio}`,
            `Técnico: ${this.tecnico === 'TODOS' ? 'TODOS' : this.getTecnicoNombre(Number(this.tecnico))}`
        ];

        doc.setFontSize(10);
        parametros.forEach((param, index) => {
            doc.text(param, 14, 45 + (index * 5));
        });

        // Generar la tabla
        const tableData = this.dataSource.data.map((row, index) => [
            (this.paginator.pageIndex * this.paginator.pageSize) + index + 1,
            row.numero,
            row.tipo,
            this.getTecnicoNombre(row.tecnicoAsignado),
            new Date(row.fechaInicio).toLocaleDateString(),
            new Date(row.fechaTerminado).toLocaleDateString(),
            row.nombreSolicitante
        ]);

        doc.autoTable({
            head: [['#', 'Número', 'Tipo de Servicio', 'Técnico Asignado', 'Fecha Inicio', 'Fecha Terminado', 'Solicitante']],
            body: tableData,
            startY: 65,
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 2,
            },
            headStyles: {
                fillColor: [63, 81, 181],
                textColor: 255,
                fontSize: 8,
                fontStyle: 'bold',
            },
        });

        // Agregar numeración de páginas
        const pageCount = doc.internal.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Página ${i} de ${pageCount}`, pageWidth - 20, doc.internal.pageSize.height - 10);
        }

        // Guardar el PDF
        doc.save(`reporte_servicios_${today.toISOString().split('T')[0]}.pdf`);
    }
}
