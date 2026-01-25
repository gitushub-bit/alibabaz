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
      {/* ... SAME UI ... */}

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

            {/* ✅ ONLY SHOW WHEN OTP VERIFIED */}
            {otpVerified && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                OTP Verified
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ... REST OF UI ... */}

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
