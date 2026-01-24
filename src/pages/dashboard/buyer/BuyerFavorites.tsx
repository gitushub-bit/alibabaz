import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Heart, Trash2, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FavoriteProduct {
  id: string;
  product_id: string;
  products: {
    id: string;
    title: string;
    slug: string;
    price_min: number | null;
    price_max: number | null;
    moq: number;
    images: string[] | null;
    verified: boolean;
    profiles: {
      company_name: string | null;
    };
  };
}

export default function BuyerFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('favorites')
      .select(`
        id,
        product_id,
        products (
          id, title, slug, price_min, price_max, moq, images, verified,
          profiles!products_seller_id_fkey (company_name)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setFavorites(data as unknown as FavoriteProduct[]);
    }
    setLoading(false);
  };

  const removeFavorite = async (id: string) => {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to remove favorite', variant: 'destructive' });
    } else {
      setFavorites(favorites.filter(f => f.id !== id));
      toast({ title: 'Removed from favorites' });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Saved Products</h1>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No saved products yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Save products you're interested in to find them easily later
          </p>
          <Button asChild className="mt-4">
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map((fav) => (
            <div key={fav.id} className="relative group">
              <Link to={`/product/${fav.products.slug}`}>
                <div className="product-card">
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={fav.products.images?.[0] || '/placeholder.svg'}
                      alt={fav.products.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {fav.products.verified && (
                      <Badge className="absolute top-2 left-2 bg-amber-100 text-amber-800 text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    <div className="price-badge">
                      {fav.products.price_min && fav.products.price_max
                        ? `$${fav.products.price_min} - $${fav.products.price_max}`
                        : 'Contact for price'}
                    </div>
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-sm text-foreground line-clamp-2">{fav.products.title}</p>
                    <p className="text-xs text-muted-foreground">
                      MOQ: {fav.products.moq} {fav.products.moq === 1 ? 'piece' : 'pieces'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fav.products.profiles?.company_name || 'Supplier'}
                    </p>
                  </div>
                </div>
              </Link>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFavorite(fav.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
