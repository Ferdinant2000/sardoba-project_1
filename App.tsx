
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import POS from './components/POS';
import Clients from './components/Clients';
import Settings from './components/Settings';
import Login from './components/Login';
import Profile from './components/Profile';
import { Product, Client, Order, CartItem, AppSettings, User, StockMovement, UserRole } from './types';
import { supabase } from './supabaseClient';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Environment State
  const [isTelegram, setIsTelegram] = useState(false);
  const [isDevBypass, setIsDevBypass] = useState(false);

  // Central State Management
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);

  // App Global Settings
  const [settings, setSettings] = useState<AppSettings>({
    companyName: 'Nexus B2B',
    currency: '$',
    taxRate: 0,
    defaultMinStock: 5
  });

  // INITIALIZATION LOGIC
  useEffect(() => {
    // 1. Detect if running inside Telegram
    // initData is only present if opened via Telegram
    const tg = window.Telegram?.WebApp;
    const isTgEnv = !!tg?.initData;
    setIsTelegram(isTgEnv);

    // 2. Handle Session based on Environment
    if (!isTgEnv) {
      // BROWSER MODE:
      // By default, ignore cached session to show Landing Page.
      // We only allow session if isDevBypass is set (handled by Login component callback)
      // But initially, we just stop loading so the Router can show Login.
      setLoading(false);
    } else {
      // TELEGRAM MODE:
      // Try to restore session or show Login (which will auto-auth)
      const savedUser = localStorage.getItem('nexus_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Failed to parse user session");
          localStorage.removeItem('nexus_user');
        }
      }
      setLoading(false);
    }
  }, []);

  // Fetch Data from Supabase
  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Products
      const { data: productsData } = await supabase.from('products').select('*');
      if (productsData) {
        setProducts(productsData.map((p: any) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category,
          price: p.price,
          cost: p.cost,
          stock: p.stock,
          minStock: p.min_stock,
          unit: p.unit,
          imageUrl: p.image_url
        })));
      }

      // 2. Clients
      const { data: clientsData } = await supabase.from('clients').select('*');
      if (clientsData) {
        setClients(clientsData.map((c: any) => ({
          id: c.id,
          name: c.name,
          companyName: c.company_name,
          email: c.email,
          phone: c.phone,
          balance: c.balance,
          status: c.status
        })));
      }

      // 3. Orders (with Joins)
      // Joined with clients for names, and order_items -> products for item details
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          clients (company_name),
          order_items (
            *,
            products (name, sku, unit, image_url)
          )
        `)
        .order('date', { ascending: false })
        .limit(100); // Fetch reasonable limit

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
      } else if (ordersData) {
        setOrders(ordersData.map((o: any) => {
          // Map nested order_items to CartItem[]
          const mappedItems: CartItem[] = o.order_items ? o.order_items.map((item: any) => ({
            id: item.product_id,
            quantity: item.quantity,
            price: item.price_at_sale,
            // Details from joined product
            name: item.products?.name || 'Unknown Product',
            sku: item.products?.sku || '',
            unit: item.products?.unit || 'pcs',
            imageUrl: item.products?.image_url,
            // Defaults for fields not in order_item join but required by CartItem
            category: 'Sold',
            cost: 0,
            stock: 0,
            minStock: 0
          })) : [];

          return {
            id: o.id,
            clientId: o.client_id,
            clientName: o.clients?.company_name || 'Unknown Client',
            staffId: o.staff_id,
            items: mappedItems,
            totalAmount: o.total_amount,
            date: o.date,
            status: o.status
          };
        }));
      }

      // 4. Stock Movements
      const { data: movementsData } = await supabase
        .from('stock_movements')
        .select('*, products(name)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (movementsData) {
        setStockMovements(movementsData.map((m: any) => ({
          id: m.id,
          productId: m.product_id,
          productName: m.products?.name || 'Unknown',
          type: m.type,
          quantity: m.quantity,
          date: m.date || m.created_at,
          note: m.note
        })));
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Auth Handlers
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('nexus_user', JSON.stringify(loggedInUser));

    // If logging in explicitly (Dev/Simulate), enable bypass
    if (!isTelegram) {
      setIsDevBypass(true);
    }
  };

  const handleLogout = async () => {
    setUser(null);
    localStorage.removeItem('nexus_user');
    await supabase.auth.signOut();

    // Force reload to clear all state and re-check environment
    window.location.reload();
  };

  // Helper: Log Movement
  const logStockMovement = async (
    productId: string,
    type: StockMovement['type'],
    quantity: number,
    note?: string
  ) => {
    await supabase.from('stock_movements').insert({
      product_id: productId,
      type,
      quantity,
      note,
      created_at: new Date().toISOString() // Use created_at to match schema
    });
  };

  // --- Handlers ---

  const handleUpdateStock = async (productId: string, newStock: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const diff = newStock - product.stock;
    if (diff === 0) return;

    try {
      await supabase.from('products').update({ stock: newStock }).eq('id', productId);
      await logStockMovement(productId, diff > 0 ? 'restock' : 'adjustment', diff, 'Manual update');
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProduct = async (product: Product) => {
    try {
      const dbProduct = {
        sku: product.sku,
        name: product.name,
        category: product.category,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        min_stock: product.minStock,
        unit: product.unit,
        image_url: product.imageUrl
      };

      const { data, error } = await supabase.from('products').insert(dbProduct).select();
      if (error) throw error;

      if (data && data[0]) {
        await logStockMovement(data[0].id, 'restock', product.stock, 'Initial entry');
      }
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleEditProduct = async (updatedProduct: Product) => {
    try {
      const product = products.find(p => p.id === updatedProduct.id);
      const diff = product ? updatedProduct.stock - product.stock : 0;

      await supabase.from('products').update({
        sku: updatedProduct.sku,
        name: updatedProduct.name,
        category: updatedProduct.category,
        price: updatedProduct.price,
        cost: updatedProduct.cost,
        stock: updatedProduct.stock,
        min_stock: updatedProduct.minStock,
        unit: updatedProduct.unit,
        image_url: updatedProduct.imageUrl
      }).eq('id', updatedProduct.id);

      if (diff !== 0) {
        await logStockMovement(updatedProduct.id, diff > 0 ? 'restock' : 'adjustment', diff, 'Product edit');
      }
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await supabase.from('products').delete().eq('id', productId);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleAddClient = async (client: Client) => {
    try {
      await supabase.from('clients').insert({
        name: client.name,
        company_name: client.companyName,
        email: client.email,
        phone: client.phone,
        balance: client.balance,
        status: client.status
      });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleClientPayment = async (clientId: string, amount: number) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    try {
      await supabase.from('clients').update({
        balance: client.balance + amount
      }).eq('id', clientId);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleCheckout = async (clientId: string, items: CartItem[]) => {
    if (!user) {
      alert("Error: You must be logged in to process orders.");
      return;
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = subtotal * (settings.taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    try {
      // 1. Create Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          client_id: clientId,
          staff_id: user.id, // CRITICAL: Save current user's ID
          total_amount: totalAmount,
          status: 'completed',
          date: new Date().toISOString()
        })
        .select()
        .single();

      if (orderError) throw orderError;
      const orderId = orderData.id;

      // 2. Insert Order Items
      const orderItemsToInsert = items.map(item => ({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price_at_sale: item.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);
      if (itemsError) throw itemsError;

      // 3. Update Client Balance (Subtract total)
      const client = clients.find(c => c.id === clientId);
      if (client) {
        await supabase.from('clients').update({
          balance: client.balance - totalAmount
        }).eq('id', clientId);
      }

      // 4. Update Stock & Log Movement
      for (const item of items) {
        const product = products.find(p => p.id === item.id);
        if (product) {
          const newStock = product.stock - item.quantity;
          await supabase.from('products').update({ stock: newStock }).eq('id', item.id);

          await logStockMovement(
            item.id,
            'sale',
            -item.quantity,
            `Order #${orderId.slice(0, 8)}`
          );
        }
      }

      alert('Order successfully processed!');
      fetchData();
    } catch (e: any) {
      console.error("Checkout failed", e);
      alert(`Checkout failed: ${e.message || e}`);
    }
  };


  // Role Access Checks
  const isDeveloper = user?.role === UserRole.DEVELOPER;
  const isAdmin = user?.role === UserRole.ADMIN || isDeveloper;
  const isStaff = user?.role === UserRole.STAFF || isAdmin;

  const canAccessSettings = isDeveloper || isAdmin;
  const canAccessDashboard = isDeveloper || isAdmin; // Staff might not see full dashboard
  const canAccessPOS = isDeveloper || isStaff;
  const canAccessInventory = isDeveloper || isStaff;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  // CORE ROUTING LOGIC

  // Rule 1: Not in Telegram AND Not Dev Bypass -> Show Login (Landing Page)
  if (!isTelegram && !isDevBypass) {
    return (
      <Router>
        <Routes>
          {/* All routes redirect to Login in strict browser mode, except Login itself */}
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  // Rule 2: In Telegram or Dev Mode -> Use User Session
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
        } />

        <Route path="/*" element={
          user ? (
            <Layout user={user} onLogout={handleLogout}>
              <Routes>
                {canAccessDashboard && (
                  <Route path="/" element={<Dashboard products={products} clients={clients} orders={orders} currency={settings.currency} />} />
                )}

                {canAccessInventory && (
                  <Route
                    path="/inventory"
                    element={
                      <Inventory
                        user={user}
                        products={products}
                        stockMovements={stockMovements}
                        currency={settings.currency}
                        defaultMinStock={settings.defaultMinStock}
                        onUpdateStock={handleUpdateStock}
                        onAddProduct={handleAddProduct}
                        onEditProduct={handleEditProduct}
                        onDeleteProduct={handleDeleteProduct}
                      />
                    }
                  />
                )}

                {canAccessPOS && (
                  <Route
                    path="/pos"
                    element={
                      <POS
                        products={products}
                        clients={clients}
                        currency={settings.currency}
                        taxRate={settings.taxRate}
                        onCheckout={handleCheckout}
                      />
                    }
                  />
                )}

                <Route
                  path="/clients"
                  element={
                    <Clients
                      clients={clients}
                      orders={orders}
                      currency={settings.currency}
                      onPayment={handleClientPayment}
                      onAddClient={handleAddClient}
                    />
                  }
                />

                {canAccessSettings && (
                  <Route
                    path="/settings"
                    element={
                      <Settings
                        settings={settings}
                        onUpdateSettings={setSettings}
                        products={products}
                        clients={clients}
                        orders={orders}
                        onResetData={() => fetchData()}
                      />
                    }
                  />
                )}

                <Route
                  path="/profile"
                  element={
                    <Profile
                      user={user}
                      orders={orders}
                      products={products}
                      clients={clients}
                      onLogout={handleLogout}
                    />
                  }
                />

                {/* Fallback for unauthorized or 404 */}
                <Route path="*" element={
                  <div className="flex flex-col items-center justify-center h-full">
                    <h2 className="text-xl font-bold p-8 text-slate-500">Access Restricted / Page Not Found</h2>
                    <Navigate to={canAccessDashboard ? "/" : (canAccessPOS ? "/pos" : "/profile")} replace />
                  </div>
                } />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </Router>
  );
};

export default App;
