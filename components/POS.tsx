import React, { useState, useEffect } from 'react';
import { Product, Client, CartItem } from '../types';
import { Search, ShoppingCart, Minus, Plus, Trash2, User, CreditCard, ScanLine } from 'lucide-react';

interface POSProps {
  products: Product[];
  clients: Client[];
  onCheckout: (clientId: string, items: CartItem[]) => void;
  currency: string;
  taxRate: number;
}

const POS: React.FC<POSProps> = ({ products, clients, onCheckout, currency, taxRate }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        // Basic stock check
        if (newQty > item.stock) return item; 
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const handleCheckout = () => {
    if (!selectedClientId) {
      alert("Please select a client first.");
      return;
    }
    if (cart.length === 0) return;

    onCheckout(selectedClientId, cart);
    setCart([]);
    setSelectedClientId('');
    alert("Order processed successfully!");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:flex-row gap-6">
      
      {/* Product Catalog Section */}
      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="p-2 text-slate-500 hover:text-blue-600 border border-slate-300 rounded-lg" title="Scan QR">
                <ScanLine size={24} />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors
                  ${selectedCategory === cat 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className={`
                   border rounded-lg overflow-hidden flex flex-col transition-all duration-200
                   ${product.stock === 0 ? 'opacity-50 grayscale pointer-events-none' : 'hover:shadow-md border-slate-200 bg-white'}
                `}
              >
                <div className="aspect-square bg-slate-100 relative">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                  {product.stock === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">OUT OF STOCK</span>
                      </div>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h4 className="font-medium text-sm text-slate-900 line-clamp-2 mb-1">{product.name}</h4>
                  <p className="text-xs text-slate-500 mb-2">{product.stock} {product.unit} available</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-bold text-slate-900">{currency}{product.price.toFixed(2)}</span>
                    <button 
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-full lg:w-96 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-bold text-lg flex items-center text-slate-900">
            <ShoppingCart className="mr-2" size={20} />
            Current Order
          </h2>
        </div>

        {/* Client Selector */}
        <div className="p-4 border-b border-slate-200">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Customer</label>
          <div className="relative">
             <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
             <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-sm"
             >
                 <option value="" disabled>Select Client</option>
                 {clients.map(client => (
                     <option key={client.id} value={client.id}>
                         {client.name} ({client.companyName})
                     </option>
                 ))}
             </select>
          </div>
          {selectedClientId && (
              <div className="mt-2 text-xs flex justify-between px-1">
                  <span className="text-slate-500">Current Balance:</span>
                  <span className={`font-medium ${
                      (clients.find(c => c.id === selectedClientId)?.balance || 0) < 0 ? 'text-red-500' : 'text-green-500'
                  }`}>
                      {currency}{(clients.find(c => c.id === selectedClientId)?.balance || 0).toFixed(2)}
                  </span>
              </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingCart size={48} className="mb-4 opacity-20" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900 line-clamp-1">{item.name}</div>
                  <div className="text-xs text-slate-500">{currency}{item.price.toFixed(2)} / {item.unit}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-white rounded-md border border-slate-200">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 hover:bg-slate-100 text-slate-600"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button 
                       onClick={() => updateQuantity(item.id, 1)}
                       disabled={item.quantity >= item.stock}
                       className="p-1 hover:bg-slate-100 text-slate-600 disabled:opacity-30"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Totals */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>{currency}{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Tax ({taxRate}%)</span>
            <span>{currency}{taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-slate-900 pt-2 border-t border-slate-200">
            <span>Total</span>
            <span>{currency}{total.toFixed(2)}</span>
          </div>
          
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || !selectedClientId}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold flex items-center justify-center transition-colors shadow-sm"
          >
            <CreditCard size={20} className="mr-2" />
            Complete Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
