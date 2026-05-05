"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type FilamentType = 'PLA' | 'PETG' | 'ABS' | 'Resina' | 'Outro';
export type SaleStatus = 'pago' | 'enviado' | 'entregue';
export type SaleChannel = 'Mercado Livre' | 'Shopee' | 'Direto' | 'Instagram';
export type ExpenseCategory = 'filamento' | 'energia' | 'manutenção' | 'equipamentos' | 'outros';

export interface Product {
  id: string;
  name: string;
  category?: string;
  weightGrams: number;
  printTimeMinutes: number;
  filamentType: FilamentType;
  color?: string;
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
  printerId?: string; // Vínculo com a impressora
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
}

export interface Printer {
  id: string;
  name: string;
  purchasePrice: number;
  purchaseDate: string;
  status: 'disponível' | 'imprimindo' | 'manutenção';
}

export interface PrintJob {
  id: string;
  printerId: string;
  productId: string;
  startTime: string;
  durationMinutes: number;
  status: 'concluído' | 'falhou';
}

export interface Settings {
  userName: string;
  systemName: string;
  filamentPricePerKg: number;
  energyCostPerHour: number;
  channelFees: Record<SaleChannel, number>;
  currency: string;
}

interface AppContextType {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  printers: Printer[];
  printJobs: PrintJob[];
  settings: Settings;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addSale: (sale: Omit<Sale, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addPrinter: (printer: Omit<Printer, 'id'>) => void;
  updatePrinterStatus: (id: string, status: Printer['status']) => void;
  deletePrinter: (id: string) => void;
  addPrintJob: (job: Omit<PrintJob, 'id'>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  calculateProductCost: (product: Product) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const [printJobs, setPrintJobs] = useState<PrintJob[]>(() => {
    const saved = localStorage.getItem('printsaas_jobs');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('printsaas_settings');
    return saved ? JSON.parse(saved) : {
      userName: 'Oliver',
      systemName: 'PrintSaaS',
      filamentPricePerKg: 120,
      energyCostPerHour: 0.85,
      channelFees: { 'Mercado Livre': 16.5, 'Shopee': 14, 'Direto': 0, 'Instagram': 0 },
      currency: 'R$',
    };
  });

  useEffect(() => {
    localStorage.setItem('printsaas_products', JSON.stringify(products));
    localStorage.setItem('printsaas_sales', JSON.stringify(sales));
    localStorage.setItem('printsaas_expenses', JSON.stringify(expenses));
    localStorage.setItem('printsaas_printers', JSON.stringify(printers));
    localStorage.setItem('printsaas_jobs', JSON.stringify(printJobs));
    localStorage.setItem('printsaas_settings', JSON.stringify(settings));
  }, [products, sales, expenses, printers, printJobs, settings]);

  const calculateProductCost = (product: Product) => {
    const filamentCost = (product.weightGrams / 1000) * settings.filamentPricePerKg;
    const energyCost = (product.printTimeMinutes / 60) * settings.energyCostPerHour;
    return filamentCost + energyCost + (product.additionalCost || 0);
  };

  const addProduct = (product: Omit<Product, 'id'>) => setProducts([...products, { ...product, id: Math.random().toString(36).substr(2, 9) }]);
  const updateProduct = (id: string, updated: Partial<Product>) => setProducts(products.map(p => p.id === id ? { ...p, ...updated } : p));
  const deleteProduct = (id: string) => setProducts(products.filter(p => p.id !== id));
  
  const addSale = (sale: Omit<Sale, 'id'>) => setSales([...sales, { ...sale, id: Math.random().toString(36).substr(2, 9) }]);
  const addExpense = (expense: Omit<Expense, 'id'>) => setExpenses([...expenses, { ...expense, id: Math.random().toString(36).substr(2, 9) }]);
  
  const addPrinter = (printer: Omit<Printer, 'id'>) => setPrinters([...printers, { ...printer, id: Math.random().toString(36).substr(2, 9) }]);
  const updatePrinterStatus = (id: string, status: Printer['status']) => setPrinters(printers.map(p => p.id === id ? { ...p, status } : p));
  const deletePrinter = (id: string) => setPrinters(printers.filter(p => p.id !== id));

  const addPrintJob = (job: Omit<PrintJob, 'id'>) => setPrintJobs([...printJobs, { ...job, id: Math.random().toString(36).substr(2, 9) }]);

  const updateSettings = (newSettings: Partial<Settings>) => setSettings({ ...settings, ...newSettings });

  return (
    <AppContext.Provider value={{ 
      products, sales, expenses, printers, printJobs, settings, 
      addProduct, updateProduct, deleteProduct, 
      addSale, addExpense, addPrinter, updatePrinterStatus, deletePrinter, addPrintJob, updateSettings,
      calculateProductCost
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