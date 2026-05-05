"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Receipt, 
  Settings as SettingsIcon,
  Printer,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Produtos', path: '/products', icon: Package },
  { name: 'Vendas', path: '/sales', icon: ShoppingCart },
  { name: 'Despesas', path: '/expenses', icon: Receipt },
  { name: 'Configurações', path: '/settings', icon: SettingsIcon },
];

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-400 border-r border-zinc-800">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
          <Printer size={24} />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">Print<span className="text-orange-500">SaaS</span></span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-zinc-900 text-blue-400 border border-zinc-800" 
                  : "hover:bg-zinc-900 hover:text-zinc-200"
              )}
            >
              <item.icon size={20} className={cn(isActive ? "text-blue-400" : "group-hover:text-blue-400")} />
              <span className="font-medium">{item.name}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-zinc-800">
        <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Plano Atual</p>
          <p className="text-sm font-medium text-zinc-200">Pro Business</p>
          <div className="mt-3 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 w-3/4" />
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">75% da cota utilizada</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2">
            <Printer size={24} className="text-blue-500" />
            <span className="font-bold text-white">PrintSaaS</span>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-zinc-400">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-zinc-950 border-zinc-800">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-zinc-950 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;