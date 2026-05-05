"use client";

import React, { useState } from 'react';
import { useApp, Sale, SaleChannel, SaleStatus } from '@/context/AppContext';
import { Plus, Search, Filter, Calendar, ShoppingBag, ExternalLink } from 'lucide-react';
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
          <h1 className="text-3xl font-bold text-white tracking-tight">Vendas</h1>
          <p className="text-zinc-400 mt-1">Acompanhe seus pedidos e lucratividade real.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus size={18} /> Registrar Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nova Venda</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="product">Produto</Label>
                <Select 
                  value={newSale.productId} 
                  onValueChange={(v) => setNewSale({...newSale, productId: v})}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="qty">Quantidade</Label>
                  <Input 
                    id="qty" 
                    type="number" 
                    className="bg-zinc-800 border-zinc-700" 
                    value={newSale.quantity}
                    onChange={e => setNewSale({...newSale, quantity: Number(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="channel">Canal de Venda</Label>
                  <Select 
                    value={newSale.channel} 
                    onValueChange={(v: SaleChannel) => setNewSale({...newSale, channel: v})}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
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
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={newSale.status} 
                    onValueChange={(v: SaleStatus) => setNewSale({...newSale, status: v})}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="enviado">Enviado</SelectItem>
                      <SelectItem value="entregue">Entregue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Preço Customizado (Opcional)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="Usar preço padrão"
                    className="bg-zinc-800 border-zinc-700" 
                    onChange={e => setNewSale({...newSale, customPrice: e.target.value ? Number(e.target.value) : undefined})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddSale}>Confirmar Venda</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <Input 
              placeholder="Filtrar vendas..." 
              className="pl-10 bg-zinc-950 border-zinc-800 text-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-zinc-800 text-zinc-400 gap-2">
            <Filter size={18} /> Filtros
          </Button>
        </div>

        <Table>
          <TableHeader className="bg-zinc-950/50">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400">Data</TableHead>
              <TableHead className="text-zinc-400">Produto</TableHead>
              <TableHead className="text-zinc-400">Canal</TableHead>
              <TableHead className="text-zinc-400">Valor Total</TableHead>
              <TableHead className="text-zinc-400">Lucro Líquido</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => {
              const product = products.find(p => p.id === sale.productId);
              if (!product) return null;

              const unitPrice = sale.customPrice || product.salePrice;
              const totalPrice = unitPrice * sale.quantity;
              const cost = calculateProductCost(product) * sale.quantity;
              const fee = (settings.channelFees[sale.channel] / 100) * totalPrice;
              const netProfit = totalPrice - cost - fee;

              return (
                <TableRow key={sale.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                  <TableCell className="text-zinc-300 font-medium">
                    {format(new Date(sale.date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-white font-semibold">{product.name}</span>
                      <span className="text-xs text-zinc-500">Qtd: {sale.quantity}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                      {sale.channel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white font-medium">
                    {settings.currency} {totalPrice.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span className="text-emerald-500 font-bold">
                      {settings.currency} {netProfit.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize border", getStatusColor(sale.status))}>
                      {sale.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
                      <ExternalLink size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Sales;