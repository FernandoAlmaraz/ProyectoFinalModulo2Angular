import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../interface/product';
@Injectable({
  providedIn: 'root'
})
export class StockService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/productos';

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  updateProduct(id: number, producto: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, producto);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  createProduct(producto: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, producto);
  }

}
