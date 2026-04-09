// redux/interfaces/productInterface.ts

export interface Product {
  _id: string;
  sku: string;
  ean?: string;
  title: string;
  description: string;
  price: number;
  cost_price?: number;
  currency: string;
  stock_quantity: number;
  images: ProductImage[];
  thumbnail: string;
  categories: Category;  // Note: This is a single object, not an array
  sizes: ProductSizes[];
  colors?: ProductColors[];
  weight: string;
  weight_unit: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
    unit: string;
  };
  meta_title?: string;
  meta_description?: string;
  keywords: string[];
  status: "draft" | "published" | "archived";
  visibility: "visible" | "hidden" | "search_only";
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  view_count: number;
  purchase_count: number;
  review: ProductReview[];  // Note: Using "review" not "reviews" to match schema
}

export interface ProductImage {
  public_id: string;
  url: string;
  is_primary: boolean;
}

export interface Category {
  main_category: string;
  sub_category: string;
}

export interface ProductSizes {
  title: string;  // Note: Using "title" not "label"
  price: number;
  stock_quantity: number;  // Note: Using snake_case
}

export interface ProductColors {
  title: string;  // Note: Using "title" not "name"
  price: number;
  stock_quantity: number;  // Note: Using snake_case
}

export interface ProductReview {  // Note: Singular to match schema
  rating: number;
  image?: string;  // Made optional to match schema
  comment?: string;  // Made optional to match schema
  createdAt: Date;
}

export interface ProductState {
  status: boolean;
  loading: boolean;
  products: Product[] | null;
  product: Product | null;
  error: string | null;
  success: string | null;
}

// types/sort-option.ts
export type SortOption =
  | "title-asc"
  | "title-desc"
  | "price-asc"
  | "price-desc"
  | "size-asc"
  | "size-desc";