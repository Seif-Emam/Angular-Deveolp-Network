import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../Core/Services/product.service';
import { Product } from '../../../Core/Models/product.model';
import { UpdateProductComponent } from '../update-product/update-product';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.html',
  styleUrls: ['./products-list.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterModule, CommonModule, UpdateProductComponent]
})
export class ProductListComponent {
  private productService = inject(ProductService);

  // Signals
  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  paginatedProducts = signal<Product[]>([]);
  categories = signal<string[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  searchTerm = signal('');
  selectedCategory = signal('');
  currentPage = signal(1);
  itemsPerPage = 10;

  // Modal state
  showUpdateModal = signal(false);
  selectedProductId = signal<number | null>(null);

  // Computed signals
  totalProducts = () => this.filteredProducts().length;
  totalPages = () => Math.ceil(this.totalProducts() / this.itemsPerPage);

  constructor() {
    // Effects should be created in constructor after injection context
    effect(() => {
      const products = this.productService.products();
      this.products.set(products);
      this.applyFilters();
      this.loading.set(false);
    });

    effect(() => {
      const cats = Array.from(new Set(this.products().map(p => p.category)));
      this.categories.set(cats);
    });

    // Effect to update pagination when filtered products or current page changes
    effect(() => {
      this.updatePaginatedProducts();
    });

    // Trigger initial load
    this.productService.loadProducts();
  }

  // Modal methods
  openUpdateModal(productId: number): void {
    this.selectedProductId.set(productId);
    this.showUpdateModal.set(true);
  }

  closeUpdateModal(): void {
    this.showUpdateModal.set(false);
    this.selectedProductId.set(null);
  }

  onProductUpdated(updatedProduct: Product): void {
    // Refresh the products list to show updated data
    this.productService.loadProducts();
    console.log('Product updated:', updatedProduct);
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.applyFilters();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.products();

    const search = this.searchTerm().toLowerCase();  
    if (search) {  
      filtered = filtered.filter(p =>  
        p.title.toLowerCase().includes(search) ||  
        p.description.toLowerCase().includes(search)  
      );  
    }  

    const category = this.selectedCategory();  
    if (category) {  
      filtered = filtered.filter(p => p.category === category);  
    }  

    this.filteredProducts.set(filtered);  
    this.currentPage.set(1);  
  }

  updatePaginatedProducts(): void {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const paginated = this.filteredProducts().slice(start, end);
    this.paginatedProducts.set(paginated);
  }

  goToPage(page: number): void {
    if (page > 0 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  addToCart(product: Product): void {
    console.log('Added to cart:', product);
    alert(`Added ${product.title} to cart!`);
  }
}