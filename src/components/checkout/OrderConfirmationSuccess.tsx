import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface OrderConfirmationSuccessProps {
  orderIds: string[];
  totalAmount: number;  // ← This is passed from CartCheckout!
  currency?: string;
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function OrderConfirmationSuccess({
  orderIds,
  totalAmount: propTotalAmount,  // ← Rename for clarity
  currency = 'USD',
}: OrderConfirmationSuccessProps) {
  const navigate = useNavigate();
  const [finalTotal, setFinalTotal] = useState<number>(propTotalAmount);  // ← Use prop as default
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // If prop total is already provided and > 0, use it
    if (propTotalAmount > 0) {
      setFinalTotal(propTotalAmount);
      return;
    }
    
    // Only fetch from DB if prop is 0 AND we have order IDs
    if (!orderIds || orderIds.length === 0 || propTotalAmount > 0) return;

    const fetchTotal = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('id, total_price')
        .in('id', orderIds);

      if (error) {
        console.error('Error fetching order total:', error);
        setLoading(false);
        return;
      }

      const total = (data || []).reduce(
        (sum: number, order: any) => sum + Number(order.total_price || 0),
        0
      );

      setFinalTotal(total);
      setLoading(false);
    };

    fetchTotal();
  }, [orderIds, propTotalAmount]);

  // Debug log to see what's happening
  useEffect(() => {
    console.log('OrderConfirmationSuccess:', {
      propTotalAmount,
      finalTotal,
      orderIds,
      loading
    });
  }, [propTotalAmount, finalTotal, orderIds, loading]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <CardTitle className="text-2xl text-green-600">Order Confirmed!</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 text-center">
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Your order has been successfully placed and confirmed.
          </p>

          {loading ? (
            <p className="text-2xl font-bold">Calculating amount...</p>
          ) : (
            <p className="text-2xl font-bold">
              Amount Paid: {currency} {finalTotal.toFixed(2)}
            </p>
          )}
        </div>

        {orderIds.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Order ID:</p>
            {orderIds.map((id) => (
              <p key={id} className="text-sm font-mono bg-muted px-3 py-2 rounded">
                {id}
              </p>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
          <Package className="h-5 w-5" />
          <span>
            You'll receive order updates via email and in your dashboard.
          </span>
        </div>

        <div className="space-y-3 pt-4">
          <Button onClick={() => navigate('/orders')} className="w-full" size="lg">
            View My Orders
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <Button onClick={() => navigate('/products')} variant="outline" className="w-full">
            Continue Shopping
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
