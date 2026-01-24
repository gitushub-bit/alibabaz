import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, ArrowLeft, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { format } from 'date-fns';

interface Order {
  id: string;
  quantity: number;
  total_price: number;
  status: string | null;
  tracking_info: any;
  created_at: string;
  updated_at: string;
  product: {
    id: string;
    title: string;
    images: string[] | null;
    slug: string;
  } | null;
  seller_profile: {
    full_name: string | null;
    company_name: string | null;
  } | null;
}

const statusSteps = [
  { key: 'pending_payment', label: 'Pending Payment', icon: Clock },
  { key: 'paid', label: 'Paid', icon: DollarSign },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const getStatusIndex = (status: string | null) => {
  const index = statusSteps.findIndex(s => s.key === status);
  return index >= 0 ? index : 0;
};

const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'delivered': return 'bg-green-500';
    case 'shipped': return 'bg-blue-500';
    case 'processing': return 'bg-yellow-500';
    case 'paid': return 'bg-primary';
    case 'cancelled': return 'bg-destructive';
    default: return 'bg-muted-foreground';
  }
};

export default function OrderTracking() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/orders');
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        product:products (id, title, images, slug)
      `)
      .eq('buyer_id', user!.id)
      .order('created_at', { ascending: false });

    if (data) {
      // Fetch seller profiles separately
      const ordersWithSellers = await Promise.all(
        data.map(async (order) => {
          const { data: sellerProfile } = await supabase
            .from('profiles')
            .select('full_name, company_name')
            .eq('user_id', order.seller_id)
            .single();

          return {
            ...order,
            seller_profile: sellerProfile,
          };
        })
      );
      setOrders(ordersWithSellers);
    }
    setLoading(false);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <div className="container py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-4">
                Start shopping to see your orders here
              </p>
              <Button onClick={() => navigate('/products')}>
                Browse Products
              </Button>
            </CardContent>
          </Card>
        ) : selectedOrder ? (
          // Order Detail View
          <div className="space-y-6">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedOrder(null)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{selectedOrder.id.slice(0, 8)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Placed on {format(new Date(selectedOrder.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Progress */}
                <div className="relative">
                  <div className="flex justify-between mb-2">
                    {statusSteps.map((step, index) => {
                      const currentIndex = getStatusIndex(selectedOrder.status);
                      const isComplete = index <= currentIndex;
                      const Icon = step.icon;
                      
                      return (
                        <div 
                          key={step.key}
                          className="flex flex-col items-center flex-1"
                        >
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center
                            ${isComplete ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                          `}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className={`text-xs mt-2 text-center ${isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Progress line */}
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-10 mx-8">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ 
                        width: `${(getStatusIndex(selectedOrder.status) / (statusSteps.length - 1)) * 100}%` 
                      }}
                    />
                  </div>
                </div>

                <Separator />

                {/* Product Info */}
                <div className="flex gap-4">
                  <img 
                    src={selectedOrder.product?.images?.[0] || '/placeholder.svg'}
                    alt={selectedOrder.product?.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{selectedOrder.product?.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Seller: {selectedOrder.seller_profile?.company_name || selectedOrder.seller_profile?.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {selectedOrder.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      ${selectedOrder.total_price.toFixed(2)}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Shipping Info */}
                {selectedOrder.tracking_info && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Shipping Address
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.tracking_info.shipping_address}
                    </p>
                    
                    {selectedOrder.tracking_info.notes && (
                      <>
                        <h4 className="font-semibold mt-4">Order Notes</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedOrder.tracking_info.notes}
                        </p>
                      </>
                    )}

                    {selectedOrder.tracking_info.tracking_number && (
                      <>
                        <h4 className="font-semibold mt-4 flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          Tracking Number
                        </h4>
                        <p className="font-mono text-sm">
                          {selectedOrder.tracking_info.tracking_number}
                        </p>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          // Orders List View
          <div className="space-y-4">
            {orders.map((order) => (
              <Card 
                key={order.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img 
                      src={order.product?.images?.[0] || '/placeholder.svg'}
                      alt={order.product?.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold truncate">
                          {order.product?.title || 'Product'}
                        </h3>
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                          {order.status?.replace('_', ' ') || 'pending'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.seller_profile?.company_name || order.seller_profile?.full_name}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(order.created_at), 'MMM dd, yyyy')}
                        </span>
                        <span className="font-semibold">
                          ${order.total_price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
