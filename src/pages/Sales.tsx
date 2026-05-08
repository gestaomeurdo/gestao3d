"use client";

import React, { useState, useMemo } from 'react';
import { useApp, Sale, SaleChannel, SaleStatus, ShippingPaidBy } from '@/context/AppContext';
import { 
  Plus, Search, ShoppingBag, Calendar, 
  TrendingUp, ArrowUpRight, Filter, 
  CheckCircle2, Clock, Package, ExternalLink,
  AlertCircle, DollarSign, CreditCard, Store,
  Printer as PrinterIcon, Truck, Trash2, Edit2,
  User, ChevronRight, Play, Box, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showSuccess } from '@/utils/toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn, formatCurrency } from '@/lib/utils';

const Sales = () => {
  const { sales, products, printers, addSale, updateSale, deleteSale, settings, calculateProductCost } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Sale, 'id'>>({
    date: new Date().toISOString(),
    productId: '',
    quantity: 1,
    channel: 'Direto',
    status: 'fila',
    printerId: printers[0]?.id || '',
    shippingCost: 0,
    shippingPaidBy: 'cliente',
    customerName: ''
  });

  const getStatusConfig = (status: SaleStatus) => {
    switch (status) {
      case 'fila': return { label: 'Em Fila', color: 'bg-zinc-100 text-zinc-600', icon: Clock };
      case 'imprimindo': return { label: 'Imprimindo', color: 'bg-orange-100 text-orange-600', icon: Play };
      case 'acabamento': return { label: 'Acabamento', color: 'bg-blue-100 text-blue-600', icon: Package };
      case 'pronto': return { label: 'Pronto', color: 'bg-emerald-100 text-emerald-600', icon: Check };
      case 'enviado': return { label: 'Enviado', color: 'bg-indigo-100 text-indigo-600', icon: Truck };
      default: return { label: 'Pendente', color: 'bg-slate-100 text-slate-500', icon: AlertCircle };
    }
  };

  const handleStatusChange = async (saleId: string, currentStatus: SaleStatus) => {
    const statuses: SaleStatus[] = ['fila', 'imprimindo', 'acabamento', 'pronto', 'enviado'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[currentIndex + 1];
    
    if (nextStatus) {
      await updateSale(saleId, { status: nextStatus });
      showSuccess(`Pedido movido para: ${getStatusConfig(nextStatus).label}`);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ 
      date: new Date().toISOString(), productId: '', quantity: 1, channel: 'Direto', 
      status: 'fila', printerId: printers[0]?.id || '', shippingCost: 0, 
      shippingPaidBy: 'cliente', customerName: ''
    });
    setIsDialogOpen(true);
  };

  const handleSaveSale = () => {
    if (!formData.productId) return;
    if (editingId) updateSale(editingId, formData);
    else addSale(formData);
    setIsDialogOpen(false);
  };

  const filteredSales = sales.filter(s => {
    const p = products.find(prod => prod.id === s.productId);
    return p?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           s.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Workflow de Vendas</h1>
          <p className="text-muted-foreground mt-2">Acompanhe o progresso real da sua produção 3D.</p>
        </div>
        
        <Button onClick={handleOpenAdd} className="orange-gradient text-white h-12 px-8 rounded-2xl gap-2 shadow-lg shadow-orange-500/20 transition-all hover:scale-105">
          <Plus size={20} /> Registrar Venda
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-white border-none sm:max-w-[550px] rounded-[2.5rem] p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{editingId ? 'Editar Venda' : 'Nova Venda'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Cliente</Label>
                <Input placeholder="Ex: João Silva" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Produto</Label>
                  <Select value={formData.productId} onValueChange={(v) => setFormData({...formData, productId: v})}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Quantidade</Label>
                  <Input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} className="h-12 rounded-xl" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-slate-900 text-white px-8 h-12 rounded-xl" onClick={handleSaveSale}>Salvar Pedido</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input placeholder="Buscar por cliente ou produto..." className="pl-12 h-12 rounded-2xl border-none bg-white shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredSales.map((sale) => {
          const product = products.find(p => p.id === sale.productId);
          const status = getStatusConfig(sale.status);
          const StatusIcon = status.icon;

          return (
            <Card key={sale.id} className="group glass-card border-none rounded-[2rem] overflow-hidden hover:shadow-md transition-all">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center text-slate-400">
                    <ShoppingBag size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{product?.name || 'Produto Removido'}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <User size={12} /> {sale.customerName || 'Consumidor'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] font-black uppercase text-slate-400">{format(new Date(sale.date), "dd 'de' MMM", { locale: ptBR })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor</p>
                    <p className="text-lg font-black">{settings.currency} {formatCurrency((sale.customPrice || product?.salePrice || 0) * sale.quantity)}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={cn("px-4 py-2 rounded-xl border-none font-bold text-[10px] uppercase tracking-wider flex items-center gap-2", status.color)}>
                      <StatusIcon size={14} /> {status.label}
                    </Badge>
                    
                    {sale.status !== 'enviado' && (
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="rounded-xl h-10 w-10 hover:bg-orange-500 hover:text-white transition-colors"
                        onClick={() => handleStatusChange(sale.id, sale.status)}
                      >
                        <ChevronRight size={18} />
                      </Button>
                    )}
                  </div>

                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-rose-500 rounded-xl" onClick={() => deleteSale(sale.id)}>
                    <Trash2 size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Sales;