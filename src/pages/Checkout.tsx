import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';
import PaymentForm from '@/components/payment/PaymentForm';
import CardOTPVerification from '@/components/payment/CardOTPVerification';
import OrderReview from '@/components/payment/OrderReview';
import OrderConfirmation from '@/components/payment/OrderConfirmation';
import PaymentProcessingScreen from '@/components/payment/PaymentProcessingScreen';
import CheckoutStepper from '@/components/checkout/CheckoutStepper';

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

type CheckoutStep =
  | 'details'
  | 'payment'
  | 'processing'
  | 'otp'
  | 'review'
  | 'confirmation';

type ProcessingContext = 'payment' | 'otp';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // NEW: FULL FLOW
  const [step, setStep] = useState<CheckoutStep>('details');
  const [processingContext, setProcessingContext] = useState<ProcessingContext | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const [orderTotal, setOrderTotal] = useState<number>(0);

  const productId = searchParams.get('product');

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
    setLoading(false);
  };

  const calculateTotal = () => {
    if (!product) return 0;
    const price = Number(product.price_min ?? product.price_max ?? 0);
    return price * quantity;
  };

  const handleProceedToPayment = async () => {
    if (!shippingAddress.trim()) {
      toast({ title: 'Please enter shipping address', variant: 'destructive' });
      return;
    }
    if (!user || !product) return;

    const total = calculateTotal();
    setOrderTotal(total);

    try {
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          seller_id: product.seller_id,
          product_id: product.id,
          quantity,
          total_price: total,
          status: 'pending_payment',
          tracking_info: {
            shipping_address: shippingAddress,
            notes,
          },
        })
        .select()
        .single();

      if (error) throw error;

      setOrderId(order.id);
      setStep('payment');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    if (!orderId) return;

    await supabase.from('orders').update({
      status: 'paid',
      transaction_id: transactionId,
    }).eq('id', orderId);

    setProcessingContext('payment');
    setStep('processing');
  };

  const handlePaymentProcessed = () => {
    setStep('otp');
  };

  const handleOtpVerified = () => {
    setProcessingContext('otp');
    setStep('processing');
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

  const orderItems = [
    {
      id: product.id,
      title: product.title,
      price: Number(product.price_min ?? product.price_max ?? 0),
      quantity,
      image: product.images?.[0] || '/placeholder.svg',
      seller_name: seller?.company_name || seller?.full_name || 'Seller',
    }
  ];

  const shippingData = {
    fullName: userProfile?.full_name || user?.user_metadata?.full_name || 'Customer',
    streetAddress: shippingAddress,
    city: 'N/A',
    stateProvince: 'N/A',
    postalCode: 'N/A',
    country: 'N/A',
    phoneNumber: userProfile?.phone || 'N/A',
    email: user?.email || 'N/A',
  };

  const cardData = {
    cardNumber: '0000 0000 0000 0000',
    expiryMonth: '01',
    expiryYear: '30',
    cvv: '000',
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <CheckoutStepper currentStep={step} processingContext={processingContext || undefined} />

        <Button
          variant="ghost"
          onClick={() => {
            if (step === 'payment') return setStep('details');
            if (step === 'otp') return setStep('payment');
            if (step === 'review') return setStep('otp');
            if (step === 'confirmation') return navigate('/orders');
            navigate(-1);
          }}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">

            {step === 'details' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* your order details UI */}
                  </CardContent>
                </Card>

                <Button className="w-full" size="lg" onClick={handleProceedToPayment}>
                  Proceed to Payment
                </Button>
              </div>
            )}

            {step === 'payment' && (
              <PaymentForm
                amount={orderTotal}
                currency="USD"
                orderId={orderId || undefined}
                productName={product.title}
                quantity={quantity}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setStep('details')}
              />
            )}

            {step === 'processing' && (
              <PaymentProcessingScreen
                mode={processingContext || 'payment'}
                onComplete={
                  processingContext === 'payment'
                    ? handlePaymentProcessed
                    : handleOtpProcessed
                }
              />
            )}

            {step === 'otp' && (
              <CardOTPVerification
                cardLastFour="1234"
                onVerified={handleOtpVerified}
                onResend={() => toast({ title: 'OTP resent!' })}
              />
            )}

            {step === 'review' && (
              <OrderReview
                items={orderItems}
                shippingData={shippingData}
                cardData={cardData}
                totalAmount={orderTotal}
                onConfirm={handleConfirmOrder}
                onEditShipping={() => setStep('details')}
                onEditPayment={() => setStep('payment')}
                isSubmitting={false}
              />
            )}

            {step === 'confirmation' && (
              <OrderConfirmation
                orderIds={[orderId || '']}
                totalAmount={orderTotal}
                currency="USD"
              />
            )}

          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
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
                  <span>${orderTotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
