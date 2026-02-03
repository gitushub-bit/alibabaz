import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/useCurrency";
import { ExternalLink } from "lucide-react";

interface Product {
  id: string;
  title: string;
  slug: string;
  images: string[] | null;
  price_min: number | null;
  price_max: number | null;
}

interface CategoryProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
}

export const CategoryProductsModal = ({
  isOpen,
  onClose,
  categoryId,
  categoryName,
}: CategoryProductsModalProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPriceOnly } = useCurrency();

  useEffect(() => {
    if (isOpen && categoryId) {
      fetchProducts();
    }
  }, [isOpen, categoryId]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, title, slug, images, price_min, price_max")
      .eq("category_id", categoryId)
      .eq("published", true)
      .limit(12);

    if (data && !error) {
      setProducts(data);
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{categoryName} Products</DialogTitle>
          <DialogDescription>
            Browse top products in {categoryName}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No products found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/product-insights/product/${product.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group cursor-pointer"
                onClick={onClose}
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-2 relative">
                  <img
                    src={product.images?.[0] || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-4 w-4 text-primary-foreground bg-primary rounded p-0.5" />
                  </div>
                </div>
                <p className="text-xs md:text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {product.title}
                </p>
                <p className="text-xs md:text-sm text-primary font-semibold">
                  {product.price_min !== null
                    ? formatPriceOnly(product.price_min)
                    : "Contact for price"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};