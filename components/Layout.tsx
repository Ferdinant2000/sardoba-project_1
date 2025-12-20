
import React, { ReactNode, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Menu,
  X,
  LogOut,
  Settings,
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: ReactNode;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Filter Nav Items based on Role
  const allNavItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: [UserRole.DEVELOPER, UserRole.ADMIN, UserRole.STAFF] },
    { name: 'Inventory', path: '/inventory', icon: Package, roles: [UserRole.DEVELOPER, UserRole.ADMIN, UserRole.STAFF, UserRole.GUEST] },
    { name: 'POS / Checkout', path: '/pos', icon: ShoppingCart, roles: [UserRole.DEVELOPER, UserRole.STAFF] },
    { name: 'Clients', path: '/clients', icon: Users, roles: [UserRole.DEVELOPER, UserRole.ADMIN, UserRole.STAFF] },
  ];

  const visibleNavItems = allNavItems.filter(item => item.roles.includes(user.role));

  const handleLogoutClick = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xl">
              N
            </div>
            <span className="font-bold text-lg tracking-tight">Nexus B2B</span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {visibleNavItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center px-4 py-3 rounded-md transition-colors
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <item.icon size={20} className="mr-3" />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-700">
          {user.role !== UserRole.GUEST && (
            <NavLink
              to="/settings"
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center w-full px-4 py-2 rounded-md transition-colors
                ${isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'}
              `}
            >
              <Settings size={20} className="mr-3" />
              <span>Settings</span>
            </NavLink>
          )}
          <button
            onClick={handleLogoutClick}
            className="flex items-center w-full px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors mt-1"
          >
            <LogOut size={20} className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shadow-sm">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 lg:flex-none"></div>

          <NavLink to={user.role === UserRole.GUEST ? '#' : "/profile"} className={`flex items-center space-x-4 ${user.role !== UserRole.GUEST ? 'hover:opacity-80 transition-opacity' : 'cursor-default'}`}>
            <div className="hidden md:flex flex-col items-end mr-2 text-right">
              <span className="text-sm font-semibold text-slate-800">{user.name}</span>
              <div className="flex items-center">
                {user.role === UserRole.GUEST && <ShieldAlert size={12} className="text-slate-500 mr-1" />}
                <span className="text-xs text-slate-500 uppercase">{user.role}</span>
              </div>
            </div>
            <div className={`h-10 w-10 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-slate-600 font-bold overflow-hidden ${user.role === UserRole.GUEST ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200'}`}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={20} />
              )}
            </div>
          </NavLink>

        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </div >
    </div >
  );
};

export default Layout;
