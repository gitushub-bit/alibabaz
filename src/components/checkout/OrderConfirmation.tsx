import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface OrderConfirmationProps {
  orderId: string;
}

export default function OrderConfirmation({ orderId }: OrderConfirmationProps) {
  const [order, setOrder] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      setOrder(data);
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  if (!order) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Order Confirmed!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Thank you for your order. Your payment has been processed successfully.</p>

            <div className="mt-4">
              <p><b>Order ID:</b> {order.id}</p>
              <p><b>Total Paid:</b> ₩{order.total_price}</p>
              <p><b>Shipping Address:</b> {order.tracking_info.shipping_address}</p>
            </div>

            <div className="flex gap-4 mt-6">
              <Button onClick={() => navigate("/")}>Back to Home</Button>
              <Button onClick={() => navigate("/orders")}>View Orders</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
