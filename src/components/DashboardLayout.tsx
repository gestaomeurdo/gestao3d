"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Receipt, 
  Settings as SettingsIcon,
  Printer as PrinterIcon,
  Search,
  Bell,
  Moon,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
  { group: "Geral", items: [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Produtos', path: '/products', icon: Package },
    { name: 'Vendas', path: '/sales', icon: ShoppingCart },
  ]},
  { group: "Operação", items: [
    { name: 'Impressoras', path: '/printers', icon: PrinterIcon },
    { name: 'Despesas', path: '/expenses', icon: Receipt },
  ]},
  { group: "Sistema", items: [
    { name: 'Configurações', path: '/settings', icon: SettingsIcon },
  ]}
];

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { settings } = useApp();
  
  const userName = settings?.userName || "Usuário";
  const userInitials = userName.substring(0, 2).toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 orange-gradient rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
          <PrinterIcon size={18} />
        </div>
        <span className="text-xl font-bold tracking-tight">Print<span className="text-primary">SaaS</span></span>
      </div>
      
      <nav className="flex-1 space-y-8">
        {navItems.map((group) => (
          <div key={group.group}>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-4 px-2">{group.group}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon size={18} className={cn(isActive ? "text-primary" : "group-hover:text-foreground")} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-border/50">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{userName}</p>
            <p className="text-[10px] text-muted-foreground">Administrador</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans dark">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-border/50">
        <SidebarContent />
      </aside>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-border/50 bg-background/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Busca rápida..." 
                className="pl-10 bg-secondary/50 border-none rounded-2xl h-11 focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sistema Online
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                <Bell size={20} />
              </Button>
              <div className="h-8 w-[1px] bg-border mx-2" />
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold leading-none">{userName}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Painel de Controle</p>
                </div>
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <ChevronDown size={14} className="text-muted-foreground" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;