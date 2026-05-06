"use client";

import React, { useState } from 'react';
import { useApp, SaleChannel, FilamentType } from '@/context/AppContext';
import { Save, Zap, CreditCard, User, Monitor, Layers, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';

const Settings = () => {
  const { settings, updateSettings, filaments, addFilament, deleteFilament } = useApp();
  const [newFilament, setNewFilament] = useState({ name: '', type: 'PLA' as FilamentType, pricePerKg: 0 });

  const handleSave = () => {
    showSuccess('Configurações salvas com sucesso!');
  };

  const handleAddFilament = () => {
    if (!newFilament.name || newFilament.pricePerKg <= 0) return;
    addFilament(newFilament);
    setNewFilament({ name: '', type: 'PLA', pricePerKg: 0 });
    showSuccess('Filamento adicionado ao estoque!');
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
      </div>
    </div>
  );
};

export default Settings;