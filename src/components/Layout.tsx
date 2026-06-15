import { Link, Outlet, useLocation } from 'react-router-dom';
import { Briefcase, Users, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

export function Layout() {
  const location = useLocation();

  const navItems = [
    { name: 'Объекты', href: '/', icon: Briefcase },
    { name: 'Сотрудники', href: '/employees', icon: Users },
    { name: 'Настройки', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7F5] font-sans text-[#2D332D]">
      {/* Top Header / Desktop Sidebar could be here, but let's do a simple bottom nav for mobile and top nav for desktop */}
      <header className="bg-white border-b border-[#E0E5E0] sticky top-0 z-10 w-full hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-3">
                <div className="w-8 h-8 bg-[#5A6B5A] rounded-lg flex items-center justify-center text-white font-bold">B</div>
                <span className="text-xl font-bold tracking-tight text-[#2D332D]">
                  BuildTracker
                </span>
              </div>
              <nav className="ml-6 flex space-x-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/');
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'border-[#5A6B5A] text-[#5A6B5A]'
                          : 'border-transparent text-[#8A968A] hover:border-[#D0D7D0] hover:text-[#5A6B5A]'
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="sm:hidden fixed bottom-0 w-full bg-white border-t border-[#E0E5E0] flex justify-around pb-safe z-10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/');
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center py-3 px-2 flex-1 text-xs font-medium transition-colors',
                isActive ? 'text-[#5A6B5A]' : 'text-[#8A968A] hover:text-[#5A6B5A]'
              )}
            >
              <Icon className={cn("h-6 w-6 mb-1", isActive ? "text-[#5A6B5A]" : "text-[#8A968A]")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
