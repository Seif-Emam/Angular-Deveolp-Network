import { Component, inject, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../Core/Services/product.service';
import { CommonModule } from '@angular/common';
import { Product } from '../../../Core/Models/product.model';

@Component({
  selector: 'app-update-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './update-product.html',
  styleUrls: ['./update-product.scss'],
})
export class UpdateProductComponent implements OnInit {
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @Input() productId!: number;
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() productUpdated = new EventEmitter<Product>();

  productForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  currentProductImage: string | null = null;
  selectedImage: File | null = null;
  isSubmitting = false;
  categories: string[] = [];
  isLoading = true;

  constructor() {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));

    this.productForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      image: [null]
    });
  
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProduct();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.errorMessage = 'Failed to load categories';
      }
    });
  }

  loadProduct(): void {
    this.productService.getProduct(this.productId).subscribe({
      next: (product: Product) => {
        this.productForm.patchValue({
          title: product.title,
          price: product.price,
          category: product.category,
          description: product.description
        });
        
        // Set the current product image
        if (product.image) {
          this.currentProductImage = product.image;
          this.productForm.patchValue({ image: 'existing' });
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load product';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        this.errorMessage = 'Please select a valid image file (JPEG, PNG, GIF, etc.)';
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size must be less than 5MB';
        return;
      }
      
      this.selectedImage = file;
      this.currentProductImage = null; // Clear current image when new one is selected
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.productForm.patchValue({ image: file });
        this.productForm.controls['image'].setErrors(null);
        this.errorMessage = null;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imagePreview = null;
    this.currentProductImage = null;
    this.selectedImage = null;
    this.productForm.patchValue({ image: null });
    this.productForm.controls['image'].setErrors({ required: true });
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    // Create form data to handle file upload
    const formData = new FormData();
    formData.append('title', this.productForm.value.title);
    formData.append('price', this.productForm.value.price.toString());
    formData.append('category', this.productForm.value.category);
    formData.append('description', this.productForm.value.description);
    
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    } else if (!this.currentProductImage) {
      // If no image is selected and no current image exists, mark as invalid
      this.productForm.controls['image'].setErrors({ required: true });
      this.isSubmitting = false;
      return;
    }

    this.productService.updateProduct(this.productId, {
      title: this.productForm.value.title,
      price: this.productForm.value.price,
      description: this.productForm.value.description,
      category: this.productForm.value.category,
      image: this.selectedImage ? this.selectedImage.name : this.currentProductImage || ''
    }).subscribe({
      next: (updatedProduct) => {
        this.successMessage = 'Product updated successfully!';
        this.isSubmitting = false;
        
        // Emit the updated product
        this.productUpdated.emit(updatedProduct);
        
        // Close modal after a short delay to show success message
        setTimeout(() => {
          this.closeModal.emit();
        }, 1500);
      },
      error: (err) => {
        this.errorMessage = 'Failed to update product';
        this.isSubmitting = false;
        console.error(err);
      }
    });
  }

  cancel(): void {
    this.closeModal.emit();
  }

  // Close modal when clicking on backdrop
  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal.emit();
    }
  }

  // Prevent modal content click from closing the modal
  onModalContentClick(event: MouseEvent): void {
    event.stopPropagation();
  }
}