"use client";

import React, { useState } from 'react';
import { useApp, Product, FilamentType } from '@/context/AppContext';
import { Plus, Search, MoreVertical, Copy, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    addProduct(newProduct);
    setIsAddDialogOpen(false);
    setNewProduct({ name: '', weightGrams: 0, printTimeMinutes: 0, filamentType: 'PLA', salePrice: 0 });
    showSuccess('Produto adicionado com sucesso!');
  };

  const handleDuplicate = (product: Product) => {
    const { id, ...rest } = product;
    addProduct({ ...rest, name: `${rest.name} (Cópia)` });
    showSuccess('Produto duplicado!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Produtos</h1>
          <p className="text-zinc-400 mt-1">Gerencie seu catálogo e custos de produção.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus size={18} /> Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Produto</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome do Produto</Label>
                <Input 
                  id="name" 
                  className="bg-zinc-800 border-zinc-700" 
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
                    className="bg-zinc-800 border-zinc-700" 
                    value={newProduct.weightGrams}
                    onChange={e => setNewProduct({...newProduct, weightGrams: Number(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Tempo (minutos)</Label>
                  <Input 
                    id="time" 
                    type="number" 
                    className="bg-zinc-800 border-zinc-700" 
                    value={newProduct.printTimeMinutes}
                    onChange={e => setNewProduct({...newProduct, printTimeMinutes: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="filament">Tipo de Filamento</Label>
                  <Select 
                    value={newProduct.filamentType} 
                    onValueChange={(v: FilamentType) => setNewProduct({...newProduct, filamentType: v})}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="PLA">PLA</SelectItem>
                      <SelectItem value="PETG">PETG</SelectItem>
                      <SelectItem value="ABS">ABS</SelectItem>
                      <SelectItem value="Resina">Resina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Preço de Venda</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    className="bg-zinc-800 border-zinc-700" 
                    value={newProduct.salePrice}
                    onChange={e => setNewProduct({...newProduct, salePrice: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddProduct}>Salvar Produto</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <Input 
          placeholder="Buscar produtos..." 
          className="pl-10 bg-zinc-900 border-zinc-800 text-white focus:ring-blue-500"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
          const cost = calculateProductCost(product);
          const profit = product.salePrice - cost;
          const margin = (profit / product.salePrice) * 100;
          const isLowMargin = margin < 30;

          return (
            <Card key={product.id} className="bg-zinc-900 border-zinc-800 overflow-hidden group hover:border-zinc-700 transition-all">
              <CardContent className="p-0">
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white text-lg">{product.name}</h3>
                      <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 mt-1">
                        {product.filamentType}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white" onClick={() => handleDuplicate(product)}>
                        <Copy size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-rose-500" onClick={() => deleteProduct(product.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-2 border-y border-zinc-800/50">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Custo Total</p>
                      <p className="text-sm font-medium text-zinc-200">{settings.currency} {cost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Preço Venda</p>
                      <p className="text-sm font-medium text-zinc-200">{settings.currency} {product.salePrice.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Lucro Líquido</p>
                      <p className="text-xl font-bold text-emerald-500">{settings.currency} {profit.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Margem</p>
                      <div className="flex items-center gap-1">
                        <span className={cn("text-lg font-bold", isLowMargin ? "text-orange-500" : "text-blue-500")}>
                          {margin.toFixed(0)}%
                        </span>
                        {isLowMargin && <AlertCircle size={14} className="text-orange-500" />}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1"><Package size={12} /> {product.weightGrams}g</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {Math.floor(product.printTimeMinutes / 60)}h {product.printTimeMinutes % 60}m</span>
                  </div>
                </div>
                <div className="h-1 w-full bg-zinc-800">
                  <div 
                    className={cn("h-full transition-all duration-500", isLowMargin ? "bg-orange-500" : "bg-blue-500")} 
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