import { useState, useEffect } from "react";
import { ChevronRight, Clock, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useCurrency } from "@/hooks/useCurrency";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  title: string;
  slug: string;
  images: string[] | null;
  price_min: number | null;
  price_max: number | null;
  moq: number | null;
  unit: string | null;
  verified: boolean | null;
  seller_id: string;
  created_at: string;
}

interface SupplierInfo {
  user_id: string;
  verified: boolean | null;
}

interface ProfileInfo {
  user_id: string;
  company_name: string | null;
  full_name: string | null;
}

export const TopDeals = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Map<string, SupplierInfo>>(new Map());
  const [profiles, setProfiles] = useState<Map<string, ProfileInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const { content } = useSiteContent();
  const { formatPriceOnly } = useCurrency();

  // Countdown state for flash deals
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Set countdown to 24 hours from now
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 24);

    const interval = setInterval(() => {
      const diff = endTime.getTime() - Date.now();
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Fetch verified products with best prices (simulating deals)
      const { data: productsData, error } = await supabase
        .from('products')
        .select('id, title, slug, images, price_min, price_max, moq, unit, verified, seller_id, created_at')
        .eq('published', true)
        .eq('verified', true)
        .not('price_min', 'is', null)
        .order('price_min', { ascending: true })
        .limit(content.topDeals?.itemCount || 8);

      if (error) throw error;

      if (productsData && productsData.length > 0) {
        // Fetch supplier and profile info
        const sellerIds = [...new Set(productsData.map(p => p.seller_id))];

        if (sellerIds.length > 0) {
          const [suppliersRes, profilesRes] = await Promise.all([
            supabase.from('suppliers').select('user_id, verified').in('user_id', sellerIds),
            supabase.from('profiles').select('user_id, company_name, full_name').in('user_id', sellerIds)
          ]);

          if (suppliersRes.data) {
            const supplierMap = new Map(suppliersRes.data.map(s => [s.user_id, s]));
            setSuppliers(supplierMap);
          }

          if (profilesRes.data) {
            const profileMap = new Map(profilesRes.data.map(p => [p.user_id, p]));
            setProfiles(profileMap);
          }
        }

        setProducts(productsData);
      }
    } catch (error) {
      console.error('Error fetching top deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  // Calculate discount percentage (simulated as 20-40% off)
  const getDiscountPercentage = (price: number) => {
    return Math.floor(20 + (price % 20)); // Random discount between 20-40%
  };

  const getOriginalPrice = (currentPrice: number, discount: number) => {
    return currentPrice / (1 - discount / 100);
  };

  if (!content.topDeals?.enabled) return null;

  if (loading) {
    return (
      <section className="py-6 gradient-deals">
        <div className="section-header px-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 gradient-deals">
      <div className="section-header px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary fill-primary" />
            <h2 className="section-title">{content.topDeals?.title || 'Top Deals'}</h2>
          </div>

          {timeLeft > 0 && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm font-medium">
              <Clock className="w-4 h-4" />
              <span>Ends in {formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        <Link
          to="/products?sort=price-low"
          className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
        >
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <p className="text-sm text-muted-foreground px-4 mb-4">
        {content.topDeals?.description || 'Score the lowest prices on Alibaba.com'}
      </p>

      {products.length === 0 ? (
        <div className="text-center py-12 px-4">
          <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No deals available</h3>
          <p className="text-muted-foreground mb-6">
            Check back later for amazing deals
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4">
          {products.slice(0, content.topDeals?.itemCount || 8).map((product) => {
            const supplier = suppliers.get(product.seller_id);
            const profile = profiles.get(product.seller_id);
            const discount = getDiscountPercentage(product.price_min || 0);
            const originalPrice = getOriginalPrice(product.price_min || 0, discount);
            const isFlashDeal = Math.random() > 0.5; // Randomly mark some as flash deals

            return (
              <Link
                key={product.id}
                to={`/product/${product.slug}`}
                className="block group bg-card rounded-xl overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.images?.[0] || '/placeholder.svg'}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Flash Deal Badge */}
                  {isFlashDeal && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-bold">
                      <Zap className="h-3 w-3 fill-current" />
                      Flash Deal
                    </div>
                  )}

                  {/* Discount Badge */}
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-bold">
                    -{discount}%
                  </div>

                  {/* Verified Badge */}
                  {product.verified && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-medium">
                      <Shield className="h-3 w-3" />
                      <span className="hidden sm:inline">Verified</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3 space-y-2">
                  {/* Title */}
                  <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                    {product.title}
                  </h3>

                  {/* Price */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-primary">
                        {formatPriceOnly(product.price_min || 0)}
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPriceOnly(originalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* MOQ */}
                  <p className="text-xs text-muted-foreground">
                    Min. order: {product.moq || 1} {product.unit || 'piece'}
                  </p>

                  {/* Supplier Info */}
                  {profile && (
                    <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground truncate flex-1">
                        {profile.company_name || profile.full_name || 'Seller'}
                      </span>
                      {supplier?.verified && (
                        <div className="shrink-0 w-4 h-4 rounded-full bg-primary flex items-center justify-center ml-1">
                          <span className="text-primary-foreground text-[8px]">✓</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};
