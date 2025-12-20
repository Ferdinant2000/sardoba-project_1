
export enum UserRole {
  DEVELOPER = 'DEVELOPER',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  GUEST = 'GUEST'
}

export interface User {
  id: string; // UUID
  telegramId: number; // BigInt in DB, number in JS (safe up to 2^53)
  name: string;
  role: UserRole;
  avatarUrl?: string;
  username?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
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
