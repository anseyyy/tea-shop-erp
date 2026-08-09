import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { icons } from '../../constData';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: icons.dashboardIcon, roles: ['admin'] },
  { name: 'POS / Sales', href: '/sales', icon: icons.salesIcon, roles: ['admin', 'employee'] },
  { name: 'Sales History', href: '/sales/history', icon: icons.calendarIcon, roles: ['admin', 'employee'] },
  { name: 'Expenses', href: '/expenses', icon: icons.expenseIcon, roles: ['admin'] },
  { name: 'Products', href: '/products', icon: icons.productIcon, roles: ['admin'] },
  { name: 'Employees', href: '/employees', icon: icons.employeesIcon, roles: ['admin'] },
  { name: 'Profile', href: '/profile', icon: icons.userIcon, roles: ['admin', 'employee'] },
];

export const MainLayout = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Filter navigation items by role
  const filteredNavItems = navigationItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  // Find the navigation item that has the longest matching href to prevent multiple matches (e.g. /sales and /sales/history)
  const activeItem = filteredNavItems
    .filter(item => pathname === item.href || pathname.startsWith(item.href + '/'))
    .reduce((longest, current) => {
      return !longest || current.href.length > longest.href.length ? current : longest;
    }, null);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col xl:flex-row text-gray-800">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden xl:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div>
            <h1 className="text-lg font-bold text-gray-900">TeaShop ERP</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
              {user?.role} Portal
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = activeItem && activeItem.name === item.name;
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors group
                  ${isActive 
                    ? 'bg-amber-800 text-white' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-3">
          <div className="flex items-center px-2">
            <div className="h-9 w-9 rounded-full bg-amber-800 flex items-center justify-center text-white font-bold text-sm">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <icons.logoutIcon className="mr-3 h-5 w-5 text-red-500" />
            Logout
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="xl:hidden bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
        <div>
          <h1 className="text-base font-bold text-gray-900">TeaShop ERP</h1>
          <p className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">
            {user?.name} ({user?.role})
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Logout"
        >
          <icons.logoutIcon className="h-5 w-5" />
        </button>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-h-0">
        <main className="flex-1 py-6 px-4 xl:py-8 xl:px-8 max-w-7xl w-full mx-auto pb-24 xl:pb-8">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex items-center justify-around px-2 z-30 shadow-lg">
        {filteredNavItems.slice(0, 5).map((item) => {
          const isActive = activeItem && activeItem.name === item.name;
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 w-16 transition-colors
                ${isActive ? 'text-amber-800 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] mt-1 truncate max-w-full">{item.name}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
};

export default MainLayout;
