"use client";

import React, { useState, useMemo } from 'react';
import { useApp, Expense, ExpenseCategory } from '@/context/AppContext';
import { 
  Plus, Receipt, Trash2, Calendar, Tag, DollarSign, 
  TrendingUp, ArrowDownRight, Info, AlertCircle, 
  PieChart, Wallet, Repeat, Search
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
import { showSuccess } from '@/utils/toast';
import { format, startOfMonth, isWithinInterval, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

const Expenses = () => {
  const { expenses, addExpense, deleteExpense, settings, sales, products, calculateProductCost } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newExpense, setNewExpense] = useState<Omit<Expense, 'id'>>({
    category: 'outros',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    isRecurring: false
  });

  // --- CÁLCULOS DE IMPACTO ---
  const currentMonthTotal = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    
    return expenses
      .filter(e => isWithinInterval(new Date(e.date), { start, end }))
      .reduce((acc, e) => acc + e.amount, 0);
  }, [expenses]);

  const currentMonthRevenue = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    
    return sales
      .filter(s => isWithinInterval(new Date(s.date), { start, end }))
      .reduce((acc, s) => {
        const product = products.find(p => p.id === s.productId);
        return acc + (s.customPrice || product?.salePrice || 0) * s.quantity;
      }, 0);
  }, [sales, products]);

  const currentMonthProfitBeforeExpenses = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    
    return sales
      .filter(s => isWithinInterval(new Date(s.date), { start, end }))
      .reduce((acc, s) => {
        const product = products.find(p => p.id === s.productId);
        if (!product) return acc;
        const cost = calculateProductCost(product) * s.quantity;
        const fee = (settings.channelFees[s.channel] / 100) * (s.customPrice || product.salePrice) * s.quantity;
        return acc + ((s.customPrice || product.salePrice) * s.quantity - cost - fee);
      }, 0);
  }, [sales, products, calculateProductCost, settings]);

  const handleAddExpense = () => {
    if (!newExpense.description || newExpense.amount <= 0) return;
    addExpense(newExpense);
    setIsAddDialogOpen(false);
    setNewExpense({ category: 'outros', amount: 0, date: new Date().toISOString().split('T')[0], description: '', isRecurring: false });
    showSuccess('Despesa registrada com sucesso!');
  };

  const getCategoryIcon = (category: ExpenseCategory) => {
    switch (category) {
      case 'filamento': return <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">🧵</div>;
      case 'energia': return <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">⚡</div>;
      case 'manutenção': return <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">🔧</div>;
      case 'equipamentos': return <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">🖨️</div>;
      case 'marketing': return <div className="p-2 bg-pink-500/10 text-pink-500 rounded-lg">📣</div>;
      default: return <div className="p-2 bg-zinc-500/10 text-zinc-500 rounded-lg">📦</div>;
    }
  };

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Gestão de Despesas</h1>
          <p className="text-muted-foreground mt-2">Controle seus custos fixos e variáveis para proteger sua margem real.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="orange-gradient text-white rounded-2xl h-12 px-6 shadow-lg shadow-orange-500/20">
              <Plus className="mr-2 h-5 w-5" /> Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50 sm:max-w-[700px] max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <DialogTitle className="text-2xl">Registrar Nova Despesa</DialogTitle>
              <DialogDescription>Adicione gastos operacionais para calcular seu lucro líquido real.</DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
              {/* COLUNA 1: DADOS */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Info size={14} /> Detalhes do Gasto
                  </h3>
                  <div className="grid gap-2">
                    <Label>Descrição da Despesa</Label>
                    <Input 
                      placeholder="Ex: Manutenção da Extrusora"
                      className="bg-secondary/50 border-border/50 h-11 rounded-xl" 
                      value={newExpense.description}
                      onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Categoria</Label>
                      <Select 
                        value={newExpense.category} 
                        onValueChange={(v: ExpenseCategory) => setNewExpense({...newExpense, category: v})}
                      >
                        <SelectTrigger className="bg-secondary/50 border-border/50 h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="filamento">Filamento</SelectItem>
                          <SelectItem value="energia">Energia</SelectItem>
                          <SelectItem value="manutenção">Manutenção</SelectItem>
                          <SelectItem value="equipamentos">Equipamentos</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Data</Label>
                      <Input 
                        type="date" 
                        className="bg-secondary/50 border-border/50 h-11 rounded-xl" 
                        value={newExpense.date}
                        onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-rose-500 flex items-center gap-2">
                    <DollarSign size={14} /> Financeiro
                  </h3>
                  <div className="grid gap-2">
                    <Label>Valor da Despesa</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{settings.currency}</span>
                      <Input 
                        type="number" 
                        className="pl-10 bg-secondary/50 border-border/50 h-11 rounded-xl" 
                        value={newExpense.amount || ''}
                        onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/50">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold">Despesa Recorrente?</Label>
                      <p className="text-[10px] text-muted-foreground">Se repete todos os meses.</p>
                    </div>
                    <Switch 
                      checked={newExpense.isRecurring}
                      onCheckedChange={(v) => setNewExpense({...newExpense, isRecurring: v})}
                    />
                  </div>
                </div>
              </div>

              {/* COLUNA 2: IMPACTO EM TEMPO REAL */}
              <div className="bg-secondary/30 rounded-3xl p-6 space-y-6 border border-border/50">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground text-center">Análise de Impacto</h3>
                
                <div className="text-center space-y-1">
                  <p className="text-xs text-muted-foreground font-bold uppercase">Novo Lucro Líquido Mensal</p>
                  <h2 className={cn(
                    "text-4xl font-black",
                    (currentMonthProfitBeforeExpenses - currentMonthTotal - newExpense.amount) > 0 ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {settings.currency} {(currentMonthProfitBeforeExpenses - currentMonthTotal - newExpense.amount).toFixed(2)}
                  </h2>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase mt-2">
                    Impacto de <span className="text-rose-500">-{((newExpense.amount / (currentMonthProfitBeforeExpenses || 1)) * 100).toFixed(1)}%</span> no lucro bruto
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lucro Bruto (Vendas)</span>
                    <span className="font-bold text-emerald-500">+{settings.currency} {currentMonthProfitBeforeExpenses.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Despesas Atuais</span>
                    <span className="font-bold text-rose-500">-{settings.currency} {currentMonthTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-border/50">
                    <span>Esta Despesa</span>
                    <span className="text-rose-500">-{settings.currency} {newExpense.amount.toFixed(2)}</span>
                  </div>
                </div>

                {newExpense.amount > (currentMonthProfitBeforeExpenses * 0.2) && newExpense.amount > 0 && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="text-rose-500 shrink-0" size={18} />
                    <p className="text-xs text-rose-500 font-medium">
                      Atenção: Esta despesa representa mais de 20% do seu lucro mensal. Verifique se é realmente necessária.
                    </p>
                  </div>
                )}

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-3">
                  <TrendingUp className="text-blue-500" size={18} />
                  <p className="text-xs text-blue-500 font-medium">
                    Para cobrir este gasto, você precisa vender aproximadamente <strong>{Math.ceil(newExpense.amount / (currentMonthProfitBeforeExpenses / (sales.length || 1)))}</strong> unidades extras.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button className="orange-gradient text-white px-8 rounded-xl" onClick={handleAddExpense}>Confirmar Gasto</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* RESUMO RÁPIDO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-none shadow-md bg-rose-500/5">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">Total no Mês</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-3xl font-black text-rose-500">{settings.currency} {currentMonthTotal.toFixed(2)}</h3>
              <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500"><ArrowDownRight size={24} /></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-none shadow-md">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Saúde Financeira</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-3xl font-black">
                {currentMonthProfitBeforeExpenses > 0 
                  ? ((currentMonthTotal / currentMonthProfitBeforeExpenses) * 100).toFixed(0) 
                  : '0'}%
              </h3>
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><PieChart size={24} /></div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase">Comprometimento do Lucro</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-md">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Lucro Líquido Real</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-3xl font-black text-emerald-500">
                {settings.currency} {(currentMonthProfitBeforeExpenses - currentMonthTotal).toFixed(2)}
              </h3>
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Wallet size={24} /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input 
            placeholder="Pesquisar despesa ou categoria..." 
            className="pl-12 bg-card/50 border-border/50 rounded-2xl h-12 focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="rounded-xl border-border/50 h-12 gap-2 flex-1 md:flex-none">
            <Calendar size={18} /> Período
          </Button>
          <Button variant="outline" className="rounded-xl border-border/50 h-12 gap-2 flex-1 md:flex-none">
            <Tag size={18} /> Categorias
          </Button>
        </div>
      </div>

      {/* LISTAGEM */}
      <div className="grid grid-cols-1 gap-4">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-3xl border-dashed border-2">
            <Receipt size={48} className="mx-auto text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-bold text-muted-foreground">Nenhuma despesa encontrada</h3>
            <p className="text-sm text-muted-foreground/60">Registre seus gastos para ter um controle financeiro real.</p>
          </div>
        ) : (
          filteredExpenses
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((expense) => (
              <Card key={expense.id} className="glass-card group hover:border-rose-500/30 transition-all duration-300 rounded-2xl overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {getCategoryIcon(expense.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{expense.description}</h4>
                        {expense.isRecurring && (
                          <Badge variant="outline" className="bg-blue-500/5 text-blue-500 border-blue-500/20 text-[10px] h-5">
                            <Repeat size={10} className="mr-1" /> Recorrente
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                          <Tag size={12} className="text-primary" /> {expense.category}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                          <Calendar size={12} className="text-blue-500" /> {format(new Date(expense.date), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xl font-black text-rose-500">-{settings.currency} {expense.amount.toFixed(2)}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteExpense(expense.id)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
};

export default Expenses;