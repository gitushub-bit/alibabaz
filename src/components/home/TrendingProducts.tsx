import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronRight, TrendingUp, Shield } from "lucide-react";
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

export const TrendingProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Map<string, SupplierInfo>>(new Map());
  const [profiles, setProfiles] = useState<Map<string, ProfileInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { content } = useSiteContent();
  const { formatPriceOnly } = useCurrency();
  const limit = content.trendingProducts?.itemCount || 12;

  const carouselRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Fetch products from database
  const fetchProducts = useCallback(async (pageNumber: number) => {
    try {
      const { data: productsData, error } = await supabase
        .from("products")
        .select("id, title, slug, images, price_min, price_max, moq, unit, verified, seller_id")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .range((pageNumber - 1) * limit, pageNumber * limit - 1);

      if (error) throw error;

      if (productsData?.length) {
        // Fetch supplier and profile info
        const sellerIds = [...new Set(productsData.map(p => p.seller_id))];

        if (sellerIds.length > 0) {
          const [suppliersRes, profilesRes] = await Promise.all([
            supabase.from('suppliers').select('user_id, verified').in('user_id', sellerIds),
            supabase.from('profiles').select('user_id, company_name, full_name').in('user_id', sellerIds)
          ]);

          if (suppliersRes.data) {
            const supplierMap = new Map(suppliersRes.data.map(s => [s.user_id, s]));
            setSuppliers(prev => new Map([...prev, ...supplierMap]));
          }

          if (profilesRes.data) {
            const profileMap = new Map(profilesRes.data.map(p => [p.user_id, p]));
            setProfiles(prev => new Map([...prev, ...profileMap]));
          }
        }

        setProducts((prev) => {
          // Filter out duplicates based on ID
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewItems = productsData.filter((item) => !existingIds.has(item.id));
          return [...prev, ...uniqueNewItems];
        });
        setHasMore(productsData.length === limit);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching trending products:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Initial load
  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore) return;

    const el = carouselRef.current;
    if (!el) return;

    const lastCard = el.querySelector(".product-card:last-child");
    if (!lastCard) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((p) => p + 1);
      }
    });

    observerRef.current.observe(lastCard);
  }, [products, hasMore]);

  // Load next page
  useEffect(() => {
    if (page === 1) return;
    fetchProducts(page);
  }, [page, fetchProducts]);

  if (!content.trendingProducts?.enabled) return null;

  if (loading) {
    return (
      <section className="py-6 px-4">
        <div className="section-header">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 px-4">
      <div className="section-header">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="section-title">
            {content.trendingProducts?.title || "Trending Now"}
          </h2>
        </div>

        <Link
          to="/products"
          className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
        >
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* MOBILE SWIPEABLE CAROUSEL */}
      <div
        ref={carouselRef}
        className="mt-4 flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      >
        {products.map((product) => {
          const supplier = suppliers.get(product.seller_id);
          const profile = profiles.get(product.seller_id);

          return (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              className="product-card group snap-start min-w-[170px] md:min-w-[200px] bg-white border border-alibaba-border rounded-lg hover:border-alibaba-orange transition-colors duration-200 overflow-hidden"
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={product.images?.[0] || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {product.verified && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-medium">
                    <Shield className="h-3 w-3" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                  {product.title}
                </h3>
                <p className="text-primary font-semibold text-sm mb-1">
                  {product.price_min && product.price_max
                    ? `${formatPriceOnly(product.price_min)} - ${formatPriceOnly(product.price_max)}`
                    : product.price_min
                      ? `From ${formatPriceOnly(product.price_min)}`
                      : "Contact for price"}
                </p>
                <p className="text-xs text-muted-foreground">
                  MOQ: {product.moq || 1} {product.unit || 'piece'}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs text-muted-foreground truncate">
                    {profile?.company_name || profile?.full_name || "Seller"}
                  </span>
                  {supplier?.verified && (
                    <span className="shrink-0 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-[8px]">✓</span>
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {hasMore && (
        <div className="text-center mt-4 text-sm text-muted-foreground">
          Loading more...
        </div>
      )}
    </section>
  );
};
