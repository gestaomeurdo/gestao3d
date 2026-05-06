"use client";

import React, { useState, useMemo } from 'react';
import { useApp, Sale, SaleChannel, SaleStatus } from '@/context/AppContext';
import { 
  Plus, Search, ShoppingBag, Calendar, 
  TrendingUp, ArrowUpRight, Filter, 
  CheckCircle2, Clock, Package, ExternalLink,
  AlertCircle, DollarSign, CreditCard, Store,
  Printer as PrinterIcon
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { showSuccess } from '@/utils/toast';
import { format, startOfMonth, isWithinInterval, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

const Sales = () => {
  const { sales, products, printers, addSale, settings, calculateProductCost } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newSale, setNewSale] = useState<Omit<Sale, 'id'>>({
    date: new Date().toISOString(),
    productId: '',
    quantity: 1,
    channel: 'Direto',
    status: 'pago',
    printerId: printers[0]?.id || ''
  });

  // --- ESTATÍSTICAS DE VENDAS ---
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
        revenue += price * s.quantity;
        profit += (price - cost - fee) * s.quantity;
      }
    });

    return { revenue, profit, count: monthSales.length };
  }, [sales, products, settings, calculateProductCost]);

  const selectedProduct = useMemo(() => 
    products.find(p => p.id === newSale.productId), 
  [newSale.productId, products]);

  const currentSaleProfit = useMemo(() => {
    if (!selectedProduct) return 0;
    const unitPrice = newSale.customPrice || selectedProduct.salePrice;
    const totalRevenue = unitPrice * newSale.quantity;
    const totalCost = calculateProductCost(selectedProduct) * newSale.quantity;
    const fee = (settings.channelFees[newSale.channel] / 100) * totalRevenue;
    return totalRevenue - totalCost - fee;
  }, [selectedProduct, newSale, settings, calculateProductCost]);

  const handleAddSale = () => {
    if (!newSale.productId) return;
    addSale(newSale);
    setIsAddDialogOpen(false);
    setNewSale({ 
      date: new Date().toISOString(), 
      productId: '', 
      quantity: 1, 
      channel: 'Direto', 
      status: 'pago',
      printerId: printers[0]?.id || ''
    });
    showSuccess('Venda registrada com sucesso!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER E STATS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Histórico de Vendas</h1>
          <p className="text-slate-500 mt-2">Acompanhe o crescimento do seu negócio e seu lucro real.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 rounded-2xl gap-2 shadow-lg shadow-blue-600/20 transition-all hover:scale-105">
              <Plus size={20} /> Registrar Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-none sm:max-w-[500px] rounded-3xl p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Nova Venda</DialogTitle>
              <p className="text-slate-500 text-sm">Registre os detalhes para calcular o lucro desta operação.</p>
            </DialogHeader>
            
            <div className="grid gap-6 py-6">
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase text-slate-400">Produto Vendido</Label>
                <Select 
                  value={newSale.productId} 
                  onValueChange={(v) => {
                    const prod = products.find(p => p.id === v);
                    setNewSale({...newSale, productId: v, channel: prod?.defaultChannel || 'Direto'});
                  }}
                >
                  <SelectTrigger className="h-12 rounded-xl border-slate-200"><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
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
                    value={newSale.quantity || ''}
                    onChange={e => setNewSale({...newSale, quantity: Number(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">Canal</Label>
                  <Select value={newSale.channel} onValueChange={(v: SaleChannel) => setNewSale({...newSale, channel: v})}>
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
                      type="number" step="0.01" inputMode="decimal"
                      placeholder={selectedProduct ? selectedProduct.salePrice.toString() : "0.00"}
                      className="h-12 pl-12 rounded-xl border-slate-200 font-bold" 
                      value={newSale.customPrice || ''}
                      onChange={e => setNewSale({...newSale, customPrice: e.target.value ? Number(e.target.value) : undefined})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">Impressora Usada</Label>
                  <Select value={newSale.printerId} onValueChange={(v) => setNewSale({...newSale, printerId: v})}>
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
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Lucro Líquido Desta Venda</p>
                    <p className="text-3xl font-black text-emerald-600">{settings.currency} {currentSaleProfit.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Taxas</p>
                    <p className="text-sm font-bold text-rose-500">-{settings.currency} {((settings.channelFees[newSale.channel] / 100) * (newSale.customPrice || selectedProduct.salePrice) * newSale.quantity).toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl">Cancelar</Button>
              <Button className="bg-blue-600 text-white px-8 rounded-xl h-12" onClick={handleAddSale}>Confirmar Venda</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* CARDS DE RESUMO DO MÊS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-slate-200 rounded-3xl shadow-sm border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Store size={24} /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Faturamento (Mês)</p>
                <h3 className="text-2xl font-black text-slate-900">{settings.currency} {stats.revenue.toFixed(2)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 rounded-3xl shadow-sm border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp size={24} /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Lucro Real (Mês)</p>
                <h3 className="text-2xl font-black text-emerald-600">{settings.currency} {stats.profit.toFixed(2)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 rounded-3xl shadow-sm border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><ShoppingBag size={24} /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Pedidos (Mês)</p>
                <h3 className="text-2xl font-black text-slate-900">{stats.count} vendas</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* LISTA DE VENDAS */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Buscar por produto..." 
              className="pl-12 h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:ring-blue-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase text-slate-400 px-6">Data</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Produto</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Canal</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Valor Total</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Lucro Líquido</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400 text-right px-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-slate-400">
                    Nenhuma venda registrada ainda.
                  </TableCell>
                </TableRow>
              ) : (
                sales
                  .filter(s => {
                    const p = products.find(prod => prod.id === s.productId);
                    return p?.name.toLowerCase().includes(searchTerm.toLowerCase());
                  })
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((sale) => {
                    const product = products.find(p => p.id === sale.productId);
                    if (!product) return null;

                    const unitPrice = sale.customPrice || product.salePrice;
                    const totalPrice = unitPrice * sale.quantity;
                    const cost = calculateProductCost(product) * sale.quantity;
                    const fee = (settings.channelFees[sale.channel] / 100) * totalPrice;
                    const netProfit = totalPrice - cost - fee;

                    return (
                      <TableRow key={sale.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <TableCell className="text-xs font-medium text-slate-500 px-6">
                          {format(new Date(sale.date), 'dd/MM/yyyy')}
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
                        <TableCell className="font-bold text-slate-900">
                          {settings.currency} {totalPrice.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className={cn("font-black text-sm", netProfit > 0 ? "text-emerald-500" : "text-rose-500")}>
                              {settings.currency} {netProfit.toFixed(2)}
                            </span>
                            {netProfit > 0 && <ArrowUpRight size={12} className="text-emerald-500" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-900">
                            <ExternalLink size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Sales;