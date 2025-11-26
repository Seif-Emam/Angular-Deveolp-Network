// src/app/models/product.model.ts
export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export interface ProductUpdate {
  id?: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}