import React, { useState } from 'react';
import { Client, Order } from '../types';
import { Search, UserPlus, Phone, Mail, FileText, DollarSign, X, Save } from 'lucide-react';
import { useLanguage } from '../contexts/Providers';

interface ClientsProps {
    clients: Client[];
    orders: Order[];
    onPayment: (clientId: string, amount: number) => void;
    onAddClient: (client: Client) => void;
    currency: string;
}

const Clients: React.FC<ClientsProps> = ({ clients, orders, onPayment, onAddClient, currency }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [selectedClientForPayment, setSelectedClientForPayment] = useState<Client | null>(null);
    const [isAddClientOpen, setIsAddClientOpen] = useState(false);
    const [selectedClientHistory, setSelectedClientHistory] = useState<Client | null>(null);

    const [paymentAmount, setPaymentAmount] = useState('');
    const [newClientData, setNewClientData] = useState<Partial<Client>>({
        name: '',
        companyName: '',
        email: '',
        phone: '',
        balance: 0,
        status: 'active'
    });

    const { language } = useLanguage();

    const translations = {
        eng: {
            clients: 'Clients',
            manage_profiles: 'Manage customer profiles and debts.',
            add_client: 'Add Client',
            search_clients: 'Search clients...',
            debt: 'Debt',
            credit: 'Credit',
            balance: 'Balance',
            record_payment: 'Record Payment',
            view_history: 'View History',
            amount: 'Amount',
            current_debt: 'Current Debt',
            cancel: 'Cancel',
            confirm_payment: 'Confirm Payment',
            add_new_client: 'Add New Client',
            company_name: 'Company Name',
            contact_name: 'Contact Name',
            email: 'Email',
            phone: 'Phone',
            save_client: 'Save Client',
            order_history: 'Order History',
            no_orders: 'No orders found for this client.',
            total: 'Total',
            for_client: 'For'
        },
        rus: {
            clients: 'Клиенты',
            manage_profiles: 'Управление профилями клиентов и долгами.',
            add_client: 'Добавить клиента',
            search_clients: 'Поиск клиентов...',
            debt: 'Долг',
            credit: 'Кредит',
            balance: 'Баланс',
            record_payment: 'Принять оплату',
            view_history: 'История',
            amount: 'Сумма',
            current_debt: 'Текущий долг',
            cancel: 'Отмена',
            confirm_payment: 'Подтвердить',
            add_new_client: 'Новый клиент',
            company_name: 'Название компании',
            contact_name: 'Контактное лицо',
            email: 'Email',
            phone: 'Телефон',
            save_client: 'Сохранить',
            order_history: 'История заказов',
            no_orders: 'Заказов не найдено.',
            total: 'Итого',
            for_client: 'Для'
        },
        uzb: {
            clients: 'Mijozlar',
            manage_profiles: 'Mijozlar profili va qarzlarini boshqarish.',
            add_client: 'Mijoz qo\'shish',
            search_clients: 'Mijozlarni qidirish...',
            debt: 'Qarz',
            credit: 'Kredit',
            balance: 'Balans',
            record_payment: 'To\'lov qabul qilish',
            view_history: 'Tarixni ko\'rish',
            amount: 'Summa',
            current_debt: 'Joriy qarz',
            cancel: 'Bekor qilish',
            confirm_payment: 'Tasdiqlash',
            add_new_client: 'Yangi mijoz qo\'shish',
            company_name: 'Kompaniya nomi',
            contact_name: 'Aloqa uchun shaxs',
            email: 'Email',
            phone: 'Telefon',
            save_client: 'Saqlash',
            order_history: 'Buyurtmalar tarixi',
            no_orders: 'Bu mijoz uchun buyurtmalar topilmadi.',
            total: 'Jami',
            for_client: 'Mijoz:'
        }
    };

    const t = translations[language];

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const clientOrders = selectedClientHistory
        ? orders.filter(o => o.clientId === selectedClientHistory.id)
        : [];

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedClientForPayment && paymentAmount) {
            onPayment(selectedClientForPayment.id, parseFloat(paymentAmount));
            setSelectedClientForPayment(null);
            setPaymentAmount('');
        }
    };

    const handleAddClientSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newClient: Client = {
            id: `c-${Date.now()}`,
            ...newClientData as Client
        };
        onAddClient(newClient);
        setIsAddClientOpen(false);
        setNewClientData({
            name: '',
            companyName: '',
            email: '',
            phone: '',
            balance: 0,
            status: 'active'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t.clients}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t.manage_profiles}</p>
                </div>
                <button
                    onClick={() => setIsAddClientOpen(true)}
                    className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <UserPlus size={20} className="mr-2" />
                    {t.add_client}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Search Bar (Full Width) */}
                <div className="md:col-span-2 lg:col-span-3 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder={t.search_clients}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
                    />
                </div>

                {filteredClients.map(client => (
                    <div key={client.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{client.companyName}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{client.name}</p>
                                </div>
                                <div className={`
                        px-3 py-1 rounded-full text-xs font-bold
                        ${client.balance < 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}
                    `}>
                                    {client.balance < 0 ? t.debt : t.credit}
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                    <Mail size={16} className="mr-2 text-slate-400 dark:text-slate-500" />
                                    {client.email}
                                </div>
                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                    <Phone size={16} className="mr-2 text-slate-400 dark:text-slate-500" />
                                    {client.phone}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div>
                                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t.balance}</span>
                                    <div className={`text-xl font-bold ${client.balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                        {currency}{Math.abs(client.balance).toFixed(2)}
                                        <span className="text-xs font-normal text-slate-400 ml-1">
                                            {client.balance < 0 ? '(DR)' : '(CR)'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedClientForPayment(client)}
                                    className="p-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                                    title={t.record_payment}
                                >
                                    <DollarSign size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950/50 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-between">
                            <button
                                onClick={() => setSelectedClientHistory(client)}
                                className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center transition-colors"
                            >
                                <FileText size={14} className="mr-1" /> {t.view_history}
                            </button>
                            <span className="text-xs text-slate-400">ID: {client.id}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment Modal */}
            {selectedClientForPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.record_payment}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t.for_client} {selectedClientForPayment.companyName}</p>
                        </div>
                        <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.amount} ({currency})</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-800">
                                {t.current_debt}: <span className="font-bold">{currency}{Math.abs(selectedClientForPayment.balance).toFixed(2)}</span>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedClientForPayment(null)}
                                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    {t.cancel}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                >
                                    {t.confirm_payment}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Client Modal */}
            {isAddClientOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.add_new_client}</h3>
                            <button onClick={() => setIsAddClientOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddClientSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.company_name}</label>
                                <input
                                    type="text"
                                    required
                                    value={newClientData.companyName}
                                    onChange={(e) => setNewClientData({ ...newClientData, companyName: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.contact_name}</label>
                                <input
                                    type="text"
                                    required
                                    value={newClientData.name}
                                    onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.email}</label>
                                <input
                                    type="email"
                                    required
                                    value={newClientData.email}
                                    onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.phone}</label>
                                <input
                                    type="tel"
                                    required
                                    value={newClientData.phone}
                                    onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddClientOpen(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    {t.cancel}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center transition-colors"
                                >
                                    <Save size={18} className="mr-2" />
                                    {t.save_client}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View History Modal */}
            {selectedClientHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.order_history}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedClientHistory.companyName}</p>
                            </div>
                            <button onClick={() => setSelectedClientHistory(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-6">
                            {clientOrders.length === 0 ? (
                                <div className="text-center text-slate-500 dark:text-slate-400 py-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">{t.no_orders}</div>
                            ) : (
                                <div className="space-y-4">
                                    {clientOrders.map(order => (
                                        <div key={order.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-950">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold text-slate-900 dark:text-white">{new Date(order.date).toLocaleDateString()}</span>
                                                <span className="text-sm text-slate-500 dark:text-slate-400">#{order.id}</span>
                                            </div>
                                            <div className="space-y-1 mb-3">
                                                {order.items.map(item => (
                                                    <div key={item.id} className="flex justify-between text-sm">
                                                        <span className="text-slate-600 dark:text-slate-400">{item.quantity}x {item.name}</span>
                                                        <span className="text-slate-900 dark:text-white">{currency}{(item.price * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-2">
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{t.total}</span>
                                                <span className="font-bold text-blue-600 dark:text-blue-400">{currency}{order.totalAmount.toFixed(2)}</span>
                                            </div>
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

export default Clients;
