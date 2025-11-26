import { ProductUpdate } from './Core/Models/product.model';
import { ProductDetail } from './Pages/Product/product-detail/product-detail';
// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  { 
    path: 'dashboard',
    loadComponent: () => import('./Pages/Dashboard/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },

  { 
    path: 'products',
    loadComponent: () => import('./Pages/Product/products-list/products-list')
      .then(m => m.ProductListComponent)
  },

    
  

  { 
    path: 'products/:id',
    loadComponent: () => import('./Pages/Product/product-detail/product-detail')
      .then(m => m.ProductDetail) ,

  },

  { path: '**', redirectTo: '/dashboard' },
];