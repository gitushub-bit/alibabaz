import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, MessageCircle, ShoppingCart, Heart, Plus, Search } from 'lucide-react';

interface Stats {
  rfqs: number;
  messages: number;
  orders: number;
  favorites: number;
}

export default function BuyerHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ rfqs: 0, messages: 0, orders: 0, favorites: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    const [rfqsRes, messagesRes, ordersRes, favoritesRes] = await Promise.all([
      supabase.from('rfqs').select('id', { count: 'exact' }).eq('buyer_id', user.id),
      supabase.from('conversations').select('id', { count: 'exact' }).eq('buyer_id', user.id),
      supabase.from('orders').select('id', { count: 'exact' }).eq('buyer_id', user.id),
      supabase.from('favorites').select('id', { count: 'exact' }).eq('user_id', user.id)
    ]);

    setStats({
      rfqs: rfqsRes.count || 0,
      messages: messagesRes.count || 0,
      orders: ordersRes.count || 0,
      favorites: favoritesRes.count || 0
    });
    setLoading(false);
  };

  const statCards = [
    { label: 'My RFQs', value: stats.rfqs, icon: FileText, href: '/buyer/rfqs', color: 'text-blue-500' },
    { label: 'Conversations', value: stats.messages, icon: MessageCircle, href: '/buyer/messages', color: 'text-green-500' },
    { label: 'Orders', value: stats.orders, icon: ShoppingCart, href: '/buyer/orders', color: 'text-purple-500' },
    { label: 'Favorites', value: stats.favorites, icon: Heart, href: '/buyer/favorites', color: 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link to="/buyer/rfqs/new">
            <Plus className="h-4 w-4 mr-2" />
            Post RFQ
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
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/buyer/rfqs/new">
                <Plus className="h-4 w-4 mr-2" />
                Post a Buying Request (RFQ)
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/products">
                <Search className="h-4 w-4 mr-2" />
                Browse Products
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/buyer/favorites">
                <Heart className="h-4 w-4 mr-2" />
                View Saved Products
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. Post an RFQ describing what you need</p>
            <p>2. Receive quotes from verified suppliers</p>
            <p>3. Compare prices and negotiate directly</p>
            <p>4. Place your order securely</p>
            <p>5. Track delivery and leave reviews</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
