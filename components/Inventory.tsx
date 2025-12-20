
import React, { useState } from 'react';
import { Product, StockMovement, User, UserRole } from '../types';
import { Search, Filter, Plus, Edit, Trash2, AlertCircle, X, Save, History, ArrowUpDown, ChevronUp, ChevronDown, Lock } from 'lucide-react';

interface InventoryProps {
  user: User; // Added user prop
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

  const isGuest = user.role === UserRole.GUEST;
  // If guest, only show stock > 0, unless they want to see OOS (optional, but requested "Browse Inventory") 
  // We'll keep standard filters for now but actions are disabled.

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
    if (stockFilter === 'Low') matchesStock = product.stock <= product.minStock && product.stock > 0;
    if (stockFilter === 'Out') matchesStock = product.stock === 0;

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
    if (window.confirm('Are you sure you want to delete this product?')) {
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-500">
            {isGuest ? 'Browse our current product catalog.' : 'Manage products, prices, and stock levels.'}
          </p>
        </div>
        {!isGuest && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={20} className="mr-2" />
            Add Product
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 flex flex-col xl:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-1 xl:pb-0">
            <div className="relative min-w-[180px]">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                ))}
              </select>
            </div>

            {/* Hide Stock Level filter for Guests maybe? No, let them filter if they want, but MinStock is hidden logic-wise */}
            {!isGuest && (
              <div className="relative min-w-[180px]">
                <AlertCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value as any)}
                  className="w-full pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-sm"
                >
                  <option value="All">All Stock Levels</option>
                  <option value="Low">Low Stock Only</option>
                  <option value="Out">Out of Stock Only</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th
                  className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Product
                    {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />)}
                  </div>
                </th>
                <th
                  className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    {sortField === 'category' && (sortOrder === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />)}
                  </div>
                </th>
                <th
                  className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('stock')}
                >
                  <div className="flex items-center">
                    Stock
                    {sortField === 'stock' && (sortOrder === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />)}
                  </div>
                </th>
                <th
                  className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center">
                    Price
                    {sortField === 'price' && (sortOrder === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />)}
                  </div>
                </th>
                {!isGuest && <th className="px-6 py-4 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{product.name}</div>
                        <div className="text-xs text-slate-500">SKU: {product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`
                        font-medium text-sm
                        ${product.stock === 0 ? 'text-slate-400' : (!isGuest && product.stock <= product.minStock) ? 'text-red-600' : 'text-slate-900'}
                      `}>
                        {product.stock} {product.unit}
                      </div>
                      {!isGuest && product.stock <= product.minStock && product.stock > 0 && (
                        <AlertCircle size={16} className="ml-2 text-red-500" />
                      )}
                      {product.stock === 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded">Out</span>
                      )}
                    </div>
                    {!isGuest && product.stock <= product.minStock && product.stock > 0 && (
                      <div className="text-xs text-red-500 mt-1">Low stock</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {currency}{product.price.toFixed(2)}
                  </td>

                  {!isGuest ? (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onUpdateStock(product.id, product.stock + 1)}
                          className="p-1 hover:bg-blue-100 text-blue-600 rounded" title="Quick Add Stock (+1)"
                        >
                          <Plus size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenHistory(product)}
                          className="p-1 hover:bg-purple-100 text-purple-600 rounded" title="View History"
                        >
                          <History size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-1 hover:bg-slate-200 text-slate-500 rounded" title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1 hover:bg-red-100 text-red-600 rounded" title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  ) : (
                    // Optional: Add a "Details" button for guests later, or just nothing.
                    // For now, removing the column entirely from the header means this td should strictly also be removed or logic adjusted.
                    // I removed the header <th>Actions</th> for guests, so I must remove this <td> as well.
                    // Ah, the mapped JSX for rows needs to conditionally render the <td>.
                    // Done above.
                    null
                  )}
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={isGuest ? 4 : 5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <Search size={48} className="text-slate-200 mb-4" />
                      <p className="font-medium text-slate-900">No products found</p>
                      <p className="text-sm mt-1">Try adjusting your filters or search terms.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal - Only Render if NOT guest */}
      {!isGuest && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    list="categories-list"
                  />
                  <datalist id="categories-list">
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cost ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.cost}
                    onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Min Stock Alert</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.minStock}
                    onChange={e => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit (e.g. pcs, kg, L)</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center"
                >
                  <Save size={20} className="mr-2" />
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock History Modal - Viewable by all usually, but maybe restrict if it shows sensitive info. 
          Actually, history shows 'restock' or 'sale'. Sale price is not in history usually, just quantity. 
          But let's assume specific history is "internal" data unless requested otherwise. 
          The requirement said "read-only view" (Catalog mode). 
          Let's ENABLE history for Guest but purely read-only if they want to see product movement? 
          Actually, "Catalog Mode" usually implies just seeing what is available. 
          I will hide History for guests to be cleaner.
      */}
      {!isGuest && isHistoryOpen && selectedProductHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            {/* ... History details same as before ... */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Stock History</h3>
                <p className="text-sm text-slate-500">{selectedProductHistory.name} (SKU: {selectedProductHistory.sku})</p>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              {productMovements.length === 0 ? (
                <div className="text-center text-slate-500 py-8 bg-slate-50 rounded-lg border border-slate-100">
                  <History className="mx-auto mb-2 opacity-20" size={32} />
                  <p>No recorded movements yet.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                  {productMovements.map((movement, idx) => (
                    <div key={movement.id} className="relative pl-6">
                      <div className={`
                                           absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white
                                           ${movement.quantity > 0 ? 'bg-green-500' : movement.quantity < 0 ? 'bg-red-500' : 'bg-slate-400'}
                                       `}></div>

                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-900 capitalize text-sm">{movement.type}</span>
                        <span className="text-xs text-slate-400">{new Date(movement.date).toLocaleDateString()} {new Date(movement.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className="flex items-center text-sm mb-1">
                        <span className={`font-bold mr-2 ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity} {selectedProductHistory.unit}
                        </span>
                      </div>

                      {movement.note && (
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
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
