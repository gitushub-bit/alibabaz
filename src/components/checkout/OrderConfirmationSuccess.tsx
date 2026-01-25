import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client'; // ← USE EXISTING CLIENT!

interface OrderConfirmationSuccessProps {
  orderIds: string[];
  totalAmount: number;
  currency?: string;
}

export default function OrderConfirmationSuccess({
  orderIds,
  totalAmount: propTotalAmount,
  currency = 'USD',
}: OrderConfirmationSuccessProps) {
  const navigate = useNavigate();
  const [finalTotal, setFinalTotal] = useState<number>(propTotalAmount);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('OrderConfirmationSuccess Mounted/Updated:', {
      propTotalAmount,
      orderIds,
      hasPropTotal: propTotalAmount > 0,
    });

    // If a prop total exists, show it immediately while we verify against the DB.
    if (propTotalAmount > 0) {
      setFinalTotal(propTotalAmount);
    }

    // If no order IDs provided, nothing to verify.
    if (!orderIds || orderIds.length === 0) {
      console.log('No order IDs to fetch');
      return;
    }

    console.log('Fetching order totals from DB for IDs (verify):', orderIds);
    const fetchTotal = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('id, total_price')
          .in('id', orderIds);

        console.log('DB Fetch Response:', { data, fetchError });

        if (fetchError) {
          console.error('Error fetching order total:', fetchError);
          setError(`Failed to fetch order details: ${fetchError.message}`);
          return; // keep the propTotalAmount as fallback
        }

        if (!data || data.length === 0) {
          console.log('No orders found in database');
          setError('Order details not found in database');
          return;
        }

        const total = data.reduce((sum: number, order: any) => {
          const orderTotal = Number(order.total_price || 0);
          console.log(`Order ${order.id}: $${orderTotal}`);
          return sum + orderTotal;
        }, 0);

        console.log('Calculated total from DB:', total);

        // If DB total differs from provided prop (beyond tiny rounding), prefer DB total.
        const difference = Math.abs((propTotalAmount || 0) - total);
        if (difference > 0.009) {
          console.log('Reconciling totals, using DB total due to difference:', difference);
          setFinalTotal(total);
        } else {
          console.log('Prop total matches DB (within rounding). Keeping prop total.');
          setFinalTotal(propTotalAmount || total);
        }
      } catch (err: any) {
        console.error('Unexpected error:', err);
        setError(`Unexpected error: ${err?.message || String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTotal();
  }, [orderIds, propTotalAmount]);

  // Debug log to see what's happening
  useEffect(() => {
    console.log('OrderConfirmationSuccess State:', {
      propTotalAmount,
      finalTotal,
      orderIds,
      loading,
      error
    });
  }, [propTotalAmount, finalTotal, orderIds, loading, error]);

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

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
              <p className="font-medium">Note:</p>
              <p>{error}</p>
              <p className="mt-1">Showing amount from order summary.</p>
            </div>
          )}

          {loading ? (
            <div className="space-y-2">
              <p className="text-2xl font-bold">Calculating amount...</p>
              <p className="text-sm text-muted-foreground">
                Fetching latest order details
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-2xl font-bold">
                Amount Paid: {currency} {finalTotal.toFixed(2)}
              </p>
              {propTotalAmount > 0 && finalTotal !== propTotalAmount && (
                <p className="text-sm text-muted-foreground">
                  (Based on order summary)
                </p>
              )}
            </div>
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
