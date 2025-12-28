import React, { useState, useEffect } from 'react';
import { Product, Client, CartItem } from '../types';
import { Search, ShoppingCart, Minus, Plus, Trash2, User, CreditCard, ScanLine } from 'lucide-react';
import { useLanguage } from '../contexts/Providers';

interface POSProps {
  products: Product[];
  clients: Client[];
  onCheckout: (clientId: string, items: CartItem[]) => void;
  currency: string;
  taxRate: number;
}

import { useTelegram } from '../contexts/TelegramContext';

const POS: React.FC<POSProps> = ({ products, clients, onCheckout, currency, taxRate }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { language } = useLanguage();
  const { showMainButton, hideMainButton, haptic } = useTelegram();

  const translations = {
    eng: {
      search_products: 'Search products...',
      all: 'All',
      out_of_stock: 'OUT OF STOCK',
      available: 'available',
      current_order: 'Current Order',
      customer: 'Customer',
      select_client: 'Select Client',
      current_balance: 'Current Balance',
      cart_empty: 'Your cart is empty',
      subtotal: 'Subtotal',
      tax: 'Tax',
      total: 'Total',
      complete_order: 'Complete Order',
      scan_qr: 'Scan QR',
      order_success: 'Order processed successfully!',
      select_client_alert: 'Please select a client first.',
    },
    rus: {
      search_products: 'Поиск товаров...',
      all: 'Все',
      out_of_stock: 'НЕТ В НАЛИЧИИ',
      available: 'доступно',
      current_order: 'Текущий заказ',
      customer: 'Клиент',
      select_client: 'Выберите клиента',
      current_balance: 'Текущий баланс',
      cart_empty: 'Корзина пуста',
      subtotal: 'Подытог',
      tax: 'Налог',
      total: 'Итого',
      complete_order: 'Оформить заказ',
      scan_qr: 'Сканировать QR',
      order_success: 'Заказ успешно обработан!',
      select_client_alert: 'Пожалуйста, выберите клиента.',
    },
    uzb: {
      search_products: 'Mahsulotlarni qidirish...',
      all: 'Barchasi',
      out_of_stock: 'QOLMAGAN',
      available: 'mavjud',
      current_order: 'Joriy buyurtma',
      customer: 'Mijoz',
      select_client: 'Mijozni tanlang',
      current_balance: 'Joriy balans',
      cart_empty: 'Savatcha bo\'sh',
      subtotal: 'Jami',
      tax: 'Soliq',
      total: 'Umumiy',
      complete_order: 'Buyurtmani yakunlash',
      scan_qr: 'QR skanerlash',
      order_success: 'Buyurtma muvaffaqiyatli qayta ishlandi!',
      select_client_alert: 'Iltimos, avval mijozni tanlang.',
    }
  };

  const t = translations[language];

  const categories = [t.all, ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === t.all || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    haptic('heavy');
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
      alert(t.select_client_alert);
      return;
    }
    onCheckout(selectedClientId, cart);
    setCart([]);
    setSelectedClientId('');
    haptic('success');
    alert(t.order_success);
  };

  // MainButton Logic
  useEffect(() => {
    if (cart.length > 0) {
      if (!selectedClientId) {
        showMainButton(t.select_client.toUpperCase(), () => {
          haptic('warning');
          alert(t.select_client_alert);
        });
      } else {
        showMainButton(`${t.complete_order} (${currency}${total.toFixed(2)})`, handleCheckout);
      }
    } else {
      hideMainButton();
    }

    // Cleanup on unmount
    return () => {
      hideMainButton();
    };
  }, [cart, selectedClientId, total, language]); // Dependencies to update button text/state

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:flex-row gap-6 animate-in fade-in duration-500 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">

      {/* Product Catalog Section */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder={t.search_products}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
              />
            </div>
            <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" title={t.scan_qr}>
              <ScanLine size={24} />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors border
                  ${selectedCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 content-start">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className={`
                   border rounded-xl overflow-hidden flex flex-col transition-all duration-200
                   ${product.stock === 0
                    ? 'opacity-60 grayscale pointer-events-none border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
                    : 'hover:shadow-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}
                `}
              >
                <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-md font-bold shadow-sm">{t.out_of_stock}</span>
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h4 className="font-medium text-sm text-slate-900 dark:text-white line-clamp-2 mb-1">{product.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{product.stock} {product.unit} {t.available}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{currency}{product.price.toFixed(2)}</span>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
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
      <div className="w-full lg:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full overflow-hidden transition-colors duration-300">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <h2 className="font-bold text-lg flex items-center text-slate-900 dark:text-white">
            <ShoppingCart className="mr-2" size={20} />
            {t.current_order}
          </h2>
        </div>

        {/* Client Selector */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">{t.customer}</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm text-slate-900 dark:text-white transition-colors"
            >
              <option value="" disabled>{t.select_client}</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.companyName})
                </option>
              ))}
            </select>
          </div>
          {selectedClientId && (
            <div className="mt-2 text-xs flex justify-between px-1">
              <span className="text-slate-500 dark:text-slate-400">{t.current_balance}:</span>
              <span className={`font-medium ${(clients.find(c => c.id === selectedClientId)?.balance || 0) < 0 ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                }`}>
                {currency}{(clients.find(c => c.id === selectedClientId)?.balance || 0).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <ShoppingCart size={48} className="mb-4 opacity-20" />
              <p>{t.cart_empty}</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 animate-in slide-in-from-right-5 fade-in duration-200">
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{item.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{currency}{item.price.toFixed(2)} / {item.unit}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-l-lg transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-slate-900 dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      disabled={item.quantity >= item.stock}
                      className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 rounded-r-lg transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Totals */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>{t.subtotal}</span>
            <span>{currency}{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>{t.tax} ({taxRate}%)</span>
            <span>{currency}{taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
            <span>{t.total}</span>
            <span>{currency}{total.toFixed(2)}</span>
          </div>

          {/* <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || !selectedClientId}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold flex items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            <CreditCard size={20} className="mr-2" />
            {t.complete_order}
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default POS;
