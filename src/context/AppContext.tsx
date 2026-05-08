"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Session } from '@supabase/supabase-js';
import { showError, showSuccess } from '@/utils/toast';

export type FilamentType = 'PLA' | 'PETG' | 'ABS' | 'Resina' | 'Outro';
export type SaleStatus = 'fila' | 'imprimindo' | 'acabamento' | 'pronto' | 'enviado';
export type SaleChannel = 'Mercado Livre' | 'Shopee' | 'Direto' | 'Instagram';
export type ExpenseCategory = 'filamento' | 'energia' | 'manutenção' | 'equipamentos' | 'marketing' | 'outros';
export type ShippingPaidBy = 'cliente' | 'vendedor' | 'isento';

export interface Filament {
  id: string;
  name: string;
  type: FilamentType;
  rollPrice: number;
  rollWeightGrams: number;
  pricePerKg: number;
  stockGrams: number;
  color?: string;
}

export interface Product {
  id: string;
  name: string;
  category?: string;
  weightGrams: number;
  printTimeMinutes: number;
  filamentId: string;
  salePrice: number;
  additionalCost?: number;
  defaultChannel?: SaleChannel;
  imageUrl?: string;
}

export interface Sale {
  id: string;
  date: string;
  productId: string;
  quantity: number;
  channel: SaleChannel;
  status: SaleStatus;
  customPrice?: number;
  printerId?: string;
  shippingCost?: number;
  shippingPaidBy: ShippingPaidBy;
  customerName?: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  isRecurring?: boolean;
}

export interface Printer {
  id: string;
  name: string;
  purchasePrice: number;
  purchaseDate: string;
  status: 'disponível' | 'imprimindo' | 'manutenção';
}

export interface Settings {
  userName: string;
  systemName: string;
  energyCostPerHour: number;
  channelFees: Record<SaleChannel, number>;
  currency: string;
  monthlyProfitGoal: number;
  avatarUrl?: string;
}

