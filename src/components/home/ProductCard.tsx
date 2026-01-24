import { Badge } from "@/components/ui/badge";
import { Star, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { useCurrency } from "@/hooks/useCurrency";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

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
  
  // Parse price as number - check if it's already formatted or raw number
  const parsePrice = (p: string | undefined) => {
    if (!p) return 0;
    // Remove currency symbols and parse
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

        {/* FLASH DEAL */}
        {isFlashDeal && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground gap-1">
            <Flame className="w-3 h-3" />
            Flash Deal
          </Badge>
        )}

        {/* DISCOUNT */}
        {discount && discount > 0 && (
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
            -{discount}%
          </Badge>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* TITLE */}
          <h3 className="text-sm font-medium line-clamp-2 text-foreground">
            {title}
          </h3>

          {/* PRICE */}
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

          {/* MOQ */}
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
          {/* RATINGS */}
          {(rating || orders) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {rating && (
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400" />
                  {rating.toFixed(1)}
                </span>
              )}
              {orders && (
                <span>{orders.toLocaleString()}+ sold</span>
              )}
            </div>
          )}

          {/* SUPPLIER + VERIFIED */}
          {supplier && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {isVerified && (
                <VerifiedBadge size="sm" />
              )}
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

  return (
    <div className={cardClass}>
      <CardContent />
    </div>
  );
};
