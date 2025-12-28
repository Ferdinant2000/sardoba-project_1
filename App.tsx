import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import POS from './components/POS';
import Clients from './components/Clients';
import Settings from './components/Settings';
import Login from './components/Login';
import Profile from './components/Profile';
import Store from './components/Store';
import Admin from './components/Admin';
import { UserRole } from './types';
import { Loader2 } from 'lucide-react';
import { AppProviders } from './contexts/Providers';
import { useAuth } from './contexts/AuthContext';
import { useData } from './contexts/DataContext';

// Helper component to use the Auth Hook inside the Router scope (or just inside Providers)
const AppContent: React.FC = () => {
  const { user, loading, isTelegram, isDevBypass, login, logout } = useAuth();

  const {
    products,
    clients,
    orders,
    stockMovements,
    loading: dataLoading,
    settings,
    updateSettings,
    refreshData,
    updateStock,
    addProduct,
    editProduct,
    deleteProduct,
    addClient,
    clientPayment,
    checkout
  } = useData();

  // Role Access Checks
  const isDeveloper = user?.role === UserRole.DEVELOPER;
  const isAdmin = user?.role === UserRole.ADMIN || isDeveloper;
  const isStaff = user?.role === UserRole.STAFF || isAdmin;
  const isBasicUser = user?.role === UserRole.USER;

  const canAccessSettings = true;
  const canAccessDashboard = isDeveloper || isAdmin;
  const canAccessPOS = isDeveloper || isStaff;
  const canAccessInventory = isDeveloper || isStaff;
  const canAccessAccessAdmin = isAdmin;

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
          <Route path="/login" element={<Login onLogin={login} />} />
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
          user ? <Navigate to="/" replace /> : <Login onLogin={login} />
        } />

        <Route path="/*" element={
          user ? (
            <Layout user={user} onLogout={logout}>
              <Routes>
                {/* DEFAULT ROUTE SPLIT */}
                <Route path="/" element={
                  canAccessDashboard ? (
                    <Dashboard products={products} clients={clients} orders={orders} currency={settings.currency} />
                  ) : (
                    <Store />
                  )
                } />

                {/* Explicit Dashboard Route */}
                {canAccessDashboard && (
                  <Route path="/dashboard" element={<Dashboard products={products} clients={clients} orders={orders} currency={settings.currency} />} />
                )}

                {/* ADMIN PANEL */}
                {canAccessAccessAdmin && (
                  <Route path="/admin" element={<Admin />} />
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
                        onUpdateStock={updateStock}
                        onAddProduct={addProduct}
                        onEditProduct={editProduct}
                        onDeleteProduct={deleteProduct}
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
                        onCheckout={checkout}
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
                      onPayment={clientPayment}
                      onAddClient={addClient}
                    />
                  }
                />

                {canAccessSettings && (
                  <Route
                    path="/settings"
                    element={
                      <Settings
                        settings={settings}
                        onUpdateSettings={updateSettings}
                        products={products}
                        clients={clients}
                        orders={orders}
                        onResetData={refreshData}
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
                      onLogout={logout}
                    />
                  }
                />

                <Route path="*" element={
                  <div className="flex flex-col items-center justify-center h-full">
                    <h2 className="text-xl font-bold p-8 text-slate-500">Access Restricted / Page Not Found</h2>
                    <Navigate to="/" replace />
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

const App: React.FC = () => {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
};

export default App;
