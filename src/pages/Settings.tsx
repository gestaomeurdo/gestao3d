"use client";

import React from 'react';
import { useApp, SaleChannel } from '@/context/AppContext';
import { Save, Globe, Zap, CreditCard, User, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { showSuccess } from '@/utils/toast';

const Settings = () => {
  const { settings, updateSettings } = useApp();

  const handleSave = () => {
    showSuccess('Configurações salvas com sucesso!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground mt-1">Ajuste os parâmetros globais de cálculo e perfil.</p>
        </div>
        <Button className="orange-gradient text-white gap-2" onClick={handleSave}>
          <Save size={18} /> Salvar Alterações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="text-primary" size={20} />
              <CardTitle>Seu Perfil</CardTitle>
            </div>
            <CardDescription>Como você quer ser chamado no sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-muted-foreground">Seu Nome</Label>
              <Input 
                className="bg-secondary/50 border-border/50 h-11" 
                value={settings.userName}
                onChange={e => updateSettings({ userName: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Monitor className="text-blue-500" size={20} />
              <CardTitle>Personalização</CardTitle>
            </div>
            <CardDescription>Altere o nome da sua marca no sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-muted-foreground">Nome do Sistema (Marca)</Label>
              <Input 
                className="bg-secondary/50 border-border/50 h-11" 
                value={settings.systemName}
                onChange={e => updateSettings({ systemName: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="text-yellow-500" size={20} />
              <CardTitle>Custos Operacionais</CardTitle>
            </div>
            <CardDescription>Valores base para cálculo de custo de produção.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-muted-foreground">Preço Médio Filamento (por kg)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{settings.currency}</span>
                <Input 
                  type="number" 
                  step="0.01"
                  inputMode="decimal"
                  className="pl-10 bg-secondary/50 border-border/50 h-11" 
                  value={settings.filamentPricePerKg || ''}
                  onChange={e => updateSettings({ filamentPricePerKg: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-muted-foreground">Custo Energia (por hora de impressão)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{settings.currency}</span>
                <Input 
                  type="number" 
                  step="0.01"
                  inputMode="decimal"
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
              <CardTitle>Taxas de Canais de Venda</CardTitle>
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
                    inputMode="decimal"
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