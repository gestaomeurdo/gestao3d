"use client";

import React, { useState } from 'react';
import { useApp, Printer } from '@/context/AppContext';
import { 
  Plus, Printer as PrinterIcon, Trash2, 
  Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { showSuccess } from '@/utils/toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Printers = () => {
  const { printers, products, sales, addPrinter, updatePrinter, deletePrinter, settings, calculateProductCost } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Printer, 'id'>>({
    name: '',
    purchasePrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    status: 'disponível'
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', purchasePrice: 0, purchaseDate: new Date().toISOString().split('T')[0], status: 'disponível' });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (printer: Printer) => {
    setEditingId(printer.id);
    setFormData({
      name: printer.name,
      purchasePrice: printer.purchasePrice,
      purchaseDate: printer.purchaseDate,
      status: printer.status
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) return;
    
    if (editingId) {
      await updatePrinter(editingId, formData);
      showSuccess('Equipamento atualizado!');
    } else {
      await addPrinter(formData);
      showSuccess('Impressora adicionada!');
    }
    
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Suas Máquinas</h1>
          <p className="text-slate-500 mt-2">Acompanhe o quanto cada impressora já rendeu para o seu negócio.</p>
        </div>
        
        <Button 
          onClick={handleOpenAdd}
          className="bg-slate-900 text-white rounded-2xl h-12 px-6 shadow-lg shadow-slate-900/10"
        >
          <Plus className="mr-2 h-5 w-5" /> Nova Impressora
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-white border-none sm:max-w-[450px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingId ? 'Editar Equipamento' : 'Adicionar Equipamento'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase text-slate-400">Modelo / Nome</Label>
                <Input 
                  placeholder="Ex: Bambu Lab P1S"
                  className="h-12 rounded-xl border-slate-200" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">Preço de Compra</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{settings.currency}</span>
                    <Input 
                      type="number" step="0.01"
                      className="pl-10 h-12 rounded-xl border-slate-200" 
                      value={formData.purchasePrice || ''}
                      onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">Data da Compra</Label>
                  <Input 
                    type="date" 
                    className="h-12 rounded-xl border-slate-200" 
                    value={formData.purchaseDate}
                    onChange={e => setFormData({...formData, purchaseDate: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-slate-900 text-white px-8 rounded-xl" onClick={handleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {printers.map((printer) => {
          const printerSales = sales.filter(s => s.printerId === printer.id || (!s.printerId && printers.length === 1));
          let totalProfit = 0;
          let totalHours = 0;

          printerSales.forEach(s => {
            const product = products.find(p => p.id === s.productId);
            if (product) {
              const cost = calculateProductCost(product);
              const price = s.customPrice || product.salePrice;
              const fee = (settings.channelFees[s.channel] / 100) * price;
              totalProfit += (price - cost - fee) * s.quantity;
              totalHours += (product.printTimeMinutes * s.quantity) / 60;
            }
          });

          const paybackProgress = Math.min((totalProfit / (printer.purchasePrice || 1)) * 100, 100);
          const isPaidOff = totalProfit >= printer.purchasePrice;

          return (
            <Card key={printer.id} className="bg-white border-slate-200 rounded-3xl overflow-hidden shadow-sm border hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100">
                      <PrinterIcon size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">{printer.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-emerald-500 text-white border-none rounded-lg text-[10px] font-bold uppercase">Ativa</Badge>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Comprada em {format(new Date(printer.purchaseDate), 'dd/MM/yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-300 hover:text-blue-500" onClick={() => handleOpenEdit(printer)}>
                      <Edit2 size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-300 hover:text-rose-500" onClick={() => deletePrinter(printer.id)}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lucro Acumulado</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{settings.currency} {totalProfit.toFixed(2)}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Horas de Trabalho</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{totalHours.toFixed(1)}h</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs font-bold text-slate-900 uppercase">Progresso de Payback</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">
                        {isPaidOff 
                          ? "Esta máquina já se pagou e agora gera lucro puro!" 
                          : `Faltam ${settings.currency} ${(printer.purchasePrice - totalProfit).toFixed(2)} para se pagar.`}
                      </p>
                    </div>
                    <span className="text-lg font-black text-slate-900">{paybackProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={paybackProgress} className="h-3 bg-slate-100" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Printers;