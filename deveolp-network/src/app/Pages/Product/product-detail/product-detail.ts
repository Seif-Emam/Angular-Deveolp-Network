import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule, ParamMap } from '@angular/router';
import { ProductService } from '../../../Core/Services/product.service';
import { Product } from '../../../Core/Models/product.model';
import { Subject, catchError, of, switchMap, takeUntil, tap } from 'rxjs';
import { UpdateProductComponent } from '../../Product/update-product/update-product';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss'],
  imports: [RouterModule, UpdateProductComponent, CommonModule],
  standalone: true
})
export class ProductDetail implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  product: Product | null = null;
  loading = false;
  error: string | null = null;

  // Modal state
  showUpdateModal = signal(false);
  selectedProductId = signal<number | null>(null);

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.loading = true;
          this.error = null;
          this.product = null;
        }),
        switchMap((params: ParamMap) => {
          const id = Number(params.get('id'));
          if (!id) {
            this.error = 'Invalid product ID';
            this.loading = false;
            return of(null);
          }
          return this.productService.getProduct(id).pipe(
            catchError(err => {
              console.error('Error loading product:', err);
              this.error = 'Failed to load product';
              this.loading = false;
              return of(null);
            })
          );
        })
      )
      .subscribe(product => {
        this.product = product;
        this.loading = false;
      });
  }

  addToCart(product: Product): void {
    console.log('Added to cart:', product);
    alert(`Added ${product.title} to cart!`);
  }

  getStars(rating: number): number[] {
    const fullStars = Math.floor(rating);
    return Array(fullStars).fill(0);
  }

  reloadPage(): void {
    window.location.reload();
  }

  // Modal methods
  openUpdateModal(productId?: number, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const idToUse = productId || this.product?.id;
    if (idToUse) {
      this.selectedProductId.set(idToUse);
      this.showUpdateModal.set(true);
    }
  }

  closeUpdateModal(): void {
    this.showUpdateModal.set(false);
    this.selectedProductId.set(null);
  }

  onProductUpdated(updatedProduct: Product): void {
    // Update the current product with the new data
    this.product = updatedProduct;
    console.log('Product updated:', updatedProduct);
    
    // Optionally reload the product from the server
    if (updatedProduct.id) {
      this.productService.getProduct(updatedProduct.id).subscribe({
        next: (product) => {
          this.product = product;
        },
        error: (err) => {
          console.error('Error reloading product:', err);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}