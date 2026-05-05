"use client";

import React, { useState } from 'react';
import { useApp, Printer } from '@/context/AppContext';
import { Plus, Printer as PrinterIcon, Trash2, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { showSuccess } from '@/utils/toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Printers = () => {
  const { printers, addPrinter, deletePrinter, sales, products, expenses, settings, calculateProductCost } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newPrinter, setNewPrinter] = useState<Omit<Printer, 'id'>>({
    name: '',
    purchasePrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    status: 'disponível'
  });

  // Cálculo de Lucro Total Acumulado para ROI
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

  const totalNetProfit = totalRevenue - totalCosts;
  const totalInvestment = printers.reduce((acc, p) => acc + p.purchasePrice, 0);
  
  const globalROI = totalInvestment > 0 ? (totalNetProfit / totalInvestment) * 100 : 0;

  const handleAddPrinter = () => {
    addPrinter(newPrinter);
    setIsAddDialogOpen(false);
    setNewPrinter({ name: '', purchasePrice: 0, purchaseDate: new Date().toISOString().split('T')[0], status: 'disponível' });
    showSuccess('Impressora adicionada!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Impressoras</h1>
          <p className="text-zinc-400 mt-1">Gerencie seu hardware e acompanhe o retorno do investimento.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus size={18} /> Nova Impressora
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Adicionar Impressora</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Modelo/Nome</Label>
                <Input 
                  id="name" 
                  className="bg-zinc-800 border-zinc-700" 
                  value={newPrinter.name}
                  onChange={e => setNewPrinter({...newPrinter, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Preço de Compra</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    className="bg-zinc-800 border-zinc-700" 
                    value={newPrinter.purchasePrice}
                    onChange={e => setNewPrinter({...newPrinter, purchasePrice: Number(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Data da Compra</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    className="bg-zinc-800 border-zinc-700" 
                    value={newPrinter.purchaseDate}
                    onChange={e => setNewPrinter({...newPrinter, purchaseDate: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddPrinter}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ROI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Investimento Total</p>
                <p className="text-2xl font-bold text-white">{settings.currency} {totalInvestment.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <DollarSign className="text-blue-500" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Lucro Acumulado</p>
                <p className="text-2xl font-bold text-emerald-500">{settings.currency} {totalNetProfit.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-full">
                <TrendingUp className="text-emerald-500" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">ROI Global</p>
                <p className={cn("text-2xl font-bold", globalROI >= 100 ? "text-blue-500" : "text-orange-500")}>
                  {globalROI.toFixed(1)}%
                </p>
              </div>
              <div className="w-full max-w-[100px]">
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-1000", globalROI >= 100 ? "bg-blue-500" : "bg-orange-500")} 
                    style={{ width: `${Math.min(globalROI, 100)}%` }} 
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 text-center">
                  {globalROI >= 100 ? 'Equipamento Pago!' : `${(100 - globalROI).toFixed(0)}% para o break-even`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {printers.map((printer) => (
          <Card key={printer.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all group">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-800 rounded-lg">
                    <PrinterIcon className="text-blue-400" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{printer.name}</h3>
                    <p className="text-xs text-zinc-500">Comprada em {format(new Date(printer.purchaseDate), 'dd/MM/yyyy')}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deletePrinter(printer.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Custo</span>
                  <span className="text-zinc-200 font-medium">{settings.currency} {printer.purchasePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Status</span>
                  <Badge variant="outline" className="capitalize border-zinc-700 text-zinc-400">
                    {printer.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Printers;