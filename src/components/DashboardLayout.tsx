"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useTheme } from 'next-themes';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings as SettingsIcon,
  Printer as PrinterIcon,
  Search,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  Wallet,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/dropdown-menu";

const navItems = [
  { group: "Principal", items: [
    { name: 'Início', path: '/', icon: LayoutDashboard },
    { name: 'Catálogo', path: '/products', icon: Package },
    { name: 'Vendas', path: '/sales', icon: ShoppingCart },
  ]},
  { group: "Gestão", items: [
    { name: 'Financeiro', path: '/finance', icon: Wallet },
    { name: 'Máquinas', path: '/printers', icon: PrinterIcon },
  ]},
  { group: "Ajustes", items: [
    { name: 'Configurações', path: '/settings', icon: SettingsIcon },
  ]}
];

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { settings, session, signOut } = useApp();
  const { theme, setTheme } = useTheme();
  
  const googleAvatar = session?.user?.user_metadata?.avatar_url;
  const userName = session?.user?.user_metadata?.full_name || settings?.userName || "Usuário";
  const systemName = settings?.systemName || "PrintSaaS";
  const userInitials = userName.substring(0, 2).toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 orange-gradient rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
          <PrinterIcon size={18} />
        </div>
        <span className="text-xl font-bold tracking-tight italic">
          {systemName}
        </span>
      </div>
      
      <nav className="flex-1 space-y-8">
        {navItems.map((group) => (
          <div key={group.group}>
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-4 px-2">{group.group}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group text-sm font-bold",
                      isActive 
                        ? "bg-orange-500/10 text-orange-600" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <item.icon size={18} className={cn(isActive ? "text-orange-600" : "text-slate-400 group-hover:text-slate-900")} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="h-10 w-10 border-2 border-orange-500/20 shadow-sm">
            <AvatarImage src={googleAvatar} />
            <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-slate-900">{userName}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Gerente</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      <aside className="hidden lg:block w-72 flex-shrink-0 border-r border-slate-100">
        <SidebarContent />
      </aside>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="h-20 flex items-center justify-between px-8 border-b border-slate-100 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="Busca rápida no sistema..." 
                className="pl-12 bg-slate-50 border-none rounded-2xl h-12 focus-visible:ring-orange-500/20 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full text-slate-400 hover:text-orange-500 hover:bg-orange-50"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full text-[10px] font-black uppercase text-emerald-600 tracking-wider">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="rounded-full text-slate-400">
                <Bell size={20} />
              </Button>
              <div className="h-8 w-[1px] bg-slate-100 mx-2" />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-black text-slate-900 leading-none">{userName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Perfil</p>
                    </div>
                    <Avatar className="h-10 w-10 border-2 border-orange-500/20 shadow-sm">
                      <AvatarImage src={googleAvatar} />
                      <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">{userInitials}</AvatarFallback>
                    </Avatar>
                    <ChevronDown size={14} className="text-slate-400" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-3xl p-2 shadow-2xl border-none">
                  <DropdownMenuLabel className="font-bold text-xs uppercase tracking-widest text-slate-400 px-3 py-2">Sua Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-50" />
                  <DropdownMenuItem onClick={() => signOut()} className="text-rose-500 focus:text-rose-600 focus:bg-rose-50 cursor-pointer rounded-2xl h-12 px-4 font-bold">
                    <LogOut className="mr-3 h-5 w-5" />
                    <span>Sair da Conta</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#FDFDFD]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;