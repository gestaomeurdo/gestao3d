"use client";

import React, { useState, useMemo } from 'react';
import { useApp, Expense, ExpenseCategory } from '@/context/AppContext';
import { 
  Plus, Receipt, Trash2, Calendar, Tag, DollarSign, 
  TrendingUp, ArrowDownRight, Info, AlertCircle, 
  PieChart, Wallet, Repeat, Search, ArrowRightLeft,
  TrendingDown, BarChart3, Package, AlertTriangle,
  Zap, Layers, FileText, Type
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showSuccess } from '@/utils/toast';
import { format, startOfMonth, isWithinInterval, endOfMonth } from 'date-fns';
import { cn, formatCurrency } from '@/lib/utils';

const Finance = () => {
  const { expenses, addExpense, deleteExpense, settings, sales, products, filaments, calculateProductCost } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newExpense, setNewExpense] = useState<Omit<Expense, 'id'>>({
    category: 'outros',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    isRecurring: false
  });

  const dre = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    
    const monthSales = sales.filter(s => isWithinInterval(new Date(s.date), { start, end }));
    const monthExpenses = expenses.filter(e => isWithinInterval(new Date(e.date), { start, end }));

    let revenue = 0;
    let productionCost = 0;
    let fees = 0;
    let shipping = 0;
    
    const productBreakdown: Record<string, { name: string, unitCost: number, totalCost: number, qty: number, filamentName: string, filamentPrice: number }> = {};

    monthSales.forEach(s => {
      const p = products.find(prod => prod.id === s.productId);
      if (p) {
        const filament = filaments.find(f => f.id === p.filamentId);
        const unitCost = calculateProductCost(p);
        const totalUnitCost = unitCost * s.quantity;
        
        const price = s.customPrice || p.salePrice;
        revenue += price * s.quantity;
        productionCost += totalUnitCost;
        fees += (settings.channelFees[s.channel] / 100) * price * s.quantity;
        if (s.shippingPaidBy === 'vendedor') shipping += (s.shippingCost || 0);

        if (!productBreakdown[p.id]) {
          productBreakdown[p.id] = { 
            name: p.name, 
            unitCost, 
            totalCost: 0, 
            qty: 0, 
            filamentName: filament?.name || 'N/A',
            filamentPrice: filament?.pricePerKg || 0
          };
        }
        productBreakdown[p.id].totalCost += totalUnitCost;
        productBreakdown[p.id].qty += s.quantity;
      }
    });

    const fixedExpenses = monthExpenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = revenue - productionCost - fees - shipping - fixedExpenses;

    return { 
      revenue, 
      productionCost, 
      fees, 
      shipping, 
      fixedExpenses, 
      netProfit,
      productBreakdown: Object.values(productBreakdown).sort((a, b) => b.totalCost - a.totalCost)
    };
  }, [sales, expenses, products, filaments, calculateProductCost, settings]);

  const handleAddExpense = () => {
    if (!newExpense.description || newExpense.amount <= 0) return;
    addExpense(newExpense);
    setIsAddDialogOpen(false);
    setNewExpense({ category: 'outros', amount: 0, date: new Date().toISOString().split('T')[0], description: '', isRecurring: false });
    showSuccess('Despesa registrada com sucesso!');
  };

  const getCategoryIcon = (category: ExpenseCategory) => {
    switch (category) {
      case 'filamento': return "🧵";
      case 'energia': return "⚡";
      case 'manutenção': return "🔧";
      case 'equipamentos': return "🖨️";
      case 'marketing': return "📣";
      default: return "📦";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Gestão Financeira</h1>
          <p className="text-muted-foreground mt-2">Controle total de entradas, saídas e lucratividade real.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="orange-gradient text-white rounded-2xl h-12 px-6 shadow-lg shadow-orange-500/20 transition-all hover:scale-105">
              <Plus className="mr-2 h-5 w-5" /> Novo Gasto
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-none sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
            <div className="orange-gradient p-8 text-white">
              <DialogHeader>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                  <Receipt size={24} />
                </div>
                <DialogTitle className="text-3xl font-black">Nova Despesa</DialogTitle>
                <DialogDescription className="text-white/80 font-medium">
                  Registre seus gastos para manter o lucro real atualizado.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <FileText size={12} /> Descrição do Gasto
                  </Label>
                  <Input 
                    placeholder="Ex: Aluguel da Oficina, Internet..."
                    className="h-14 rounded-2xl border-secondary bg-secondary/30 px-5 focus-visible:ring-orange-500/20 font-medium" 
                    value={newExpense.description}
                    onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <DollarSign size={12} /> Valor Total
                    </Label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">{settings.currency}</span>
                      <Input 
                        type="number" 
                        className="h-14 pl-12 rounded-2xl border-secondary bg-secondary/30 focus-visible:ring-orange-500/20 font-black text-lg" 
                        value={newExpense.amount || ''}
                        onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Type size={12} /> Categoria
                    </Label>
                    <Select value={newExpense.category} onValueChange={(v: ExpenseCategory) => setNewExpense({...newExpense, category: v})}>
                      <SelectTrigger className="h-14 rounded-2xl border-secondary bg-secondary/30 px-5 focus:ring-orange-500/20 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-xl">
                        <SelectItem value="filamento">🧵 Filamento</SelectItem>
                        <SelectItem value="energia">⚡ Energia</SelectItem>
                        <SelectItem value="manutenção">🔧 Manutenção</SelectItem>
                        <SelectItem value="equipamentos">🖨️ Equipamentos</SelectItem>
                        <SelectItem value="marketing">📣 Marketing</SelectItem>
                        <SelectItem value="outros">📦 Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-orange-500/5 rounded-[1.5rem] border border-orange-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                      <Repeat size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-orange-900">Gasto Recorrente?</p>
                      <p className="text-[10px] text-orange-600/70 font-bold uppercase">Repetir todos os meses</p>
                    </div>
                  </div>
                  <Switch 
                    checked={newExpense.isRecurring} 
                    onCheckedChange={(v) => setNewExpense({...newExpense, isRecurring: v})}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1 h-14 rounded-2xl font-bold text-muted-foreground hover:bg-secondary"
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-[2] orange-gradient text-white h-14 rounded-2xl font-black text-lg shadow-lg shadow-orange-500/20" 
                  onClick={handleAddExpense}
                >
                  Confirmar Gasto
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-secondary/50 p-1 rounded-2xl border border-border/50">
          <TabsTrigger value="overview" className="rounded-xl px-8 data-[state=active]:bg-background data-[state=active]:shadow-sm">Visão Geral</TabsTrigger>
          <TabsTrigger value="expenses" className="rounded-xl px-8 data-[state=active]:bg-background data-[state=active]:shadow-sm">Lista de Gastos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 glass-card border-none shadow-lg overflow-hidden">
              <CardHeader className="bg-secondary/30 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold">Demonstrativo de Resultados (Mês)</CardTitle>
                    <CardDescription>Análise detalhada de para onde seu dinheiro está indo.</CardDescription>
                  </div>
                  <BarChart3 className="text-muted-foreground opacity-50" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  <div className="p-6 flex justify-between items-center bg-emerald-500/10">
                    <span className="font-bold text-emerald-600 flex items-center gap-2"><TrendingUp size={16} /> Faturamento Bruto</span>
                    <span className="font-black text-emerald-600 text-xl">+{settings.currency} {formatCurrency(dre.revenue)}</span>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-muted-foreground">(-) Custos de Produção</span>
                        <span className="font-black text-rose-500">-{settings.currency} {formatCurrency(dre.productionCost)}</span>
                      </div>
                      
                      <div className="bg-secondary/20 rounded-2xl p-5 space-y-4 border border-border/50">
                        <div className="flex items-center justify-between border-b border-border/50 pb-3">
                          <div className="flex items-center gap-2 text-orange-600 text-[10px] font-black uppercase tracking-wider">
                            <AlertTriangle size={14} /> Auditoria de Variáveis
                          </div>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Zap size={10} className="text-yellow-500" /> Energia: <span className="text-foreground font-bold">{settings.currency} {formatCurrency(settings.energyCostPerHour)}/h</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {dre.productBreakdown.map((item, idx) => (
                            <div key={idx} className="space-y-1 border-b border-border/30 pb-2 last:border-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground">{item.qty}x {item.name}</span>
                                <span className="text-sm font-black text-rose-500">{settings.currency} {formatCurrency(item.totalCost)}</span>
                              </div>
                              <div className="flex gap-3 text-[9px] text-muted-foreground font-bold uppercase">
                                <span className="flex items-center gap-1"><Layers size={8} /> {item.filamentName}: {settings.currency} {formatCurrency(item.filamentPrice)}/kg</span>
                                <span>•</span>
                                <span>Custo Unitário: {settings.currency} {formatCurrency(item.unitCost)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">(-) Taxas de Canais</span>
                      <span className="font-bold text-rose-500">-{settings.currency} {formatCurrency(dre.fees)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">(-) Fretes Pagos</span>
                      <span className="font-bold text-rose-500">-{settings.currency} {formatCurrency(dre.shipping)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">(-) Despesas Fixas</span>
                      <span className="font-bold text-rose-500">-{settings.currency} {formatCurrency(dre.fixedExpenses)}</span>
                    </div>
                  </div>

                  <div className={cn(
                    "p-6 flex justify-between items-center text-white",
                    dre.netProfit > 0 ? "emerald-gradient" : "rose-gradient"
                  )}>
                    <span className="font-black text-lg uppercase tracking-widest">Lucro Líquido Real</span>
                    <span className="font-black text-3xl">{settings.currency} {formatCurrency(dre.netProfit)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="glass-card border-none shadow-md bg-emerald-500/5">
                <CardContent className="p-6 text-center space-y-4">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Margem de Lucro Real</p>
                  <h3 className="text-5xl font-black text-emerald-600">
                    {dre.revenue > 0 ? ((dre.netProfit / dre.revenue) * 100).toFixed(1) : '0'}%
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    De cada {settings.currency} 100,00 vendidos, você coloca {settings.currency} {dre.revenue > 0 ? (dre.netProfit / dre.revenue * 100).toFixed(2) : '0'} no bolso.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Saúde do Caixa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><TrendingUp size={16} /></div>
                      <span className="text-xs font-bold text-emerald-700">Entradas</span>
                    </div>
                    <span className="text-sm font-black text-emerald-600">+{settings.currency} {formatCurrency(dre.revenue)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg"><TrendingDown size={16} /></div>
                      <span className="text-xs font-bold text-rose-700">Saídas</span>
                    </div>
                    <span className="text-sm font-black text-rose-600">-{settings.currency} {formatCurrency(dre.productionCost + dre.fees + dre.shipping + dre.fixedExpenses)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input 
              placeholder="Pesquisar despesa..." 
              className="pl-12 bg-card/50 border-border/50 rounded-2xl h-12"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {expenses.filter(e => e.description.toLowerCase().includes(searchTerm.toLowerCase())).map(expense => (
              <Card key={expense.id} className="glass-card group hover:border-primary/30 transition-all rounded-2xl overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center text-2xl">
                      {getCategoryIcon(expense.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold">{expense.description}</h4>
                        {expense.isRecurring && <Badge variant="outline" className="text-[9px] h-4">Recorrente</Badge>}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">{format(new Date(expense.date), 'dd/MM/yyyy')} • {expense.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="text-lg font-black text-rose-500">-{settings.currency} {formatCurrency(expense.amount)}</p>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-rose-500" onClick={() => deleteExpense(expense.id)}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;