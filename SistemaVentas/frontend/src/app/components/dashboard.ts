import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentaService } from '../services/venta.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container my-5">
      <div class="text-center mb-5">
        <h1 class="fw-bold text-primary">Sistema de Análisis Comercial</h1>
        <p class="text-muted">Reportes y métricas de ventas conectados a MongoDB Atlas</p>
      </div>

      <!-- Tarjetas de Indicadores Generales (KPIs) -->
      <div *ngIf="reporteGeneral" class="row text-center g-4 mb-5">
        <div class="col-md-4">
          <div class="card shadow-sm border-0 p-4 bg-primary text-white">
            <h6 class="text-uppercase">Facturación Total</h6>
            <h3 class="fw-bold">{{ reporteGeneral.facturacionTotal | currency:'CRC':'symbol':'1.0-0' }}</h3>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card shadow-sm border-0 p-4 bg-success text-white">
            <h6 class="text-uppercase">Ticket Promedio</h6>
            <h3 class="fw-bold">{{ reporteGeneral.ticketPromedio | currency:'CRC':'symbol':'1.0-0' }}</h3>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card shadow-sm border-0 p-4 bg-dark text-white">
            <h6 class="text-uppercase">Total Transacciones</h6>
            <h3 class="fw-bold">{{ reporteGeneral.totalTransacciones }}</h3>
          </div>
        </div>
      </div>

      <!-- Tablas de Resultados -->
      <div class="row g-4">
        <!-- Productos Más Vendidos -->
        <div class="col-lg-6">
          <div class="card shadow-sm border-0 p-3 h-100">
            <h4 class="mb-3 text-secondary">Productos Más Vendidos</h4>
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Cantidad</th>
                    <th>Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of productosMasVendidos">
                    <td class="fw-semibold">{{ p.nombre }}</td>
                    <td><span class="badge bg-info text-dark">{{ p.categoria }}</span></td>
                    <td>{{ p.cantidadTotalVendida }}</td>
                    <td>{{ p.ingresoGenerado | currency:'CRC':'symbol':'1.0-0' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Desempeño de Vendedores -->
        <div class="col-lg-6">
          <div class="card shadow-sm border-0 p-3 h-100">
            <h4 class="mb-3 text-secondary">Desempeño por Vendedor</h4>
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Vendedor</th>
                    <th>Sucursal</th>
                    <th>Ventas</th>
                    <th>Total Vendido</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let v of vendedores">
                    <td class="fw-semibold">{{ v.nombre }}</td>
                    <td>{{ v.sucursal }}</td>
                    <td>{{ v.cantidadVentas }}</td>
                    <td>{{ v.montoTotalVendido | currency:'CRC':'symbol':'1.0-0' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  reporteGeneral: any = null;
  productosMasVendidos: any[] = [];
  vendedores: any[] = [];

  constructor(
    private ventaService: VentaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.ventaService.getReporteGeneral().subscribe({
      next: (data: any) => {
        this.reporteGeneral = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar reporte general', err)
    });

    this.ventaService.getProductosMasVendidos().subscribe({
      next: (data: any[]) => {
        this.productosMasVendidos = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar productos', err)
    });

    this.ventaService.getDesempenoVendedores().subscribe({
      next: (data: any[]) => {
        this.vendedores = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar vendedores', err)
    });
  }
}