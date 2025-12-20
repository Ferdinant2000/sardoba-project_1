import React, { useState, useEffect } from 'react';
import { AppSettings, Product, Client, Order } from '../types';
import { Save, Download, RefreshCw, Building, DollarSign, Package, AlertTriangle } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  products: Product[];
  clients: Client[];
  orders: Order[];
  onResetData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  settings, 
  onUpdateSettings, 
  products, 
  clients, 
  orders,
  onResetData
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'taxRate' || name === 'defaultMinStock' ? parseFloat(value) : value
    }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportData = (type: 'products' | 'clients' | 'orders') => {
    let data;
    let filename;
    
    switch(type) {
        case 'products':
            data = products;
            filename = 'nexus_inventory.json';
            break;
        case 'clients':
            data = clients;
            filename = 'nexus_clients.json';
            break;
        case 'orders':
            data = orders;
            filename = 'nexus_orders.json';
            break;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
      if (window.confirm("WARNING: This will reset all data to the initial demo state. This action cannot be undone. Are you sure?")) {
          onResetData();
      }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Configure your application preferences and manage data.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* General Settings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center">
                <Building size={20} className="text-slate-500 mr-2" />
                <h2 className="font-bold text-slate-900">General Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                    <input 
                        type="text" 
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
            </div>
        </div>

        {/* Financial Settings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center">
                <DollarSign size={20} className="text-slate-500 mr-2" />
                <h2 className="font-bold text-slate-900">Financial Settings</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Currency Symbol</label>
                    <select 
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                        <option value="$">USD ($)</option>
                        <option value="€">EUR (€)</option>
                        <option value="£">GBP (£)</option>
                        <option value="¥">JPY (¥)</option>
                        <option value="₹">INR (₹)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tax Rate (%)</label>
                    <input 
                        type="number" 
                        name="taxRate"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.taxRate}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">Applied automatically at checkout.</p>
                </div>
            </div>
        </div>

        {/* Inventory Defaults */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center">
                <Package size={20} className="text-slate-500 mr-2" />
                <h2 className="font-bold text-slate-900">Inventory Defaults</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Default Low Stock Alert Threshold</label>
                    <input 
                        type="number" 
                        name="defaultMinStock"
                        min="0"
                        value={formData.defaultMinStock}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">Used when creating new products.</p>
                </div>
            </div>
        </div>

        <div className="flex items-center justify-end">
             {isSaved && (
                 <span className="text-green-600 font-medium mr-4 animate-fade-in">Settings Saved!</span>
             )}
             <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center transition-colors shadow-sm"
             >
                 <Save size={20} className="mr-2" />
                 Save Changes
             </button>
        </div>
      </form>

      {/* Data Management Section */}
      <div className="border-t border-slate-300 pt-8 mt-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Data Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
             <button 
                onClick={() => handleExportData('products')}
                className="flex items-center justify-center px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors"
             >
                 <Download size={18} className="mr-2" />
                 Export Products
             </button>
             <button 
                onClick={() => handleExportData('clients')}
                className="flex items-center justify-center px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors"
             >
                 <Download size={18} className="mr-2" />
                 Export Clients
             </button>
             <button 
                onClick={() => handleExportData('orders')}
                className="flex items-center justify-center px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors"
             >
                 <Download size={18} className="mr-2" />
                 Export Orders
             </button>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                  <h3 className="font-bold text-red-900 flex items-center">
                      <AlertTriangle size={20} className="mr-2" />
                      Danger Zone
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                      Resetting data will revert the application to its initial demo state. All created orders, new clients, and inventory changes will be lost.
                  </p>
              </div>
              <button 
                 onClick={handleReset}
                 className="px-4 py-2 bg-white border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center whitespace-nowrap"
              >
                  <RefreshCw size={18} className="mr-2" />
                  Reset Demo Data
              </button>
          </div>
      </div>
    </div>
  );
};

export default Settings;
