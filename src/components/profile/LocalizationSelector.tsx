import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { countries, Country } from '@/data/countries';
import { useCurrency, Currency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ChevronRight, Search, Check, Globe, Flag, Coins } from 'lucide-react';

// Language definitions
interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
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
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
];

// Map browser language codes to our language codes
const browserLangMap: Record<string, string> = {
  'en': 'en', 'en-US': 'en', 'en-GB': 'en',
  'zh': 'zh', 'zh-CN': 'zh', 'zh-TW': 'zh',
  'es': 'es', 'es-ES': 'es', 'es-MX': 'es',
  'fr': 'fr', 'fr-FR': 'fr', 'fr-CA': 'fr',
  'ar': 'ar', 'ar-SA': 'ar',
  'pt': 'pt', 'pt-BR': 'pt', 'pt-PT': 'pt',
  'ru': 'ru', 'ru-RU': 'ru',
  'de': 'de', 'de-DE': 'de',
  'ja': 'ja', 'ja-JP': 'ja',
  'ko': 'ko', 'ko-KR': 'ko',
  'it': 'it', 'it-IT': 'it',
  'nl': 'nl', 'nl-NL': 'nl',
  'tr': 'tr', 'tr-TR': 'tr',
  'th': 'th', 'th-TH': 'th',
  'vi': 'vi', 'vi-VN': 'vi',
  'id': 'id', 'id-ID': 'id',
  'ms': 'ms', 'ms-MY': 'ms',
  'hi': 'hi', 'hi-IN': 'hi',
  'bn': 'bn', 'bn-BD': 'bn',
  'pl': 'pl', 'pl-PL': 'pl',
  'sw': 'sw', 'sw-KE': 'sw',
};

// Map browser locale to country codes
const localeCountryMap: Record<string, string> = {
  'en-US': 'US', 'en-GB': 'GB', 'en-AU': 'AU', 'en-CA': 'CA', 'en-NZ': 'NZ', 'en-IN': 'IN', 'en-KE': 'KE', 'en-NG': 'NG',
  'zh-CN': 'CN', 'zh-TW': 'TW', 'zh-HK': 'HK',
  'es-ES': 'ES', 'es-MX': 'MX', 'es-AR': 'AR', 'es-CO': 'CO',
  'fr-FR': 'FR', 'fr-CA': 'CA', 'fr-BE': 'BE',
  'ar-SA': 'SA', 'ar-AE': 'AE', 'ar-EG': 'EG',
  'pt-BR': 'BR', 'pt-PT': 'PT',
  'ru-RU': 'RU',
  'de-DE': 'DE', 'de-AT': 'AT', 'de-CH': 'CH',
  'ja-JP': 'JP',
  'ko-KR': 'KR',
  'it-IT': 'IT',
  'nl-NL': 'NL', 'nl-BE': 'BE',
  'tr-TR': 'TR',
  'th-TH': 'TH',
  'vi-VN': 'VN',
  'id-ID': 'ID',
  'ms-MY': 'MY',
  'hi-IN': 'IN',
  'bn-BD': 'BD',
  'pl-PL': 'PL',
  'sw-KE': 'KE', 'sw-TZ': 'TZ',
};

interface LocalizationSelectorProps {
  onCountryChange?: (country: Country) => void;
  compact?: boolean;
}

