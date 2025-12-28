
export enum UserRole {
  DEVELOPER = 'DEVELOPER',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  USER = 'user', // Lowercase to match DB default if needed, or uppercase 'USER' if I make it consistent. The DB string 'user' was used in Login.tsx
  GUEST = 'GUEST'
}

export interface User {
  id: string; // UUID
  telegramId: number; // BigInt in DB
  name: string;
  role: UserRole;
  avatarUrl?: string;
  username?: string;
  phone?: string;
  age?: number; // Added from SQL schema
}

export interface Product {
  id: string;
  sku: string; // Note: SQL schema didn't explicitly show SKU, but it's used extensively in app. Keeping it.
  name: string;
  description?: string; // Added from SQL schema
  category: string; // Note: SQL schema didn't show category, assuming it exists or is handled loosely
  price: number;
  cost: number;
  stock: number; // Mapped from 'quantity' in DB
  quantity?: number; // Optional alias if needed for direct DB types
  minStock: number;
  unit: string;
  imageUrl?: string;
}

export interface Client {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  balance: number;
  status: 'active' | 'inactive';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtSale: number;
}

export interface Order {
  id: string;
  clientId: string;
  clientName?: string;
  staffId?: string;
  items?: CartItem[];
  totalAmount: number;
  date: string;
  status: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName?: string;
  type: string;
  quantity: number;
  date: string;
  note?: string;
}

export interface AppSettings {
  companyName: string;
  currency: string;
  taxRate: number;
  defaultMinStock: number;
}
