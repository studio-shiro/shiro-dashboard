export type Business = {
  id: string;
  name: string;
  logo_url: string | null;
  currency: string;
  contact_email: string | null;
  contact_phone: string | null;
  stock_alert_threshold: number;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  brand_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Stock = {
  id: string;
  business_id: string;
  product_id: string;
  quantity: number;
  alert_threshold: number;
  updated_at: string;
};

export type Sale = {
  id: string;
  business_id: string;
  product_id: string;
  customer_id: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  date: string;
  notes: string | null;
  created_at: string;
};

export type Customer = {
  id: string;
  business_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
};

export type Brand = {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

export type ProductWithRelations = Product & {
  category: Pick<Category, "id" | "name"> | null;
  brand: Pick<Brand, "id" | "name"> | null;
  stock: Pick<Stock, "quantity" | "alert_threshold"> | null;
};

export type SaleWithRelations = Sale & {
  product: Pick<Product, "id" | "name"> | null;
  customer: Pick<Customer, "id" | "name"> | null;
};
