"use client";

import React, { useState } from 'react';
import { useApp, Expense, ExpenseCategory } from '@/context/AppContext';
import { Plus, Receipt, Trash2, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';
import { format } from 'date-fns';

const Expenses = () => {
  const { expenses, addExpense, settings } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newExpense, setNewExpense] = useState<Omit<Expense, 'id'>>({
    category: 'outros',
    amount: 0,
    date: new Date().toISOString(),
    description: ''
  });

  const handleAddExpense = () => {
    addExpense(newExpense);
    setIsAddDialogOpen(false);
    setNewExpense({ category: 'outros', amount: 0, date: new Date().toISOString(), description: '' });
    showSuccess('Despesa registrada!');
  };

  const getCategoryIcon = (category: ExpenseCategory) => {
    switch (category) {
      case 'filamento': return '🧵';
      case 'energia': return '⚡';
      case 'manutenção': return '🔧';
      case 'equipamentos': return '🖨️';
      default: return '📦';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Despesas</h1>
          <p className="text-zinc-400 mt-1">Controle seus gastos fixos e variáveis.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
              <Plus size={18} /> Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Registrar Despesa</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="desc">Descrição</Label>
                <Input 
                  id="desc" 
                  className="bg-zinc-800 border-zinc-700" 
                  value={newExpense.description}
                  onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Valor</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    className="bg-zinc-800 border-zinc-700" 
                    value={newExpense.amount}
                    onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cat">Categoria</Label>
                  <Select 
                    value={newExpense.category} 
                    onValueChange={(v: ExpenseCategory) => setNewExpense({...newExpense, category: v})}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="filamento">Filamento</SelectItem>
                      <SelectItem value="energia">Energia</SelectItem>
                      <SelectItem value="manutenção">Manutenção</SelectItem>
                      <SelectItem value="equipamentos">Equipamentos</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleAddExpense}>Salvar Despesa</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {expenses.map((expense) => (
          <Card key={expense.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-2xl">
                  {getCategoryIcon(expense.category)}
                </div>
                <div>
                  <h4 className="text-white font-semibold">{expense.description}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-zinc-500 flex items-center gap-1 capitalize">
                      <Tag size={12} /> {expense.category}
                    </span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Calendar size={12} /> {format(new Date(expense.date), 'dd/MM/yyyy')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-rose-500">-{settings.currency} {expense.amount.toFixed(2)}</p>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-rose-500 mt-1">
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Expenses;