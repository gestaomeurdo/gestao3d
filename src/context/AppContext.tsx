"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type FilamentType = 'PLA' | 'PETG' | 'ABS' | 'Resina' | 'Outro';
export type SaleStatus = 'pago' | 'enviado' | 'entregue';
export type SaleChannel = 'Mercado Livre' | 'Shopee' | 'Direto' | 'Instagram';
export type ExpenseCategory = 'filamento' | 'energia' | 'manutenção' | 'equipamentos' | 'marketing' | 'outros';
export type ShippingPaidBy = 'cliente' | 'vendedor' | 'isento';

export interface Filament {
  id: string;
  name: string;
  type: FilamentType;
  pricePerKg: number;
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
}

interface AppContextType {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  printers: Printer[];
  filaments: Filament[];
  settings: Settings;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addSale: (sale: Omit<Sale, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  addPrinter: (printer: Omit<Printer, 'id'>) => void;
  deletePrinter: (id: string) => void;
  addFilament: (filament: Omit<Filament, 'id'>) => void;
  deleteFilament: (id: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  calculateProductCost: (product: Product) => number;
  importAllData: (data: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filaments, setFilaments] = useState<Filament[]>(() => {
    const saved = localStorage.getItem('printsaas_filaments');
    return saved ? JSON.parse(saved) : [
      { id: 'f1', name: 'PLA Básico', type: 'PLA', pricePerKg: 120 }
    ];
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('printsaas_products');
    return saved ? JSON.parse(saved) : [];
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('printsaas_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('printsaas_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [printers, setPrinters] = useState<Printer[]>(() => {
    const saved = localStorage.getItem('printsaas_printers');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Bambu Lab A1 Mini', purchasePrice: 2500, purchaseDate: '2024-01-01', status: 'disponível' },
    ];
  });

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('printsaas_settings');
    return saved ? JSON.parse(saved) : {
      userName: 'Oliver',
      systemName: 'PrintSaaS',
      energyCostPerHour: 0.85,
      channelFees: { 'Mercado Livre': 16.5, 'Shopee': 14, 'Direto': 0, 'Instagram': 0 },
      currency: 'R$',
    };
  });

  useEffect(() => {
    localStorage.setItem('printsaas_filaments', JSON.stringify(filaments));
    localStorage.setItem('printsaas_products', JSON.stringify(products));
    localStorage.setItem('printsaas_sales', JSON.stringify(sales));
    localStorage.setItem('printsaas_expenses', JSON.stringify(expenses));
    localStorage.setItem('printsaas_printers', JSON.stringify(printers));
    localStorage.setItem('printsaas_settings', JSON.stringify(settings));
  }, [filaments, products, sales, expenses, printers, settings]);

  const calculateProductCost = (product: Product) => {
    const filament = filaments.find(f => f.id === product.filamentId);
    const filamentPrice = filament ? filament.pricePerKg : 120;
    const filamentCost = (product.weightGrams / 1000) * filamentPrice;
    const energyCost = (product.printTimeMinutes / 60) * settings.energyCostPerHour;
    return filamentCost + energyCost + (product.additionalCost || 0);
  };

  const addFilament = (filament: Omit<Filament, 'id'>) => setFilaments([...filaments, { ...filament, id: Math.random().toString(36).substr(2, 9) }]);
  const deleteFilament = (id: string) => setFilaments(filaments.filter(f => f.id !== id));

  const addProduct = (product: Omit<Product, 'id'>) => setProducts([...products, { ...product, id: Math.random().toString(36).substr(2, 9) }]);
  const updateProduct = (id: string, updated: Partial<Product>) => setProducts(products.map(p => p.id === id ? { ...p, ...updated } : p));
  const deleteProduct = (id: string) => setProducts(products.filter(p => p.id !== id));
  
  const addSale = (sale: Omit<Sale, 'id'>) => setSales([...sales, { ...sale, id: Math.random().toString(36).substr(2, 9) }]);
  
  const addExpense = (expense: Omit<Expense, 'id'>) => setExpenses([...expenses, { ...expense, id: Math.random().toString(36).substr(2, 9) }]);
  const deleteExpense = (id: string) => setExpenses(expenses.filter(e => e.id !== id));
  
  const addPrinter = (printer: Omit<Printer, 'id'>) => setPrinters([...printers, { ...printer, id: Math.random().toString(36).substr(2, 9) }]);
  const deletePrinter = (id: string) => setPrinters(printers.filter(p => p.id !== id));

  const updateSettings = (newSettings: Partial<Settings>) => setSettings({ ...settings, ...newSettings });

  const importAllData = (data: any) => {
    if (data.filaments) setFilaments(data.filaments);
    if (data.products) setProducts(data.products);
    if (data.sales) setSales(data.sales);
    if (data.expenses) setExpenses(data.expenses);
    if (data.printers) setPrinters(data.printers);
    if (data.settings) setSettings(data.settings);
  };

  return (
    <AppContext.Provider value={{ 
      products, sales, expenses, printers, filaments, settings, 
      addProduct, updateProduct, deleteProduct, 
      addSale, addExpense, deleteExpense, addPrinter, deletePrinter,
      addFilament, deleteFilament, updateSettings,
      calculateProductCost, importAllData
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