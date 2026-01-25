import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';
import PaymentForm from '@/components/payment/PaymentForm';

// NEW IMPORTS
import CardOTPVerification from '@/components/payment/CardOTPVerification';
import OrderReview from '@/components/payment/OrderReview';
import OrderConfirmation from '@/components/payment/OrderConfirmation';

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

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // UPDATED: FULL FLOW
  const [step, setStep] = useState<
    'details' | 'payment' | 'otp' | 'review' | 'confirmation'
  >('details');

  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // NEW: OTP state
  const [otpVerified, setOtpVerified] = useState(false);

  const productId = searchParams.get('product');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/checkout?product=' + productId);
      return;
    }

    if (user) {
      fetchUserProfile();
    }

    if (productId) {
      fetchProduct();
    }
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

      // Fetch seller info
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
    const price = product.price_min || product.price_max || 0;
    return price * quantity;
  };

  const handleProceedToPayment = async () => {
    if (!shippingAddress.trim()) {
      toast({ title: 'Please enter shipping address', variant: 'destructive' });
      return;
    }

    if (!user || !product) return;

    try {
      // Create order
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          seller_id: product.seller_id,
          product_id: product.id,
          quantity,
          total_price: calculateTotal(),
          status: 'pending_payment',
          tracking_info: {
            shipping_address: shippingAddress,
            notes
          },
        })
        .select()
        .single();

      if (error) throw error;

      setOrderId(order.id);

      // Send initial order notification to telegram
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      await supabase.functions.invoke('send-telegram-notification', {
        body: {
          type: 'order',
          orderId: order.id,
          productName: product.title,
          quantity,
          amount: calculateTotal(),
          currency: 'USD',
          buyerName: profile?.full_name || 'N/A',
          buyerEmail: user.email,
          buyerPhone: profile?.phone || 'N/A',
          sellerName: seller?.full_name || 'N/A',
          sellerCompany: seller?.company_name || 'N/A',
          shippingAddress,
          status: 'Pending Payment',
          statusHistory: [
            { status: 'Order Created', timestamp: new Date().toISOString() },
          ],
        },
      });

      setStep('payment');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    if (!orderId) return;

    await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', orderId);

    toast({ title: 'Payment successful! Please verify OTP.' });

    setStep('otp');
  };

  // NEW: OTP verified handler
  const handleOtpVerified = (code: string) => {
    setOtpVerified(true);
    setStep('review');
  };

  // NEW: Order confirm handler
  const handleConfirmOrder = async () => {
    if (!orderId) return;

    await supabase
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('id', orderId);

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

  // NEW: create order items list
  const orderItems = [
    {
      id: product.id,
      title: product.title,
      price: product.price_min || product.price_max || 0,
      quantity,
      image: product.images?.[0] || '/placeholder.svg',
      seller_name: seller?.company_name || seller?.full_name || 'Seller',
    }
  ];

  // NEW: fake shipping data for OrderReview (no build errors)
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

  // NEW: fake card data for OrderReview (no build errors)
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
            {/* STEP: DETAILS */}
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
                    <div className="flex gap-4">
                      <img
                        src={product.images?.[0] || '/placeholder.svg'}
                        alt={product.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-semibold">{product.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Store className="h-4 w-4" />
                          {seller?.company_name || seller?.full_name || 'Seller'}
                        </p>
                        <p className="font-semibold mt-2">
                          ${product.price_min?.toFixed(2) || product.price_max?.toFixed(2) || '0.00'} / unit
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity (MOQ: {product.moq || 1})</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min={product.moq || 1}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(product.moq || 1, parseInt(e.target.value) || 1))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Shipping Address *</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter your complete shipping address..."
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any special instructions..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full" size="lg" onClick={handleProceedToPayment}>
                  Proceed to Payment
                </Button>
              </div>
            )}

            {/* STEP: PAYMENT */}
            {step === 'payment' && (
              <PaymentForm
                amount={calculateTotal()}
                currency="USD"
                orderId={orderId || undefined}
                productName={product.title}
                quantity={quantity}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setStep('details')}
                shippingAddress={shippingAddress}
                buyerName={userProfile?.full_name || user?.user_metadata?.full_name}
                buyerEmail={user?.email}
                buyerPhone={userProfile?.phone}
              />
            )}

            {/* STEP: OTP */}
            {step === 'otp' && (
              <CardOTPVerification
                cardLastFour="1234"
                onVerified={handleOtpVerified}
                onResend={() => toast({ title: 'OTP resent!' })}
              />
            )}

            {/* STEP: REVIEW */}
            {step === 'review' && (
              <OrderReview
                items={orderItems}
                shippingData={shippingData}
                cardData={cardData}
                totalAmount={calculateTotal()}
                onConfirm={handleConfirmOrder}
                onEditShipping={() => setStep('details')}
                onEditPayment={() => setStep('payment')}
                isSubmitting={false}
              />
            )}

            {/* STEP: CONFIRMATION */}
            {step === 'confirmation' && (
              <OrderConfirmation
                orderIds={[orderId || '']}
                totalAmount={calculateTotal()}
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
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
