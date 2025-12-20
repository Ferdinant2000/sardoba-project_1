import React, { useState } from 'react';
import { Client, Order } from '../types';
import { Search, UserPlus, Phone, Mail, FileText, DollarSign, X, Save } from 'lucide-react';

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
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500">Manage customer profiles and debts.</p>
        </div>
        <button 
          onClick={() => setIsAddClientOpen(true)}
          className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <UserPlus size={20} className="mr-2" />
          Add Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Search Bar (Full Width) */}
          <div className="md:col-span-2 lg:col-span-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          {filteredClients.map(client => (
            <div key={client.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
               <div className="p-6">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">{client.companyName}</h3>
                        <p className="text-sm text-slate-500">{client.name}</p>
                    </div>
                    <div className={`
                        px-3 py-1 rounded-full text-xs font-bold
                        ${client.balance < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
                    `}>
                        {client.balance < 0 ? 'Debt' : 'Credit'}
                    </div>
                 </div>

                 <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-slate-600">
                        <Mail size={16} className="mr-2 text-slate-400" />
                        {client.email}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                        <Phone size={16} className="mr-2 text-slate-400" />
                        {client.phone}
                    </div>
                 </div>

                 <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Balance</span>
                        <div className={`text-xl font-bold ${client.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {currency}{Math.abs(client.balance).toFixed(2)}
                            <span className="text-xs font-normal text-slate-400 ml-1">
                                {client.balance < 0 ? '(DR)' : '(CR)'}
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedClientForPayment(client)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors" 
                        title="Record Payment"
                    >
                        <DollarSign size={20} />
                    </button>
                 </div>
               </div>
               <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between">
                   <button 
                    onClick={() => setSelectedClientHistory(client)}
                    className="text-xs font-medium text-slate-500 hover:text-blue-600 flex items-center"
                   >
                       <FileText size={14} className="mr-1" /> View History
                   </button>
                   <span className="text-xs text-slate-400">ID: {client.id}</span>
               </div>
            </div>
          ))}
      </div>

      {/* Payment Modal */}
      {selectedClientForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900">Record Payment</h3>
                    <p className="text-sm text-slate-500">For {selectedClientForPayment.companyName}</p>
                </div>
                <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Amount ({currency})</label>
                        <input 
                            type="number" 
                            step="0.01"
                            min="0"
                            required
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                        />
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                        Current Debt: <span className="font-bold">{currency}{Math.abs(selectedClientForPayment.balance).toFixed(2)}</span>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button 
                            type="button" 
                            onClick={() => setSelectedClientForPayment(null)}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            Confirm Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Add Client Modal */}
      {isAddClientOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Add New Client</h3>
                    <button onClick={() => setIsAddClientOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleAddClientSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                        <input 
                            type="text" 
                            required
                            value={newClientData.companyName}
                            onChange={(e) => setNewClientData({...newClientData, companyName: e.target.value})}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Name</label>
                        <input 
                            type="text" 
                            required
                            value={newClientData.name}
                            onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input 
                            type="email" 
                            required
                            value={newClientData.email}
                            onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                        <input 
                            type="tel" 
                            required
                            value={newClientData.phone}
                            onChange={(e) => setNewClientData({...newClientData, phone: e.target.value})}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button 
                            type="button" 
                            onClick={() => setIsAddClientOpen(false)}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center"
                        >
                            <Save size={18} className="mr-2" />
                            Save Client
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* View History Modal */}
      {selectedClientHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                  <div className="p-6 border-b border-slate-200 flex justify-between items-center shrink-0">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Order History</h3>
                        <p className="text-sm text-slate-500">{selectedClientHistory.companyName}</p>
                      </div>
                      <button onClick={() => setSelectedClientHistory(null)} className="text-slate-400 hover:text-slate-600">
                          <X size={24} />
                      </button>
                  </div>
                  <div className="overflow-y-auto p-6">
                      {clientOrders.length === 0 ? (
                          <div className="text-center text-slate-500 py-8">No orders found for this client.</div>
                      ) : (
                          <div className="space-y-4">
                              {clientOrders.map(order => (
                                  <div key={order.id} className="border border-slate-200 rounded-lg p-4">
                                      <div className="flex justify-between items-center mb-2">
                                          <span className="font-bold text-slate-900">{new Date(order.date).toLocaleDateString()}</span>
                                          <span className="text-sm text-slate-500">#{order.id}</span>
                                      </div>
                                      <div className="space-y-1 mb-3">
                                          {order.items.map(item => (
                                              <div key={item.id} className="flex justify-between text-sm">
                                                  <span className="text-slate-600">{item.quantity}x {item.name}</span>
                                                  <span className="text-slate-900">{currency}{(item.price * item.quantity).toFixed(2)}</span>
                                              </div>
                                          ))}
                                      </div>
                                      <div className="flex justify-between items-center border-t border-slate-100 pt-2">
                                          <span className="font-semibold text-slate-700">Total</span>
                                          <span className="font-bold text-blue-600">{currency}{order.totalAmount.toFixed(2)}</span>
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
