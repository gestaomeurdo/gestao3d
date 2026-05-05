"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  Zap,
  Clock,
  Calendar
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
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const { sales, products, expenses, printers, settings, calculateProductCost } = useApp();
  const [period, setPeriod] = useState('month');

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
  
  const totalInvestment = printers.reduce((acc, p) => acc + p.purchasePrice, 0);
  const globalROI = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

  const stats = [
    { title: 'Receita Total', value: `${settings.currency} ${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-blue-500', trend: '+12.5%', trendUp: true },
    { title: 'Lucro Líquido', value: `${settings.currency} ${netProfit.toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-500', trend: '+8.2%', trendUp: true },
    { title: 'ROI Global', value: `${globalROI.toFixed(1)}%`, icon: Zap, color: 'text-purple-500', trend: 'Payback em progresso', trendUp: globalROI >= 100 },
    { title: 'Margem Média', value: `${margin.toFixed(1)}%`, icon: Package, color: 'text-orange-500', trend: '+1.2%', trendUp: true },
  ];

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-zinc-400 mt-1">Visão geral da sua operação de impressão 3D.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <Calendar size={16} className="text-zinc-500 ml-2" />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px] bg-transparent border-none text-zinc-300 focus:ring-0">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
              <SelectItem value="day">Hoje</SelectItem>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
    </div>
  );
};

export default Dashboard;