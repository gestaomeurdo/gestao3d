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
  ArrowRight,
  Printer as PrinterIcon,
  ShoppingCart,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Layers
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, isToday, startOfDay } from 'date-fns';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { sales, products, printers, expenses, settings, filaments, calculateProductCost } = useApp();

  // --- LÓGICA DE DADOS ---
  
  const todaySales = useMemo(() => 
    sales.filter(sale => isToday(new Date(sale.date))), 
  [sales]);

  const stats = useMemo(() => {
    let revenue = 0;
    let cost = 0;
    let pieces = 0;
    let time = 0;

    todaySales.forEach(sale => {
      const product = products.find(p => p.id === sale.productId);
      if (product) {
        const unitPrice = sale.customPrice || product.salePrice;
        revenue += unitPrice * sale.quantity;
        cost += calculateProductCost(product) * sale.quantity;
        pieces += sale.quantity;
        time += product.printTimeMinutes * sale.quantity;
      }
    });

    const profit = revenue - cost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return { revenue, profit, pieces, time, margin };
  }, [todaySales, products, calculateProductCost]);

  const alerts = useMemo(() => {
    const list = [];
    
    // Alerta de Impressoras Paradas
    const idlePrinters = printers.filter(p => p.status === 'disponível').length;
    if (idlePrinters > 0) list.push({ type: 'warning', text: `${idlePrinters} impressora(s) parada(s)` });
    
    // Alerta de Estoque Baixo (menos de 200g)
    const lowStockFilaments = filaments.filter(f => f.stockGrams < 200);
    lowStockFilaments.forEach(f => {
      list.push({ type: 'danger', text: `Estoque crítico: ${f.name} (${f.stockGrams}g)` });
    });
    
    if (todaySales.length === 0) list.push({ type: 'info', text: "Nenhuma venda registrada hoje" });
    
    return list;
  }, [printers, filaments, todaySales]);

  // Mock de dados para o mini gráfico (últimos 7 dias)
  const chartData = [
    { day: 'Seg', profit: 120 }, { day: 'Ter', profit: 450 }, { day: 'Qua', profit: 300 },
    { day: 'Qui', profit: 600 }, { day: 'Sex', profit: 800 }, { day: 'Sab', profit: 500 },
    { day: 'Dom', profit: stats.profit || 200 }
  ];

  const monthlyGoal = 5000; 
  const currentMonthlyProfit = stats.profit * 20; 
  const goalProgress = Math.min((currentMonthlyProfit / monthlyGoal) * 100, 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER INTELIGENTE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              stats.profit > 0 ? "bg-emerald-500" : "bg-zinc-500"
            )} />
            <p className="text-muted-foreground text-sm">
              {todaySales.length === 0 
                ? "Você ainda não registrou vendas hoje. Que tal conferir seus anúncios?" 
                : `Operação saudável. Seu lucro hoje é de ${settings.currency} ${stats.profit.toFixed(2)}.`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1">
            Status: {stats.margin > 50 ? 'Lucro Alto' : stats.margin > 30 ? 'Lucro Médio' : 'Lucro Baixo'}
          </Badge>
        </div>
      </div>

      {/* ⚡ AÇÕES RÁPIDAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/sales">
          <Button className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex flex-col gap-1 shadow-lg shadow-blue-500/20">
            <ShoppingCart size={20} />
            <span className="font-bold">+ Venda</span>
          </Button>
        </Link>
        <Link to="/products">
          <Button className="w-full h-20 orange-gradient text-white rounded-2xl flex flex-col gap-1 shadow-lg shadow-orange-500/20">
            <Plus size={20} />
            <span className="font-bold">+ Produto</span>
          </Button>
        </Link>
        <Link to="/expenses">
          <Button variant="outline" className="w-full h-20 border-2 border-rose-500/20 hover:bg-rose-500/5 text-rose-500 rounded-2xl flex flex-col gap-1">
            <Receipt size={20} />
            <span className="font-bold">+ Despesa</span>
          </Button>
        </Link>
        <Link to="/settings">
          <Button variant="outline" className="w-full h-20 border-2 border-primary/20 hover:bg-primary/5 text-primary rounded-2xl flex flex-col gap-1">
            <Layers size={20} />
            <span className="font-bold">Estoque</span>
          </Button>
        </Link>
      </div>

      {/* 💰 RESUMO DO DIA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-none shadow-md">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Receita Hoje</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-2xl font-black">{settings.currency} {stats.revenue.toFixed(2)}</h3>
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><DollarSign size={18} /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-none shadow-md bg-emerald-500/5">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Lucro Líquido</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-2xl font-black text-emerald-500">{settings.currency} {stats.profit.toFixed(2)}</h3>
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><TrendingUp size={18} /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-none shadow-md">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Peças Produzidas</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-2xl font-black">{stats.pieces} un</h3>
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><Package size={18} /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-none shadow-md">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tempo de Impressão</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-2xl font-black">{Math.floor(stats.time / 60)}h {stats.time % 60}m</h3>
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Clock size={18} /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: PRODUÇÃO E TOP PRODUTOS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 📦 PRODUÇÃO ATUAL */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Zap size={20} className="text-primary" /> Produção Atual
              </h2>
              <Link to="/printers" className="text-xs text-primary font-bold hover:underline">Ver todas</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {printers.map(printer => (
                <Card key={printer.id} className="glass-card border-border/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      printer.status === 'imprimindo' ? "bg-primary/10 text-primary" : "bg-zinc-500/10 text-zinc-500"
                    )}>
                      <PrinterIcon size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm">{printer.name}</h4>
                        <Badge variant="outline" className={cn(
                          "text-[10px] uppercase px-1.5 py-0",
                          printer.status === 'imprimindo' ? "border-primary text-primary" : "border-zinc-500 text-zinc-500"
                        )}>
                          {printer.status}
                        </Badge>
                      </div>
                      {printer.status === 'imprimindo' ? (
                        <div className="mt-2">
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="font-bold">75%</span>
                          </div>
                          <Progress value={75} className="h-1.5" />
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">Aguardando novo arquivo...</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 🧠 PRODUTOS MAIS LUCRATIVOS */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-500" /> Top Lucratividade
            </h2>
            <div className="space-y-3">
              {products.slice(0, 3).map((product, idx) => {
                const cost = calculateProductCost(product);
                const profit = product.salePrice - cost;
                const margin = (profit / product.salePrice) * 100;
                const sold = sales.filter(s => s.productId === product.id).reduce((acc, s) => acc + s.quantity, 0);
                
                return (
                  <div key={product.id} className="flex items-center justify-between p-4 glass-card rounded-2xl border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">{sold} unidades vendidas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-500 font-black text-sm">+{settings.currency} {profit.toFixed(2)}/un</p>
                      <p className="text-[10px] font-bold text-primary">{margin.toFixed(0)}% margem</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* COLUNA DIREITA: ALERTAS, META E GRÁFICO */}
        <div className="space-y-8">
          
          {/* 🚨 ALERTAS IMPORTANTES */}
          <section>
            <h2 className="text-xl font-bold mb-4">Alertas</h2>
            <div className="space-y-3">
              {alerts.length > 0 ? alerts.map((alert, i) => (
                <div key={i} className={cn(
                  "p-4 rounded-2xl border flex items-center gap-3",
                  alert.type === 'danger' ? "bg-rose-500/5 border-rose-500/20 text-rose-500" :
                  alert.type === 'warning' ? "bg-orange-500/5 border-orange-500/20 text-orange-500" :
                  "bg-blue-500/5 border-blue-500/20 text-blue-500"
                )}>
                  <AlertTriangle size={18} />
                  <span className="text-sm font-bold">{alert.text}</span>
                </div>
              )) : (
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 flex items-center gap-3">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-bold">Tudo sob controle!</span>
                </div>
              )}
            </div>
          </section>

          {/* 🎯 META DO MÊS */}
          <Card className="glass-card border-none bg-primary/5">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Meta de Lucro Mensal</p>
                  <h3 className="text-2xl font-black mt-1">{settings.currency} {monthlyGoal.toLocaleString()}</h3>
                </div>
                <Badge className="bg-primary text-white border-none">{goalProgress.toFixed(0)}%</Badge>
              </div>
              <Progress value={goalProgress} className="h-3 bg-primary/10" />
              <p className="text-[10px] text-muted-foreground mt-3 text-center font-bold">
                Faltam {settings.currency} {(monthlyGoal - currentMonthlyProfit).toLocaleString()} para atingir o objetivo.
              </p>
            </CardContent>
          </Card>

          {/* 📊 VISÃO RÁPIDA (7 DIAS) */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Lucro (7 dias)</h2>
              <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                <ArrowUpRight size={14} /> 12%
              </div>
            </div>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff5722" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ff5722" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(20,20,20,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                    itemStyle={{ color: '#ff5722' }}
                  />
                  <Area type="monotone" dataKey="profit" stroke="#ff5722" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;