
import React from 'react';
import { User, Order, UserRole, Product, Client } from '../types';
import { LogOut, Award, RefreshCw, Server, Users, DollarSign, Package, Shield, AlertTriangle, Briefcase, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileProps {
    user: User;
    orders: Order[];
    products: Product[];
    clients: Client[];
    onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, orders, products, clients, onLogout }) => {
    const navigate = useNavigate();

    const handleForceRefetch = () => {
        window.location.reload();
    };

    const handleClearStorage = () => {
        if (window.confirm('Are you sure? This will clear all local session data.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const today = new Date().toISOString().split('T')[0];

    // STAFF Logic: Performance Today
    // Filter orders where staffId matches current user ID and date matches today
    const myOrdersToday = orders.filter(
        (o) => o.staffId === user.id && o.date.startsWith(today)
    );
    const totalSalesToday = myOrdersToday.reduce((sum, o) => sum + o.totalAmount, 0);

    // ADMIN Logic: Business KPIs
    // 1. Total Inventory Value (Stock * Cost)
    const inventoryValue = products.reduce((sum, p) => sum + (p.stock * p.cost), 0);
    // 2. Total Debt (Sum of negative client balances)
    // Assuming 'balance' represents what they owe us if negative? 
    // Usually positive balance = credit, negative = debt, OR client has 'balance' which is debt.
    // Let's assume standard accounting: Positive = Asset (They owe us), Negative = Liability (We owe them). 
    // BUT the prompt says "Total Debt (Sum of negative client balances)".
    // Wait, usually client balance > 0 means they paid upfront or have credit? Or debt? 
    // In many simple apps, Balance = What they owe. 
    // "Sum of negative client balances" implies if balance is < 0 it's debt? 
    // Let's interpret strict prompt: "Sum of negative client balances". 
    // If a client has balance -50, debt is 50.
    const totalDebt = clients
        .filter(c => c.balance < 0)
        .reduce((sum, c) => sum + Math.abs(c.balance), 0);

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">

            {/* Header Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-10"></div>

                <div className="relative z-10 w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-200 flex-shrink-0">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                            <span className="text-4xl font-bold">{user.name.charAt(0)}</span>
                        </div>
                    )}
                </div>

                <div className="relative z-10 text-center md:text-left flex-1 pt-2">
                    <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.role === UserRole.DEVELOPER ? 'bg-purple-100 text-purple-700' :
                            user.role === UserRole.ADMIN ? 'bg-blue-100 text-blue-700' :
                                'bg-emerald-100 text-emerald-700'
                            }`}>
                            {user.role}
                        </span>
                    </div>
                    {user.username && (
                        <p className="text-slate-500 font-medium mb-6">@{user.username}</p>
                    )}

                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <button
                            onClick={onLogout}
                            className="flex items-center space-x-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-bold shadow-sm"
                        >
                            <LogOut size={18} />
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Role-Specific Views */}

            {/* STAFF VIEW */}
            {(user.role === UserRole.STAFF || user.role === UserRole.ADMIN || user.role === UserRole.DEVELOPER) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Award size={100} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center relative z-10">
                            <Award className="mr-2 text-yellow-500" size={24} />
                            My Performance Today
                        </h3>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Orders</p>
                                <p className="text-3xl font-bold text-slate-900">{myOrdersToday.length}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                <p className="text-xs text-green-600 uppercase font-bold tracking-wider mb-1">Sales Volume</p>
                                <p className="text-3xl font-bold text-emerald-600">${totalSalesToday.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center justify-between p-4 bg-blue-50 text-blue-800 rounded-xl border border-blue-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-bold text-sm">Shift Status: Active</span>
                            </div>
                            <span className="text-xs font-mono opacity-70 cursor-help" title="Recorded via Access Log">ID: {user.id.slice(0, 8)}...</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ADMIN VIEW */}
            {(user.role === UserRole.ADMIN || user.role === UserRole.DEVELOPER) && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 pl-1 mt-8 border-l-4 border-blue-500 pl-4">Admin Dashboard</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* KPI 1: Inventory Value */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">Inventory Value</span>
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Package size={20} />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-slate-900">
                                ${(inventoryValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-slate-400 mt-2 font-medium">Total Cost Basis</div>
                        </div>

                        {/* KPI 2: Total Debt */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Debt</span>
                                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                    <TrendingUp size={20} />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-slate-900">
                                ${(totalDebt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-slate-400 mt-2 font-medium">Outstanding Client Balances (Neg)</div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-slate-50 p-6 rounded-2xl shadow-inner border border-slate-200">
                            <span className="text-slate-500 text-sm font-bold uppercase tracking-wider block mb-4">Quick Actions</span>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-blue-50 text-slate-700 rounded-xl transition-colors border border-slate-200 font-medium text-sm group">
                                    <span className="flex items-center"><Users size={16} className="mr-2 text-blue-500" /> Register New Staff</span>
                                    <span className="text-slate-300 group-hover:text-blue-400">→</span>
                                </button>
                                <button className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-blue-50 text-slate-700 rounded-xl transition-colors border border-slate-200 font-medium text-sm group">
                                    <span className="flex items-center"><Briefcase size={16} className="mr-2 text-blue-500" /> Export Reports</span>
                                    <span className="text-slate-300 group-hover:text-blue-400">→</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DEVELOPER VIEW */}
            {user.role === UserRole.DEVELOPER && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 pl-1 mt-8 border-l-4 border-purple-500 pl-4">Developer Tools</h2>

                    <div className="bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800 text-slate-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600 rounded-full blur-3xl opacity-10 transform translate-x-1/3 -translate-y-1/3"></div>

                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <Server className="text-green-400" size={24} />
                            <h3 className="text-lg font-bold text-white">System Diagnostics</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-4 font-mono text-sm">
                                <div className="flex justify-between border-b border-slate-800 pb-2">
                                    <span>Database Connection</span>
                                    <span className="text-green-400 flex items-center">● <span className="ml-2 text-white">Supabase Connected</span></span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800 pb-2">
                                    <span>Current User ID</span>
                                    <span className="text-slate-500 select-all text-xs">{user.id}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800 pb-2">
                                    <span>Telegram ID</span>
                                    <span className="text-slate-500 select-all">{user.telegramId}</span>
                                </div>
                                <div className="flex justify-between pb-2">
                                    <span>Client Version</span>
                                    <span className="text-blue-400">v2.0.0-rc1</span>
                                </div>
                            </div>

                            <div className="bg-red-500/10 p-6 rounded-xl border border-red-500/20">
                                <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center">
                                    <AlertTriangle size={14} className="mr-2" />
                                    Danger Zone
                                </h4>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleClearStorage}
                                        className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-200 border border-red-500/30 rounded-lg text-sm font-bold transition-colors flex items-center justify-center"
                                    >
                                        <LogOut size={16} className="mr-2" />
                                        Clear Local Storage & Reset
                                    </button>
                                    <button
                                        onClick={handleForceRefetch}
                                        className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                                    >
                                        <RefreshCw size={16} className="mr-2" />
                                        Force Application Reload
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
