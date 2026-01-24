import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Building2, 
  Package, 
  FileText, 
  ShoppingCart,
  TrendingUp,
  DollarSign,
  MessageCircle
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalSellers: number;
  totalBuyers: number;
  totalProducts: number;
  publishedProducts: number;
  verifiedSuppliers: number;
  totalRfqs: number;
  totalOrders: number;
  pendingOrders: number;
}

export default function AdminHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [recentRfqs, setRecentRfqs] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentData();
  }, []);

  const fetchStats = async () => {
    // Fetch user counts by role
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: totalSellers } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'seller');

    const { count: totalBuyers } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'buyer');

    // Fetch product counts
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    const { count: publishedProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('published', true);

    // Fetch supplier counts
    const { count: verifiedSuppliers } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true })
      .eq('verified', true);

    // Fetch RFQ counts
    const { count: totalRfqs } = await supabase
      .from('rfqs')
      .select('*', { count: 'exact', head: true });

    // Fetch order counts
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    setStats({
      totalUsers: totalUsers || 0,
      totalSellers: totalSellers || 0,
      totalBuyers: totalBuyers || 0,
      totalProducts: totalProducts || 0,
      publishedProducts: publishedProducts || 0,
      verifiedSuppliers: verifiedSuppliers || 0,
      totalRfqs: totalRfqs || 0,
      totalOrders: totalOrders || 0,
      pendingOrders: pendingOrders || 0,
    });

    setLoading(false);
  };

  const fetchRecentData = async () => {
    // Fetch recent products
    const { data: products } = await supabase
      .from('products')
      .select('id, title, created_at, published')
      .order('created_at', { ascending: false })
      .limit(5);

    if (products) setRecentProducts(products);

    // Fetch recent RFQs
    const { data: rfqs } = await supabase
      .from('rfqs')
      .select('id, title, created_at, status')
      .order('created_at', { ascending: false })
      .limit(5);

    if (rfqs) setRecentRfqs(rfqs);
  };

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats?.totalUsers || 0, 
      icon: Users, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      title: 'Sellers', 
      value: stats?.totalSellers || 0, 
      icon: Building2, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    { 
      title: 'Buyers', 
      value: stats?.totalBuyers || 0, 
      icon: Users, 
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      title: 'Products', 
      value: stats?.totalProducts || 0, 
      icon: Package, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      subtitle: `${stats?.publishedProducts || 0} published`
    },
    { 
      title: 'Verified Suppliers', 
      value: stats?.verifiedSuppliers || 0, 
      icon: Building2, 
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    },
    { 
      title: 'RFQs', 
      value: stats?.totalRfqs || 0, 
      icon: FileText, 
      color: 'text-teal-600',
      bgColor: 'bg-teal-100'
    },
    { 
      title: 'Total Orders', 
      value: stats?.totalOrders || 0, 
      icon: ShoppingCart, 
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      subtitle: `${stats?.pendingOrders || 0} pending`
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your marketplace</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No products yet</p>
            ) : (
              <div className="space-y-3">
                {recentProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm truncate max-w-[200px]">{product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(product.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      product.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent RFQs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentRfqs.length === 0 ? (
              <p className="text-muted-foreground text-sm">No RFQs yet</p>
            ) : (
              <div className="space-y-3">
                {recentRfqs.map((rfq) => (
                  <div key={rfq.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm truncate max-w-[200px]">{rfq.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(rfq.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      rfq.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rfq.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
