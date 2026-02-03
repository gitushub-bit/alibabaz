import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useCurrency } from "@/hooks/useCurrency";
import { Skeleton } from "@/components/ui/skeleton";

interface TrendingMetadata {
  priceRange?: string;
  moq?: string;
  supplier?: string;
  verified?: boolean;
}

interface TrendingItem {
  id: string;
  title: string;
  image: string | null;
  metadata: TrendingMetadata;
}

export const TrendingProducts = () => {
  const [products, setProducts] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { content } = useSiteContent();
  const { formatPrice } = useCurrency();
  const limit = content.trendingProducts?.itemCount || 8;

  const carouselRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // fetch function
  const fetchProducts = useCallback(async (pageNumber: number) => {
    const { data } = await supabase
      .from("featured_items")
      .select("*")
      .eq("section", "trending")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .range((pageNumber - 1) * limit, pageNumber * limit - 1);

    if (data?.length) {
      setProducts((prev) => {
        const newItems = data.map((item: any) => ({
          ...item,
          metadata:
            typeof item.metadata === "string"
              ? JSON.parse(item.metadata)
              : item.metadata || {},
        }));

        // Filter out duplicates based on ID
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNewItems = newItems.filter((item: TrendingItem) => !existingIds.has(item.id));

        return [...prev, ...uniqueNewItems];
      });
      setHasMore(data.length === limit);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  }, [limit]);

  // initial load
  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  // infinite scroll
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

  // load next page
  useEffect(() => {
    if (page === 1) return;
    fetchProducts(page);
  }, [page, fetchProducts]);

  // auto refresh
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("featured_items")
        .select("*")
        .eq("section", "trending")
        .eq("is_active", true)
        .order("random()")
        .limit(limit);

      if (data) {
        setProducts(
          data.map((item: any) => ({
            ...item,
            metadata:
              typeof item.metadata === "string"
                ? JSON.parse(item.metadata)
                : item.metadata || {},
          }))
        );
      }
    }, 30000); // refresh every 30 seconds

    return () => clearInterval(interval);
  }, [limit]);

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
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/product-insights/featured/${product.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="product-card group snap-start min-w-[170px] md:min-w-[200px] bg-white border border-alibaba-border rounded-lg hover:border-alibaba-orange transition-colors duration-200 overflow-hidden"
          >
            <div className="relative aspect-square overflow-hidden">
              <img
                src={product.image || "/images/placeholder.png"}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                {product.title}
              </h3>
              <p className="text-primary font-semibold text-sm mb-1">
                {product.metadata?.priceRange
                  ? product.metadata.priceRange.includes('-')
                    ? product.metadata.priceRange
                    : formatPrice(parseFloat(product.metadata.priceRange.replace(/[^0-9.]/g, '')) || 0)
                  : "Contact for price"}
              </p>
              <p className="text-xs text-muted-foreground">
                MOQ: {product.metadata?.moq || "N/A"}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-muted-foreground truncate">
                  {product.metadata?.supplier || "Unknown"}
                </span>
                {product.metadata?.verified && (
                  <span className="shrink-0 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-[8px]">✓</span>
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-4 text-sm text-muted-foreground">
          Loading more...
        </div>
      )}
    </section>
  );
};
