import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/useCurrency";
import { countries } from "@/data/countries";
import { useTranslation } from "react-i18next";
import { applyRtlDirection } from "@/i18n";

// Language definitions
const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
];

export const DeliverToModal = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) => {
  const { i18n } = useTranslation();
  const {
    countryCode,
    zipCode,
    setCountry,
    setZipCode,
    currency,
    availableCurrencies,
    setCurrency,
    getCountryFlag,
  } = useCurrency();

  const [country, setCountryLocal] = useState(countryCode);
  const [zip, setZip] = useState(zipCode);
  const [selectedLang, setSelectedLang] = useState(() => {
    const stored = localStorage.getItem('userLanguage');
    if (stored) {
      try {
        return JSON.parse(stored).code || 'en';
      } catch {
        return 'en';
      }
    }
    return i18n.language || 'en';
  });
  const [selectedCurrency, setSelectedCurrencyLocal] = useState(currency.code);

  useEffect(() => {
    setCountryLocal(countryCode);
  }, [countryCode]);

  useEffect(() => {
    setZip(zipCode);
  }, [zipCode]);

  useEffect(() => {
    setSelectedCurrencyLocal(currency.code);
  }, [currency.code]);

  const saveLocation = () => {
    // Update country (also updates currency via useCurrency hook)
    setCountry(country);
    setZipCode(zip);

    // Override currency if user explicitly selected a different one
    const chosenCurrency = availableCurrencies.find(c => c.code === selectedCurrency);
    if (chosenCurrency && chosenCurrency.code !== currency.code) {
      setCurrency(chosenCurrency);
    }

    // Update language globally
    const lang = languages.find(l => l.code === selectedLang);
    if (lang) {
      localStorage.setItem('userLanguage', JSON.stringify(lang));
      i18n.changeLanguage(lang.code);
      applyRtlDirection(lang.code);
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Deliver To & Preferences</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Country */}
          <div>
            <label className="text-sm font-medium text-foreground">Country / Region</label>
            <select
              value={country}
              onChange={(e) => setCountryLocal(e.target.value)}
              className="w-full border border-input bg-background rounded-md px-3 py-2 mt-1 text-foreground focus:ring-2 focus:ring-primary"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* ZIP Code */}
          <div>
            <label className="text-sm font-medium text-foreground">ZIP / Postal Code</label>
            <input
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="w-full border border-input bg-background rounded-md px-3 py-2 mt-1 text-foreground focus:ring-2 focus:ring-primary"
              placeholder="Enter ZIP or postal code"
            />
          </div>

          {/* Currency - Separate field */}
          <div>
            <label className="text-sm font-medium text-foreground">Currency</label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrencyLocal(e.target.value)}
              className="w-full border border-input bg-background rounded-md px-3 py-2 mt-1 text-foreground focus:ring-2 focus:ring-primary"
            >
              {availableCurrencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Language - Separate field */}
          <div>
            <label className="text-sm font-medium text-foreground">Language</label>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="w-full border border-input bg-background rounded-md px-3 py-2 mt-1 text-foreground focus:ring-2 focus:ring-primary"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveLocation} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Save Preferences
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
