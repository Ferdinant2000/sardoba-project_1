import React, { useState } from 'react';
import { Product, StockMovement, User, UserRole } from '../types';
import { Search, Filter, Plus, Edit, Trash2, AlertCircle, X, Save, History, ArrowUpDown, ChevronUp, ChevronDown, Lock } from 'lucide-react';
import { useLanguage } from '../contexts/Providers';

interface InventoryProps {
  user: User;
  products: Product[];
  stockMovements: StockMovement[];
  onUpdateStock: (productId: string, newStock: number) => void;
  onAddProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  currency: string;
  defaultMinStock: number;
}

type SortField = 'name' | 'stock' | 'price' | 'category';
type SortOrder = 'asc' | 'desc';

const Inventory: React.FC<InventoryProps> = ({
  user,
  products,
  stockMovements,
  onUpdateStock,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  currency,
  defaultMinStock
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'Low' | 'Out'>('All');

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProductHistory, setSelectedProductHistory] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    category: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
    unit: 'pcs',
    imageUrl: ''
  });

  const { language } = useLanguage();

  const translations = {
    eng: {
      catalog: 'Catalog',
      browse_collection: 'Browse our collection of premium products.',
      add_product: 'Add Product',
      search_placeholder: 'Search by name or SKU...',
      all_categories: 'All Categories',
      all_stock_levels: 'All Stock Levels',
      low_stock_only: 'Low Stock Only',
      out_of_stock_only: 'Out of Stock Only',
      out_of_stock: 'Out of Stock',
      low: 'Low',
      price: 'Price',
      no_products_found: 'No products found matching your criteria.',
      edit_product: 'Edit Product',
      add_new_product: 'Add New Product',
      product_name: 'Product Name',
      sku: 'SKU',
      category: 'Category',
      cost: 'Cost',
      stock_quantity: 'Stock Quantity',
      min_stock_alert: 'Min Stock Alert',
      unit: 'Unit (e.g. pcs, kg, L)',
      image_url: 'Image URL',
      cancel: 'Cancel',
      save_product: 'Save Product',
      stock_history: 'Stock History',
      no_movements: 'No recorded movements yet.',
      delete_confirm: 'Are you sure you want to delete this product?'
    },
    rus: {
      catalog: 'Каталог',
      browse_collection: 'Просмотрите нашу коллекцию премиальных товаров.',
      add_product: 'Добавить товар',
      search_placeholder: 'Поиск по названию или артикулу...',
      all_categories: 'Все категории',
      all_stock_levels: 'Все уровни запасов',
      low_stock_only: 'Только малый запас',
      out_of_stock_only: 'Только отсутствующие',
      out_of_stock: 'Нет в наличии',
      low: 'Мало',
      price: 'Цена',
      no_products_found: 'Товары не найдены.',
      edit_product: 'Редактировать товар',
      add_new_product: 'Добавить новый товар',
      product_name: 'Название товара',
      sku: 'Артикул',
      category: 'Категория',
      cost: 'Себестоимость',
      stock_quantity: 'Количество на складе',
      min_stock_alert: 'Мин. запас',
      unit: 'Ед. изм. (шт, кг, л)',
      image_url: 'URL изображения',
      cancel: 'Отмена',
      save_product: 'Сохранить',
      stock_history: 'История движения',
      no_movements: 'История пуста.',
      delete_confirm: 'Вы уверены, что хотите удалить этот товар?'
    },
    uzb: {
      catalog: 'Katalog',
      browse_collection: 'Bizning premium mahsulotlar to\'plamini ko\'ring.',
      add_product: 'Mahsulot qo\'shish',
      search_placeholder: 'Nom yoki SKU bo\'yicha qidirish...',
      all_categories: 'Barcha kategoriyalar',
      all_stock_levels: 'Barcha zaxira darajalari',
      low_stock_only: 'Kam qolganlar',
      out_of_stock_only: 'Qolmaganlar',
      out_of_stock: 'Qolmagan',
      low: 'Kam',
      price: 'Narx',
      no_products_found: 'Hech qanday mahsulot topilmadi.',
      edit_product: 'Mahsulotni tahrirlash',
      add_new_product: 'Yangi mahsulot qo\'shish',
      product_name: 'Mahsulot nomi',
      sku: 'SKU',
      category: 'Kategoriya',
      cost: 'Tannarx',
      stock_quantity: 'Zaxira miqdori',
      min_stock_alert: 'Min. zaxira ogohlantirishi',
      unit: 'Birlik (dona, kg, l)',
      image_url: 'Rasm URL',
      cancel: 'Bekor qilish',
      save_product: 'Saqlash',
      stock_history: 'Zaxira tarixi',
      no_movements: 'Hozircha harakatlar yo\'q.',
      delete_confirm: 'Ushbu mahsulotni o\'chirishga ishonchingiz komilmi?'
    }
  };

  const t = translations[language];

  const isGuest = user.role === UserRole.GUEST;
  const canManage = [UserRole.ADMIN, UserRole.DEVELOPER, UserRole.STAFF].includes(user.role);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;

    let matchesStock = true;
    if (canManage) {
      if (stockFilter === 'Low') matchesStock = product.stock <= product.minStock && product.stock > 0;
      if (stockFilter === 'Out') matchesStock = product.stock === 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  }).sort((a, b) => {
    let compareA = a[sortField];
    let compareB = b[sortField];

    if (typeof compareA === 'string') compareA = compareA.toLowerCase();
    if (typeof compareB === 'string') compareB = compareB.toLowerCase();

    if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
    if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      category: 'General',
      price: 0,
      cost: 0,
      stock: 0,
      minStock: defaultMinStock,
      unit: 'pcs',
      imageUrl: 'https://picsum.photos/200/200?random=' + Math.floor(Math.random() * 1000)
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsModalOpen(true);
  };

  const handleOpenHistory = (product: Product) => {
    setSelectedProductHistory(product);
    setIsHistoryOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t.delete_confirm)) {
      onDeleteProduct(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduct) {
      onEditProduct({
        ...editingProduct,
        ...formData as Product
      });
    } else {
      const newProduct: Product = {
        id: `p-${Date.now()}`,
        ...formData as Product
      };
      onAddProduct(newProduct);
    }

    setIsModalOpen(false);
  };

  const productMovements = selectedProductHistory
    ? stockMovements.filter(m => m.productId === selectedProductHistory.id)
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t.catalog}</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {t.browse_collection}
          </p>
        </div>
        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={20} className="mr-2" />
            {t.add_product}
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col xl:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder={t.search_placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-1 xl:pb-0">
            <div className="relative min-w-[180px]">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm text-slate-900 dark:text-white transition-colors"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'All' ? t.all_categories : cat}</option>
                ))}
              </select>
            </div>

            {canManage && (
              <div className="relative min-w-[180px]">
                <AlertCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value as any)}
                  className="w-full pl-10 pr-8 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm text-slate-900 dark:text-white transition-colors"
                >
                  <option value="All">{t.all_stock_levels}</option>
                  <option value="Low">{t.low_stock_only}</option>
                  <option value="Out">{t.out_of_stock_only}</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Table/Grid */}
        <div className="p-6 bg-slate-50/50 dark:bg-slate-950/50 transition-colors duration-300">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all duration-300 group flex flex-col">
                {/* Image */}
                <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-black/40 flex items-center justify-center backdrop-blur-sm">
                      <span className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">{t.out_of_stock}</span>
                    </div>
                  )}
                  {product.stock <= product.minStock && product.stock > 0 && !isGuest && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center shadow-sm">
                        <AlertCircle size={12} className="mr-1" /> {t.low}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 mb-1 flex-1">{product.name}</h3>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400">{t.price}</span>
                      <span className="font-bold text-lg text-slate-900 dark:text-white">{currency}{product.price.toFixed(2)}</span>
                    </div>
                    {!isGuest && (
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                <Search size={48} className="mb-4 opacity-20" />
                <p>{t.no_products_found}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {!isGuest && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingProduct ? t.edit_product : t.add_new_product}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.product_name}</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.sku}</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.category}</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    list="categories-list"
                  />
                  <datalist id="categories-list">
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.price} ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.cost} ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
                    value={formData.cost}
                    onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.stock_quantity}</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.min_stock_alert}</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
                    value={formData.minStock}
                    onChange={e => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.unit}</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.image_url}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center transition-colors"
                >
                  <Save size={20} className="mr-2" />
                  {t.save_product}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock History Modal */}
      {!isGuest && isHistoryOpen && selectedProductHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.stock_history}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedProductHistory.name} (SKU: {selectedProductHistory.sku})</p>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={24} />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              {productMovements.length === 0 ? (
                <div className="text-center text-slate-500 dark:text-slate-400 py-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                  <History className="mx-auto mb-2 opacity-20" size={32} />
                  <p>{t.no_movements}</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-6">
                  {productMovements.map((movement, idx) => (
                    <div key={movement.id} className="relative pl-6">
                      <div className={`
                                           absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900
                                           ${movement.quantity > 0 ? 'bg-green-500' : movement.quantity < 0 ? 'bg-red-500' : 'bg-slate-400'}
                                       `}></div>

                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-900 dark:text-white capitalize text-sm">{movement.type}</span>
                        <span className="text-xs text-slate-400">{new Date(movement.date).toLocaleDateString()} {new Date(movement.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className="flex items-center text-sm mb-1">
                        <span className={`font-bold mr-2 ${movement.quantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity} {selectedProductHistory.unit}
                        </span>
                      </div>

                      {movement.note && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-700">
                          {movement.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