export function LocalizationSelector({ onCountryChange, compact = false }: LocalizationSelectorProps) {
  const { t, i18n } = useTranslation();
  const { countryCode, setCountryCode, currency, setCurrency, availableCurrencies, getCountryFlag } = useCurrency();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('country');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('userLanguage');
    return stored ? JSON.parse(stored) : languages[0];
  });

  const selectedCountry = countries.find(c => c.code === countryCode);

  // Auto-detection on first load
  useEffect(() => {
    const hasDetected = localStorage.getItem('localizationAutoDetected');
    if (hasDetected) return;

    // Auto-detect from browser
    autoDetectLocalization();
  }, []);

  const autoDetectLocalization = () => {
    try {
      // Get browser language
      const browserLang = navigator.language || (navigator as any).userLanguage || 'en-US';
      
      // Detect language
      const langCode = browserLangMap[browserLang] || browserLangMap[browserLang.split('-')[0]] || 'en';
      const detectedLang = languages.find(l => l.code === langCode) || languages[0];
      setSelectedLanguage(detectedLang);
      localStorage.setItem('userLanguage', JSON.stringify(detectedLang));
      i18n.changeLanguage(detectedLang.code);

      // Detect country from locale
      let detectedCountryCode = localeCountryMap[browserLang] || 'US';
      
      // Try to get more accurate location from timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const tzCountryCode = getCountryFromTimezone(timezone);
      if (tzCountryCode) {
        detectedCountryCode = tzCountryCode;
      }

      // Set country (this will auto-set currency via useCurrency hook)
      if (countries.find(c => c.code === detectedCountryCode)) {
        setCountryCode(detectedCountryCode);
        const country = countries.find(c => c.code === detectedCountryCode);
        if (country) {
          onCountryChange?.(country);
        }
      }

      localStorage.setItem('localizationAutoDetected', 'true');
    } catch (error) {
      console.error('Auto-detection failed, using defaults:', error);
      setCountryCode('US');
      setSelectedLanguage(languages[0]);
      localStorage.setItem('localizationAutoDetected', 'true');
    }
  };

  // Get country from timezone (approximate)
  const getCountryFromTimezone = (tz: string): string | null => {
    const tzMap: Record<string, string> = {
      'America/New_York': 'US', 'America/Los_Angeles': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
      'Europe/London': 'GB', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE', 'Europe/Rome': 'IT', 'Europe/Madrid': 'ES',
      'Asia/Tokyo': 'JP', 'Asia/Shanghai': 'CN', 'Asia/Hong_Kong': 'HK', 'Asia/Seoul': 'KR', 'Asia/Singapore': 'SG',
      'Asia/Dubai': 'AE', 'Asia/Kolkata': 'IN', 'Asia/Jakarta': 'ID', 'Asia/Bangkok': 'TH', 'Asia/Manila': 'PH',
      'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Pacific/Auckland': 'NZ',
      'Africa/Lagos': 'NG', 'Africa/Nairobi': 'KE', 'Africa/Cairo': 'EG', 'Africa/Johannesburg': 'ZA',
      'America/Sao_Paulo': 'BR', 'America/Mexico_City': 'MX', 'America/Buenos_Aires': 'AR',
      'Europe/Moscow': 'RU', 'Europe/Istanbul': 'TR', 'Europe/Warsaw': 'PL',
      'Asia/Karachi': 'PK', 'Asia/Dhaka': 'BD', 'Asia/Kuala_Lumpur': 'MY', 'Asia/Ho_Chi_Minh': 'VN',
    };
    return tzMap[tz] || null;
  };

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.code.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCurrencies = availableCurrencies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(search.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(search.toLowerCase())
  );

  const handleCountrySelect = (country: Country) => {
    setCountryCode(country.code);
    onCountryChange?.(country);
  };

  const handleCurrencySelect = (selectedCurrency: Currency) => {
    setCurrency(selectedCurrency);
  };

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    localStorage.setItem('userLanguage', JSON.stringify(language));
    i18n.changeLanguage(language.code);
  };

  if (compact) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="flex items-center gap-1 text-sm hover:text-foreground transition-colors">
            <span className="text-lg">{getCountryFlag(countryCode)}</span>
            <span className="hidden md:inline">{countryCode}</span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[85vh] p-0">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle>{t('localization.title')}</DialogTitle>
          </DialogHeader>

          <div className="px-4 pb-2">
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-xl">{getCountryFlag(countryCode)}</span>
                <span className="font-medium">{selectedCountry?.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {currency.code} ({currency.symbol}) • {selectedLanguage.name}
              </p>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 mx-4" style={{ width: 'calc(100% - 32px)' }}>
              <TabsTrigger value="country" className="text-xs">
                <Flag className="h-3 w-3 mr-1" />
                {t('localization.country')}
              </TabsTrigger>
              <TabsTrigger value="currency" className="text-xs">
                <Coins className="h-3 w-3 mr-1" />
                {t('localization.currency')}
              </TabsTrigger>
              <TabsTrigger value="language" className="text-xs">
                <Globe className="h-3 w-3 mr-1" />
                {t('localization.language')}
              </TabsTrigger>
            </TabsList>

            <div className="p-4 pt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t(`localization.search${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`)}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <TabsContent value="country" className="mt-0">
              <ScrollArea className="h-[300px]">
                <div className="px-2 pb-4">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => handleCountrySelect(country)}
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
            </TabsContent>

            <TabsContent value="currency" className="mt-0">
              <ScrollArea className="h-[300px]">
                <div className="px-2 pb-4">
                  {filteredCurrencies.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => handleCurrencySelect(c)}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-lg w-8">{c.symbol}</span>
                        <div className="text-left">
                          <p className="text-sm font-medium">{c.name}</p>
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
            </TabsContent>

            <TabsContent value="language" className="mt-0">
              <ScrollArea className="h-[300px]">
                <div className="px-2 pb-4">
                  {filteredLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang)}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{lang.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {lang.nativeName}
                        </span>
                      </div>
                      {lang.code === selectedLanguage.code && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="p-4 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => {
                localStorage.removeItem('localizationAutoDetected');
                autoDetectLocalization();
              }}
            >
              {t('localization.autoDetect')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-muted/50 transition-colors text-left">
          <div className="flex items-center gap-4">
            <span className="text-2xl">{getCountryFlag(countryCode)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{t('profile.localizationSettings')}</p>
              <p className="text-xs text-muted-foreground truncate">
                {selectedCountry?.name || 'Select'} • {currency.code} ({currency.symbol}) • {selectedLanguage.name}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle>{t('localization.title')}</DialogTitle>
        </DialogHeader>

        {/* Current Selection Summary */}
        <div className="px-4 pb-2">
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xl">{getCountryFlag(countryCode)}</span>
              <span className="font-medium">{selectedCountry?.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {currency.code} ({currency.symbol}) • {selectedLanguage.name}
            </p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mx-4" style={{ width: 'calc(100% - 32px)' }}>
            <TabsTrigger value="country" className="text-xs">
              <Flag className="h-3 w-3 mr-1" />
              {t('localization.country')}
            </TabsTrigger>
            <TabsTrigger value="currency" className="text-xs">
              <Coins className="h-3 w-3 mr-1" />
              {t('localization.currency')}
            </TabsTrigger>
            <TabsTrigger value="language" className="text-xs">
              <Globe className="h-3 w-3 mr-1" />
              {t('localization.language')}
            </TabsTrigger>
          </TabsList>

          <div className="p-4 pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t(`localization.search${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`)}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <TabsContent value="country" className="mt-0">
            <ScrollArea className="h-[300px]">
              <div className="px-2 pb-4">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => handleCountrySelect(country)}
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
          </TabsContent>

          <TabsContent value="currency" className="mt-0">
            <ScrollArea className="h-[300px]">
              <div className="px-2 pb-4">
                {filteredCurrencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleCurrencySelect(c)}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-lg w-8">{c.symbol}</span>
                      <div className="text-left">
                        <p className="text-sm font-medium">{c.name}</p>
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
          </TabsContent>

          <TabsContent value="language" className="mt-0">
            <ScrollArea className="h-[300px]">
              <div className="px-2 pb-4">
                {filteredLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang)}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{lang.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {lang.nativeName}
                      </span>
                    </div>
                    {lang.code === selectedLanguage.code && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="p-4 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => {
              localStorage.removeItem('localizationAutoDetected');
              autoDetectLocalization();
            }}
          >
            {t('localization.autoDetect')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
