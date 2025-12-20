import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Package, 
  CreditCard
} from 'lucide-react';
import { Product, Client, Order } from '../types';

interface DashboardProps {
  products: Product[];
  clients: Client[];
  orders: Order[];
  currency: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC<DashboardProps> = ({ products, clients, orders, currency }) => {
  
  // Calculate metrics
  const totalStockValue = products.reduce((acc, p) => acc + (p.stock * p.price), 0);
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const outstandingDebt = clients.reduce((acc, c) => acc + (c.balance < 0 ? Math.abs(c.balance) : 0), 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  // Prepare chart data
  const categoryData = products.reduce((acc, product) => {
    const existing = acc.find(i => i.name === product.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: product.category, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Mock Sales Data for the last 7 days (generated dynamically for visual)
  const salesData = [
    { name: 'Mon', sales: 1200 },
    { name: 'Tue', sales: 2100 },
    { name: 'Wed', sales: 800 },
    { name: 'Thu', sales: 1600 },
    { name: 'Fri', sales: 2300 },
    { name: 'Sat', sales: 3400 },
    { name: 'Sun', sales: orders.reduce((acc, o) => acc + o.totalAmount, 0) }, // Current simplistic
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Overview of your business performance.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
            <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium border border-blue-100">
                Today: {new Date().toLocaleDateString()}
            </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Total Stock Value</h3>
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Package size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{currency}{totalStockValue.toLocaleString()}</p>
          <span className="text-xs text-green-600 flex items-center mt-1">
             <TrendingUp size={12} className="mr-1" /> +2.5% from last month
          </span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Total Sales</h3>
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{currency}{totalRevenue.toLocaleString()}</p>
           <span className="text-xs text-slate-400 mt-1">All time revenue</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Outstanding Debt</h3>
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <CreditCard size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{currency}{outstandingDebt.toLocaleString()}</p>
          <span className="text-xs text-red-500 mt-1">3 Clients have debt</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Low Stock Alerts</h3>
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{lowStockCount}</p>
          <span className="text-xs text-amber-600 mt-1">Items below min. level</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Sales Analytics</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Inventory by Category</h3>
          <div className="h-72 flex justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
              {categoryData.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center text-xs text-slate-600">
                      <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length]}}></div>
                      {cat.name} ({cat.value})
                  </div>
              ))}
          </div>
        </div>
      </div>
      
      {/* Recent Activity Table (simplified for visual) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                      <tr>
                          <th className="px-6 py-3 font-medium">Order ID</th>
                          <th className="px-6 py-3 font-medium">Client</th>
                          <th className="px-6 py-3 font-medium">Date</th>
                          <th className="px-6 py-3 font-medium">Amount</th>
                          <th className="px-6 py-3 font-medium">Status</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {orders.slice(0, 5).map(order => (
                          <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-medium text-slate-900">{order.id}</td>
                              <td className="px-6 py-4">{order.clientName}</td>
                              <td className="px-6 py-4 text-slate-500">{new Date(order.date).toLocaleDateString()}</td>
                              <td className="px-6 py-4 font-medium text-slate-900">{currency}{order.totalAmount.toFixed(2)}</td>
                              <td className="px-6 py-4">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Completed
                                  </span>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
