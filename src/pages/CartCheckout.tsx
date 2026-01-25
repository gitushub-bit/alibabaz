import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import { useCurrency } from '@/hooks/useCurrency';
import { toast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';

import CheckoutStepper, { CheckoutStep } from '@/components/checkout/CheckoutStepper';
import ShippingAddressForm, { ShippingFormData } from '@/components/checkout/ShippingAddressForm';
import PaymentDetailsForm, { CardFormData } from '@/components/checkout/PaymentDetailsForm';
import CardOTPVerification from '@/components/checkout/CardOTPVerification';
import OrderReview from '@/components/checkout/OrderReview';
import OrderConfirmationSuccess from '@/components/checkout/OrderConfirmationSuccess';
import PaymentProcessingScreen from '@/components/checkout/PaymentProcessingScreen';

export default function CartCheckout() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { items, clearCart, total } = useCart();
  const { formatPriceOnly } = useCurrency();
  const { loading: settingsLoading } = usePaymentSettings();

  const [step, setStep] = useState<CheckoutStep>('shipping');

  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [cardData, setCardData] = useState<CardFormData | null>(null);
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  /* ---------------- Guards ---------------- */
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/cart/checkout');
    }
    if (items.length === 0 && step === 'shipping') {
      navigate('/cart');
    }
  }, [user, authLoading, items.length, step, navigate]);

  /* ---------------- Shipping ---------------- */
  const handleShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setStep('payment');
  };

  /* ---------------- Payment ---------------- */
  const handlePaymentSubmit = async (data: CardFormData & { is3DSecure?: boolean }) => {
    if (!user) return;

    setCardData(data);
    setStep('processingPayment');

    try {
      const lastFour = data.cardNumber.replace(/\s/g, '').slice(-4);
      const brand = detectCardBrand(data.cardNumber);

      const { data: tx, error } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: user.id,
          amount: total,
          currency: 'USD',
          card_last_four: lastFour,
          card_brand: brand,
          status: 'pending_otp',
        })
        .select()
        .single();

      if (error) throw error;

      setTransactionId(tx.id);

      // this is now handled by onDone in processing screen
    } catch (e: any) {
      toast({ title: 'Payment error', description: e.message, variant: 'destructive' });
      setStep('payment');
    }
  };

  /* ---------------- OTP ---------------- */
  const handleOTPVerified = async () => {
    if (!transactionId) return;

    setStep('processingOtp');

    await supabase
      .from('payment_transactions')
      .update({ status: 'otp_verified', otp_verified: true })
      .eq('id', transactionId);

    // this is now handled by onDone in processing screen
  };

  /* ---------------- Review ---------------- */
  const handleConfirmOrder = async () => {
    if (!user || !shippingData) return;

    try {
      const ids: string[] = [];

      for (const item of items) {
        const { data, error } = await supabase
          .from('orders')
          .insert({
            buyer_id: user.id,
            seller_id: item.seller_id,
            product_id: item.product_id,
            quantity: item.quantity,
            total_price: item.price * item.quantity,
            status: 'paid',
          })
          .select()
          .single();

        if (error) throw error;
        ids.push(data.id);
      }

      setOrderIds(ids);
      clearCart();
      setStep('confirmation');
    } catch (e: any) {
      toast({ title: 'Order error', description: e.message, variant: 'destructive' });
    }
  };

  const detectCardBrand = (num: string) => {
    const c = num.replace(/\s/g, '');
    if (/^4/.test(c)) return 'Visa';
    if (/^5[1-5]/.test(c)) return 'Mastercard';
    if (/^3[47]/.test(c)) return 'American Express';
    return 'Card';
  };

  if (authLoading || settingsLoading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <CheckoutStepper currentStep={step} />

        <div className="grid lg:grid-cols-3 gap-8 mt-6">
          <div className="lg:col-span-2">
            {step === 'shipping' && <ShippingAddressForm onSubmit={handleShippingSubmit} />}

            {step === 'payment' && (
              <PaymentDetailsForm
                amount={total}
                currency="USD"
                onSubmit={handlePaymentSubmit}
                onBack={() => setStep('shipping')}
              />
            )}

            {step === 'processingPayment' && (
              <PaymentProcessingScreen
                mode="processingPayment"
                onDone={() => {
                  toast({ title: 'OTP Sent', description: 'Enter the code sent to your phone.' });
                  setStep('otp');
                }}
              />
            )}

            {step === 'otp' && cardData && (
              <CardOTPVerification
                cardLastFour={cardData.cardNumber.slice(-4)}
                onVerified={handleOTPVerified}
                onResend={() => toast({ title: 'OTP resent' })}
              />
            )}

            {step === 'processingOtp' && (
              <PaymentProcessingScreen
                mode="processingOtp"
                onDone={() => setStep('review')}
              />
            )}

            {step === 'review' && shippingData && cardData && (
              <OrderReview
                items={items}
                shippingData={shippingData}
                cardData={cardData}
                totalAmount={total}
                currency="USD"
                onConfirm={handleConfirmOrder}
                onEditShipping={() => setStep('shipping')}
                onEditPayment={() => setStep('payment')}
              />
            )}

            {step === 'confirmation' && shippingData && (
              <OrderConfirmationSuccess
                orderIds={orderIds}
                totalAmount={total}
                currency="USD"
              />
            )}
          </div>

          {step !== 'confirmation' && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold mt-4">
                    <span>Total</span>
                    <span>{formatPriceOnly(total)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
