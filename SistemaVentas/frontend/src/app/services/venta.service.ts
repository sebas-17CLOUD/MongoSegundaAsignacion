import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReporteGeneral {
  facturacionTotal: number;
  ticketPromedio: number;
  totalTransacciones: number;
  ventaMaxima: number;
  ventaMinima: number;
}

export interface ProductoVendido {
  idProducto: string;
  nombre: string;
  categoria: string;
  cantidadTotalVendida: number;
  ingresoGenerado: number;
}

export interface VendedorRendimiento {
  identificacion: string;
  nombre: string;
  sucursal: string;
  cantidadVentas: number;
  montoTotalVendido: number;
}

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private apiUrl = 'http://localhost:5232/api/reportes';

  constructor(private http: HttpClient) {}

  getReporteGeneral(): Observable<ReporteGeneral> {
    return this.http.get<ReporteGeneral>(`${this.apiUrl}/general`);
  }

  getProductosMasVendidos(): Observable<ProductoVendido[]> {
    return this.http.get<ProductoVendido[]>(`${this.apiUrl}/productos-mas-vendidos`);
  }

  getDesempenoVendedores(): Observable<VendedorRendimiento[]> {
    return this.http.get<VendedorRendimiento[]>(`${this.apiUrl}/vendedores`);
  }
}