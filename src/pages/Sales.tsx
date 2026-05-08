"use client";

import React, { useState, useMemo } from 'react';
import { useApp, Sale, SaleChannel, SaleStatus, ShippingPaidBy } from '@/context/AppContext';
import { 
  Plus, Search, ShoppingBag, Calendar, 
  TrendingUp, ArrowUpRight, Filter, 
  CheckCircle2, Clock, Package, ExternalLink,
  AlertCircle, DollarSign, CreditCard, Store,
  Printer as PrinterIcon, Truck, Trash2, Edit2,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { showSuccess } from '@/utils/toast';
import { format, startOfMonth, isWithinInterval, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

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
    status: 'pago',
    printerId: printers[0]?.id || '',
    shippingCost: 0,
    shippingPaidBy: 'cliente',
    customerName: ''
  });

  const stats = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    
    const monthSales = sales.filter(s => isWithinInterval(new Date(s.date), { start, end }));
    
    let revenue = 0;
    let profit = 0;
    
    monthSales.forEach(s => {
      const p = products.find(prod => prod.id === s.productId);
      if (p) {
        const price = s.customPrice || p.salePrice;
        const cost = calculateProductCost(p);
        const fee = (settings.channelFees[s.channel] / 100) * price;
        const shippingImpact = s.shippingPaidBy === 'vendedor' ? (s.shippingCost || 0) : 0;
        
        revenue += price * s.quantity;
        profit += (price - cost - fee) * s.quantity - shippingImpact;
      }
    });

    return { revenue, profit, count: monthSales.length };
  }, [sales, products, settings, calculateProductCost]);

  const selectedProduct = useMemo(() => 
    products.find(p => p.id === formData.productId), 
  [formData.productId, products]);

  const currentSaleProfit = useMemo(() => {
    if (!selectedProduct) return 0;
    const unitPrice = formData.customPrice || selectedProduct.salePrice;
    const totalRevenue = unitPrice * formData.quantity;
    const totalCost = calculateProductCost(selectedProduct) * formData.quantity;
    const fee = (settings.channelFees[formData.channel] / 100) * totalRevenue;
    const shippingImpact = formData.shippingPaidBy === 'vendedor' ? (formData.shippingCost || 0) : 0;
    
    return totalRevenue - totalCost - fee - shippingImpact;
  }, [selectedProduct, formData, settings, calculateProductCost]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ 
      date: new Date().toISOString(), 
      productId: '', 
      quantity: 1, 
      channel: 'Direto', 
      status: 'pago',
      printerId: printers[0]?.id || '',
      shippingCost: 0,
      shippingPaidBy: 'cliente',
      customerName: ''
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (sale: Sale) => {
    setEditingId(sale.id);
    setFormData({
      date: sale.date,
      productId: sale.productId,
      quantity: sale.quantity,
      channel: sale.channel,
      status: sale.status,
      customPrice: sale.customPrice,
      printerId: sale.printerId || printers[0]?.id || '',
      shippingCost: sale.shippingCost || 0,
      shippingPaidBy: sale.shippingPaidBy,
      customerName: sale.customerName || ''
    });
    setIsDialogOpen(true);
  };

  const handleSaveSale = () => {
    if (!formData.productId) return;
    
    if (editingId) {
      updateSale(editingId, formData);
      showSuccess('Venda atualizada!');
    } else {
      addSale(formData);
      showSuccess('Venda registrada e estoque baixado!');
    }
    
    setIsDialogOpen(false);
  };

  const handleDeleteSale = (id: string) => {
    deleteSale(id);
    showSuccess('Venda removida.');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Vendas</h1>
          <p className="text-slate-500 mt-2">O estoque é baixado automaticamente ao registrar uma nova venda.</p>
        </div>
        
        <Button 
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 rounded-2xl gap-2 shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} /> Registrar Venda
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-white border-none sm:max-w-[550px] rounded-3xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingId ? 'Editar Venda' : 'Nova Venda'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-6 py-6">
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase text-slate-400">Cliente (Opcional)</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    placeholder="Nome do cliente"
                    className="h-12 pl-12 rounded-xl border-slate-200" 
                    value={formData.customerName}
                    onChange={e => setFormData({...formData, customerName: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase text-slate-400">Produto</Label>
                <Select 
                  value={formData.productId} 
                  onValueChange={(v) => {
                    const prod = products.find(p => p.id === v);
                    setFormData({...formData, productId: v, channel: prod?.defaultChannel || 'Direto'});
                  }}
                >
                  <SelectTrigger className="h-12 rounded-xl border-slate-200"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">Quantidade</Label>
                  <Input 
                    type="number" className="h-12 rounded-xl border-slate-200" 
                    value={formData.quantity || ''}
                    onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">Canal</Label>
                  <Select value={formData.channel} onValueChange={(v: SaleChannel) => setFormData({...formData, channel: v})}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mercado Livre">Mercado Livre</SelectItem>
                      <SelectItem value="Shopee">Shopee</SelectItem>
                      <SelectItem value="Direto">Direto</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">Preço Unitário</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">{settings.currency}</span>
                    <Input 
                      type="number" step="0.01"
                      className="h-12 pl-12 rounded-xl border-slate-200 font-bold" 
                      value={formData.customPrice || ''}
                      onChange={e => setFormData({...formData, customPrice: e.target.value ? Number(e.target.value) : undefined})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">Impressora</Label>
                  <Select value={formData.printerId} onValueChange={(v) => setFormData({...formData, printerId: v})}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {printers.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedProduct && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Lucro Líquido Real</p>
                    <p className="text-3xl font-black text-emerald-600">{settings.currency} {currentSaleProfit.toFixed(2)}</p>
                    <p className="text-[10px] text-emerald-600 font-medium mt-1">
                      Material consumido: {(selectedProduct.weightGrams * formData.quantity).toFixed(0)}g
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancelar</Button>
              <Button className="bg-blue-600 text-white px-8 rounded-xl h-12" onClick={handleSaveSale}>
                {editingId ? 'Salvar' : 'Vender e Baixar Estoque'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Buscar por produto ou cliente..." 
              className="pl-12 h-12 rounded-2xl border-slate-200 bg-slate-50/50"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase text-slate-400 px-6">Data / Cliente</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Produto</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Canal</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Lucro</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400 text-right px-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales
                .filter(s => {
                  const p = products.find(prod => prod.id === s.productId);
                  return p?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
                })
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((sale) => {
                  const product = products.find(p => p.id === sale.productId);
                  if (!product) return null;

                  const unitPrice = sale.customPrice || product.salePrice;
                  const totalPrice = unitPrice * sale.quantity;
                  const cost = calculateProductCost(product) * sale.quantity;
                  const fee = (settings.channelFees[sale.channel] / 100) * totalPrice;
                  const shippingImpact = sale.shippingPaidBy === 'vendedor' ? (sale.shippingCost || 0) : 0;
                  const netProfit = totalPrice - cost - fee - shippingImpact;

                  return (
                    <TableRow key={sale.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-500">{format(new Date(sale.date), 'dd/MM/yyyy')}</span>
                          <span className="font-bold text-slate-900">{sale.customerName || 'Consumidor Final'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{product.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Qtd: {sale.quantity}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-lg border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                          {sale.channel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={cn("font-black text-sm", netProfit > 0 ? "text-emerald-500" : "text-rose-500")}>
                          {settings.currency} {netProfit.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" size="icon" 
                            className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => handleOpenEdit(sale)}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button 
                            variant="ghost" size="icon" 
                            className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            onClick={() => handleDeleteSale(sale.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Sales;