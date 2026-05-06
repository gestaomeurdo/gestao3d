"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useApp, SaleChannel, FilamentType } from '@/context/AppContext';
import { 
  Save, Zap, CreditCard, User, Monitor, Layers, 
  Plus, Trash2, Download, Upload, ShieldCheck,
  Database, Scale, Target, Layout, AlertTriangle,
  DollarSign, Weight, RefreshCw, Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Settings = () => {
  const { 
    settings, updateSettings, filaments, addFilament, 
    updateFilament, deleteFilament, refreshData
  } = useApp();
  
  // Estado local para evitar bugs ao digitar
  const [localSettings, setLocalSettings] = useState(settings);
  const [newFilament, setNewFilament] = useState({ 
    name: '', type: 'PLA' as FilamentType, 
    rollPrice: 0, rollWeightGrams: 1000, stockGrams: 1000 
  });

  // Sincronizar estado local quando os dados do banco mudarem
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSaveSettings = async () => {
    await updateSettings(localSettings);
  };

  const handleAddFilament = () => {
    if (!newFilament.name || newFilament.rollPrice <= 0) {
      showError("Preencha o nome e o preço do material.");
      return;
    }
    addFilament(newFilament);
    setNewFilament({ name: '', type: 'PLA', rollPrice: 0, rollWeightGrams: 1000, stockGrams: 1000 });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings({ ...localSettings, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configurações</h1>
          <p className="text-slate-500 mt-1 font-medium">Ajuste os parâmetros do sistema e seu estoque de materiais.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PERFIL E FOTO */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white border-slate-100 rounded-3xl shadow-sm border overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2"><User size={18} className="text-blue-500"/> Seu Perfil</CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex flex-col items-center gap-6">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-orange-500/20 shadow-xl">
                  <AvatarImage src={localSettings.avatarUrl} />
                  <AvatarFallback className="bg-slate-100 text-slate-400 text-3xl font-black">
                    {localSettings.userName?.substring(0, 2).toUpperCase() || 'US'}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 p-2 bg-orange-600 text-white rounded-full cursor-pointer hover:bg-orange-700 transition-colors shadow-lg">
                  <Camera size={18} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </label>
              </div>
              
              <div className="w-full space-y-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Seu Nome</Label>
                  <Input 
                    className="bg-slate-50 border-slate-200 h-11 rounded-xl" 
                    value={localSettings.userName} 
                    onChange={e => setLocalSettings({ ...localSettings, userName: e.target.value })} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Nome da Empresa</Label>
                  <Input 
                    className="bg-slate-50 border-slate-200 h-11 font-bold rounded-xl" 
                    value={localSettings.systemName} 
                    onChange={e => setLocalSettings({ ...localSettings, systemName: e.target.value })} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-100 rounded-3xl shadow-sm border overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2"><Target size={18} className="text-emerald-500"/> Meta Financeira</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Meta de Lucro Mensal</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{localSettings.currency}</span>
                  <Input 
                    type="number" 
                    className="pl-10 bg-slate-50 border-slate-200 h-11 font-black rounded-xl" 
                    value={localSettings.monthlyProfitGoal} 
                    onChange={e => setLocalSettings({ ...localSettings, monthlyProfitGoal: Number(e.target.value) })} 
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Custo Energia (Hora)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{localSettings.currency}</span>
                  <Input 
                    type="number" step="0.01" 
                    className="pl-10 bg-slate-50 border-slate-200 h-11 rounded-xl font-bold" 
                    value={localSettings.energyCostPerHour} 
                    onChange={e => setLocalSettings({ ...localSettings, energyCostPerHour: Number(e.target.value) })} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MATERIAIS E TAXAS */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-slate-100 rounded-3xl shadow-sm border overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2"><Layers size={18} className="text-orange-500"/> Estoque de Filamentos</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <div className="grid gap-2 md:col-span-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Nome do Material</Label>
                  <Input placeholder="Ex: PLA Premium" value={newFilament.name} onChange={e => setNewFilament({...newFilament, name: e.target.value})} className="bg-white border-slate-200 rounded-xl h-11" />
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
                  <Plus size={18} />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filaments.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 font-black">
                        {f.type[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{f.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{f.stockGrams}g em estoque</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-300 hover:text-rose-500" onClick={() => deleteFilament(f.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-100 rounded-3xl shadow-sm border overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2"><CreditCard size={18} className="text-emerald-500"/> Taxas de Canais (%)</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {(Object.keys(localSettings.channelFees) as SaleChannel[]).map((channel) => (
                <div key={channel} className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">{channel}</Label>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">%</span>
                    <Input 
                      type="number" step="0.1" 
                      className="bg-slate-50 border-slate-200 h-10 rounded-xl font-black text-center pr-8" 
                      value={localSettings.channelFees[channel]} 
                      onChange={e => {
                        const newFees = { ...localSettings.channelFees, [channel]: Number(e.target.value) };
                        setLocalSettings({ ...localSettings, channelFees: newFees });
                      }} 
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;