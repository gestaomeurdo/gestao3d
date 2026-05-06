"use client";

import React, { useState, useRef } from 'react';
import { useApp, SaleChannel, FilamentType } from '@/context/AppContext';
import { 
  Save, Zap, CreditCard, User, Monitor, Layers, 
  Plus, Trash2, Download, Upload, ShieldCheck,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';

const Settings = () => {
  const { 
    settings, updateSettings, filaments, addFilament, 
    deleteFilament, products, sales, expenses, printers,
    importAllData 
  } = useApp();
  
  const [newFilament, setNewFilament] = useState({ name: '', type: 'PLA' as FilamentType, pricePerKg: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    showSuccess('Configurações salvas com sucesso!');
  };

  const handleAddFilament = () => {
    if (!newFilament.name || newFilament.pricePerKg <= 0) return;
    addFilament(newFilament);
    setNewFilament({ name: '', type: 'PLA', pricePerKg: 0 });
    showSuccess('Filamento adicionado ao estoque!');
  };

  const handleExportData = () => {
    const data = {
      filaments,
      products,
      sales,
      expenses,
      printers,
      settings,
      exportDate: new Date().toISOString()
    };
    
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
        
        // Validação básica
        if (!data.settings || !data.products) {
          throw new Error('Arquivo de backup inválido');
        }
        
        importAllData(data);
        showSuccess('Dados importados com sucesso!');
      } catch (err) {
        showError('Erro ao importar arquivo. Verifique se o formato está correto.');
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
        
        {/* PERFIL E SISTEMA */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="text-blue-500" size={20} />
              <CardTitle>Perfil e Sistema</CardTitle>
            </div>
            <CardDescription>Personalize como o sistema aparece para você.</CardDescription>
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
              <Label>Nome do Sistema</Label>
              <Input 
                className="bg-secondary/50 border-border/50 h-11" 
                value={settings.systemName}
                onChange={e => updateSettings({ systemName: e.target.value })}
              />
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
            <CardDescription>Valor base para cálculo de consumo elétrico.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-muted-foreground">Custo Energia (por hora de impressão)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{settings.currency}</span>
                <Input 
                  type="number" 
                  step="0.01"
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
            <CardDescription>Cadastre seus filamentos com preços diferentes para cálculos precisos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-secondary/20 p-4 rounded-2xl border border-border/50">
              <div className="grid gap-2">
                <Label>Nome / Marca</Label>
                <Input 
                  placeholder="Ex: PLA Premium 3DLab" 
                  value={newFilament.name}
                  onChange={e => setNewFilament({...newFilament, name: e.target.value})}
                  className="bg-background"
                />
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
                <Label>Preço por Kg</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{settings.currency}</span>
                  <Input 
                    type="number" 
                    step="0.01"
                    className="pl-10 bg-background"
                    value={newFilament.pricePerKg || ''}
                    onChange={e => setNewFilament({...newFilament, pricePerKg: Number(e.target.value)})}
                  />
                </div>
              </div>
              <Button className="orange-gradient text-white" onClick={handleAddFilament}>
                <Plus size={18} className="mr-2" /> Adicionar
              </Button>
            </div>

            <div className="space-y-2">
              {filaments.map(f => (
                <div key={f.id} className="flex items-center justify-between p-4 bg-secondary/10 rounded-xl border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold">
                      {f.type[0]}
                    </div>
                    <div>
                      <p className="font-bold">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.type} • {settings.currency} {f.pricePerKg.toFixed(2)}/kg</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => deleteFilament(f.id)}>
                    <Trash2 size={18} />
                  </Button>
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
            <CardDescription>Porcentagem cobrada por cada plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(Object.keys(settings.channelFees) as SaleChannel[]).map((channel) => (
              <div key={channel} className="grid grid-cols-2 items-center gap-4">
                <Label className="text-muted-foreground">{channel}</Label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  <Input 
                    type="number" 
                    step="0.1"
                    className="bg-secondary/50 border-border/50 pr-8 h-11" 
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
        <Card className="glass-card border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-blue-500" size={20} />
              <CardTitle>Backup e Segurança</CardTitle>
            </div>
            <CardDescription>Seus dados são salvos localmente. Use estas ferramentas para segurança extra.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12 border-blue-500/20 hover:bg-blue-500/10"
                onClick={handleExportData}
              >
                <Download size={18} className="text-blue-500" />
                <div className="text-left">
                  <p className="text-sm font-bold">Exportar Backup</p>
                  <p className="text-[10px] text-muted-foreground">Baixe todos os seus dados em um arquivo JSON.</p>
                </div>
              </Button>

              <div className="relative">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".json"
                  onChange={handleImportData}
                />
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 h-12 border-orange-500/20 hover:bg-orange-500/10"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={18} className="text-orange-500" />
                  <div className="text-left">
                    <p className="text-sm font-bold">Importar Backup</p>
                    <p className="text-[10px] text-muted-foreground">Restaure seus dados a partir de um arquivo.</p>
                  </div>
                </Button>
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 rounded-2xl flex items-start gap-3">
              <Database className="text-blue-500 shrink-0 mt-1" size={16} />
              <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                <strong>Nota:</strong> Seus dados estão seguros no seu navegador. No entanto, se você limpar os dados do site ou trocar de computador, precisará do arquivo de backup para restaurar suas informações.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;