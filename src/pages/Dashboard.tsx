"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  ArrowUpRight, 
  Zap,
  Clock,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { sales, products, expenses, settings, calculateProductCost } = useApp();

  const totalRevenue = sales.reduce((acc, sale) => {
    const product = products.find(p => p.id === sale.productId);
    return acc + ((sale.customPrice || product?.salePrice || 0) * sale.quantity);
  }, 0);

  const netProfit = totalRevenue * 0.65; // Simulação para visual

  const chartData = [
    { name: 'Jan', value: 400 }, { name: 'Fev', value: 300 }, { name: 'Mar', value: 600 },
    { name: 'Abr', value: 800 }, { name: 'Mai', value: 500 }, { name: 'Jun', value: 900 },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Olá, Oliver! 👋</h1>
          <p className="text-muted-foreground mt-2 text-lg">Vamos conferir o desempenho da sua oficina hoje.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-border/50 bg-card/50">
            <Calendar className="mr-2 h-4 w-4" /> Fevereiro 2026
          </Button>
          <Button className="orange-gradient text-white rounded-xl shadow-lg shadow-orange-500/20">
            Exportar Dados
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hero Card */}
        <Card className="lg:col-span-2 glass-card overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 orange-gradient blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Receita Mensal</CardTitle>
              <div className="text-4xl font-bold mt-2">{settings.currency} {totalRevenue.toLocaleString()}</div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal size={20} /></Button>
          </CardHeader>
          <CardContent className="h-[240px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff5722" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff5722" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(20,20,20,0.8)', border: 'none', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#ff5722" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Side Stats */}
        <div className="space-y-6">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                  <TrendingUp size={20} />
                </div>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">+12.5%</span>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Lucro Líquido</p>
              <p className="text-2xl font-bold mt-1">{settings.currency} {netProfit.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <Zap size={20} />
                </div>
                <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full">Meta 80%</span>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Eficiência de Impressão</p>
              <div className="mt-3 h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full orange-gradient w-[78%]" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card bg-primary/5 border-primary/20">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary uppercase tracking-widest">ROI Global</p>
                <p className="text-3xl font-black mt-1">142%</p>
              </div>
              <ArrowUpRight size={32} className="text-primary opacity-50" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card p-6">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Produtos Ativos</p>
          <p className="text-2xl font-bold mt-2">{products.length}</p>
          <div className="mt-4 flex -space-x-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold">
                P{i}
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Carga de Trabalho Semanal</p>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => <div key={i} className={cn("w-3 h-3 rounded-sm", i > 3 ? "bg-primary" : "bg-primary/20")} />)}
            </div>
          </div>
          <div className="flex justify-between items-end h-12 gap-2">
            {Array.from({length: 14}).map((_, i) => (
              <div key={i} className="flex-1 orange-gradient rounded-t-sm" style={{ height: `${Math.random() * 100}%`, opacity: 0.3 + (Math.random() * 0.7) }} />
            ))}
          </div>
        </Card>

        <Card className="glass-card p-6 flex flex-col justify-center items-center text-center border-dashed border-2 border-primary/20 bg-transparent">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
            <Plus size={24} />
          </div>
          <p className="text-sm font-bold">Novo Projeto</p>
          <p className="text-xs text-muted-foreground mt-1">Comece uma nova impressão</p>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;