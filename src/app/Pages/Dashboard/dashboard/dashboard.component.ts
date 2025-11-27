import { Product } from './../../../Core/Models/product.model';
import { Component, inject, signal, effect } from '@angular/core';
import { ProductService } from '../../../Core/Services/product.service';
import { RouterModule } from '@angular/router';
import { UpdateProductComponent } from '../../Product/update-product/update-product';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [RouterModule, UpdateProductComponent, CommonModule],
  standalone: true
})
export class DashboardComponent {
  // Inject service correctly (injection context)
  private productService = inject(ProductService);

  // Signals
  totalProducts = signal(0);
  averagePrice = signal(0);
  categoriesCount = signal(0);
  highestRating = signal(0);
  recentProducts = signal<Product[]>([]);
  loading = signal(true);
  
  // Modal state
  showUpdateModal = signal(false);
  selectedProductId = signal<number | null>(null);

  // Correct usage: effect in field initializer (inside injection context)
  private productsEffect = effect(() => {
    const products = this.productService.products();

    if (products.length > 0) {
      this.loading.set(false);
      this.calculateStats(products);
    }
  });

  constructor() {
    // Trigger loading once
    this.productService.loadProducts();
  }

  private calculateStats(products: Product[]): void {
    // Total products
    this.totalProducts.set(products.length);

    // Average price rounded to 2 decimals
    const avgPrice = products.reduce((sum, product) => sum + product.price, 0) / products.length;
    this.averagePrice.set(Math.round(avgPrice * 100) / 100);

    // Unique categories count
    const categories = new Set(products.map(p => p.category));
    this.categoriesCount.set(categories.size);

    // Highest rating
    const maxRating = Math.max(...products.map(p => p.rating?.rate || 0));
    this.highestRating.set(Math.round(maxRating * 10) / 10);

    // Recent products (last 6)
    this.recentProducts.set(products.slice(-6));
  }

  // Modal methods
  openUpdateModal(productId: number, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.selectedProductId.set(productId);
    this.showUpdateModal.set(true);
  }

  closeUpdateModal(): void {
    this.showUpdateModal.set(false);
    this.selectedProductId.set(null);
  }

  onProductUpdated(updatedProduct: Product): void {
    // Refresh products list
    this.productService.loadProducts();
    console.log('Product updated:', updatedProduct);
  }
}