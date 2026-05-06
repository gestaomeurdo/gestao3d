"use client";

import React, { useState, useRef } from 'react';
import { useApp, SaleChannel, FilamentType } from '@/context/AppContext';
import { 
  Save, Zap, CreditCard, User, Monitor, Layers, 
  Plus, Trash2, Download, Upload, ShieldCheck,
  Database, Scale, Target, Layout, AlertTriangle,
  DollarSign, Weight, RefreshCw
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
    expenses, printers, refreshData
  } = useApp();
  
  const [newFilament, setNewFilament] = useState({ 
    name: '', 
    type: 'PLA' as FilamentType, 
    rollPrice: 0, 
    rollWeightGrams: 1000, 
    stockGrams: 1000 
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = () => {
    updateSettings(settings);
  };

  const handleAddFilament = () => {
    if (!newFilament.name || newFilament.rollPrice <= 0 || newFilament.rollWeightGrams <= 0) {
      showError("Preencha o nome e o preço do rolo.");
      return;
    }
    addFilament(newFilament);
    setNewFilament({ name: '', type: 'PLA', rollPrice: 0, rollWeightGrams: 1000, stockGrams: 1000 });
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
        // Implementação simplificada para o usuário não se perder
        showSuccess('Dados lidos. Função de importação completa em breve.');
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configurações</h1>
          <p className="text-slate-500 mt-1 font-medium">Ajuste os parâmetros globais e gerencie seu estoque de materiais.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 rounded-2xl h-12" onClick={() => refreshData()}>
            <RefreshCw size={18} /> Sincronizar
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2 rounded-2xl h-12 px-6 shadow-lg shadow-orange-500/20" onClick={handleSaveSettings}>
            <Save size={18} /> Salvar Tudo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PERFIL E PERSONALIZAÇÃO */}
        <Card className="bg-white border-slate-100 rounded-3xl shadow-sm border overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="text-blue-500" size={20} />
              <CardTitle className="text-lg">Perfil e Sistema</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Seu Nome</Label>
              <Input 
                className="bg-slate-50 border-slate-200 h-11 rounded-xl" 
                value={settings.userName} 
                onChange={e => updateSettings({ userName: e.target.value })} 
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-2">
                <Layout size={14} className="text-orange-500" /> Nome da Sua Empresa
              </Label>
              <Input 
                className="bg-slate-50 border-slate-200 h-11 font-bold rounded-xl" 
                value={settings.systemName} 
                onChange={e => updateSettings({ systemName: e.target.value })} 
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-2">
                <Target size={14} className="text-emerald-500" /> Meta de Lucro Mensal
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{settings.currency}</span>
                <Input 
                  type="number" 
                  className="pl-10 bg-slate-50 border-slate-200 h-11 font-bold rounded-xl" 
                  value={settings.monthlyProfitGoal} 
                  onChange={e => updateSettings({ monthlyProfitGoal: Number(e.target.value) })} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CUSTOS DE ENERGIA */}
        <Card className="bg-white border-slate-100 rounded-3xl shadow-sm border overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Zap className="text-yellow-500" size={20} />
              <CardTitle className="text-lg">Custos de Energia</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Custo Energia (por hora de impressão)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{settings.currency}</span>
                <Input 
                  type="number" step="0.01" 
                  className="pl-10 bg-slate-50 border-slate-200 h-11 rounded-xl font-bold" 
                  value={settings.energyCostPerHour || ''} 
                  onChange={e => updateSettings({ energyCostPerHour: Number(e.target.value) })} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ESTOQUE DE FILAMENTOS */}
        <Card className="bg-white border-slate-100 rounded-3xl shadow-sm border overflow-hidden lg:col-span-2">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="text-orange-500" size={20} />
              <CardTitle className="text-lg">Estoque de Filamentos (Materiais)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <div className="grid gap-2 md:col-span-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Nome / Marca</Label>
                <Input placeholder="Ex: PLA Premium 3DLab" value={newFilament.name} onChange={e => setNewFilament({...newFilament, name: e.target.value})} className="bg-white border-slate-200 rounded-xl h-11" />
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Tipo</Label>
                <Select value={newFilament.type} onValueChange={(v: FilamentType) => setNewFilament({...newFilament, type: v})}>
                  <SelectTrigger className="bg-white border-slate-200 rounded-xl h-11"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="PLA">PLA</SelectItem>
                    <SelectItem value="PETG">PETG</SelectItem>
                    <SelectItem value="ABS">ABS</SelectItem>
                    <SelectItem value="Resina">Resina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Preço Rolo</Label>
                <Input type="number" className="bg-white border-slate-200 rounded-xl h-11" value={newFilament.rollPrice || ''} onChange={e => setNewFilament({...newFilament, rollPrice: Number(e.target.value)})} />
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Peso (g)</Label>
                <Input type="number" className="bg-white border-slate-200 rounded-xl h-11" value={newFilament.rollWeightGrams || ''} onChange={e => setNewFilament({...newFilament, rollWeightGrams: Number(e.target.value)})} />
              </div>
              <Button className="bg-slate-900 text-white rounded-xl h-11 font-bold" onClick={handleAddFilament}>
                <Plus size={18} className="mr-2" /> Adicionar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filaments.length === 0 ? (
                <div className="col-span-2 text-center py-10 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm font-medium">Nenhum material cadastrado no estoque.</p>
                </div>
              ) : filaments.map(f => (
                <div key={f.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-orange-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 font-black text-xl">
                      {f.type[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{f.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">
                        {f.type} • {settings.currency} {(f.rollPrice || 0).toFixed(2)} ({f.rollWeightGrams || 0}g)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Estoque (g)</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input 
                          type="number" 
                          className={cn(
                            "w-20 h-9 text-xs font-black text-center rounded-lg border-slate-200",
                            f.stockGrams < 200 ? "text-rose-500 bg-rose-50 border-rose-100" : "text-emerald-600 bg-emerald-50 border-emerald-100"
                          )} 
                          value={f.stockGrams} 
                          onChange={(e) => handleUpdateStock(f.id, Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl" onClick={() => deleteFilament(f.id)}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* TAXAS DE CANAIS */}
        <Card className="bg-white border-slate-100 rounded-3xl shadow-sm border overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CreditCard className="text-emerald-500" size={20} />
              <CardTitle className="text-lg">Taxas de Venda (%)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {(Object.keys(settings.channelFees) as SaleChannel[]).map((channel) => (
              <div key={channel} className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Label className="text-sm font-bold text-slate-700">{channel}</Label>
                <div className="relative w-24">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
                  <Input 
                    type="number" step="0.1" 
                    className="bg-white border-slate-200 pr-8 h-10 rounded-lg font-black text-center" 
                    value={settings.channelFees[channel] || ''} 
                    onChange={e => {
                      const newFees = { ...settings.channelFees, [channel]: Number(e.target.value) };
                      updateSettings({ channelFees: newFees });
                    }} 
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* BACKUP E SEGURANÇA */}
        <Card className="bg-slate-900 border-none rounded-3xl shadow-xl overflow-hidden text-white">
          <CardHeader className="border-b border-white/10 p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-blue-400" size={20} />
              <CardTitle className="text-lg">Backup e Segurança</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col gap-3">
              <Button variant="ghost" className="w-full justify-start gap-3 h-14 rounded-2xl hover:bg-white/5 text-white" onClick={handleExportData}>
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl"><Download size={20} /></div>
                <div className="text-left">
                  <p className="text-sm font-bold">Exportar Backup</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Baixe seus dados em JSON</p>
                </div>
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-14 rounded-2xl hover:bg-rose-500/10 text-rose-400">
                    <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl"><AlertTriangle size={20} /></div>
                    <div className="text-left">
                      <p className="text-sm font-bold">Limpar Tudo</p>
                      <p className="text-[10px] text-rose-400/60 font-bold uppercase">Apagar produtos e vendas</p>
                    </div>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-black">Tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500 font-medium">
                      Esta ação não pode ser desfeita. Isso apagará permanentemente todos os seus produtos, vendas, gastos e estoque do banco de dados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-8">
                    <AlertDialogCancel className="rounded-2xl h-12 px-6 font-bold">Cancelar</AlertDialogCancel>
                    <AlertDialogAction className="bg-rose-500 hover:bg-rose-600 rounded-2xl h-12 px-6 font-bold">Sim, apagar tudo</AlertDialogAction>
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