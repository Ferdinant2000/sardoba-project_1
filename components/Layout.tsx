
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
  ShieldAlert,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { User, UserRole } from '../types';
import { useLanguage, useTheme } from '../contexts/Providers';

interface LayoutProps {
  children: ReactNode;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();
  // We can use theme here if we need conditional rendering, but CSS classes are preferred.
  // const { theme } = useTheme(); 

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  // Filter Nav Items based on Role
  const allNavItems = [
    { name: t('dashboard'), path: '/', icon: LayoutDashboard, roles: [UserRole.DEVELOPER, UserRole.ADMIN, UserRole.STAFF] },
    { name: t('catalog'), path: '/inventory', icon: Package, roles: [UserRole.DEVELOPER, UserRole.ADMIN, UserRole.STAFF] },
    { name: t('store'), path: '/', icon: ShoppingCart, roles: [UserRole.USER, UserRole.GUEST] }, // Store for regular users
    { name: t('pos'), path: '/pos', icon: ShoppingCart, roles: [UserRole.DEVELOPER, UserRole.STAFF] },
    { name: t('admin'), path: '/admin', icon: ShieldAlert, roles: [UserRole.DEVELOPER, UserRole.ADMIN] },
    { name: t('clients'), path: '/clients', icon: Users, roles: [UserRole.DEVELOPER, UserRole.ADMIN, UserRole.STAFF] },
    { name: t('profile'), path: '/profile', icon: UserIcon, roles: [UserRole.DEVELOPER, UserRole.ADMIN, UserRole.STAFF, UserRole.GUEST, UserRole.USER] },
  ];

  const visibleNavItems = allNavItems.filter(item => item.roles.includes(user.role));

  const handleLogoutClick = () => {
    if (window.confirm(t('logout_confirm') || 'Are you sure you want to logout?')) {
      onLogout();
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
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
          fixed inset-y-0 left-0 z-30 
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
          text-slate-600 dark:text-slate-300
          transform transition-all duration-300 ease-in-out flex flex-col
          lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64
        `}
      >
        <div className={`flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 h-16 ${isCollapsed ? 'lg:justify-center' : ''}`}>
          {!isCollapsed && (
            <div className="flex items-center space-x-2 animate-in fade-in duration-200">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xl flex-shrink-0">
                N
              </div>
              <span className="font-bold text-lg tracking-tight whitespace-nowrap text-slate-900 dark:text-white">Nexus B2B</span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xl flex-shrink-0 lg:block hidden">
              N
            </div>
          )}

          <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <X size={24} />
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex absolute -right-3 top-8 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 p-1 rounded-full shadow-md hover:text-blue-600 dark:hover:text-blue-400 transition-colors z-50 w-6 h-6 items-center justify-center"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
          <ul className="space-y-1 px-2">
            {visibleNavItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center px-4 py-3 rounded-md transition-all duration-200 relative group
                    ${isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.name : ''}
                >
                  <item.icon size={20} className={`${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
                  {!isCollapsed && <span className="font-medium whitespace-nowrap animate-in fade-in duration-200">{item.name}</span>}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                      {item.name}
                    </div>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <NavLink
            to="/settings"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) => `
              flex items-center w-full px-4 py-2 rounded-md transition-colors relative group
              ${isActive
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? t('settings') : ''}
          >
            <Settings size={20} className={`${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
            {!isCollapsed && <span>{t('settings')}</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                {t('settings')}
              </div>
            )}
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 bg-slate-50 dark:bg-gray-900">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-8 shadow-sm transition-colors duration-300">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 lg:flex-none"></div>

          <NavLink to={user.role === UserRole.GUEST ? '#' : "/profile"} className={`flex items-center space-x-4 ${user.role !== UserRole.GUEST ? 'hover:opacity-80 transition-opacity' : 'cursor-default'}`}>
            <div className="hidden md:flex flex-col items-end mr-2 text-right">
              <span className="text-sm font-semibold text-slate-800 dark:text-white transition-colors">{user.name}</span>
              <div className="flex items-center">
                {user.role === UserRole.GUEST && <ShieldAlert size={12} className="text-slate-500 mr-1" />}
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase">{user.role}</span>
              </div>
            </div>
            <div className={`h-10 w-10 rounded-full border-2 border-white dark:border-slate-600 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold overflow-hidden ${user.role === UserRole.GUEST ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
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