interface AppContextType {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  printers: Printer[];
  filaments: Filament[];
  settings: Settings;
  session: Session | null;
  loading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id'>) => Promise<void>;
  updateSale: (id: string, sale: Partial<Sale>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addPrinter: (printer: Omit<Printer, 'id'>) => Promise<void>;
  updatePrinter: (id: string, printer: Partial<Printer>) => Promise<void>;
  deletePrinter: (id: string) => Promise<void>;
  addFilament: (filament: Omit<Filament, 'id' | 'pricePerKg'>) => Promise<void>;
  updateFilament: (id: string, filament: Partial<Filament>) => Promise<void>;
  deleteFilament: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  calculateProductCost: (product: Product) => number;
  signOut: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [settings, setSettings] = useState<Settings>({
    userName: '',
    systemName: 'PrintSaaS',
    energyCostPerHour: 0.85,
    channelFees: { 'Mercado Livre': 16.5, 'Shopee': 14, 'Direto': 0, 'Instagram': 0 },
    currency: 'R$',
    monthlyProfitGoal: 5000,
  });

  const fetchData = async (userId: string) => {
    try {
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      
      if (prof) {
        setSettings({
          userName: prof.first_name || '',
          systemName: prof.system_name || 'PrintSaaS',
          energyCostPerHour: Number(prof.energy_cost_per_hour || 0.85),
          channelFees: prof.channel_fees || { 'Mercado Livre': 16.5, 'Shopee': 14, 'Direto': 0, 'Instagram': 0 },
          currency: prof.currency || 'R$',
          monthlyProfitGoal: Number(prof.monthly_profit_goal || 5000),
          avatarUrl: prof.avatar_url,
        });
      }

      const [
        { data: fil },
        { data: prod },
        { data: sls },
        { data: exp },
        { data: prn }
      ] = await Promise.all([
        supabase.from('filaments').select('*').eq('user_id', userId),
        supabase.from('products').select('*').eq('user_id', userId),
        supabase.from('sales').select('*').eq('user_id', userId),
        supabase.from('expenses').select('*').eq('user_id', userId),
        supabase.from('printers').select('*').eq('user_id', userId)
      ]);

      if (fil) setFilaments(fil.map(f => ({
        id: f.id, name: f.name, type: f.type as FilamentType,
        rollPrice: Number(f.roll_price), rollWeightGrams: Number(f.roll_weight_grams),
        pricePerKg: Number(f.price_per_kg), stockGrams: Number(f.stock_grams), color: f.color
      })));

      if (prod) setProducts(prod.map(p => ({
        id: p.id, name: p.name, category: p.category,
        weightGrams: Number(p.weight_grams), printTimeMinutes: Number(p.print_time_minutes),
        filamentId: p.filament_id, salePrice: Number(p.sale_price),
        additionalCost: Number(p.additional_cost), defaultChannel: p.default_channel as SaleChannel,
        imageUrl: p.image_url
      })));

      if (sls) setSales(sls.map(s => ({
        id: s.id, date: s.date, productId: s.product_id,
        quantity: s.quantity, channel: s.channel as SaleChannel,
        status: (s.status as SaleStatus) || 'fila', 
        customPrice: s.custom_price ? Number(s.custom_price) : undefined,
        printerId: s.printer_id, shippingCost: Number(s.shipping_cost),
        shippingPaidBy: s.shipping_paid_by as ShippingPaidBy,
        customerName: s.customer_name
      })));

      if (exp) setExpenses(exp.map(e => ({
        id: e.id, category: e.category as ExpenseCategory,
        amount: Number(e.amount), date: e.date, description: e.description,
        isRecurring: e.is_recurring
      })));

      if (prn) setPrinters(prn.map(p => ({
        id: p.id, name: p.name, purchasePrice: Number(p.purchase_price),
        purchaseDate: p.purchase_date, status: p.status as any
      })));

    } catch (error) {
      console.error("[AppContext] Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData(session.user.id);
      else {
        setFilaments([]);
        setProducts([]);
        setSales([]);
        setExpenses([]);
        setPrinters([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const calculateProductCost = (product: Product) => {
    const filament = filaments.find(f => f.id === product.filamentId);
    const filamentPrice = filament ? Number(filament.pricePerKg) : 0;
    const weight = Number(product.weightGrams) || 0;
    const time = Number(product.printTimeMinutes) || 0;
    const energy = Number(settings.energyCostPerHour) || 0;
    const extra = Number(product.additionalCost) || 0;
    return ((weight / 1000) * filamentPrice) + ((time / 60) * energy) + extra;
  };

  const addFilament = async (f: Omit<Filament, 'id' | 'pricePerKg'>) => {
    if (!session) return;
    const pricePerKg = (f.rollPrice / f.rollWeightGrams) * 1000;
    const { error } = await supabase.from('filaments').insert([{
      name: f.name, type: f.type, roll_price: f.rollPrice, 
      roll_weight_grams: f.rollWeightGrams, price_per_kg: pricePerKg,
      stock_grams: f.stockGrams, color: f.color, user_id: session.user.id
    }]);
    if (error) showError("Erro ao salvar material.");
    else {
      showSuccess("Material adicionado!");
      fetchData(session.user.id);
    }
  };

  const updateFilament = async (id: string, updated: Partial<Filament>) => {
    if (!session) return;
    const { error } = await supabase.from('filaments').update({
      name: updated.name, type: updated.type, roll_price: updated.rollPrice,
      roll_weight_grams: updated.rollWeightGrams, stock_grams: updated.stockGrams,
      color: updated.color,
      price_per_kg: (updated.rollPrice && updated.rollWeightGrams) ? (updated.rollPrice / updated.rollWeightGrams) * 1000 : undefined
    }).eq('id', id);
    if (error) showError("Erro ao atualizar.");
    else fetchData(session.user.id);
  };

  const deleteFilament = async (id: string) => {
    if (!session) return;
    const { error } = await supabase.from('filaments').delete().eq('id', id);
    if (error) showError("Erro ao excluir. O material pode estar em uso.");
    else fetchData(session.user.id);
  };

  const addProduct = async (p: Omit<Product, 'id'>) => {
    if (!session) return;
    const { error } = await supabase.from('products').insert([{
      name: p.name, category: p.category, weight_grams: p.weightGrams,
      print_time_minutes: p.printTimeMinutes, filament_id: p.filament_id,
      sale_price: p.salePrice, additional_cost: p.additional_cost,
      default_channel: p.default_channel, image_url: p.imageUrl,
      user_id: session.user.id
    }]);
    if (error) showError("Erro ao salvar produto.");
    else fetchData(session.user.id);
  };

  const updateProduct = async (id: string, p: Partial<Product>) => {
    if (!session) return;
    const { error } = await supabase.from('products').update({
      name: p.name, category: p.category, weight_grams: p.weight_grams,
      print_time_minutes: p.print_time_minutes, filament_id: p.filament_id,
      sale_price: p.sale_price, additional_cost: p.additional_cost,
      default_channel: p.default_channel, image_url: p.imageUrl
    }).eq('id', id);
    if (error) showError("Erro ao atualizar produto.");
    else fetchData(session.user.id);
  };

  const deleteProduct = async (id: string) => {
    if (!session) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) showError("Erro ao excluir.");
    else fetchData(session.user.id);
  };

  const addSale = async (s: Omit<Sale, 'id'>) => {
    if (!session) return;
    
    // 1. Registrar a venda
    const { data: newSale, error: saleError } = await supabase.from('sales').insert([{
      product_id: s.productId, quantity: s.quantity, channel: s.channel,
      status: s.status, custom_price: s.customPrice, printer_id: s.printerId,
      shipping_cost: s.shipping_cost, shipping_paid_by: s.shipping_paid_by,
      user_id: session.user.id, date: s.date, customer_name: s.customerName
    }]).select().single();

    if (saleError) {
      showError("Erro ao registrar venda.");
      return;
    }

    // 2. Baixar estoque automaticamente
    const product = products.find(p => p.id === s.productId);
    if (product) {
      const filament = filaments.find(f => f.id === product.filamentId);
      if (filament) {
        const consumedWeight = Number(product.weightGrams) * Number(s.quantity);
        const newStock = Math.max(0, Number(filament.stockGrams) - consumedWeight);
        
        await supabase.from('filaments')
          .update({ stock_grams: newStock })
          .eq('id', filament.id);
      }
    }

    fetchData(session.user.id);
  };

  const updateSale = async (id: string, s: Partial<Sale>) => {
    if (!session) return;
    const { error } = await supabase.from('sales').update({
      product_id: s.productId, quantity: s.quantity, channel: s.channel,
      status: s.status, custom_price: s.customPrice, printer_id: s.printerId,
      shipping_cost: s.shipping_cost, shipping_paid_by: s.shipping_paid_by,
      date: s.date, customer_name: s.customerName
    }).eq('id', id);
    if (error) showError("Erro ao atualizar venda.");
    else fetchData(session.user.id);
  };

  const deleteSale = async (id: string) => {
    if (!session) return;
    const { error } = await supabase.from('sales').delete().eq('id', id);
    if (error) showError("Erro ao excluir venda.");
    else fetchData(session.user.id);
  };

  const addExpense = async (e: Omit<Expense, 'id'>) => {
    if (!session) return;
    const { error } = await supabase.from('expenses').insert([{
      category: e.category, amount: e.amount, date: e.date,
      description: e.description, is_recurring: e.isRecurring,
      user_id: session.user.id
    }]);
    if (error) showError("Erro ao registrar gasto.");
    else fetchData(session.user.id);
  };

  const updateExpense = async (id: string, e: Partial<Expense>) => {
    if (!session) return;
    const { error } = await supabase.from('expenses').update({
      category: e.category, amount: e.amount, date: e.date,
      description: e.description, is_recurring: e.isRecurring
    }).eq('id', id);
    if (error) showError("Erro ao atualizar gasto.");
    else fetchData(session.user.id);
  };

  const deleteExpense = async (id: string) => {
    if (!session) return;
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) showError("Erro ao excluir gasto.");
    else fetchData(session.user.id);
  };

  const addPrinter = async (p: Omit<Printer, 'id'>) => {
    if (!session) return;
    const { error } = await supabase.from('printers').insert([{
      name: p.name, purchase_price: p.purchasePrice, purchase_date: p.purchaseDate,
      status: p.status, user_id: session.user.id
    }]);
    if (error) showError("Erro ao adicionar impressora.");
    else fetchData(session.user.id);
  };

  const updatePrinter = async (id: string, p: Partial<Printer>) => {
    if (!session) return;
    const { error } = await supabase.from('printers').update({
      name: p.name, purchase_price: p.purchasePrice, purchase_date: p.purchaseDate,
      status: p.status
    }).eq('id', id);
    if (error) showError("Erro ao atualizar impressora.");
    else fetchData(session.user.id);
  };

  const deletePrinter = async (id: string) => {
    if (!session) return;
    const { error } = await supabase.from('printers').delete().eq('id', id);
    if (error) showError("Erro ao excluir impressora.");
    else fetchData(session.user.id);
  };

  const updateSettings = async (s: Partial<Settings>) => {
    if (!session) return;
    
    // Objeto base para o upsert
    const updatePayload: any = {
      id: session.user.id,
      first_name: s.userName, 
      system_name: s.systemName,
      energy_cost_per_hour: s.energyCostPerHour, 
      channel_fees: s.channelFees,
      currency: s.currency, 
      monthly_profit_goal: s.monthlyProfitGoal,
      updated_at: new Date().toISOString()
    };

    // Só inclui avatar_url se ele existir no objeto s
    if (s.avatarUrl) {
      updatePayload.avatar_url = s.avatarUrl;
    }

    const { error } = await supabase.from('profiles').upsert(updatePayload);
    
    if (error) {
      console.error("[AppContext] Erro ao salvar configurações:", error);
      // Se o erro for de coluna inexistente, avisamos o usuário
      if (error.message.includes("avatar_url")) {
        showError("Erro: Você precisa adicionar a coluna 'avatar_url' no SQL do Supabase.");
      } else {
        showError("Erro ao salvar configurações. Verifique sua conexão.");
      }
    } else {
      showSuccess("Configurações salvas!");
      fetchData(session.user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshData = async () => {
    if (session) await fetchData(session.user.id);
  };

  return (
    <AppContext.Provider value={{ 
      products, sales, expenses, printers, filaments, settings, session, loading,
      addProduct, updateProduct, deleteProduct, 
      addSale, updateSale, deleteSale,
      addExpense, updateExpense, deleteExpense,
      addPrinter, updatePrinter, deletePrinter,
      addFilament, updateFilament, deleteFilament, updateSettings,
      calculateProductCost, signOut, refreshData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};