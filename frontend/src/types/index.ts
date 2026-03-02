export type User = {
  id: string;
  email: string;
  role: "customer" | "admin";
};

export type AuthResponse = {
  data: {
    access_token: string;
    user: User;
  };
};

export type Variant = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  variants: Variant[];
}
export type CartItem = {
  id: string;
  variant_id: string;
  qty: number;
  price: number;
  name: string;
};

export type Cart = {
  id: string;
  items: CartItem[];
};