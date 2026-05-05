"use client";

import React from 'react';
import { useApp, SaleChannel } from '@/context/AppContext';
import { Save, Globe, Zap, CreditCard, User } from 'lucide-react';
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
          <h1 className="text-3xl font-bold text-white tracking-tight">Configurações</h1>
          <p className="text-zinc-400 mt-1">Ajuste os parâmetros globais de cálculo e perfil.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={handleSave}>
          <Save size={18} /> Salvar Alterações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Perfil do Usuário */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="text-primary" size={20} />
              <CardTitle className="text-white">Seu Perfil</CardTitle>
            </div>
            <CardDescription className="text-zinc-500">Como você quer ser chamado no sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-zinc-400">Seu Nome</Label>
              <Input 
                className="bg-zinc-950 border-zinc-800 text-white" 
                value={settings.userName}
                onChange={e => updateSettings({ userName: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Custos Base */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="text-blue-500" size={20} />
              <CardTitle className="text-white">Custos Operacionais</CardTitle>
            </div>
            <CardDescription className="text-zinc-500">Valores base para cálculo de custo de produção.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-zinc-400">Preço Médio Filamento (por kg)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">{settings.currency}</span>
                <Input 
                  type="number" 
                  className="pl-10 bg-zinc-950 border-zinc-800 text-white" 
                  value={settings.filamentPricePerKg}
                  onChange={e => updateSettings({ filamentPricePerKg: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-zinc-400">Custo Energia (por hora de impressão)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">{settings.currency}</span>
                <Input 
                  type="number" 
                  className="pl-10 bg-zinc-950 border-zinc-800 text-white" 
                  value={settings.energyCostPerHour}
                  onChange={e => updateSettings({ energyCostPerHour: Number(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Taxas de Canais */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="text-orange-500" size={20} />
              <CardTitle className="text-white">Taxas de Canais de Venda</CardTitle>
            </div>
            <CardDescription className="text-zinc-500">Porcentagem cobrada por cada plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(Object.keys(settings.channelFees) as SaleChannel[]).map((channel) => (
              <div key={channel} className="grid grid-cols-2 items-center gap-4">
                <Label className="text-zinc-400">{channel}</Label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">%</span>
                  <Input 
                    type="number" 
                    className="bg-zinc-950 border-zinc-800 text-white pr-8" 
                    value={settings.channelFees[channel]}
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

        {/* Regional */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="text-purple-500" size={20} />
              <CardTitle className="text-white">Regional e Moeda</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-zinc-400">Símbolo da Moeda</Label>
              <Input 
                className="bg-zinc-950 border-zinc-800 text-white" 
                value={settings.currency}
                onChange={e => updateSettings({ currency: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;