import { useState, useEffect } from "react";
import { ChevronRight, Clock, Zap, AlertCircle } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useCurrency } from "@/hooks/useCurrency";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Deal {
  id: string;
  product_id?: string;
  title: string;
  image: string | null;
  price: number | null;
  original_price: number | null;
  discount: number | null;
  moq: number | null;
  supplier: string | null;
  is_verified: boolean | null;
  is_flash_deal: boolean | null;
  ends_at?: string | null;
  created_at: string;
}

// Fallback deals data (in case database is empty)
const fallbackDeals: Deal[] = [
  {
    id: "1",
    title: "Wireless Bluetooth Headphones",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    price: 29.99,
    original_price: 49.99,
    discount: 40,
    moq: 50,
    supplier: "Shenzhen Electronics Co.",
    is_verified: true,
    is_flash_deal: true,
    ends_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Organic Cotton T-Shirts",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    price: 8.50,
    original_price: 12.99,
    discount: 35,
    moq: 100,
    supplier: "Guangzhou Textiles Ltd.",
    is_verified: true,
    is_flash_deal: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Stainless Steel Water Bottles",
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=400&fit=crop",
    price: 6.80,
    original_price: 9.99,
    discount: 32,
    moq: 200,
    supplier: "Dongguan Manufacturing",
    is_verified: true,
    is_flash_deal: true,
    ends_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "LED Desk Lamp with USB",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop",
    price: 14.99,
    original_price: 24.99,
    discount: 40,
    moq: 50,
    supplier: "Foshan Lighting",
    is_verified: true,
    is_flash_deal: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Portable Power Bank 20000mAh",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop",
    price: 22.50,
    original_price: 34.99,
    discount: 36,
    moq: 100,
    supplier: "Shenzhen Tech Solutions",
    is_verified: true,
    is_flash_deal: true,
    ends_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "6",
    title: "Yoga Mat Non-Slip",
    image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=400&fit=crop",
    price: 9.99,
    original_price: 16.99,
    discount: 41,
    moq: 50,
    supplier: "Hangzhou Sports Goods",
    is_verified: true,
    is_flash_deal: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "7",
    title: "Wireless Charging Pad",
    image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=400&fit=crop",
    price: 12.80,
    original_price: 19.99,
    discount: 36,
    moq: 100,
    supplier: "Ningbo Electronics",
    is_verified: true,
    is_flash_deal: true,
    ends_at: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "8",
    title: "Insulated Lunch Bag",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    price: 4.99,
    original_price: 8.99,
    discount: 45,
    moq: 200,
    supplier: "Wenzhou Packaging",
    is_verified: true,
    is_flash_deal: false,
    created_at: new Date().toISOString(),
  },
];

export const TopDeals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFallbackAlert, setShowFallbackAlert] = useState(false);
  const { content } = useSiteContent();
  const { formatPriceOnly } = useCurrency();

  // Countdown state
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    fetchDeals();
  }, []);

  useEffect(() => {
    if (deals.length === 0) return;

    // Find earliest deal end time among flash deals
    const flashDealsWithEndTime = deals
      .filter(d => d.is_flash_deal && d.ends_at)
      .map(d => new Date(d.ends_at!).getTime());

    if (flashDealsWithEndTime.length === 0) return;

    const earliest = Math.min(...flashDealsWithEndTime);

    const interval = setInterval(() => {
      const diff = earliest - Date.now();
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [deals]);

  const checkDealsTable = async () => {
    try {
      const { error } = await supabase
        .from('deals')
        .select('id')
        .limit(1)
        .maybeSingle();

      return !error;
    } catch (error) {
      console.error('Error checking deals table:', error);
      return false;
    }
  };

  const fetchDeals = async () => {
    try {
      setLoading(true);
      
      // Check if deals table exists
      const tableExists = await checkDealsTable();
      
      if (!tableExists) {
        console.log('Deals table not found, using fallback data');
        setDeals(fallbackDeals);
        setShowFallbackAlert(true);
        setLoading(false);
        return;
      }

      // Fetch active deals from database
      const { data, error } = await supabase
        .from('deals')
        .select(`
          id,
          product_id,
          title,
          image,
          price,
          original_price,
          discount,
          moq,
          supplier,
          is_verified,
          is_flash_deal,
          ends_at,
          created_at
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(content.topDeals?.itemCount || 8);

      if (error) {
        console.error('Error fetching deals:', error);
        throw error;
      }

      if (data && data.length > 0) {
        setDeals(data);
        setShowFallbackAlert(false);
      } else {
        // No active deals found, show fallback
        console.log('No active deals found, using fallback data');
        setDeals(fallbackDeals);
        setShowFallbackAlert(true);
      }
    } catch (error: any) {
      console.error('Error in fetchDeals:', error);
      // Use fallback data if there's an error
      setDeals(fallbackDeals);
      setShowFallbackAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const getProductLink = (deal: Deal) => {
    // If deal has a product_id, link to the product
    if (deal.product_id) {
      return `/product-insights/deal/${deal.id}`;
    }
    // Otherwise, use the deal ID directly
    return `/product-insights/deal/${deal.id}`;
  };

  const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const hasActiveFlashDeals = deals.some(d => d.is_flash_deal && d.ends_at);

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
      {showFallbackAlert && (
        <Alert className="mx-4 mb-4 bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            Showing sample deals. Create your own deals in the admin panel.
          </AlertDescription>
        </Alert>
      )}

      <div className="section-header px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary fill-primary" />
            <h2 className="section-title">{content.topDeals?.title || 'Top Deals'}</h2>
          </div>

          {hasActiveFlashDeals && timeLeft > 0 && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm font-medium">
              <Clock className="w-4 h-4" />
              <span>Ends in {formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        <button className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
          View all <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-muted-foreground px-4 mb-4">
        {content.topDeals?.description || 'Score the lowest prices on Alibaba.com'}
      </p>

      {deals.length === 0 ? (
        <div className="text-center py-12 px-4">
          <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No deals available</h3>
          <p className="text-muted-foreground mb-6">
            Create some deals in the admin panel to feature them here
          </p>
          <Button variant="outline" onClick={() => window.location.href = '/admin/deals'}>
            Go to Admin Panel
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4">
          {deals.slice(0, content.topDeals?.itemCount || 8).map((deal) => (
            <ProductCard
              key={deal.id}
              dealId={deal.id}
              image={deal.image || ""}
              title={deal.title}
              price={String(deal.price || 0)}
              originalPrice={deal.original_price ? String(deal.original_price) : undefined}
              discount={deal.discount || undefined}
              moq={deal.moq || undefined}
              supplier={deal.supplier || undefined}
              isVerified={deal.is_verified || false}
              isFlashDeal={deal.is_flash_deal || false}
              endsAt={deal.ends_at}
              productLink={getProductLink(deal)}
              openInNewTab={true}
            />
          ))}
        </div>
      )}
    </section>
  );
};
