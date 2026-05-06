"use client";

import React, { useState, useMemo } from 'react';
import { useApp, Product, FilamentType, SaleChannel } from '@/context/AppContext';
import { 
  Plus, Search, Trash2, Package, Clock, Zap, 
  ArrowUpRight, AlertCircle, Info, TrendingUp, 
  DollarSign, Calculator, Layers, ShoppingBag,
  Target, Percent, HelpCircle, ImageIcon, Edit2
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
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

const Products = () => {
  const { products, addProduct, updateProduct, deleteProduct, calculateProductCost, settings, filaments } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    category: '',
    weightGrams: 0,
    printTimeMinutes: 0,
    filamentId: filaments[0]?.id || '',
    salePrice: 0,
    additionalCost: 0,
    defaultChannel: 'Direto',
    imageUrl: ''
  });

  const pricingAnalysis = useMemo(() => {
    const filament = filaments.find(f => f.id === formData.filamentId);
    const filamentPrice = filament ? filament.pricePerKg : 0;
    
    const filamentCost = (formData.weightGrams / 1000) * filamentPrice;
    const energyCost = (formData.printTimeMinutes / 60) * settings.energyCostPerHour;
    const baseCost = filamentCost + energyCost + (formData.additionalCost || 0);
    
    const feePercent = settings.channelFees[formData.defaultChannel || 'Direto'];
    const fee = (feePercent / 100) * formData.salePrice;
    
    const profit = formData.salePrice - baseCost - fee;
    const margin = formData.salePrice > 0 ? (profit / formData.salePrice) * 100 : 0;
    
    const suggest30 = (baseCost) / (1 - (feePercent/100) - 0.30);
    const suggest50 = (baseCost) / (1 - (feePercent/100) - 0.50);

    return { baseCost, fee, profit, margin, suggest30, suggest50 };
  }, [formData, settings, filaments]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '', category: '', weightGrams: 0, printTimeMinutes: 0, 
      filamentId: filaments[0]?.id || '', salePrice: 0, additionalCost: 0, 
      defaultChannel: 'Direto', imageUrl: ''
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category: product.category || '',
      weightGrams: product.weightGrams,
      printTimeMinutes: product.printTimeMinutes,
      filamentId: product.filamentId,
      salePrice: product.salePrice,
      additionalCost: product.additionalCost || 0,
      defaultChannel: product.defaultChannel || 'Direto',
      imageUrl: product.imageUrl || ''
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.filamentId || formData.salePrice <= 0) return;
    
    if (editingId) {
      updateProduct(editingId, formData);
      showSuccess('Produto atualizado!');
    } else {
      addProduct(formData);
      showSuccess('Produto cadastrado!');
    }
    
    setIsDialogOpen(false);
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
        
        <Button 
          onClick={handleOpenAdd}
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-2xl h-12 px-8 shadow-lg shadow-orange-600/20 transition-all hover:scale-105"
        >
          <Plus className="mr-2 h-5 w-5" /> Novo Produto
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-white border-none sm:max-w-[850px] max-h-[90vh] overflow-y-auto custom-scrollbar p-0 rounded-3xl">
            <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
              <div className="lg:col-span-3 p-8 space-y-8">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    {editingId ? 'Editar Produto' : 'Configurar Produto'}
                  </DialogTitle>
                  <DialogDescription>Vincule o material correto para um cálculo de custo preciso.</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-slate-400">Nome do Produto</Label>
                      <input 
                        placeholder="Ex: Vaso Decorativo"
                        className="h-12 rounded-xl border border-slate-200 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
                        <ImageIcon size={14} /> Link da Foto (URL)
                      </Label>
                      <input 
                        placeholder="https://exemplo.com/foto.jpg"
                        className="h-12 rounded-xl border border-slate-200 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20" 
                        value={formData.imageUrl}
                        onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label className="text-xs font-bold uppercase text-slate-400">Filamento do Estoque</Label>
                        <Select value={formData.filamentId} onValueChange={(v) => setFormData({...formData, filamentId: v})}>
                          <SelectTrigger className="h-12 rounded-xl border-slate-200">
                            <SelectValue placeholder="Selecione o material" />
                          </SelectTrigger>
                          <SelectContent>
                            {filaments.map(f => (
                              <SelectItem key={f.id} value={f.id}>{f.name} ({f.type})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-xs font-bold uppercase text-slate-400">Canal de Venda</Label>
                        <Select value={formData.defaultChannel} onValueChange={(v: SaleChannel) => setFormData({...formData, defaultChannel: v})}>
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
                      <input 
                        type="number" step="0.1"
                        className="h-12 rounded-xl border border-slate-200 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20" 
                        value={formData.weightGrams || ''}
                        onChange={e => setFormData({...formData, weightGrams: Number(e.target.value)})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
                        <Clock size={14} /> Tempo (min)
                      </Label>
                      <input 
                        type="number"
                        className="h-12 rounded-xl border border-slate-200 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20" 
                        value={formData.printTimeMinutes || ''}
                        onChange={e => setFormData({...formData, printTimeMinutes: Number(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase text-orange-600 flex items-center gap-1">
                      <DollarSign size={14} /> Preço de Venda
                    </Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">{settings.currency}</span>
                      <input 
                        type="number" step="0.01"
                        className="h-14 pl-12 w-full rounded-xl border border-orange-200 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20" 
                        value={formData.salePrice || ''}
                        onChange={e => setFormData({...formData, salePrice: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button className="bg-slate-900 text-white px-8 rounded-xl h-12" onClick={handleSave}>
                    {editingId ? 'Atualizar' : 'Salvar'}
                  </Button>
                </DialogFooter>
              </div>

              <div className="lg:col-span-2 bg-slate-900 p-8 text-white space-y-8">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-orange-400">Análise de Custo Real</h3>
                  <p className="text-xs text-slate-400">Baseado no filamento selecionado.</p>
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
                      pricingAnalysis.margin > 40 ? "bg-emerald-500" : "bg-orange-500"
                    )}>
                      {pricingAnalysis.margin.toFixed(1)}% de Margem
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase text-slate-400">Sugestões de Preço</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-xs">Margem 30%</span>
                        <span className="font-bold text-orange-400">{settings.currency} {pricingAnalysis.suggest30.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-xs font-bold">Margem 50%</span>
                        <span className="font-bold text-emerald-400">{settings.currency} {pricingAnalysis.suggest50.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <Input 
          placeholder="Pesquisar produto..." 
          className="pl-12 h-12 rounded-2xl border-slate-200 bg-white shadow-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const cost = calculateProductCost(product);
          const filament = filaments.find(f => f.id === product.filamentId);
          const fee = (settings.channelFees[product.defaultChannel || 'Direto'] / 100) * product.salePrice;
          const profit = product.salePrice - cost - fee;
          const margin = (profit / product.salePrice) * 100;

          return (
            <Card key={product.id} className="group bg-white border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl transition-all border">
              <CardContent className="p-0">
                <div className="h-48 bg-slate-50 relative flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  ) : (
                    <Package size={48} className="text-slate-200" />
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/80 backdrop-blur-md text-slate-900 border-none shadow-sm">
                      {filament?.name || 'Material'}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" size="icon" 
                      className="h-8 w-8 rounded-lg bg-white/80 backdrop-blur-md hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => handleOpenEdit(product)}
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button 
                      variant="ghost" size="icon" 
                      className="h-8 w-8 rounded-lg bg-white/80 backdrop-blur-md hover:bg-rose-50 hover:text-rose-600"
                      onClick={() => deleteProduct(product.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 truncate">{product.name}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Custo</p>
                      <p className="text-sm font-bold text-slate-900">{settings.currency} {(cost + fee).toFixed(2)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-orange-50 border border-orange-100">
                      <p className="text-[10px] font-bold text-orange-600 uppercase">Venda</p>
                      <p className="text-sm font-bold text-orange-700">{settings.currency} {product.salePrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Lucro</p>
                      <p className={cn("text-xl font-black", profit > 0 ? "text-emerald-500" : "text-rose-500")}>
                        {settings.currency} {profit.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Margem</p>
                      <p className="text-sm font-bold text-slate-900">{margin.toFixed(0)}%</p>
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