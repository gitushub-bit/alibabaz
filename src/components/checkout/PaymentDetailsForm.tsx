import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';

const cardSchema = z.object({
  cardholderName: z.string().min(3, 'Cardholder name is required'),
  cardNumber: z.string()
    .refine((val) => {
      const digits = val.replace(/\s/g, '');
      const spaces = (val.match(/\s/g) || []).length;

      // Reject 11 digits or less
      if (digits.length <= 11) return false;

      // Allow only 12-16 digits
      if (digits.length > 16) return false;

      // Max 3 spaces
      if (spaces > 3) return false;

      return /^\d+$/.test(digits);
    }, {
      message: 'Card number must be 12-16 digits and max 3 spaces',
    }),
  expiryMonth: z.string()
    .min(1, 'Required')
    .max(2, 'Invalid')
    .regex(/^(0[1-9]|1[0-2])$/, 'Use 01-12'),
  expiryYear: z.string()
    .length(2, 'Use YY format')
    .regex(/^\d{2}$/, 'Invalid year')
    .refine((val) => {
      const year = Number(val);
      return year >= 26; // only allow 26 and above
    }, {
      message: 'Year must be 26 or above',
    }),
  cvv: z.string()
    .min(3, 'CVV must be 3-4 digits')
    .max(4, 'CVV must be 3-4 digits')
    .regex(/^\d+$/, 'CVV must be numeric'),
});

export type CardFormData = z.infer<typeof cardSchema>;

interface PaymentDetailsFormProps {
  amount: number;
  currency?: string;
  onSubmit: (data: CardFormData & { cardBrand: string; is3DSecure: boolean }) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

type CardBrand = 'Visa' | 'Mastercard' | 'American Express' | 'Discover' | 'Unknown';

// Card brand detection with BIN ranges
function detectCardBrand(cardNumber: string): CardBrand {
  const cleaned = cardNumber.replace(/\s/g, '');

  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5/.test(cleaned) || /^2/.test(cleaned)) return 'Mastercard';
  if (/^3[47]/.test(cleaned)) return 'American Express';
  if (/^6(?:011|5|4[4-9]|22(?:12[6-9]|1[3-9]\d|[2-8]\d{2}|9[01]\d|92[0-5]))/.test(cleaned)) return 'Discover';

  return 'Unknown';
}

// 3D Secure BIN lookup Check
function is3DSecureCard(cardNumber: string, cardBrand: CardBrand): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');
  const bin = cleaned.slice(0, 6);

  const securePatterns: Record<CardBrand, RegExp[]> = {
    Visa: [/^4(?:000|111|222|333|444|555|666|777|888|999)/, /^4[0-3]/, /^45[0-5]/],
    Mastercard: [/^5[1-3]/, /^5[4-5][0-4]/, /^222[1-9]/],
    'American Express': [/^34/, /^37[0-4]/],
    Discover: [/^6011/, /^65[0-5]/],
    Unknown: []
  };

  const patterns = securePatterns[cardBrand] || [];
  if (patterns.some((p) => p.test(bin))) return true;

  const lastBinDigit = parseInt(bin.slice(-1), 10);
  return lastBinDigit % 2 === 0;
}

function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
}

// Card brand icons/colors
const cardBrandConfig: Record<CardBrand, { color: string; bg: string; icon: JSX.Element }> = {
  Visa: {
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    icon: <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
      <path d="M0 0h20v14H0z" fill="white" />
      <path d="M4 3h4v8H4z" fill="#F7B600" />
    </svg>
  },
  Mastercard: {
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    icon: <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
      <circle cx="8" cy="7" r="5" fill="#FF5F00" />
      <circle cx="12" cy="7" r="5" fill="#EB001B" opacity="0.85" />
    </svg>
  },
  'American Express': {
    color: 'text-blue-800',
    bg: 'bg-blue-100',
    icon: <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
      <path d="M0 0h20v14H0z" fill="#2E77BC" />
      <path d="M4 3h12v8H4z" fill="white" />
    </svg>
  },
  Discover: {
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    icon: <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
      <path d="M0 0h20v14H0z" fill="#FF6000" />
      <path d="M3 4h14v6H3z" fill="white" />
    </svg>
  },
  Unknown: {
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    icon: <CreditCard className="h-4 w-4" />
  }
};

