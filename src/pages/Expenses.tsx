"use client";

import React, { useState, useMemo } from 'react';
import { useApp, Expense, ExpenseCategory } from '@/context/AppContext';
import { Plus, Receipt, Trash2, Calendar, Tag, DollarSign, TrendingUp, ArrowDownRight } from 'lucide-react';
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
import { showSuccess } from '@/utils/toast';
import { format, startOfMonth, isWithinInterval, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

const Expenses = () => {
  const { expenses, addExpense, deleteExpense, settings } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newExpense, setNewExpense] = useState<Omit<Expense, 'id'>>({
    category: 'outros',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const currentMonthTotal = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    
    return expenses
      .filter(e => isWithinInterval(new Date(e.date), { start, end }))
      .reduce((acc, e) => acc + e.amount, 0);
  }, [expenses]);

  const handleAddExpense = () => {
    if (!newExpense.description || newExpense.amount <= 0) return;
    addExpense(newExpense);
    setIsAddDialogOpen(false);
    setNewExpense({ category: 'outros', amount: 0, date: new Date().toISOString().split('T')[0], description: '' });
    showSuccess('Despesa registrada com sucesso!');
  };

  const getCategoryIcon = (category: ExpenseCategory) => {
    switch (category) {
      case 'filamento': return <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">🧵</div>;
      case 'energia': return <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">⚡</div>;
      case 'manutenção': return <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">🔧</div>;
      case 'equipamentos': return <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">🖨️</div>;
      default: return <div className="p-2 bg-zinc-500/10 text-zinc-500 rounded-lg">📦</div>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Gestão de Despesas</h1>
          <p className="text-muted-foreground mt-2">Controle seus custos fixos e variáveis para proteger sua margem.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="orange-gradient text-white rounded-2xl h-12 px-6 shadow-lg shadow-orange-500/20">
              <Plus className="mr-2 h-5 w-5" /> Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50 sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">Registrar Despesa</DialogTitle>
              <DialogDescription>Adicione gastos que impactam seu lucro líquido.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label>Descrição</Label>
                <Input 
                  placeholder="Ex: Manutenção Extrusora"
                  className="bg-secondary/50 border-border/50 h-12 rounded-xl" 
                  value={newExpense.description}
                  onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Valor</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{settings.currency}</span>
                    <Input 
                      type="number" 
                      className="pl-10 bg-secondary/50 border-border/50 h-12 rounded-xl" 
                      value={newExpense.amount || ''}
                      onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Categoria</Label>
                  <Select 
                    value={newExpense.category} 
                    onValueChange={(v: ExpenseCategory) => setNewExpense({...newExpense, category: v})}
                  >
                    <SelectTrigger className="bg-secondary/50 border-border/50 h-12 rounded-xl">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="filamento">Filamento</SelectItem>
                      <SelectItem value="energia">Energia</SelectItem>
                      <SelectItem value="manutenção">Manutenção</SelectItem>
                      <SelectItem value="equipamentos">Equipamentos</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Data</Label>
                <Input 
                  type="date" 
                  className="bg-secondary/50 border-border/50 h-12 rounded-xl" 
                  value={newExpense.date}
                  onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button className="orange-gradient text-white px-8 rounded-xl" onClick={handleAddExpense}>Salvar Despesa</Button>
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
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Média por Despesa</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-3xl font-black">
                {settings.currency} {expenses.length > 0 ? (expenses.reduce((acc, e) => acc + e.amount, 0) / expenses.length).toFixed(2) : '0.00'}
              </h3>
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><TrendingUp size={24} /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-md">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total de Registros</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-3xl font-black">{expenses.length}</h3>
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><Receipt size={24} /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* LISTAGEM */}
      <div className="grid grid-cols-1 gap-4">
        {expenses.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-3xl border-dashed border-2">
            <Receipt size={48} className="mx-auto text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-bold text-muted-foreground">Nenhuma despesa registrada</h3>
            <p className="text-sm text-muted-foreground/60">Registre seus gastos para ter um lucro líquido real.</p>
          </div>
        ) : (
          expenses
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((expense) => (
              <Card key={expense.id} className="glass-card group hover:border-rose-500/30 transition-all duration-300 rounded-2xl overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {getCategoryIcon(expense.category)}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{expense.description}</h4>
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
                      onClick={() => deleteExpense && deleteExpense(expense.id)}
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