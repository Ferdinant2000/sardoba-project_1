import React, { useCallback } from 'react';
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
import { useLanguage } from '../contexts/Providers';
import { useTelegram } from '../contexts/TelegramContext';

interface DashboardProps {
  products: Product[];
  clients: Client[];
  orders: Order[];
  currency: string;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']; // Updated primary to indigo

const Dashboard: React.FC<DashboardProps> = ({ products, clients, orders, currency }) => {
  const { language } = useLanguage();
  const { haptic } = useTelegram();

  const handleCardClick = useCallback(() => {
    haptic('light');
  }, [haptic]);

  const translations = {
    eng: {
      dashboard: 'Dashboard',
      overview: 'Overview of your business performance.',
      today: 'Today',
      total_stock_value: 'Total Stock Value',
      from_last_month: 'from last month',
      total_sales: 'Total Sales',
      all_time_revenue: 'All time revenue',
      outstanding_debt: 'Outstanding Debt',
      clients_debt: 'Clients have debt',
      low_stock_alerts: 'Low Stock Alerts',
      items_below_min: 'Items below min. level',
      sales_analytics: 'Sales Analytics',
      inventory_by_category: 'Inventory by Category',
      recent_transactions: 'Recent Transactions',
      order_id: 'Order ID',
      client: 'Client',
      date: 'Date',
      amount: 'Amount',
      status: 'Status',
      completed: 'Completed'
    },
    rus: {
      dashboard: 'Панель управления',
      overview: 'Обзор показателей вашего бизнеса.',
      today: 'Сегодня',
      total_stock_value: 'Стоимость запасов',
      from_last_month: 'с прошлого месяца',
      total_sales: 'Общие продажи',
      all_time_revenue: 'Выручка за все время',
      outstanding_debt: 'Задолженность',
      clients_debt: 'Клиентов с долгами',
      low_stock_alerts: 'Низкий запас',
      items_below_min: 'Товаров ниже минимума',
      sales_analytics: 'Аналитика продаж',
      inventory_by_category: 'Запасы по категориям',
      recent_transactions: 'Недавние транзакции',
      order_id: 'ID заказа',
      client: 'Клиент',
      date: 'Дата',
      amount: 'Сумма',
      status: 'Статус',
      completed: 'Завершен'
    },
    uzb: {
      dashboard: 'Boshqaruv paneli',
      overview: 'Biznes ko\'rsatkichlaringiz haqida umumiy ma\'lumot.',
      today: 'Bugun',
      total_stock_value: 'Umumiy zaxira qiymati',
      from_last_month: 'o\'tgan oydan',
      total_sales: 'Umumiy savdo',
      all_time_revenue: 'Barcha vaqt daromadi',
      outstanding_debt: 'Qarzlar',
      clients_debt: 'Qarzdor mijozlar',
      low_stock_alerts: 'Kam qolgan tovarlar',
      items_below_min: 'Minimumdan kam mahsulotlar',
      sales_analytics: 'Savdo tahlili',
      inventory_by_category: 'Kategoriya bo\'yicha zaxira',
      recent_transactions: 'So\'nggi operatsiyalar',
      order_id: 'Buyurtma ID',
      client: 'Mijoz',
      date: 'Sana',
      amount: 'Summa',
      status: 'Holat',
      completed: 'Bajarildi'
    }
  };

  const t = translations[language];

  // Calculate metrics
  const totalStockValue = products.reduce((acc, p) => acc + (p.stock * p.price), 0);
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const outstandingDebt = clients.reduce((acc, c) => acc + (c.balance < 0 ? Math.abs(c.balance) : 0), 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  const debtClientCount = clients.filter(c => c.balance < 0).length;

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
    { name: 'Sun', sales: orders.reduce((acc, o) => acc + o.totalAmount, 0) },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.dashboard}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t.overview}</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <span className="text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-1.5 rounded-full font-medium border border-indigo-100 dark:border-indigo-800 shadow-sm">
            {t.today}: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stock Value */}
        <div onClick={handleCardClick} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer active:scale-95">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.total_stock_value}</h3>
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <Package size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{currency}{totalStockValue.toLocaleString()}</p>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center mt-2 font-medium">
            <TrendingUp size={12} className="mr-1" /> +2.5% {t.from_last_month}
          </span>
        </div>

        {/* Total Sales */}
        <div onClick={handleCardClick} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer active:scale-95">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.total_sales}</h3>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{currency}{totalRevenue.toLocaleString()}</p>
          <span className="text-xs text-slate-400 dark:text-slate-500 mt-2 block">{t.all_time_revenue}</span>
        </div>

        {/* Outstanding Debt */}
        <div onClick={handleCardClick} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer active:scale-95">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.outstanding_debt}</h3>
            <div className="p-2.5 bg-rose-50 dark:bg-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <CreditCard size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{currency}{outstandingDebt.toLocaleString()}</p>
          <span className="text-xs text-rose-500 dark:text-rose-400 mt-2 block font-medium">{debtClientCount} {t.clients_debt}</span>
        </div>

        {/* Low Stock Alerts */}
        <div onClick={handleCardClick} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer active:scale-95">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.low_stock_alerts}</h3>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{lowStockCount}</p>
          <span className="text-xs text-amber-600 dark:text-amber-400 mt-2 block font-medium">{t.items_below_min}</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 tracking-tight">{t.sales_analytics}</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: 'rgb(255 255 255 / 0.95)',
                    padding: '12px'
                  }}
                  labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '12px' }}
                />
                <Bar
                  dataKey="sales"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                  className="hover:opacity-90 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 tracking-tight">{t.inventory_by_category}</h3>
          <div className="h-64 flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="block text-2xl font-bold text-slate-900 dark:text-white">{categoryData.reduce((acc, c) => acc + c.value, 0)}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Items</span>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {categoryData.slice(0, 4).map((cat, idx) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <div className="w-2.5 h-2.5 rounded-full mr-2.5" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  {cat.name}
                </div>
                <span className="font-medium text-slate-900 dark:text-white">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{t.recent_transactions}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">{t.order_id}</th>
                <th className="px-6 py-4 font-medium">{t.client}</th>
                <th className="px-6 py-4 font-medium">{t.date}</th>
                <th className="px-6 py-4 font-medium">{t.amount}</th>
                <th className="px-6 py-4 font-medium">{t.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders.slice(0, 5).map(order => (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">#{order.id}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{order.clientName}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(order.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{currency}{order.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {t.completed}
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
