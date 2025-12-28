
import React, { useState, useEffect } from 'react';
import { User, Order, UserRole, Product, Client } from '../types';
import { LogOut, Award, RefreshCw, Server, Users, Briefcase, TrendingUp, Phone, Save, AlertCircle, Package, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface ProfileProps {
    user: User;
    orders: Order[];
    products: Product[];
    clients: Client[];
    onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user: initialUser, orders, products, clients, onLogout }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User>(initialUser);
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState(initialUser.phone || '');
    const [loading, setLoading] = useState(false);

    // Fetch fresh user data on mount to ensure reactivity (Fix Name Reactivity)
    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', initialUser.id)
                .single();

            if (data) {
                // Map DB snake_case to TS camelCase if needed, but keeping it simple based on types
                // Actually types.ts uses snake_case for telegram_id? No, types.ts says telegramId.
                // Supabase returns keys as in DB (telegram_id). We need to map.
                setUser({
                    ...initialUser, // Keep props like role if not in simple fetch? No, DB is truth.
                    name: data.name || initialUser.name || 'User', // Fallback to ensure text visibility
                    username: data.username,
                    avatarUrl: data.avatar_url,
                    telegramId: data.telegram_id,
                    phone: data.phone,
                    role: data.role // Ensure we use latest role
                });
                setPhoneNumber(data.phone || '+998');
            }
        };
        fetchUser();
    }, [initialUser.id]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;
        // Enforce +998 prefix
        if (!val.startsWith('+998')) {
            val = '+998';
        }
        setPhoneNumber(val);
    };

    const handleSavePhone = async () => {
        if (!phoneNumber.trim() || phoneNumber === '+998') return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({ phone: phoneNumber })
                .eq('id', user.id);

            if (error) throw error;

            setUser(prev => ({ ...prev, phone: phoneNumber }));
            setIsEditingPhone(false);
            alert("Phone number updated successfully!");
        } catch (e: any) {
            alert("Failed to update phone: " + e.message);
        } finally {
            setLoading(false);
        }
    };

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
    const myOrdersToday = orders.filter(
        (o) => o.staffId === user.id && o.date.startsWith(today)
    );
    const totalSalesToday = myOrdersToday.reduce((sum, o) => sum + o.totalAmount, 0);

    // ADMIN Logic: Business KPIs
    const inventoryValue = products.reduce((sum, p) => sum + (p.stock * p.cost), 0);
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
                        <h1 className="text-3xl font-bold text-slate-900 break-words">{user.name || 'User'}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.role === UserRole.DEVELOPER ? 'bg-purple-100 text-purple-700' :
                                user.role === UserRole.ADMIN ? 'bg-blue-100 text-blue-700' :
                                    user.role === UserRole.STAFF ? 'bg-emerald-100 text-emerald-700' :
                                        'bg-slate-100 text-slate-600'
                            }`}>
                            {user.role}
                        </span>
                    </div>

                    {/* User Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/60 inline-block min-w-[300px]">
                        <div className="flex items-center space-x-2">
                            <span className="font-semibold text-slate-400">ID:</span>
                            <span className="font-mono text-slate-800">{user.telegramId}</span>
                        </div>
                        {user.username && (
                            <div className="flex items-center space-x-2">
                                <span className="font-semibold text-slate-400">Username:</span>
                                <span className="text-blue-600 font-medium">@{user.username}</span>
                            </div>
                        )}

                        {/* Phone Section */}
                        <div className="col-span-1 md:col-span-2 border-t border-slate-200 pt-3 mt-1">
                            {user.phone ? (
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center space-x-2">
                                        <Phone size={16} className="text-slate-400" />
                                        <span className="font-bold text-slate-800">{user.phone}</span>
                                    </div>
                                    <button onClick={() => setIsEditingPhone(!isEditingPhone)} className="text-xs text-blue-500 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center text-amber-600 text-xs font-bold">
                                        <AlertCircle size={14} className="mr-1" />
                                        Phone number not set
                                    </div>
                                    {!isEditingPhone && (
                                        <button onClick={() => {
                                            setPhoneNumber('+998');
                                            setIsEditingPhone(true);
                                        }} className="text-sm text-blue-600 font-bold hover:underline text-left">
                                            + Add Phone Number
                                        </button>
                                    )}
                                </div>
                            )}

                            {isEditingPhone && (
                                <div className="mt-2 flex gap-2 animate-in slide-in-from-top-2">
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={handlePhoneChange}
                                        placeholder="+998..."
                                        className="flex-1 px-3 py-1.5 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSavePhone}
                                        disabled={loading}
                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        <Save size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
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