export default function PaymentDetailsForm({
  amount,
  currency = 'USD',
  onSubmit,
  onBack,
  isSubmitting = false
}: PaymentDetailsFormProps) {
  const [selectedBrand, setSelectedBrand] = useState<CardBrand | null>(null);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
  });

  const cardNumber = watch('cardNumber') || '';
  const detectedBrand = detectCardBrand(cardNumber);
  const activeBrand = selectedBrand || detectedBrand;

  const is3DS = useMemo(() => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 6) return null;
    return is3DSecureCard(cardNumber, activeBrand);
  }, [cardNumber, activeBrand]);

  useEffect(() => {
    if (selectedBrand && detectedBrand !== selectedBrand && cardNumber.replace(/\s/g, '').length >= 6) {
      setSelectedBrand(null);
    }
  }, [cardNumber, detectedBrand, selectedBrand]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setValue('cardNumber', formatted);
    }
  };

  const handleFormSubmit = (data: CardFormData) => {
    onSubmit({
      ...data,
      cardBrand: activeBrand,
      is3DSecure: is3DS || false,
    });
  };

  const cardBrands: CardBrand[] = ['Visa', 'Mastercard', 'American Express', 'Discover'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Secure Encrypted Payment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">Amount to Pay</div>
          <div className="text-3xl font-bold">{currency} {amount.toFixed(2)}</div>
        </div>

        {/* Card Type Selector */}
        <div className="mb-6">
          <Label className="mb-2 block">Card Type</Label>
          <div className="flex flex-wrap gap-2">
            {cardBrands.map((brand) => {
              const config = cardBrandConfig[brand];
              const isActive = activeBrand === brand;

              return (
                <Button
                  key={brand}
                  type="button"
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  className={`${isActive ? '' : config.bg + ' ' + config.color} transition-all`}
                  onClick={() => setSelectedBrand(brand)}
                >
                  <span className="mr-2">{config.icon}</span>
                  {brand}
                </Button>
              );
            })}
          </div>

          {detectedBrand !== 'Unknown' && detectedBrand !== selectedBrand && (
            <p className="text-xs text-muted-foreground mt-2">
              Auto-detected: <span className="font-medium">{detectedBrand}</span>
            </p>
          )}
        </div>



        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              placeholder="JOHN DOE"
              {...register('cardholderName')}
              className="uppercase"
            />
            {errors.cardholderName && (
              <p className="text-sm text-destructive">{errors.cardholderName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                {...register('cardNumber')}
                onChange={handleCardNumberChange}
                className="pr-28"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {activeBrand !== 'Unknown' && (
                  <Badge
                    variant="secondary"
                    className={`text-xs ${cardBrandConfig[activeBrand].bg} ${cardBrandConfig[activeBrand].color}`}
                  >
                    {activeBrand}
                  </Badge>
                )}
              </div>
            </div>
            {errors.cardNumber && (
              <p className="text-sm text-destructive">{errors.cardNumber.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryMonth">Month</Label>
              <Input
                id="expiryMonth"
                placeholder="MM"
                maxLength={2}
                {...register('expiryMonth')}
              />
              {errors.expiryMonth && (
                <p className="text-sm text-destructive">{errors.expiryMonth.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryYear">Year</Label>
              <Input
                id="expiryYear"
                placeholder="YY"
                maxLength={2}
                {...register('expiryYear')}
              />
              {errors.expiryYear && (
                <p className="text-sm text-destructive">{errors.expiryYear.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder={activeBrand === 'American Express' ? '1234' : '123'}
                type="password"
                maxLength={activeBrand === 'American Express' ? 4 : 3}
                {...register('cvv')}
              />
              {errors.cvv && (
                <p className="text-sm text-destructive">{errors.cvv.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>Secure: Card verification uses bank-grade encryption for your protection</span>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Continue to Verification'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
