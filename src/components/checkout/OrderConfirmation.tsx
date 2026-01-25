import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Package, Home, ShoppingBag, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

interface OrderConfirmationProps {
  orderIds: string[];
  totalAmount: number;
  shippingAddress?: ShippingAddress;
  currency?: string;
  showTrackOrder?: boolean;
}

export default function OrderConfirmation({
  orderIds,
  totalAmount,
  shippingAddress,
  currency = 'USD',
  showTrackOrder = true,
}: OrderConfirmationProps) {
  const navigate = useNavigate();

  const formattedOrderIds =
    orderIds.length === 1
      ? orderIds[0].slice(0, 8) + '...'
      : orderIds.map(id => id.slice(0, 6)).join(' • ');

  // Safely format currency
  const formattedAmount = (() => {
    // If totalAmount is NaN or not a number
    if (typeof totalAmount !== 'number' || isNaN(totalAmount)) {
      return `${currency} 0.00`;
    }

    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
      }).format(totalAmount);
    } catch {
      // fallback if currency code invalid
      return `${currency} ${totalAmount.toFixed(2)}`;
    }
  })();

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardContent className="pt-8 pb-6">
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-green-600">Order Confirmed!</h2>
            <p className="text-muted-foreground">
              Thank you for your order. Your payment has been processed successfully.
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order ID(s)</span>
              <span className="font-mono text-xs">{formattedOrderIds}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Paid</span>
              <span className="font-bold text-lg">{formattedAmount}</span>
            </div>
          </div>

          {shippingAddress && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </div>
              <div className="text-sm text-muted-foreground">
                <div>{shippingAddress.fullName}</div>
                <div>{shippingAddress.line1}</div>
                {shippingAddress.line2 && <div>{shippingAddress.line2}</div>}
                <div>
                  {shippingAddress.city}
                  {shippingAddress.state ? `, ${shippingAddress.state}` : ''}
                </div>
                <div>
                  {shippingAddress.postalCode} • {shippingAddress.country}
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
            <Package className="inline h-4 w-4 mr-1" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>

            <Button className="flex-1" onClick={() => navigate('/orders')}>
              <ShoppingBag className="h-4 w-4 mr-2" />
              View Orders
            </Button>

            {showTrackOrder && (
              <Button variant="ghost" className="flex-1" onClick={() => navigate('/orders')}>
                <Package className="h-4 w-4 mr-2" />
                Track Order
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
