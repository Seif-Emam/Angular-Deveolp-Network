// src/app/services/product.service.ts
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Product, ProductUpdate } from '../Models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = 'https://fakestoreapi.com';

  // Signals for state management
  private productsSignal = signal<Product[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Public readonly signals
  readonly products = this.productsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  loadProducts(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
  
    this.http.get<Product[]>(`${this.baseUrl}/products`)
      .subscribe({
        next: (products) => {
          this.productsSignal.set(products);
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set('Failed to load products');
          this.loadingSignal.set(false);
          console.error('Error loading products:', error);
        }
      });
  }
  
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }
  
  updateProduct(id: number, product: ProductUpdate): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/products/${id}`, product);
  }
  
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/products/categories`);
  }
  
}