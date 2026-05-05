"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  Zap,
  Clock
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const { sales, products, expenses, settings, calculateProductCost } = useApp();

  // Cálculos de métricas
  const totalRevenue = sales.reduce((acc, sale) => {
    const product = products.find(p => p.id === sale.productId);
    const price = sale.customPrice || product?.salePrice || 0;
    return acc + (price * sale.quantity);
  }, 0);

  const totalCosts = sales.reduce((acc, sale) => {
    const product = products.find(p => p.id === sale.productId);
    if (!product) return acc;
    const cost = calculateProductCost(product);
    const fee = (settings.channelFees[sale.channel] / 100) * (sale.customPrice || product.salePrice);
    return acc + ((cost + fee) * sale.quantity);
  }, 0) + expenses.reduce((acc, exp) => acc + exp.amount, 0);

  const netProfit = totalRevenue - totalCosts;
  const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const stats = [
    { title: 'Receita Total', value: `${settings.currency} ${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-blue-500', trend: '+12.5%', trendUp: true },
    { title: 'Lucro Líquido', value: `${settings.currency} ${netProfit.toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-500', trend: '+8.2%', trendUp: true },
    { title: 'Custos Totais', value: `${settings.currency} ${totalCosts.toFixed(2)}`, icon: Package, color: 'text-orange-500', trend: '-2.4%', trendUp: false },
    { title: 'Margem Média', value: `${margin.toFixed(1)}%`, icon: Zap, color: 'text-purple-500', trend: '+1.2%', trendUp: true },
  ];

  // Dados fictícios para os gráficos (em um app real viriam do estado filtrado por data)
  const chartData = [
    { name: 'Seg', vendas: 400, lucro: 240 },
    { name: 'Ter', vendas: 300, lucro: 139 },
    { name: 'Qua', vendas: 200, lucro: 980 },
    { name: 'Qui', vendas: 278, lucro: 390 },
    { name: 'Sex', vendas: 189, lucro: 480 },
    { name: 'Sáb', vendas: 239, lucro: 380 },
    { name: 'Dom', vendas: 349, lucro: 430 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Visão geral da sua operação de impressão 3D.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-400">{stat.title}</CardTitle>
              <stat.icon className={stat.color} size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="flex items-center mt-1">
                {stat.trendUp ? (
                  <ArrowUpRight className="text-emerald-500 mr-1" size={14} />
                ) : (
                  <ArrowDownRight className="text-rose-500 mr-1" size={14} />
                )}
                <span className={cn("text-xs font-medium", stat.trendUp ? "text-emerald-500" : "text-rose-500")}>
                  {stat.trend}
                </span>
                <span className="text-xs text-zinc-500 ml-1">vs mês anterior</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Desempenho de Vendas</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Line type="monotone" dataKey="vendas" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Lucro por Dia</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  cursor={{ fill: '#27272a' }}
                />
                <Bar dataKey="lucro" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Clock className="text-blue-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Custo Energia/Hora</p>
              <p className="text-xl font-bold text-white">{settings.currency} {settings.energyCostPerHour.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-full">
              <Package className="text-orange-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Filamento Médio/kg</p>
              <p className="text-xl font-bold text-white">{settings.currency} {settings.filamentPricePerKg.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-full">
              <TrendingUp className="text-purple-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-zinc-400">ROI Estimado</p>
              <p className="text-xl font-bold text-white">145%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;