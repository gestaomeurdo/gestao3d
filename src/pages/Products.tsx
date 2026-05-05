"use client";

import React, { useState, useMemo } from 'react';
import { useApp, Product, FilamentType, SaleChannel } from '@/context/AppContext';
import { 
  Plus, Search, Trash2, Package, Clock, Zap, 
  ArrowUpRight, AlertCircle, Info, TrendingUp, 
  DollarSign, Calculator, Layers, Palette, ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

const Products = () => {
  const { products, addProduct, deleteProduct, calculateProductCost, settings, printers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [simulationQty, setSimulationQty] = useState(10);

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

  // Cálculos em tempo real para o formulário
  const currentFormCost = useMemo(() => {
    const filamentCost = (newProduct.weightGrams / 1000) * settings.filamentPricePerKg;
    const energyCost = (newProduct.printTimeMinutes / 60) * settings.energyCostPerHour;
    return filamentCost + energyCost + (newProduct.additionalCost || 0);
  }, [newProduct, settings]);

  const currentFormFee = useMemo(() => {
    const feePercent = settings.channelFees[newProduct.defaultChannel || 'Direto'];
    return (feePercent / 100) * newProduct.salePrice;
  }, [newProduct, settings]);

  const currentFormProfit = newProduct.salePrice - currentFormCost - currentFormFee;
  const currentFormMargin = newProduct.salePrice > 0 ? (currentFormProfit / newProduct.salePrice) * 100 : 0;

  const handleAddProduct = () => {
    if (!newProduct.name || newProduct.salePrice <= 0) return;
    addProduct(newProduct);
    setIsAddDialogOpen(false);
    setNewProduct({
      name: '', category: '', weightGrams: 0, printTimeMinutes: 0, 
      filamentType: 'PLA', color: '', salePrice: 0, additionalCost: 0, 
      defaultChannel: 'Direto', imageUrl: ''
    });
    showSuccess('Produto adicionado com sucesso!');
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMarginColor = (margin: number) => {
    if (margin >= 50) return "text-emerald-500";
    if (margin >= 30) return "text-orange-500";
    return "text-rose-500";
  };

  const getMarginBg = (margin: number) => {
    if (margin >= 50) return "bg-emerald-500";
    if (margin >= 30) return "bg-orange-500";
    return "bg-rose-500";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Catálogo de Produtos</h1>
          <p className="text-muted-foreground mt-2">Gestão de custos, margens e ROI da sua produção.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="orange-gradient text-white rounded-2xl h-12 px-6 shadow-lg shadow-orange-500/20">
              <Plus className="mr-2 h-5 w-5" /> Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50 sm:max-w-[700px] max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <DialogTitle className="text-2xl">Cadastrar Novo Produto</DialogTitle>
              <DialogDescription>Preencha os dados para calcular automaticamente sua lucratividade.</DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
              {/* COLUNA 1: DADOS */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Info size={14} /> Informações Básicas
                  </h3>
                  <div className="grid gap-2">
                    <Label>Nome do Produto</Label>
                    <Input 
                      placeholder="Ex: Vaso Articulado"
                      className="bg-secondary/50 border-border/50" 
                      value={newProduct.name}
                      onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Categoria</Label>
                      <Input 
                        placeholder="Decoração"
                        className="bg-secondary/50 border-border/50" 
                        value={newProduct.category}
                        onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Material</Label>
                      <Select 
                        value={newProduct.filamentType} 
                        onValueChange={(v: FilamentType) => setNewProduct({...newProduct, filamentType: v})}
                      >
                        <SelectTrigger className="bg-secondary/50 border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PLA">PLA</SelectItem>
                          <SelectItem value="PETG">PETG</SelectItem>
                          <SelectItem value="ABS">ABS</SelectItem>
                          <SelectItem value="Resina">Resina</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-blue-500 flex items-center gap-2">
                    <Zap size={14} /> Produção
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Peso (gramas)</Label>
                      <Input 
                        type="number" 
                        className="bg-secondary/50 border-border/50" 
                        value={newProduct.weightGrams}
                        onChange={e => setNewProduct({...newProduct, weightGrams: Number(e.target.value)})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Tempo (minutos)</Label>
                      <Input 
                        type="number" 
                        className="bg-secondary/50 border-border/50" 
                        value={newProduct.printTimeMinutes}
                        onChange={e => setNewProduct({...newProduct, printTimeMinutes: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                    <ShoppingBag size={14} /> Venda
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Preço de Venda</Label>
                      <Input 
                        type="number" 
                        className="bg-secondary/50 border-border/50" 
                        value={newProduct.salePrice}
                        onChange={e => setNewProduct({...newProduct, salePrice: Number(e.target.value)})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Canal Padrão</Label>
                      <Select 
                        value={newProduct.defaultChannel} 
                        onValueChange={(v: SaleChannel) => setNewProduct({...newProduct, defaultChannel: v})}
                      >
                        <SelectTrigger className="bg-secondary/50 border-border/50">
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
                </div>
              </div>

              {/* COLUNA 2: RESULTADOS EM TEMPO REAL */}
              <div className="bg-secondary/30 rounded-3xl p-6 space-y-6 border border-border/50">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground text-center">Análise de Lucratividade</h3>
                
                <div className="text-center space-y-1">
                  <p className="text-xs text-muted-foreground font-bold uppercase">Lucro Líquido por Unidade</p>
                  <h2 className={cn("text-5xl font-black", getMarginColor(currentFormMargin))}>
                    {settings.currency} {currentFormProfit.toFixed(2)}
                  </h2>
                  <Badge className={cn("mt-2 border-none text-white", getMarginBg(currentFormMargin))}>
                    {currentFormMargin.toFixed(1)}% de Margem
                  </Badge>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Custo Filamento</span>
                    <span className="font-bold">{settings.currency} {((newProduct.weightGrams / 1000) * settings.filamentPricePerKg).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Custo Energia</span>
                    <span className="font-bold">{settings.currency} {((newProduct.printTimeMinutes / 60) * settings.energyCostPerHour).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxa do Canal ({newProduct.defaultChannel})</span>
                    <span className="font-bold text-rose-500">-{settings.currency} {currentFormFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border/50">
                    <span>Custo Total</span>
                    <span>{settings.currency} {currentFormCost.toFixed(2)}</span>
                  </div>
                </div>

                {currentFormMargin < 30 && newProduct.salePrice > 0 && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="text-rose-500 shrink-0" size={18} />
                    <p className="text-xs text-rose-500 font-medium">
                      Margem baixa! Sugerimos vender por pelo menos <strong>{settings.currency} {(currentFormCost * 2).toFixed(2)}</strong> para atingir 50% de margem.
                    </p>
                  </div>
                )}

                {printers.length > 0 && currentFormProfit > 0 && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-3">
                    <TrendingUp className="text-blue-500" size={18} />
                    <p className="text-xs text-blue-500 font-medium">
                      Este produto paga uma <strong>{printers[0].name}</strong> em apenas <strong>{Math.ceil(printers[0].purchasePrice / currentFormProfit)}</strong> unidades vendidas.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button className="orange-gradient text-white px-8" onClick={handleAddProduct}>Salvar Produto</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input 
            placeholder="Pesquisar por nome ou categoria..." 
            className="pl-12 bg-card/50 border-border/50 rounded-2xl h-12 focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="rounded-xl border-border/50 h-12 gap-2 flex-1 md:flex-none">
            <Layers size={18} /> Filamento
          </Button>
          <Button variant="outline" className="rounded-xl border-border/50 h-12 gap-2 flex-1 md:flex-none">
            <TrendingUp size={18} /> Ordenar
          </Button>
        </div>
      </div>

      {/* LISTAGEM DE PRODUTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const cost = calculateProductCost(product);
          const feePercent = settings.channelFees[product.defaultChannel || 'Direto'];
          const fee = (feePercent / 100) * product.salePrice;
          const profit = product.salePrice - cost - fee;
          const margin = product.salePrice > 0 ? (profit / product.salePrice) * 100 : 0;

          return (
            <Card key={product.id} className="glass-card group hover:border-primary/30 transition-all duration-300 overflow-hidden rounded-3xl">
              <CardContent className="p-0">
                {/* Top Visual */}
                <div className="h-40 bg-secondary/30 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 orange-gradient opacity-0 group-hover:opacity-5 transition-opacity" />
                  <Package size={64} className="text-muted-foreground/20 group-hover:text-primary/20 transition-colors" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-background/80 backdrop-blur-md text-foreground border-none rounded-lg">
                      {product.filamentType}
                    </Badge>
                    {product.category && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 rounded-lg">
                        {product.category}
                      </Badge>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-4 right-4 h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteProduct(product.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors truncate">{product.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Clock size={14} className="text-blue-500" /> {Math.floor(product.printTimeMinutes / 60)}h {product.printTimeMinutes % 60}m</span>
                      <span className="flex items-center gap-1"><Layers size={14} className="text-orange-500" /> {product.weightGrams}g</span>
                    </div>
                  </div>

                  {/* Financeiro */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-secondary/30 border border-border/50">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Custo Total</p>
                      <p className="text-lg font-bold mt-1">{settings.currency} {(cost + fee).toFixed(2)}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Preço Venda</p>
                      <p className="text-lg font-bold mt-1">{settings.currency} {product.salePrice.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Lucro e Margem */}
                  <div className="flex items-end justify-between pt-2">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Lucro Líquido</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn("text-2xl font-black", getMarginColor(margin))}>
                          {settings.currency} {profit.toFixed(2)}
                        </span>
                        <ArrowUpRight size={18} className={getMarginColor(margin)} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Margem</p>
                      <div className={cn("text-xl font-black mt-1", getMarginColor(margin))}>
                        {margin.toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* ROI Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                      <span>Saúde do Produto</span>
                      <span className={getMarginColor(margin)}>{margin >= 50 ? 'Excelente' : margin >= 30 ? 'Médio' : 'Crítico'}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-1000", getMarginBg(margin))} 
                        style={{ width: `${Math.min(margin, 100)}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* SIMULADOR INTELIGENTE (FIXO NO RODAPÉ OU SEÇÃO FINAL) */}
      {products.length > 0 && (
        <Card className="glass-card border-primary/20 bg-primary/5 rounded-3xl overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Calculator className="text-primary" size={20} />
              <CardTitle className="text-lg">Simulador de Escala</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="font-bold">Se eu vender:</Label>
                  <span className="text-2xl font-black text-primary">{simulationQty} unidades</span>
                </div>
                <Slider 
                  value={[simulationQty]} 
                  onValueChange={(v) => setSimulationQty(v[0])} 
                  max={100} 
                  step={1} 
                  className="py-4"
                />
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background/50 p-4 rounded-2xl border border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Receita Total</p>
                  <p className="text-xl font-black mt-1">
                    {settings.currency} {(products.reduce((acc, p) => acc + p.salePrice, 0) / products.length * simulationQty).toFixed(2)}
                  </p>
                </div>
                <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Lucro Total Estimado</p>
                  <p className="text-xl font-black text-emerald-500 mt-1">
                    {settings.currency} {(products.reduce((acc, p) => {
                      const cost = calculateProductCost(p);
                      const fee = (settings.channelFees[p.defaultChannel || 'Direto'] / 100) * p.salePrice;
                      return acc + (p.salePrice - cost - fee);
                    }, 0) / products.length * simulationQty).toFixed(2)}
                  </p>
                </div>
                <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Tempo de Produção</p>
                  <p className="text-xl font-black text-blue-500 mt-1">
                    {Math.floor((products.reduce((acc, p) => acc + p.printTimeMinutes, 0) / products.length * simulationQty) / 60)}h
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Products;