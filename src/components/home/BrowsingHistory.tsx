import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Link } from "react-router-dom";

interface BrowsingHistoryItem {
  id: string;
  slug: string;
  title: string;
  image: string;
  price_min: number;
  price_max: number;
  viewed_at: number;
}

export const BrowsingHistory = () => {
  const { content } = useSiteContent();
  const [history, setHistory] = useState<BrowsingHistoryItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("browsingHistory");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as BrowsingHistoryItem[];

      // Sort by most recent
      const sorted = parsed.sort((a, b) => b.viewed_at - a.viewed_at);

      setHistory(sorted.slice(0, 10));
    } catch (e) {
      console.error("Error parsing browsing history:", e);
      localStorage.removeItem("browsingHistory");
    }
  }, []);

  if (!content.browsingHistory?.enabled || history.length === 0) return null;

  return (
    <section className="py-4">
      <div className="section-header px-4">
        <h2 className="section-title">Recently Viewed</h2>
        <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          See all <ChevronRight className="w-5 h-5" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2">
        {history.map((item) => (
          <div key={item.id} className="shrink-0 w-40">
            <ProductCard
              image={item.image || "/placeholder.svg"}
              title={item.title}
              price={`${item.price_min} - ${item.price_max}`}
              slug={item.slug}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
