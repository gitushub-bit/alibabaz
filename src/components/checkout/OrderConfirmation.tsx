import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  MapPin, 
  CreditCard, 
  Shield, 
  Package
} from 'lucide-react';
import { ShippingFormData } from './ShippingAddressForm';
import { CardFormData } from './PaymentDetailsForm';

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  seller_name?: string;
}

interface OrderReviewProps {
  items: OrderItem[];
  shippingData: ShippingFormData;
  cardData: CardFormData;
  totalAmount: number;
  currency?: string;
  onConfirm: () => void;
  onEditShipping: () => void;
  onEditPayment: () => void;
  isSubmitting?: boolean;
  onUpdate?: (data: CardFormData) => void;
  otpVerified?: boolean;  // <-- ADDED
}

function detectCardBrand(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
  if (/^3[47]/.test(cleaned)) return 'American Express';
  if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
  return 'Card';
}

function isCardValid(cardData: CardFormData) {
  const digits = cardData.cardNumber.replace(/\s/g, '');

  if (digits.length <= 11) return false;
  if (digits.length > 16) return false;

  const spaces = (cardData.cardNumber.match(/\s/g) || []).length;
  if (spaces > 3) return false;

  const year = Number(cardData.expiryYear);
  if (year < 26) return false;

  const month = Number(cardData.expiryMonth);
  if (month < 1 || month > 12) return false;

  return true;
}

export default function OrderReview({
  items,
  shippingData,
  cardData,
  totalAmount,
  currency = 'USD',
  onConfirm,
  onEditShipping,
  onEditPayment,
  isSubmitting = false,
  onUpdate,
  otpVerified = false,  // <-- ADDED
}: OrderReviewProps) {
  const cardLastFour = cardData.cardNumber.replace(/\s/g, '').slice(-4);
  const cardBrand = detectCardBrand(cardData.cardNumber);
  const validCard = isCardValid(cardData);

  useEffect(() => {
    if (onUpdate) {
      onUpdate(cardData);
    }
  }, [cardData, onUpdate]); // <-- FIXED

  return (
    <div className="space-y-6">

      {/* ORDER ITEMS */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <img 
                src={item.image || '/placeholder.svg'} 
                alt={item.title}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-medium line-clamp-1">{item.title}</h4>
                {item.seller_name && (
                  <p className="text-sm text-muted-foreground">{item.seller_name}</p>
                )}
                <p className="text-sm">
                  {currency} {item.price.toFixed(2)} × {item.quantity}
                </p>
              </div>
              <div className="text-right font-semibold">
                {currency} {(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{currency} {totalAmount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* SHIPPING */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{shippingData.fullName}</p>
            <p>{shippingData.streetAddress}</p>
            <p>{shippingData.city}, {shippingData.stateProvince} {shippingData.postalCode}</p>
            <p>{shippingData.country}</p>
            <Separator className="my-2" />
            <p>📞 {shippingData.phoneNumber}</p>
            <p>✉️ {shippingData.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* PAYMENT */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">{cardBrand} ****{cardLastFour}</p>
                <p className="text-sm text-muted-foreground">
                  Expires {cardData.expiryMonth}/{cardData.expiryYear}
                </p>
              </div>
            </div>

            {otpVerified && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                OTP Verified
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {!validCard && (
        <div className="flex items-center gap-2 p-4 bg-red-100 rounded-lg text-sm text-red-700">
          <Shield className="h-5 w-5" />
          <span>
            Invalid card details. Card must be 12–16 digits, max 3 spaces, year 26+.
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
        <Shield className="h-5 w-5 text-primary" />
        <span>
          Your order is protected by our secure checkout.
        </span>
      </div>

      <Button 
        className="w-full" 
        size="lg" 
        onClick={() => {
          if (!validCard) return;
          onConfirm();
        }}
        disabled={isSubmitting || !validCard}
      >
        {isSubmitting ? 'Processing Order...' : `Confirm Order - ${currency} ${totalAmount.toFixed(2)}`}
      </Button>
    </div>
  );
}
