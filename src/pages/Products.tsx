"use client";

import React, { useState, useMemo } from 'react';
import { useApp, Product, FilamentType, SaleChannel } from '@/context/AppContext';
import { 
  Plus, Search, Trash2, Package, Clock, Zap, 
  ArrowUpRight, AlertCircle, Info, TrendingUp, 
  DollarSign, Calculator, Layers, ShoppingBag,
  Target, Percent, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

const Products = () => {
  const { products, addProduct, deleteProduct, calculateProductCost, settings } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    category: '',
    weightGrams: 0,
    printTimeMinutes: 0,
    filamentType: 'PLA',
    color: '',
    salePrice: 0,
    additionalCost: 0,
    defaultChannel: 'Direto',
    imageUrl: ''
  });

  // --- CÁLCULOS DE APOIO À PRECIFICAÇÃO ---
  const pricingAnalysis = useMemo(() => {
    const filamentCost = (newProduct.weightGrams / 1000) * settings.filamentPricePerKg;
    const energyCost = (newProduct.printTimeMinutes / 60) * settings.energyCostPerHour;
    const baseCost = filamentCost + energyCost + (newProduct.additionalCost || 0);
    
    const feePercent = settings.channelFees[newProduct.defaultChannel || 'Direto'];
    const fee = (feePercent / 100) * newProduct.salePrice;
    
    const profit = newProduct.salePrice - baseCost - fee;
    const margin = newProduct.salePrice > 0 ? (profit / newProduct.salePrice) * 100 : 0;
    
    // Sugestões de Preço
    const suggest30 = (baseCost) / (1 - (feePercent/100) - 0.30);
    const suggest50 = (baseCost) / (1 - (feePercent/100) - 0.50);
    const suggest100 = (baseCost) / (1 - (feePercent/100) - 0.70); // Margem de 70% (Markup alto)

    return { baseCost, fee, profit, margin, suggest30, suggest50, suggest100 };
  }, [newProduct, settings]);

  const handleAddProduct = () => {
    if (!newProduct.name || newProduct.salePrice <= 0) return;
    addProduct(newProduct);
    setIsAddDialogOpen(false);
    setNewProduct({
      name: '', category: '', weightGrams: 0, printTimeMinutes: 0, 
      filamentType: 'PLA', color: '', salePrice: 0, additionalCost: 0, 
      defaultChannel: 'Direto', imageUrl: ''
    });
    showSuccess('Produto cadastrado com sucesso!');
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Seus Produtos</h1>
          <p className="text-slate-500 mt-2">Gerencie seus custos e descubra o preço ideal para lucrar mais.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-2xl h-12 px-8 shadow-lg shadow-orange-600/20 transition-all hover:scale-105">
              <Plus className="mr-2 h-5 w-5" /> Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-none sm:max-w-[850px] max-h-[90vh] overflow-y-auto custom-scrollbar p-0 rounded-3xl">
            <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
              {/* LADO ESQUERDO: FORMULÁRIO */}
              <div className="lg:col-span-3 p-8 space-y-8">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Configurar Produto</DialogTitle>
                  <DialogDescription>Insira os dados técnicos para calcular o custo real.</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-slate-400">Nome do Produto</Label>
                      <Input 
                        placeholder="Ex: Vaso Decorativo Minimalista"
                        className="h-12 rounded-xl border-slate-200 focus:ring-orange-500" 
                        value={newProduct.name}
                        onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label className="text-xs font-bold uppercase text-slate-400">Material</Label>
                        <Select value={newProduct.filamentType} onValueChange={(v: FilamentType) => setNewProduct({...newProduct, filamentType: v})}>
                          <SelectTrigger className="h-12 rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PLA">PLA</SelectItem>
                            <SelectItem value="PETG">PETG</SelectItem>
                            <SelectItem value="ABS">ABS</SelectItem>
                            <SelectItem value="Resina">Resina</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-xs font-bold uppercase text-slate-400">Canal de Venda</Label>
                        <Select value={newProduct.defaultChannel} onValueChange={(v: SaleChannel) => setNewProduct({...newProduct, defaultChannel: v})}>
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
                  </div>

                  <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
                        <Layers size={14} /> Peso (g)
                      </Label>
                      <Input 
                        type="number" step="0.1" inputMode="decimal"
                        className="h-12 rounded-xl border-slate-200" 
                        value={newProduct.weightGrams || ''}
                        onChange={e => setNewProduct({...newProduct, weightGrams: Number(e.target.value)})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
                        <Clock size={14} /> Tempo (min)
                      </Label>
                      <Input 
                        type="number"
                        className="h-12 rounded-xl border-slate-200" 
                        value={newProduct.printTimeMinutes || ''}
                        onChange={e => setNewProduct({...newProduct, printTimeMinutes: Number(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase text-orange-600 flex items-center gap-1">
                      <DollarSign size={14} /> Seu Preço de Venda
                    </Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">{settings.currency}</span>
                      <Input 
                        type="number" step="0.01" inputMode="decimal"
                        className="h-14 pl-12 rounded-xl border-orange-200 focus:ring-orange-500 text-xl font-bold" 
                        value={newProduct.salePrice || ''}
                        onChange={e => setNewProduct({...newProduct, salePrice: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="pt-4">
                  <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl">Cancelar</Button>
                  <Button className="bg-slate-900 text-white px-8 rounded-xl h-12" onClick={handleAddProduct}>Salvar Produto</Button>
                </DialogFooter>
              </div>

              {/* LADO DIREITO: GUIA DE PRECIFICAÇÃO */}
              <div className="lg:col-span-2 bg-slate-900 p-8 text-white space-y-8">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-orange-400">Guia de Lucro</h3>
                  <p className="text-xs text-slate-400">Análise baseada nos seus custos de filamento e energia.</p>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase">Lucro por Peça</p>
                    <h2 className={cn(
                      "text-4xl font-black mt-1",
                      pricingAnalysis.profit > 0 ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {settings.currency} {pricingAnalysis.profit.toFixed(2)}
                    </h2>
                    <Badge className={cn(
                      "mt-3 border-none",
                      pricingAnalysis.margin > 40 ? "bg-emerald-500" : pricingAnalysis.margin > 20 ? "bg-orange-500" : "bg-rose-500"
                    )}>
                      {pricingAnalysis.margin.toFixed(1)}% de Margem
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase text-slate-400">Sugestões de Preço</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-xs">Margem 30% (Mínima)</span>
                        <span className="font-bold text-orange-400">{settings.currency} {pricingAnalysis.suggest30.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-xs font-bold">Margem 50% (Ideal)</span>
                        <span className="font-bold text-emerald-400">{settings.currency} {pricingAnalysis.suggest50.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-xs">Margem 70% (Premium)</span>
                        <span className="font-bold text-purple-400">{settings.currency} {pricingAnalysis.suggest100.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3">
                    <Info className="text-blue-400 shrink-0" size={18} />
                    <p className="text-[10px] text-blue-100 leading-relaxed">
                      <strong>Dica:</strong> Em impressão 3D, o tempo de máquina é seu recurso mais caro. Tente manter um lucro de pelo menos {settings.currency} 10,00 por hora de impressão.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* BUSCA */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <Input 
          placeholder="Pesquisar produto..." 
          className="pl-12 h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-orange-500"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* GRID DE PRODUTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const cost = calculateProductCost(product);
          const fee = (settings.channelFees[product.defaultChannel || 'Direto'] / 100) * product.salePrice;
          const profit = product.salePrice - cost - fee;
          const margin = (profit / product.salePrice) * 100;
          const profitPerHour = (profit / (product.printTimeMinutes / 60));

          return (
            <Card key={product.id} className="group bg-white border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border">
              <CardContent className="p-0">
                <div className="h-48 bg-slate-50 relative flex items-center justify-center">
                  <Package size={64} className="text-slate-200 group-hover:text-orange-200 transition-colors" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-white/80 backdrop-blur-md text-slate-900 border-none shadow-sm">{product.filamentType}</Badge>
                  </div>
                  <Button 
                    variant="ghost" size="icon" 
                    className="absolute top-4 right-4 h-9 w-9 rounded-xl hover:bg-rose-50 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteProduct(product.id)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 truncate">{product.name}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase"><Clock size={14} /> {Math.floor(product.printTimeMinutes/60)}h {product.printTimeMinutes%60}m</span>
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase"><Layers size={14} /> {product.weightGrams}g</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Custo Total</p>
                      <p className="text-lg font-bold text-slate-900">{settings.currency} {(cost + fee).toFixed(2)}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                      <p className="text-[10px] font-bold text-orange-600 uppercase">Venda</p>
                      <p className="text-lg font-bold text-orange-700">{settings.currency} {product.salePrice.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Lucro Líquido</p>
                      <p className={cn("text-2xl font-black", profit > 0 ? "text-emerald-500" : "text-rose-500")}>
                        {settings.currency} {profit.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Lucro/Hora</p>
                      <p className="text-sm font-bold text-slate-900">{settings.currency} {profitPerHour.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Products;