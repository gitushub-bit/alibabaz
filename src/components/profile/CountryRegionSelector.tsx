import { useState } from 'react';
import { countries, Country } from '@/data/countries';
import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ChevronRight, Search, Check } from 'lucide-react';

interface CountryRegionSelectorProps {
  onCountryChange?: (country: Country) => void;
}

export function CountryRegionSelector({ onCountryChange }: CountryRegionSelectorProps) {
  const { countryCode, setCountryCode, currency, getCountryFlag } = useCurrency();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedCountry = countries.find(c => c.code === countryCode);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (country: Country) => {
    setCountryCode(country.code);
    onCountryChange?.(country);
    setOpen(false);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-muted/50 transition-colors text-left">
          <div className="flex items-center gap-4">
            <span className="text-2xl">{getCountryFlag(countryCode)}</span>
            <div>
              <p className="text-sm font-medium">{selectedCountry?.name || 'Select Country'}</p>
              <p className="text-xs text-muted-foreground">
                {currency.code} ({currency.symbol}) • English
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Country/Region</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="p-2">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                onClick={() => handleSelect(country)}
                className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{country.flag}</span>
                  <span className="text-sm">{country.name}</span>
                </div>
                {country.code === countryCode && (
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
