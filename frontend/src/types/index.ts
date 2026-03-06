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

export type { Product, Variant } from "./product";
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