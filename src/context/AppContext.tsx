"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type FilamentType = 'PLA' | 'PETG' | 'ABS' | 'Resina' | 'Outro';
export type SaleStatus = 'pago' | 'enviado' | 'entregue';
export type SaleChannel = 'Mercado Livre' | 'Shopee' | 'Direto' | 'Instagram';
export type ExpenseCategory = 'filamento' | 'energia' | 'manutenção' | 'equipamentos' | 'outros';

export interface Product {
  id: string;
  name: string;
  weightGrams: number;
  printTimeMinutes: number;
  filamentType: FilamentType;
  salePrice: number;
}

export interface Sale {
  id: string;
  date: string;
  productId: string;
  quantity: number;
  channel: SaleChannel;
  status: SaleStatus;
  customPrice?: number;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
}

export interface Settings {
  filamentPricePerKg: number;
  energyCostPerHour: number;
  channelFees: Record<SaleChannel, number>;
  currency: string;
}

interface AppContextType {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  settings: Settings;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addSale: (sale: Omit<Sale, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  calculateProductCost: (product: Product) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Vaso Decorativo Low Poly', weightGrams: 150, printTimeMinutes: 480, filamentType: 'PLA', salePrice: 85 },
    { id: '2', name: 'Suporte de Headset', weightGrams: 80, printTimeMinutes: 180, filamentType: 'PETG', salePrice: 45 },
  ]);

  const [sales, setSales] = useState<Sale[]>([
    { id: '1', date: new Date().toISOString(), productId: '1', quantity: 2, channel: 'Mercado Livre', status: 'entregue' },
    { id: '2', date: new Date().toISOString(), productId: '2', quantity: 1, channel: 'Direto', status: 'pago' },
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', category: 'filamento', amount: 120, date: new Date().toISOString(), description: 'Rolo PLA Branco 1kg' },
  ]);

  const [settings, setSettings] = useState<Settings>({
    filamentPricePerKg: 120,
    energyCostPerHour: 0.85,
    channelFees: {
      'Mercado Livre': 16.5,
      'Shopee': 14,
      'Direto': 0,
      'Instagram': 0,
    },
    currency: 'R$',
  });

  const calculateProductCost = (product: Product) => {
    const filamentCost = (product.weightGrams / 1000) * settings.filamentPricePerKg;
    const energyCost = (product.printTimeMinutes / 60) * settings.energyCostPerHour;
    return filamentCost + energyCost;
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts([...products, { ...product, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updated } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const addSale = (sale: Omit<Sale, 'id'>) => {
    setSales([...sales, { ...sale, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    setExpenses([...expenses, { ...expense, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  return (
    <AppContext.Provider value={{ 
      products, sales, expenses, settings, 
      addProduct, updateProduct, deleteProduct, 
      addSale, addExpense, updateSettings,
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