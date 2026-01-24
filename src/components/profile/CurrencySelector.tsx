import { useState } from 'react';
import { useCurrency, Currency } from '@/hooks/useCurrency';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ChevronRight, Search, Check, DollarSign } from 'lucide-react';

export function CurrencySelector() {
  const { currency, setCurrency, availableCurrencies } = useCurrency();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredCurrencies = availableCurrencies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (selectedCurrency: Currency) => {
    setCurrency(selectedCurrency);
    setOpen(false);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-muted/50 transition-colors text-left">
          <div className="flex items-center gap-4">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Currency</p>
              <p className="text-xs text-muted-foreground">
                {currency.name} ({currency.symbol})
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Select Currency</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search currencies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="p-2">
            {filteredCurrencies.map((c) => (
              <button
                key={c.code}
                onClick={() => handleSelect(c)}
                className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg">{c.symbol}</span>
                  <div className="text-left">
                    <p className="text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.code}</p>
                  </div>
                </div>
                {c.code === currency.code && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
