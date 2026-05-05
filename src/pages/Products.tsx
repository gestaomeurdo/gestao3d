"use client";

import React, { useState } from 'react';
import { useApp, Product, FilamentType } from '@/context/AppContext';
import { Plus, Search, Copy, Trash2, Package, Clock, Zap, ArrowUpRight, AlertCircle } from 'lucide-react';
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
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

const Products = () => {
  const { products, addProduct, deleteProduct, calculateProductCost, settings } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    weightGrams: 0,
    printTimeMinutes: 0,
    filamentType: 'PLA',
    salePrice: 0
  });

  const handleAddProduct = () => {
    if (!newProduct.name || newProduct.salePrice <= 0) return;
    addProduct(newProduct);
    setIsAddDialogOpen(false);
    setNewProduct({ name: '', weightGrams: 0, printTimeMinutes: 0, filamentType: 'PLA', salePrice: 0 });
    showSuccess('Produto adicionado ao catálogo!');
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Catálogo de Produtos</h1>
          <p className="text-muted-foreground mt-2">Gerencie seus modelos 3D e otimize suas margens.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="orange-gradient text-white rounded-2xl h-12 px-6 shadow-lg shadow-orange-500/20">
              <Plus className="mr-2 h-5 w-5" /> Adicionar Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50 sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Produto</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome do Modelo</Label>
                <Input 
                  id="name" 
                  placeholder="Ex: Vaso Articulado"
                  className="bg-secondary/50 border-border/50" 
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="weight">Peso (gramas)</Label>
                  <Input 
                    id="weight" 
                    type="number" 
                    className="bg-secondary/50 border-border/50" 
                    value={newProduct.weightGrams}
                    onChange={e => setNewProduct({...newProduct, weightGrams: Number(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Tempo (minutos)</Label>
                  <Input 
                    id="time" 
                    type="number" 
                    className="bg-secondary/50 border-border/50" 
                    value={newProduct.printTimeMinutes}
                    onChange={e => setNewProduct({...newProduct, printTimeMinutes: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="filament">Material</Label>
                  <Select 
                    value={newProduct.filamentType} 
                    onValueChange={(v: FilamentType) => setNewProduct({...newProduct, filamentType: v})}
                  >
                    <SelectTrigger className="bg-secondary/50 border-border/50">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLA">PLA</SelectItem>
                      <SelectItem value="PETG">PETG</SelectItem>
                      <SelectItem value="ABS">ABS</SelectItem>
                      <SelectItem value="Resina">Resina</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Preço de Venda</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    className="bg-secondary/50 border-border/50" 
                    value={newProduct.salePrice}
                    onChange={e => setNewProduct({...newProduct, salePrice: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button className="orange-gradient text-white" onClick={handleAddProduct}>Salvar Produto</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <Input 
          placeholder="Pesquisar no catálogo..." 
          className="pl-12 bg-card/50 border-border/50 rounded-2xl h-12 focus-visible:ring-primary/20"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const cost = calculateProductCost(product);
          const profit = product.salePrice - cost;
          const margin = product.salePrice > 0 ? (profit / product.salePrice) * 100 : 0;
          const isLowMargin = margin < 30;

          return (
            <Card key={product.id} className="glass-card group hover:border-primary/30 transition-all duration-300 overflow-hidden">
              <CardContent className="p-0">
                <div className="h-32 bg-secondary/30 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 orange-gradient opacity-0 group-hover:opacity-5 transition-opacity" />
                  <Package size={48} className="text-muted-foreground/20 group-hover:text-primary/20 transition-colors" />
                  <Badge className="absolute top-4 right-4 bg-background/80 backdrop-blur-md text-foreground border-none rounded-lg">
                    {product.filamentType}
                  </Badge>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{product.name}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1"><Clock size={14} /> {Math.floor(product.printTimeMinutes / 60)}h {product.printTimeMinutes % 60}m</span>
                        <span className="flex items-center gap-1"><Zap size={14} /> {product.weightGrams}g</span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive" onClick={() => deleteProduct(product.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-2xl bg-secondary/30 border border-border/50">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Custo</p>
                      <p className="text-lg font-bold mt-1">{settings.currency} {cost.toFixed(2)}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Venda</p>
                      <p className="text-lg font-bold mt-1">{settings.currency} {product.salePrice.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-end justify-between pt-2">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Lucro por Unidade</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-black text-emerald-500">{settings.currency} {profit.toFixed(2)}</span>
                        <ArrowUpRight size={18} className="text-emerald-500" />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Margem</p>
                      <div className={cn(
                        "text-xl font-black mt-1 flex items-center gap-1 justify-end",
                        isLowMargin ? "text-orange-500" : "text-primary"
                      )}>
                        {margin.toFixed(0)}%
                        {isLowMargin && <AlertCircle size={16} />}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="h-1.5 w-full bg-secondary/30">
                  <div 
                    className={cn("h-full transition-all duration-1000", isLowMargin ? "bg-orange-500" : "orange-gradient")} 
                    style={{ width: `${Math.min(margin, 100)}%` }} 
                  />
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