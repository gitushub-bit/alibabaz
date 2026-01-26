import { useState, useEffect } from 'react';
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
import OrderReview from '@/components/checkout/OrderReview';
import OrderConfirmationSuccess from '@/components/checkout/OrderConfirmationSuccess';
import PaymentProcessingScreen from '@/components/checkout/PaymentProcessingScreen';

// IMPORT THE SAME OTP COMPONENT AS CART CHECKOUT
import OTPVerification from '@/components/payment/OTPVerification';

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

  /* ---------------- Guards ---------------- */
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/checkout?product=' + productId);
      return;
    }

    if (user && productId) {
      fetchProduct();
    }
  }, [productId, user, authLoading, navigate]);

  /* ---------------- Product Fetching ---------------- */
  const fetchProduct = async () => {
    try {
      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productData) {
        setProduct(productData);
        setQuantity(productData.moq || 1);

        const { data: sellerData } = await supabase
          .from('profiles')
          .select('full_name, company_name')
          .eq('user_id', productData.seller_id)
          .single();

        if (sellerData) setSeller(sellerData);
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
  const calculateTotal = () => {
    if (!product) return 0;
    const price = Number(product.price_min ?? product.price_max ?? 0);
    return price * quantity;
  };

  /* ---------------- Shipping ---------------- */
  const handleShippingSubmit = (data: ShippingFormData) => {
    console.log('Shipping submitted');
    setShippingData(data);
    setStep('payment');
  };

  /* ---------------- Payment ---------------- */
  const handlePaymentSubmit = async (data: CardFormData & { is3DSecure?: boolean }) => {
    console.log('Payment submitted');
    
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
      const total = calculateTotal();

      const { data: tx, error } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: user.id,
          amount: total,
          currency: 'USD',
          status: 'pending_otp',
        })
        .select()
        .single();

      if (error) throw error;

      setTransactionId(tx.id);
      
    } catch (e: any) {
      console.error('Payment error:', e);
      toast({ 
        title: 'Payment error', 
        description: e.message, 
        variant: 'destructive' 
      });
      setStep('payment');
    }
  };

  /* ---------------- OTP ---------------- */
  const handleOTPVerified = async () => {
    console.log('OTP verified');
    setStep('processingOtp');
  };

  /* ---------------- Review ---------------- */
  const handleConfirmOrder = async () => {
    console.log('Confirming order');

    if (!user || !product || !shippingData || !cardData) {
      toast({ 
        title: 'Error', 
        description: 'Missing required information', 
        variant: 'destructive' 
      });
      return;
    }

    try {
      const total = calculateTotal();
      setConfirmedTotal(total);

      // Create order
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
        })
        .select()
        .single();

      if (error) throw error;

      setOrderId(order.id);

      // Update payment transaction
      if (transactionId) {
        await supabase
          .from('payment_transactions')
          .update({ 
            order_id: order.id,
            status: 'completed' 
          })
          .eq('id', transactionId);
      }

      setStep('confirmation');
    } catch (e: any) {
      console.error('Order error:', e);
      toast({ 
        title: 'Order error', 
        description: e.message, 
        variant: 'destructive' 
      });
    }
  };

  const handleBack = () => {
    if (step === 'confirmation') {
      navigate(`/products/${productId}`);
    } else {
      navigate(-1);
    }
  };

  if (loading || authLoading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return (
      <div>
        <Header />
        <div className="container py-8 text-center">
          <h1>Product not found</h1>
          <Button onClick={() => navigate('/products')}>Browse Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <CheckoutStepper currentStep={step} />

        <Button variant="ghost" onClick={handleBack} className="mb-6">
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
                description="Confirming your card details."
                onDone={() => {
                  toast({ title: 'OTP Sent', description: 'Enter the code sent to your phone.' });
                  setStep('otp');
                }}
              />
            )}

            {step === 'otp' && (
              <OTPVerification
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

            {step === 'review' && (
              <OrderReview
                items={[{
                  id: product.id,
                  title: product.title,
                  price: Number(product.price_min ?? product.price_max ?? 0),
                  quantity,
                  image: product.images?.[0] || '/placeholder.svg',
                  seller_name: seller?.company_name || seller?.full_name || 'Seller',
                  seller_id: product.seller_id,
                  product_id: product.id,
                }]}
                shippingData={shippingData || {
                  fullName: '',
                  streetAddress: '',
                  city: '',
                  stateProvince: '',
                  postalCode: '',
                  country: '',
                  phoneNumber: '',
                  email: user?.email || '',
                  additionalNotes: '',
                }}
                cardData={cardData ? {
                  cardholderName: cardData.cardholderName,
                  cardNumber: `•••• •••• •••• ${cardData.cardNumber.replace(/\s/g, '').slice(-4)}`,
                  expiryMonth: cardData.expiryMonth,
                  expiryYear: cardData.expiryYear,
                } : {
                  cardholderName: 'N/A',
                  cardNumber: '•••• •••• •••• ••••',
                  expiryMonth: 'MM',
                  expiryYear: 'YY',
                }}
                totalAmount={calculateTotal()}
                currency="USD"
                onConfirm={handleConfirmOrder}
                onEditShipping={() => setStep('shipping')}
                onEditPayment={() => setStep('payment')}
              />
            )}

            {step === 'confirmation' && (
              <OrderConfirmationSuccess
                orderIds={orderId ? [orderId] : []}
                totalAmount={confirmedTotal}
                currency="USD"
              />
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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product</span>
                    <span>{product.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unit Price</span>
                    <span>${(product.price_min || product.price_max || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span>{quantity}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
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
