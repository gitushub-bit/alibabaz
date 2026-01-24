import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  title: string;
  slug: string;
  images: string[] | null;
  price_min: number | null;
  price_max: number | null;
  moq: number | null;
  unit: string | null;
  seller_id: string;
}

interface RecommendedProductsProps {
  currentProductId: string;
}

export function RecommendedProducts({ currentProductId }: RecommendedProductsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [currentProductId, user]);

  const fetchRecommendations = async () => {
    setLoading(true);
    
    try {
      let recommendedProducts: Product[] = [];

      // If user is logged in, try to get products from categories they've ordered from
      if (user) {
        const { data: orders } = await supabase
          .from('orders')
          .select('product_id')
          .eq('buyer_id', user.id)
          .limit(10);

        if (orders && orders.length > 0) {
          const productIds = orders
            .map(o => o.product_id)
            .filter(Boolean) as string[];

          if (productIds.length > 0) {
            // Get categories from ordered products
            const { data: orderedProducts } = await supabase
              .from('products')
              .select('category_id')
              .in('id', productIds);

            const categoryIds = [...new Set(orderedProducts?.map(p => p.category_id).filter(Boolean) || [])];

            if (categoryIds.length > 0) {
              // Get products from those categories
              const { data } = await supabase
                .from('products')
                .select('id, title, slug, images, price_min, price_max, moq, unit, seller_id')
                .in('category_id', categoryIds)
                .neq('id', currentProductId)
                .eq('published', true)
                .limit(4);

              if (data) {
                recommendedProducts = data;
              }
            }
          }
        }
      }

      // Fallback: Get browsing history based recommendations
      if (recommendedProducts.length < 4) {
        const storedHistory = localStorage.getItem('browsingHistory');
        if (storedHistory) {
          const history = JSON.parse(storedHistory);
          const viewedIds = history
            .map((h: any) => h.id)
            .filter((id: string) => id !== currentProductId)
            .slice(0, 5);

          if (viewedIds.length > 0) {
            // Get categories from viewed products
            const { data: viewedProducts } = await supabase
              .from('products')
              .select('category_id')
              .in('id', viewedIds);

            const categoryIds = [...new Set(viewedProducts?.map(p => p.category_id).filter(Boolean) || [])];

            if (categoryIds.length > 0) {
              const existingIds = recommendedProducts.map(p => p.id);
              const { data } = await supabase
                .from('products')
                .select('id, title, slug, images, price_min, price_max, moq, unit, seller_id')
                .in('category_id', categoryIds)
                .not('id', 'in', `(${[currentProductId, ...existingIds].join(',')})`)
                .eq('published', true)
                .limit(4 - recommendedProducts.length);

              if (data) {
                recommendedProducts = [...recommendedProducts, ...data];
              }
            }
          }
        }
      }

      // Final fallback: Just get popular/recent products
      if (recommendedProducts.length < 4) {
        const existingIds = recommendedProducts.map(p => p.id);
        const { data } = await supabase
          .from('products')
          .select('id, title, slug, images, price_min, price_max, moq, unit, seller_id')
          .neq('id', currentProductId)
          .not('id', 'in', existingIds.length > 0 ? `(${existingIds.join(',')})` : '()')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(4 - recommendedProducts.length);

        if (data) {
          recommendedProducts = [...recommendedProducts, ...data];
        }
      }

      setProducts(recommendedProducts.slice(0, 4));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setProducts([]);
    }
    
    setLoading(false);
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const price = product.price_min ?? product.price_max ?? 0;
    if (price === 0) {
      toast({
        title: 'Price not available',
        description: 'Contact supplier for pricing',
      });
      return;
    }

    addItem({
      product_id: product.id,
      title: product.title,
      image: product.images?.[0] || '/placeholder.svg',
      price,
      quantity: product.moq || 1,
      moq: product.moq || 1,
      unit: product.unit || 'piece',
      seller_id: product.seller_id,
      seller_name: 'Seller',
    });

    toast({ title: 'Added to cart' });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Recommended for You</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Recommended for You</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Card
            key={product.id}
            className="cursor-pointer hover:shadow-md transition-shadow group"
            onClick={() => navigate(`/product/${product.slug}`)}
          >
            <CardContent className="p-3">
              <div className="aspect-square bg-muted rounded-md overflow-hidden mb-2 relative">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleQuickAdd(product, e)}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-medium text-sm line-clamp-2">{product.title}</h3>
              <p className="text-sm text-primary mt-1">
                {product.price_min
                  ? `$${product.price_min.toFixed(2)}`
                  : 'Contact for price'}
              </p>
              {product.moq && product.moq > 1 && (
                <p className="text-xs text-muted-foreground">
                  Min. order: {product.moq} {product.unit || 'pcs'}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
