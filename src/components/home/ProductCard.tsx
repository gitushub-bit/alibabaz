import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { useCurrency } from '@/hooks/useCurrency';
import { supabase } from '@/integrations/supabase/client';

interface ProductCardProps {
  image: string;
  title: string;
  price: string;
  originalPrice?: string;
  discount?: number;
  moq?: number;
  supplier?: string;
  isVerified?: boolean;
  isFlashDeal?: boolean;
  slug?: string;
  rating?: number;
  orders?: number;
  dealId?: string;
  showConversion?: boolean;
  openInNewTab?: boolean;
}

export const ProductCard = ({
  image,
  title,
  price,
  originalPrice,
  discount,
  moq,
  supplier,
  isVerified = false,
  isFlashDeal = false,
  slug,
  rating,
  orders,
  dealId,
  showConversion = false,
  openInNewTab = false,
}: ProductCardProps) => {
  const { formatPriceOnly, currency } = useCurrency();

  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", slug)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
      } else {
        setReviews(data || []);
        if (data && data.length > 0) {
          const totalRating = data.reduce((acc: number, review: any) => acc + review.rating, 0);
          setAverageRating(totalRating / data.length);
        }
      }
    };

    fetchReviews();
  }, [slug]);

  const parsePrice = (p: string | undefined) => {
    if (!p) return 0;
    const cleaned = p.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  const priceNum = parsePrice(price);
  const originalPriceNum = originalPrice ? parsePrice(originalPrice) : undefined;

  const CardContent = () => (
    <div className="flex flex-col h-full">
      {/* IMAGE */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />

        {isFlashDeal && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground gap-1">
            <Flame className="w-3 h-3" />
            Flash Deal
          </Badge>
        )}

        {discount && discount > 0 && (
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
            -{discount}%
          </Badge>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-3 flex-1 flex-col justify-between">
        <div>
          <h3 className="text-sm font-medium line-clamp-2 text-foreground">{title}</h3>

          <div className="flex flex-col mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-primary">
                {formatPriceOnly(priceNum)}
              </span>
              {originalPriceNum && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPriceOnly(originalPriceNum)}
                </span>
              )}
            </div>
            {showConversion && currency.code !== 'USD' && (
              <span className="text-xs text-muted-foreground">
                ≈ ${priceNum.toFixed(2)} USD
              </span>
            )}
          </div>

          {moq && (
            <p className="text-xs text-muted-foreground mt-2">
              Min. order:{" "}
              <span className="font-medium text-foreground">
                {moq} {moq === 1 ? "piece" : "pieces"}
              </span>
            </p>
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-3 flex flex-col gap-2">
          {(averageRating > 0 || orders) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {averageRating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400" />
                  {averageRating.toFixed(1)} ({reviews.length} Reviews)
                </span>
              )}
              {orders && (
                <span>{orders.toLocaleString()}+ sold</span>
              )}
            </div>
          )}

          {/* LATEST REVIEWS */}
          {reviews.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-medium text-foreground">Latest Reviews</h4>
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span>{review.rating}</span>
                </div>
              ))}
            </div>
          )}

          {/* SUPPLIER + VERIFIED */}
          {supplier && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {isVerified && <VerifiedBadge />}
              <span className="truncate">{supplier}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const cardClass =
    "product-card group cursor-pointer rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 bg-card h-full";

  const linkProps = openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {};

  if (dealId) {
    return (
      <Link to={`/product-insights/deal/${dealId}`} className={cardClass} {...linkProps}>
        <CardContent />
      </Link>
    );
  }

  if (slug) {
    return (
      <Link to={`/product/${slug}`} className={cardClass} {...linkProps}>
        <CardContent />
      </Link>
    );
  }

  return <div className={cardClass}><CardContent /></div>;
};
