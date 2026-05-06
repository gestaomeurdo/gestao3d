"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { AlertTriangle, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LowStockAlert = () => {
  const { filaments } = useApp();
  const lowStockFilaments = filaments.filter(f => f.stockGrams < 200);

  if (lowStockFilaments.length === 0) return null;

  return (
    <Card className="border-rose-500/20 bg-rose-500/5 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 className="font-bold text-rose-900">Atenção ao Estoque</h4>
            <p className="text-xs text-rose-600 font-medium">Você tem {lowStockFilaments.length} material(is) acabando.</p>
          </div>
        </div>
        <div className="space-y-2">
          {lowStockFilaments.map(f => (
            <div key={f.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-rose-500/10">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-rose-500" />
                <span className="text-xs font-bold text-slate-700">{f.name}</span>
              </div>
              <Badge variant="destructive" className="rounded-lg text-[10px] px-2 h-5">
                {f.stockGrams}g restantes
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LowStockAlert;