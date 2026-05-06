"use client";

import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  TrendingUp, 
  DollarSign, 
  Zap,
  Clock,
  Package,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Printer as PrinterIcon,
  ShoppingCart,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Wallet,
  PieChart,
  Target,
  ArrowRightLeft
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { sales, products, printers, expenses, settings, filaments, calculateProductCost } = useApp();

  // --- CÁLCULOS FINANCEIROS REAIS ---
  
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const financialStats = useMemo(() => {
    const currentMonthSales = sales.filter(s => isWithinInterval(new Date(s.date), { start: monthStart, end: monthEnd }));
    const currentMonthExpenses = expenses.filter(e => isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd }));

    let monthlyRevenue = 0;
    let monthlyProductionCost = 0;
    let monthlyFees = 0;
    let monthlyShipping = 0;

    currentMonthSales.forEach(sale => {
      const product = products.find(p => p.id === sale.productId);
      if (product) {
        const price = sale.customPrice || product.salePrice;
        monthlyRevenue += price * sale.quantity;
        monthlyProductionCost += calculateProductCost(product) * sale.quantity;
        monthlyFees += (settings.channelFees[sale.channel] / 100) * price * sale.quantity;
        if (sale.shippingPaidBy === 'vendedor') monthlyShipping += (sale.shippingCost || 0);
      }
    });

    const monthlyFixedExpenses = currentMonthExpenses.reduce((acc, e) => acc + e.amount, 0);
    const monthlyNetProfit = monthlyRevenue - monthlyProductionCost - monthlyFees - monthlyShipping - monthlyFixedExpenses;

    const totalRevenue = sales.reduce((acc, s) => {
      const p = products.find(prod => prod.id === s.productId);
      return acc + (s.customPrice || p?.salePrice || 0) * s.quantity;
    }, 0);
    
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const totalProductionCost = sales.reduce((acc, s) => {
      const p = products.find(prod => prod.id === s.productId);
      return acc + (p ? calculateProductCost(p) * s.quantity : 0);
    }, 0);

    const cashBalance = totalRevenue - totalExpenses - totalProductionCost;

    return {
      monthlyRevenue,
      monthlyNetProfit,
      monthlyFixedExpenses,
      monthlyProductionCost,
      cashBalance,
      margin: monthlyRevenue > 0 ? (monthlyNetProfit / monthlyRevenue) * 100 : 0
    };
  }, [sales, expenses, products, calculateProductCost, settings, monthStart, monthEnd]);

  // --- GERAÇÃO DE DADOS REAIS PARA O GRÁFICO (ÚLTIMOS 6 MESES) ---
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const start = startOfMonth(d);
      const end = endOfMonth(d);
      const monthName = format(d, 'MMM');

      const monthSales = sales.filter(s => isWithinInterval(new Date(s.date), { start, end }));
      const monthExpenses = expenses.filter(e => isWithinInterval(new Date(e.date), { start, end }));

      let revenue = 0;
      let prodCost = 0;
      let fees = 0;
      
      monthSales.forEach(s => {
        const p = products.find(prod => prod.id === s.productId);
        if (p) {
          const price = s.customPrice || p.salePrice;
          revenue += price * s.quantity;
          prodCost += calculateProductCost(p) * s.quantity;
          fees += (settings.channelFees[s.channel] / 100) * price * s.quantity;
        }
      });

      const fixedExp = monthExpenses.reduce((acc, e) => acc + e.amount, 0);
      const totalGastos = prodCost + fixedExp + fees;
      const profit = revenue - totalGastos;

      data.push({
        name: monthName,
        lucro: Math.max(0, profit),
        gastos: totalGastos
      });
    }
    return data;
  }, [sales, expenses, products, calculateProductCost, settings]);

  const goalProgress = Math.min((financialStats.monthlyNetProfit / settings.monthlyProfitGoal) * 100, 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Dashboard Financeiro</h1>
          <p className="text-muted-foreground mt-1">Bem-vindo de volta, {settings.userName}. Aqui está o pulso real do seu negócio.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-card p-4 rounded-3xl border border-border/50 shadow-sm">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Saldo em Caixa</p>
            <h2 className="text-2xl font-black text-emerald-500">{settings.currency} {financialStats.cashBalance.toLocaleString()}</h2>
          </div>
          <div className="h-10 w-[1px] bg-border mx-2" />
          <Link to="/sales">
            <Button size="sm" className="orange-gradient text-white rounded-xl">Retirar</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-none shadow-md overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={64} /></div>
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Faturamento (Mês)</p>
            <h3 className="text-3xl font-black mt-2">{settings.currency} {financialStats.monthlyRevenue.toLocaleString()}</h3>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-md bg-emerald-500/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500"><TrendingUp size={64} /></div>
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Lucro Líquido Real</p>
            <h3 className="text-3xl font-black text-emerald-500 mt-2">{settings.currency} {financialStats.monthlyNetProfit.toLocaleString()}</h3>
            <Badge className="mt-2 bg-emerald-500 text-white border-none">{financialStats.margin.toFixed(1)}% Margem</Badge>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-md bg-rose-500/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-rose-500"><Receipt size={64} /></div>
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Despesas Totais</p>
            <h3 className="text-3xl font-black text-rose-500 mt-2">{settings.currency} {(financialStats.monthlyFixedExpenses + financialStats.monthlyProductionCost).toLocaleString()}</h3>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-md overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Target size={64} /></div>
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Progresso da Meta</p>
            <h3 className="text-3xl font-black mt-2">{goalProgress.toFixed(0)}%</h3>
            <Progress value={goalProgress} className="h-2 mt-4 bg-primary/10" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-card border-none shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Performance Mensal Real</CardTitle>
                  <CardDescription>Histórico baseado em suas vendas e gastos reais.</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-xs font-bold">Lucro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-zinc-300" />
                    <span className="text-xs font-bold">Gastos</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff5722" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ff5722" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="lucro" stroke="#ff5722" strokeWidth={4} fillOpacity={1} fill="url(#colorLucro)" />
                  <Area type="monotone" dataKey="gastos" stroke="#d4d4d8" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ArrowRightLeft size={20} className="text-primary" /> Fluxo Recente
              </h2>
              <Link to="/sales" className="text-xs text-primary font-bold hover:underline">Ver extrato completo</Link>
            </div>
            <div className="space-y-3">
              {sales.slice(0, 3).map(sale => {
                const product = products.find(p => p.id === sale.productId);
                return (
                  <div key={sale.id} className="flex items-center justify-between p-4 glass-card rounded-2xl border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <ShoppingCart size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Venda: {product?.name}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">{format(new Date(sale.date), 'dd MMM, HH:mm')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-500 font-black text-sm">+{settings.currency} {(sale.customPrice || product?.salePrice || 0).toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <Card className="glass-card border-none bg-primary/5 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10 text-primary rotate-12"><Target size={120} /></div>
            <CardContent className="p-6">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Meta de Lucro Mensal</p>
              <h3 className="text-3xl font-black mt-1">{settings.currency} {settings.monthlyProfitGoal.toLocaleString()}</h3>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold">Progresso Real</span>
                  <span className="text-lg font-black text-primary">{goalProgress.toFixed(0)}%</span>
                </div>
                <Progress value={goalProgress} className="h-3 bg-primary/10" />
                <p className="text-[10px] text-muted-foreground font-bold text-center">
                  Você precisa de mais {settings.currency} {Math.max(0, settings.monthlyProfitGoal - financialStats.monthlyNetProfit).toLocaleString()} para bater a meta.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Distribuição de Custos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Produção</span>
                  <span>{((financialStats.monthlyProductionCost / (financialStats.monthlyFixedExpenses + financialStats.monthlyProductionCost || 1)) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(financialStats.monthlyProductionCost / (financialStats.monthlyFixedExpenses + financialStats.monthlyProductionCost || 1)) * 100} className="h-1.5 bg-orange-500/10" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Despesas Fixas</span>
                  <span>{((financialStats.monthlyFixedExpenses / (financialStats.monthlyFixedExpenses + financialStats.monthlyProductionCost || 1)) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(financialStats.monthlyFixedExpenses / (financialStats.monthlyFixedExpenses + financialStats.monthlyProductionCost || 1)) * 100} className="h-1.5 bg-blue-500/10" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;