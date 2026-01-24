import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Package } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  slug: string;
  images: string[] | null;
  price_min: number | null;
  price_max: number | null;
}

interface SimilarProductsProps {
  categoryId: string | null;
  currentProductId: string;
  tags?: string[] | null;
}

export function SimilarProducts({ categoryId, currentProductId, tags }: SimilarProductsProps) {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSimilarProducts();
  }, [categoryId, currentProductId, tags]);

  const fetchSimilarProducts = async () => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('products')
        .select('id, title, slug, images, price_min, price_max')
        .neq('id', currentProductId)
        .eq('published', true)
        .limit(4);

      // Filter by category first
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // If we got products, use them; otherwise try without category filter
      if (data && data.length >= 4) {
        setProducts(data);
      } else if (data && data.length > 0) {
        setProducts(data);
      } else {
        // Fallback: get any published products
        const { data: fallbackData } = await supabase
          .from('products')
          .select('id, title, slug, images, price_min, price_max')
          .neq('id', currentProductId)
          .eq('published', true)
          .limit(4);
        
        setProducts(fallbackData || []);
      }
    } catch (error) {
      console.error('Error fetching similar products:', error);
      setProducts([]);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Similar Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
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
      <h2 className="text-lg font-bold">Similar Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Card
            key={product.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/product/${product.slug}`)}
          >
            <CardContent className="p-3">
              <div className="aspect-square bg-muted rounded-md overflow-hidden mb-2">
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
              </div>
              <h3 className="font-medium text-sm line-clamp-2">{product.title}</h3>
              <p className="text-sm text-primary mt-1">
                {product.price_min
                  ? `$${product.price_min.toFixed(2)}`
                  : 'Contact for price'}
                {product.price_max && product.price_min !== product.price_max && (
                  <span> - ${product.price_max.toFixed(2)}</span>
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
