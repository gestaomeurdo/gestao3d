"use client";

import React, { useState, useMemo } from 'react';
import { useApp, Sale, SaleChannel, SaleStatus } from '@/context/AppContext';
import { 
  Plus, Search, ShoppingBag, Calendar, 
  TrendingUp, ArrowUpRight, Filter, 
  CheckCircle2, Clock, Package, ExternalLink,
  AlertCircle
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
import { showSuccess } from '@/utils/toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Sales = () => {
  const { sales, products, addSale, settings, calculateProductCost } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newSale, setNewSale] = useState<Omit<Sale, 'id'>>({
    date: new Date().toISOString(),
    productId: '',
    quantity: 1,
    channel: 'Direto',
    status: 'pago'
  });

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
    setNewSale({ date: new Date().toISOString(), productId: '', quantity: 1, channel: 'Direto', status: 'pago' });
    showSuccess('Venda registrada com sucesso!');
  };

  const getStatusColor = (status: SaleStatus) => {
    switch (status) {
      case 'pago': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'enviado': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'entregue': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendas</h1>
          <p className="text-muted-foreground mt-1">Acompanhe seus pedidos e lucro líquido real.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-6 rounded-2xl gap-2 shadow-lg shadow-blue-500/20">
              <Plus size={20} /> Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50 sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">Registrar Venda Rápida</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label>Produto</Label>
                <Select 
                  value={newSale.productId} 
                  onValueChange={(v) => {
                    const prod = products.find(p => p.id === v);
                    setNewSale({...newSale, productId: v, channel: prod?.defaultChannel || 'Direto'});
                  }}
                >
                  <SelectTrigger className="bg-secondary/50 border-border/50 h-12 rounded-xl">
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Quantidade</Label>
                  <Input 
                    type="number" 
                    className="bg-secondary/50 border-border/50 h-12 rounded-xl" 
                    value={newSale.quantity || ''}
                    onChange={e => setNewSale({...newSale, quantity: Number(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Canal</Label>
                  <Select 
                    value={newSale.channel} 
                    onValueChange={(v: SaleChannel) => setNewSale({...newSale, channel: v})}
                  >
                    <SelectTrigger className="bg-secondary/50 border-border/50 h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mercado Livre">Mercado Livre</SelectItem>
                      <SelectItem value="Shopee">Shopee</SelectItem>
                      <SelectItem value="Direto">Direto</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Preço de Venda (Unitário)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{settings.currency}</span>
                  <Input 
                    type="number" 
                    step="0.01"
                    inputMode="decimal"
                    placeholder={selectedProduct ? selectedProduct.salePrice.toString() : "0.00"}
                    className="pl-10 bg-secondary/50 border-border/50 h-12 rounded-xl" 
                    value={newSale.customPrice || ''}
                    onChange={e => setNewSale({...newSale, customPrice: e.target.value ? Number(e.target.value) : undefined})}
                  />
                </div>
              </div>

              {selectedProduct && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Lucro Líquido Estimado</p>
                    <p className="text-2xl font-black text-emerald-500">{settings.currency} {currentSaleProfit.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Taxa Canal</p>
                    <p className="text-sm font-bold text-rose-500">-{settings.currency} {((settings.channelFees[newSale.channel] / 100) * (newSale.customPrice || selectedProduct.salePrice) * newSale.quantity).toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl" onClick={handleAddSale}>Confirmar Venda</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border/50 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Buscar por produto..." 
              className="pl-10 bg-secondary/30 border-none rounded-xl h-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest">Data</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest">Produto</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest">Canal</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest">Valor Total</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest">Lucro Líquido</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Nenhuma venda registrada. Comece agora!
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
                      <TableRow key={sale.id} className="border-border/50 hover:bg-secondary/20 transition-colors">
                        <TableCell className="text-xs font-medium text-muted-foreground">
                          {format(new Date(sale.date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{product.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Qtd: {sale.quantity}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-lg border-border/50 text-[10px] font-bold uppercase">
                            {sale.channel}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-sm">
                          {settings.currency} {totalPrice.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-emerald-500 font-black text-sm">
                              {settings.currency} {netProfit.toFixed(2)}
                            </span>
                            <ArrowUpRight size={12} className="text-emerald-500" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("capitalize border-none rounded-lg text-[10px] font-bold", getStatusColor(sale.status))}>
                            {sale.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
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