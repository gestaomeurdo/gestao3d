"use client";

import React, { useState, useMemo } from 'react';
import { useApp, Printer, PrintJob } from '@/context/AppContext';
import { 
  Plus, Printer as PrinterIcon, Trash2, Clock, 
  TrendingUp, AlertTriangle, CheckCircle2, 
  History, Zap, DollarSign, Play, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { showSuccess } from '@/utils/toast';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

const Printers = () => {
  const { printers, products, sales, printJobs, addPrinter, deletePrinter, addPrintJob, updatePrinterStatus, settings, calculateProductCost } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [selectedPrinterId, setSelectedPrinterId] = useState<string | null>(null);

  const [newPrinter, setNewPrinter] = useState<Omit<Printer, 'id'>>({
    name: '',
    purchasePrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    status: 'disponível'
  });

  const [newJob, setNewJob] = useState({
    productId: '',
    status: 'concluído' as const
  });

  const handleAddPrinter = () => {
    if (!newPrinter.name) return;
    addPrinter(newPrinter);
    setIsAddDialogOpen(false);
    setNewPrinter({ name: '', purchasePrice: 0, purchaseDate: new Date().toISOString().split('T')[0], status: 'disponível' });
    showSuccess('Impressora adicionada!');
  };

  const handleRegisterPrint = () => {
    if (!selectedPrinterId || !newJob.productId) return;
    const product = products.find(p => p.id === newJob.productId);
    if (!product) return;

    addPrintJob({
      printerId: selectedPrinterId,
      productId: newJob.productId,
      startTime: new Date().toISOString(),
      durationMinutes: product.printTimeMinutes,
      status: newJob.status
    });

    setIsJobDialogOpen(false);
    showSuccess('Impressão registrada no histórico!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Gestão de Máquinas</h1>
          <p className="text-muted-foreground mt-2">Monitore a produtividade e o retorno de cada equipamento.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 shadow-lg shadow-blue-500/20">
              <Plus className="mr-2 h-5 w-5" /> Nova Impressora
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50 sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Adicionar Equipamento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Modelo / Nome</Label>
                <Input 
                  placeholder="Ex: Bambu Lab P1S"
                  className="bg-secondary/50 border-border/50" 
                  value={newPrinter.name}
                  onChange={e => setNewPrinter({...newPrinter, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Preço de Compra</Label>
                  <Input 
                    type="number" 
                    className="bg-secondary/50 border-border/50" 
                    value={newPrinter.purchasePrice}
                    onChange={e => setNewPrinter({...newPrinter, purchasePrice: Number(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Data da Compra</Label>
                  <Input 
                    type="date" 
                    className="bg-secondary/50 border-border/50" 
                    value={newPrinter.purchaseDate}
                    onChange={e => setNewPrinter({...newPrinter, purchaseDate: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAddPrinter}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* LISTAGEM DE IMPRESSORAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {printers.map((printer) => {
          // Cálculos por impressora
          const printerJobs = printJobs.filter(j => j.printerId === printer.id);
          const jobsToday = printerJobs.filter(j => isToday(new Date(j.startTime)));
          const timeTodayMinutes = jobsToday.reduce((acc, j) => acc + j.durationMinutes, 0);
          const efficiency = Math.min((timeTodayMinutes / (24 * 60)) * 100, 100);
          
          const printerSales = sales.filter(s => s.printerId === printer.id);
          const profitGenerated = printerSales.reduce((acc, s) => {
            const product = products.find(p => p.id === s.productId);
            if (!product) return acc;
            const cost = calculateProductCost(product);
            const fee = (settings.channelFees[s.channel] / 100) * (s.customPrice || product.salePrice);
            return acc + ((s.customPrice || product.salePrice) - cost - fee) * s.quantity;
          }, 0);

          return (
            <Card key={printer.id} className="glass-card group hover:border-primary/30 transition-all duration-300 overflow-hidden rounded-3xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner",
                      printer.status === 'imprimindo' ? "bg-primary/10 text-primary" : 
                      printer.status === 'manutenção' ? "bg-rose-500/10 text-rose-500" : "bg-zinc-500/10 text-zinc-500"
                    )}>
                      <PrinterIcon size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{printer.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={cn(
                          "capitalize border-none rounded-lg text-[10px] font-bold",
                          printer.status === 'imprimindo' ? "bg-primary text-white" : 
                          printer.status === 'manutenção' ? "bg-rose-500 text-white" : "bg-zinc-500 text-white"
                        )}>
                          {printer.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Desde {format(new Date(printer.purchaseDate), 'MM/yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={isJobDialogOpen && selectedPrinterId === printer.id} onOpenChange={(open) => {
                      setIsJobDialogOpen(open);
                      if (open) setSelectedPrinterId(printer.id);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-xl border-border/50 hover:bg-primary/10 hover:text-primary">
                          <Play size={16} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-card border-border/50">
                        <DialogHeader>
                          <DialogTitle>Registrar Trabalho de Impressão</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label>Produto Impresso</Label>
                            <Select onValueChange={(v) => setNewJob({...newJob, productId: v})}>
                              <SelectTrigger className="bg-secondary/50 border-border/50">
                                <SelectValue placeholder="Selecione o produto" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map(p => (
                                  <SelectItem key={p.id} value={p.id}>{p.name} ({Math.floor(p.printTimeMinutes/60)}h {p.printTimeMinutes%60}m)</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="ghost" onClick={() => setIsJobDialogOpen(false)}>Cancelar</Button>
                          <Button className="bg-primary text-white" onClick={handleRegisterPrint}>Registrar</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-rose-500" onClick={() => deletePrinter(printer.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-secondary/30 border border-border/50">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Uso Hoje</p>
                    <p className="text-lg font-bold mt-1">{Math.floor(timeTodayMinutes / 60)}h {timeTodayMinutes % 60}m</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-secondary/30 border border-border/50">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Eficiência</p>
                    <p className="text-lg font-bold mt-1">{efficiency.toFixed(1)}%</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Lucro Total</p>
                    <p className="text-lg font-bold text-emerald-500 mt-1">{settings.currency} {profitGenerated.toFixed(2)}</p>
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                    <span>Produtividade Diária</span>
                    <span className={cn(efficiency > 70 ? "text-emerald-500" : efficiency > 30 ? "text-orange-500" : "text-rose-500")}>
                      {efficiency > 70 ? 'Excelente' : efficiency > 30 ? 'Moderada' : 'Baixa'}
                    </span>
                  </div>
                  <Progress value={efficiency} className="h-2" />
                </div>

                {/* ALERTAS INTELIGENTES */}
                {efficiency < 20 && printer.status === 'disponível' && (
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-3 mb-6">
                    <AlertTriangle className="text-orange-500 shrink-0" size={18} />
                    <p className="text-xs text-orange-500 font-medium">
                      Esta impressora está <strong>subutilizada</strong> hoje. Considere iniciar uma nova fila de produção.
                    </p>
                  </div>
                )}

                {/* HISTÓRICO RÁPIDO */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <History size={14} /> Últimos Trabalhos
                  </h4>
                  <div className="space-y-2">
                    {printerJobs.slice(-3).reverse().map((job) => {
                      const product = products.find(p => p.id === job.productId);
                      return (
                        <div key={job.id} className="flex items-center justify-between p-3 bg-background/50 rounded-xl border border-border/50 text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="font-bold">{product?.name || 'Produto Removido'}</span>
                          </div>
                          <span className="text-muted-foreground">{format(new Date(job.startTime), 'dd/MM HH:mm')}</span>
                        </div>
                      );
                    })}
                    {printerJobs.length === 0 && (
                      <p className="text-xs text-muted-foreground italic text-center py-2">Nenhum trabalho registrado ainda.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Printers;