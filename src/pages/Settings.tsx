"use client";

import React, { useState, useRef } from 'react';
import { useApp, SaleChannel, FilamentType } from '@/context/AppContext';
import { 
  Save, Zap, CreditCard, User, Monitor, Layers, 
  Plus, Trash2, Download, Upload, ShieldCheck,
  Database, Scale, Target, Layout, AlertTriangle,
  DollarSign, Weight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
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

const Settings = () => {
  const { 
    settings, updateSettings, filaments, addFilament, 
    updateFilament, deleteFilament, products, sales, 
    expenses, printers, importAllData, clearAllData 
  } = useApp();
  
  const [newFilament, setNewFilament] = useState({ 
    name: '', 
    type: 'PLA' as FilamentType, 
    rollPrice: 0, 
    rollWeightGrams: 1000, 
    stockGrams: 1000 
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    showSuccess('Configurações salvas com sucesso!');
  };

  const handleAddFilament = () => {
    if (!newFilament.name || newFilament.rollPrice <= 0 || newFilament.rollWeightGrams <= 0) return;
    addFilament(newFilament);
    setNewFilament({ name: '', type: 'PLA', rollPrice: 0, rollWeightGrams: 1000, stockGrams: 1000 });
    showSuccess('Filamento adicionado ao estoque!');
  };

  const handleUpdateStock = (id: string, grams: number) => {
    updateFilament(id, { stockGrams: grams });
  };

  const handleExportData = () => {
    const data = { filaments, products, sales, expenses, printers, settings, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-printsaas-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('Backup exportado com sucesso!');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (!data.settings || !data.products) throw new Error('Arquivo inválido');
        importAllData(data);
        showSuccess('Dados importados com sucesso!');
      } catch (err) {
        showError('Erro ao importar arquivo.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground mt-1">Ajuste os parâmetros globais e gerencie seu estoque de materiais.</p>
        </div>
        <Button className="orange-gradient text-white gap-2" onClick={handleSave}>
          <Save size={18} /> Salvar Alterações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PERFIL E PERSONALIZAÇÃO */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="text-blue-500" size={20} />
              <CardTitle>Perfil e Personalização</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Seu Nome</Label>
              <Input 
                className="bg-secondary/50 border-border/50 h-11" 
                value={settings.userName} 
                onChange={e => updateSettings({ userName: e.target.value })} 
              />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Layout size={14} className="text-orange-500" /> Nome do Sistema / Empresa
              </Label>
              <Input 
                className="bg-secondary/50 border-border/50 h-11 font-bold" 
                value={settings.systemName} 
                onChange={e => updateSettings({ systemName: e.target.value })} 
              />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Target size={14} className="text-primary" /> Meta de Lucro Mensal
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{settings.currency}</span>
                <Input 
                  type="number" 
                  className="pl-10 bg-secondary/50 border-border/50 h-11 font-bold" 
                  value={settings.monthlyProfitGoal} 
                  onChange={e => updateSettings({ monthlyProfitGoal: Number(e.target.value) })} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CUSTOS DE ENERGIA */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="text-yellow-500" size={20} />
              <CardTitle>Custos de Energia</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-muted-foreground">Custo Energia (por hora de impressão)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{settings.currency}</span>
                <Input 
                  type="number" step="0.01" 
                  className="pl-10 bg-secondary/50 border-border/50 h-11" 
                  value={settings.energyCostPerHour || ''} 
                  onChange={e => updateSettings({ energyCostPerHour: Number(e.target.value) })} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ESTOQUE DE FILAMENTOS */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="text-orange-500" size={20} />
              <CardTitle>Estoque de Filamentos</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end bg-secondary/20 p-4 rounded-2xl border border-border/50">
              <div className="grid gap-2 md:col-span-2">
                <Label>Nome / Marca</Label>
                <Input placeholder="Ex: PLA Premium 3DLab" value={newFilament.name} onChange={e => setNewFilament({...newFilament, name: e.target.value})} className="bg-background" />
              </div>
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select value={newFilament.type} onValueChange={(v: FilamentType) => setNewFilament({...newFilament, type: v})}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLA">PLA</SelectItem>
                    <SelectItem value="PETG">PETG</SelectItem>
                    <SelectItem value="ABS">ABS</SelectItem>
                    <SelectItem value="Resina">Resina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="flex items-center gap-1"><DollarSign size={12}/> Preço Rolo</Label>
                <Input type="number" className="bg-background" value={newFilament.rollPrice || ''} onChange={e => setNewFilament({...newFilament, rollPrice: Number(e.target.value)})} />
              </div>
              <div className="grid gap-2">
                <Label className="flex items-center gap-1"><Weight size={12}/> Peso (g)</Label>
                <Input type="number" className="bg-background" value={newFilament.rollWeightGrams || ''} onChange={e => setNewFilament({...newFilament, rollWeightGrams: Number(e.target.value)})} />
              </div>
              <Button className="orange-gradient text-white" onClick={handleAddFilament}>
                <Plus size={18} className="mr-2" /> Adicionar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filaments.map(f => (
                <div key={f.id} className="flex items-center justify-between p-4 bg-secondary/10 rounded-xl border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold">
                      {f.type[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{f.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">
                        {f.type} • {settings.currency} {f.rollPrice.toFixed(2)} ({f.rollWeightGrams}g)
                      </p>
                      <p className="text-[9px] text-orange-600 font-black">Custo: {settings.currency} {(f.pricePerKg / 1000).toFixed(4)}/g</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Estoque Atual (g)</Label>
                      <div className="flex items-center gap-2">
                        <Scale size={12} className={cn(f.stockGrams < 200 ? "text-rose-500" : "text-emerald-500")} />
                        <Input 
                          type="number" 
                          className="w-20 h-8 text-xs font-bold text-center bg-background" 
                          value={f.stockGrams} 
                          onChange={(e) => handleUpdateStock(f.id, Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => deleteFilament(f.id)}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* TAXAS DE CANAIS */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="text-orange-500" size={20} />
              <CardTitle>Taxas de Canais</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {(Object.keys(settings.channelFees) as SaleChannel[]).map((channel) => (
              <div key={channel} className="grid grid-cols-2 items-center gap-4">
                <Label className="text-muted-foreground">{channel}</Label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  <Input type="number" step="0.1" className="bg-secondary/50 border-border/50 pr-8 h-11" value={settings.channelFees[channel] || ''} onChange={e => {
                    const newFees = { ...settings.channelFees, [channel]: Number(e.target.value) };
                    updateSettings({ channelFees: newFees });
                  }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* BACKUP E SEGURANÇA */}
        <Card className="glass-card border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-blue-500" size={20} />
              <CardTitle>Backup e Segurança</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 border-blue-500/20 hover:bg-blue-500/10" onClick={handleExportData}>
                <Download size={18} className="text-blue-500" />
                <div className="text-left">
                  <p className="text-sm font-bold">Exportar Backup</p>
                  <p className="text-[10px] text-muted-foreground">Baixe todos os seus dados em um arquivo JSON.</p>
                </div>
              </Button>
              <div className="relative">
                <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportData} />
                <Button variant="outline" className="w-full justify-start gap-3 h-12 border-orange-500/20 hover:bg-orange-500/10" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={18} className="text-orange-500" />
                  <div className="text-left">
                    <p className="text-sm font-bold">Importar Backup</p>
                    <p className="text-[10px] text-muted-foreground">Restaure seus dados a partir de um arquivo.</p>
                  </div>
                </Button>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-rose-500 hover:bg-rose-500/10">
                    <AlertTriangle size={18} />
                    <div className="text-left">
                      <p className="text-sm font-bold">Limpar Todos os Dados</p>
                      <p className="text-[10px] text-rose-400">Cuidado! Isso apagará produtos, vendas e gastos.</p>
                    </div>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso apagará permanentemente todos os seus produtos, vendas, gastos e estoque.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={clearAllData} className="bg-rose-500 hover:bg-rose-600 rounded-xl">Sim, limpar tudo</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;