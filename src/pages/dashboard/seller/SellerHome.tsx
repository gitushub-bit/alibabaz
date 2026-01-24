import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, FileText, MessageCircle, ShoppingCart, Plus, TrendingUp, Eye } from 'lucide-react';

interface Stats {
  products: number;
  rfqs: number;
  messages: number;
  orders: number;
}

export default function SellerHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ products: 0, rfqs: 0, messages: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    const [productsRes, rfqsRes, messagesRes, ordersRes] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact' }).eq('seller_id', user.id),
      supabase.from('rfq_responses').select('id', { count: 'exact' }).eq('seller_id', user.id),
      supabase.from('conversations').select('id', { count: 'exact' }).eq('seller_id', user.id),
      supabase.from('orders').select('id', { count: 'exact' }).eq('seller_id', user.id)
    ]);

    setStats({
      products: productsRes.count || 0,
      rfqs: rfqsRes.count || 0,
      messages: messagesRes.count || 0,
      orders: ordersRes.count || 0
    });
    setLoading(false);
  };

  const statCards = [
    { label: 'Products', value: stats.products, icon: Package, href: '/seller/products', color: 'text-blue-500' },
    { label: 'RFQ Responses', value: stats.rfqs, icon: FileText, href: '/seller/rfqs', color: 'text-green-500' },
    { label: 'Conversations', value: stats.messages, icon: MessageCircle, href: '/seller/messages', color: 'text-purple-500' },
    { label: 'Orders', value: stats.orders, icon: ShoppingCart, href: '/seller/orders', color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link to="/seller/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))
        ) : (
          statCards.map((stat) => (
            <Link key={stat.label} to={stat.href}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    <span className="text-2xl font-bold">{stat.value}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/seller/products/new">
                <Plus className="h-4 w-4 mr-2" />
                Add New Product
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/seller/rfqs">
                <FileText className="h-4 w-4 mr-2" />
                View Open RFQs
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/seller/settings">
                <Eye className="h-4 w-4 mr-2" />
                Update Company Profile
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tips for Success</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>✓ Add high-quality product images</p>
            <p>✓ Respond to inquiries within 24 hours</p>
            <p>✓ Keep your product catalog updated</p>
            <p>✓ Get verified to build trust with buyers</p>
            <p>✓ Complete your company profile</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
