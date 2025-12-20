import { Product, Client, Order } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    sku: 'KIT-001',
    name: 'Industrial Mixer 5L',
    category: 'Kitchenware',
    price: 450.00,
    cost: 300.00,
    stock: 12,
    minStock: 5,
    unit: 'unit',
    imageUrl: 'https://picsum.photos/200/200?random=1'
  },
  {
    id: 'p2',
    sku: 'KIT-002',
    name: 'Stainless Steel Pot 20L',
    category: 'Kitchenware',
    price: 85.50,
    cost: 50.00,
    stock: 45,
    minStock: 10,
    unit: 'unit',
    imageUrl: 'https://picsum.photos/200/200?random=2'
  },
  {
    id: 'p3',
    sku: 'ING-001',
    name: 'Premium Olive Oil',
    category: 'Ingredients',
    price: 25.00,
    cost: 15.00,
    stock: 120,
    minStock: 20,
    unit: 'L',
    imageUrl: 'https://picsum.photos/200/200?random=3'
  },
  {
    id: 'p4',
    sku: 'ING-002',
    name: 'Organic Flour Type 00',
    category: 'Ingredients',
    price: 4.50,
    cost: 2.00,
    stock: 500,
    minStock: 100,
    unit: 'kg',
    imageUrl: 'https://picsum.photos/200/200?random=4'
  },
  {
    id: 'p5',
    sku: 'PKG-001',
    name: 'Cardboard Box (Large)',
    category: 'Packaging',
    price: 1.20,
    cost: 0.40,
    stock: 1000,
    minStock: 200,
    unit: 'pcs',
    imageUrl: 'https://picsum.photos/200/200?random=5'
  },
  {
    id: 'p6',
    sku: 'CLN-001',
    name: 'Heavy Duty Degreaser',
    category: 'Cleaning',
    price: 15.00,
    cost: 8.00,
    stock: 3,
    minStock: 10,
    unit: 'L',
    imageUrl: 'https://picsum.photos/200/200?random=6'
  }
];

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Alice Johnson',
    companyName: 'The Morning Café',
    email: 'alice@morningcafe.com',
    phone: '+1 555-0101',
    balance: -450.00, // Debt
    status: 'active'
  },
  {
    id: 'c2',
    name: 'Bob Smith',
    companyName: 'Bistro 42',
    email: 'bob@bistro42.com',
    phone: '+1 555-0202',
    balance: 0,
    status: 'active'
  },
  {
    id: 'c3',
    name: 'Charlie Davis',
    companyName: 'Downtown Bakery',
    email: 'charlie@bakery.com',
    phone: '+1 555-0303',
    balance: -1250.50,
    status: 'active'
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-001',
    clientId: 'c1',
    clientName: 'The Morning Café',
    items: [
      { ...MOCK_PRODUCTS[2], quantity: 5 },
      { ...MOCK_PRODUCTS[3], quantity: 10 }
    ],
    totalAmount: 170.00,
    date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    status: 'completed'
  },
  {
    id: 'ord-002',
    clientId: 'c3',
    clientName: 'Downtown Bakery',
    items: [
      { ...MOCK_PRODUCTS[0], quantity: 1 },
      { ...MOCK_PRODUCTS[4], quantity: 100 }
    ],
    totalAmount: 570.00,
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    status: 'completed'
  }
];
