import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { countries, getCountryByCode } from '@/data/countries';
import { supabase } from '@/integrations/supabase/client';

const countryCurrencyMap: Record<string, { code: string; symbol: string; name: string }> = {
  US: { code: 'USD', symbol: '$', name: 'US Dollar' },
  GB: { code: 'GBP', symbol: '£', name: 'British Pound' },
  EU: { code: 'EUR', symbol: '€', name: 'Euro' },
  DE: { code: 'EUR', symbol: '€', name: 'Euro' },
  FR: { code: 'EUR', symbol: '€', name: 'Euro' },
  IT: { code: 'EUR', symbol: '€', name: 'Euro' },
  ES: { code: 'EUR', symbol: '€', name: 'Euro' },
  NL: { code: 'EUR', symbol: '€', name: 'Euro' },
  BE: { code: 'EUR', symbol: '€', name: 'Euro' },
  AT: { code: 'EUR', symbol: '€', name: 'Euro' },
  PT: { code: 'EUR', symbol: '€', name: 'Euro' },
  IE: { code: 'EUR', symbol: '€', name: 'Euro' },
  FI: { code: 'EUR', symbol: '€', name: 'Euro' },
  GR: { code: 'EUR', symbol: '€', name: 'Euro' },
  JP: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  CN: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  IN: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  AU: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  CA: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  CH: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  HK: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  SG: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  KR: { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  MX: { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  BR: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  RU: { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  ZA: { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  AE: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  SA: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  MY: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  TH: { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  ID: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  PH: { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  VN: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  PK: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  BD: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  NG: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  EG: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  KE: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  GH: { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  TZ: { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  UG: { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  PL: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  CZ: { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  HU: { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  RO: { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
  TR: { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  IL: { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  NZ: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  SE: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  NO: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  DK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  AR: { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  CL: { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
  CO: { code: 'COP', symbol: '$', name: 'Colombian Peso' },
  PE: { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },
  UA: { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
};

// Fallback rates if API fetch fails
const defaultExchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CNY: 7.24,
  INR: 83.12,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  HKD: 7.82,
  SGD: 1.34,
  KRW: 1320,
  MXN: 17.15,
  BRL: 4.97,
  RUB: 92.50,
  ZAR: 18.65,
  AED: 3.67,
  SAR: 3.75,
  MYR: 4.72,
  THB: 35.50,
  IDR: 15650,
  PHP: 56.20,
  VND: 24500,
  PKR: 278,
  BDT: 110,
  NGN: 1550,
  EGP: 30.90,
  KES: 153,
  GHS: 12.50,
  TZS: 2510,
  UGX: 3780,
  PLN: 4.02,
  CZK: 22.80,
  HUF: 358,
  RON: 4.58,
  TRY: 32.50,
  ILS: 3.72,
  NZD: 1.64,
  SEK: 10.45,
  NOK: 10.65,
  DKK: 6.88,
  ARS: 870,
  CLP: 890,
  COP: 3950,
  PEN: 3.72,
  UAH: 37.50,
};

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

interface CurrencyContextType {
  currency: Currency;
  countryCode: string;
  zipCode: string;
  setCurrency: (currency: Currency) => void;
  setCountryCode: (code: string) => void;
  setCountry: (code: string) => void;
  setZipCode: (zip: string) => void;
  convertFromUSD: (amountUSD: number) => number;
  formatPrice: (amountUSD: number, showConversion?: boolean) => string;
  formatPriceOnly: (amountUSD: number) => string;
  getCountryFlag: (code: string) => string;
  availableCurrencies: Currency[];
  ratesLastUpdated: Date | null;
  isLoadingRates: boolean;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const defaultCurrency: Currency = { code: 'USD', symbol: '$', name: 'US Dollar' };

// Cache key for localStorage
const RATES_CACHE_KEY = 'exchangeRates';
const RATES_TIMESTAMP_KEY = 'exchangeRatesTimestamp';

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>(() => {
    const stored = localStorage.getItem('userCurrency');
    return stored ? JSON.parse(stored) : defaultCurrency;
  });

  const [countryCode, setCountryCode] = useState<string>(() => {
    return localStorage.getItem('userCountryCode') || 'US';
  });

  const [zipCode, setZipCode] = useState<string>(() => {
    return localStorage.getItem('userZipCode') || '';
  });

  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(() => {
    const cached = localStorage.getItem(RATES_CACHE_KEY);
    return cached ? JSON.parse(cached) : defaultExchangeRates;
  });

  const [ratesLastUpdated, setRatesLastUpdated] = useState<Date | null>(() => {
    const timestamp = localStorage.getItem(RATES_TIMESTAMP_KEY);
    return timestamp ? new Date(timestamp) : null;
  });

  const [isLoadingRates, setIsLoadingRates] = useState(false);

  // Fetch real exchange rates from edge function or database
  const fetchExchangeRates = useCallback(async () => {
    setIsLoadingRates(true);
    
    try {
      // First try to get cached rates from database (faster)
      const { data: cachedRates, error: dbError } = await supabase
        .from('site_settings')
        .select('value, updated_at')
        .eq('key', 'exchange_rates')
        .single();

      if (cachedRates && !dbError) {
        const rates = cachedRates.value as Record<string, number>;
        setExchangeRates(rates);
        setRatesLastUpdated(new Date(cachedRates.updated_at));
        localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(rates));
        localStorage.setItem(RATES_TIMESTAMP_KEY, cachedRates.updated_at);
        console.log('Loaded exchange rates from database cache');
        setIsLoadingRates(false);
        return;
      }

      // If no cached rates, call the edge function to fetch fresh rates
      const { data, error } = await supabase.functions.invoke('get-exchange-rates');

      if (!error && data?.rates) {
        setExchangeRates(data.rates);
        const updatedAt = new Date(data.updated_at || Date.now());
        setRatesLastUpdated(updatedAt);
        localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(data.rates));
        localStorage.setItem(RATES_TIMESTAMP_KEY, updatedAt.toISOString());
        console.log('Fetched fresh exchange rates');
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      // Keep using cached/default rates
    } finally {
      setIsLoadingRates(false);
    }
  }, []);

  // Fetch rates on mount and every hour
  useEffect(() => {
    const cachedTimestamp = localStorage.getItem(RATES_TIMESTAMP_KEY);
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    // Fetch if no cached rates or cache is older than 1 hour
    if (!cachedTimestamp || new Date(cachedTimestamp).getTime() < oneHourAgo) {
      fetchExchangeRates();
    }

    // Refresh rates every hour
    const intervalId = setInterval(fetchExchangeRates, 60 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [fetchExchangeRates]);

  useEffect(() => {
    localStorage.setItem('userCurrency', JSON.stringify(currency));
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('userCountryCode', countryCode);
  }, [countryCode]);

  useEffect(() => {
    localStorage.setItem('userZipCode', zipCode);
  }, [zipCode]);

  // Update country + currency together
  const setCountry = (code: string) => {
    const countryCurrency = countryCurrencyMap[code] || defaultCurrency;
    setCountryCode(code);
    setCurrency(countryCurrency);
  };

  const convertFromUSD = (amountUSD: number): number => {
    const rate = exchangeRates[currency.code] || 1;
    return amountUSD * rate;
  };

  const formatPrice = (amountUSD: number, showConversion: boolean = true): string => {
    if (currency.code === 'USD') {
      return `$${amountUSD.toFixed(2)}`;
    }

    const convertedAmount = convertFromUSD(amountUSD);
    const formattedConverted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertedAmount);

    if (showConversion) {
      return `${currency.symbol}${formattedConverted} (~$${amountUSD.toFixed(2)} USD)`;
    }

    return `${currency.symbol}${formattedConverted}`;
  };

  const formatPriceOnly = (amountUSD: number): string => {
    if (currency.code === 'USD') {
      return `$${amountUSD.toFixed(2)}`;
    }

    const convertedAmount = convertFromUSD(amountUSD);
    return `${currency.symbol}${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertedAmount)}`;
  };

  const getCountryFlag = (code: string): string => {
    const country = getCountryByCode(code);
    return country?.flag || '🌍';
  };

  const availableCurrencies: Currency[] = Array.from(
    new Map(Object.values(countryCurrencyMap).map(c => [c.code, c])).values()
  );

  const refreshRates = async () => {
    await fetchExchangeRates();
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      countryCode,
      zipCode,
      setCurrency,
      setCountryCode,
      setCountry,
      setZipCode,
      convertFromUSD,
      formatPrice,
      formatPriceOnly,
      getCountryFlag,
      availableCurrencies,
      ratesLastUpdated,
      isLoadingRates,
      refreshRates,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
