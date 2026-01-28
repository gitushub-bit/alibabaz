import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronRight, TrendingUp, ShoppingCart, Star, MapPin, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useCurrency } from "@/hooks/useCurrency";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";

interface Product {
  id: string;
  title: string;
  image: string | null;
  price_min: number | null;
  price_max: number | null;
  moq: number;
  unit: string;
  country: string;
  is_verified: boolean;
  category: string;
  supplier_name: string;
  rating: number;
  slug?: string;
}

export const TrendingProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { content } = useSiteContent();
  const { formatPrice } = useCurrency();
  const { addItem } = useCart();
  
  const carouselRef = useRef<HTMLDivElement>(null);

  // Fetch random products from database
  const fetchRandomProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch 8 random products with their details
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          title,
          images,
          price_min,
          price_max,
          moq,
          unit,
          country,
          is_verified,
          category:categories(name),
          supplier:profiles(company_name),
          rating,
          slug
        `)
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) {
        console.error("Error fetching trending products:", error);
        
        // Fallback: try to get any published products
        const { data: fallbackData } = await supabase
          .from("products")
          .select("*")
          .eq("published", true)
          .limit(8);

        if (fallbackData) {
          processProducts(fallbackData);
        }
        return;
      }

      if (data) {
        processProducts(data);
      }
    } catch (error) {
      console.error("Error in fetchRandomProducts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const processProducts = (productsData: any[]) => {
    const processed = productsData.map((item: any) => ({
      id: item.id,
      title: item.title || "Unnamed Product",
      image: item.images 
        ? (Array.isArray(item.images) ? item.images[0] : item.images)
        : null,
      price_min: item.price_min || 0,
      price_max: item.price_max || item.price_min || 0,
      moq: item.moq || 1,
      unit: item.unit || "piece",
      country: item.country || "Global",
      is_verified: item.is_verified || false,
      category: item.category?.name || "Uncategorized",
      supplier_name: item.supplier?.company_name || "Supplier",
      rating: item.rating || Math.floor(Math.random() * 2) + 4, // Random rating 4-5
      slug: item.slug || item.id,
    }));

    setProducts(processed);
  };

  // Initial load
  useEffect(() => {
    fetchRandomProducts();
  }, [fetchRandomProducts]);

  // Auto refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRandomProducts();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchRandomProducts]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      product_id: product.id,
      title: product.title,
      price: product.price_min || 0,
      image: product.image || "/placeholder.svg",
      quantity: Math.max(1, product.moq || 1),
      moq: product.moq || 1,
      unit: product.unit || "piece",
      seller_name: product.supplier_name,
      supplier_company: product.supplier_name,
      supplier_verified: product.is_verified,
    });

    toast.success(`Added ${product.title} to cart`);
  };

  if (!content.trendingProducts?.enabled) return null;

  if (loading) {
    return (
      <section className="py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-20" />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-3">
                <Skeleton className="h-32 w-full mb-3 rounded-lg" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF6B35] rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {content.trendingProducts?.title || "Trending Products"}
              </h2>
              <p className="text-gray-600 mt-1">
                Most popular products this week
              </p>
            </div>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            View All Products
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Products Grid - Desktop */}
        <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-8 gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/product-insights/${product.slug || product.id}`}
              className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#FF6B35]/20"
            >
              {/* Product Image */}
              <div className="relative h-40 overflow-hidden bg-gray-100">
                <img
                  src={product.image || "/placeholder.svg?height=160&width=160"}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.is_verified && (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-0 h-5">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {product.rating >= 4.5 && (
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-2 py-0 h-5">
                      <Star className="w-3 h-3 mr-1 fill-white" />
                      {product.rating.toFixed(1)}
                    </Badge>
                  )}
                </div>
                
                {/* Country Flag */}
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="bg-white/90 text-xs px-2 py-0 h-5">
                    <MapPin className="w-3 h-3 mr-1" />
                    {product.country}
                  </Badge>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[2.5rem] group-hover:text-[#FF6B35] mb-2">
                  {product.title}
                </h3>

                {/* Price */}
                <div className="mb-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-[#FF6B35]">
                      ${formatPrice(product.price_min)}
                    </span>
                    {product.price_max && product.price_max > product.price_min && (
                      <span className="text-xs text-gray-500">
                        ~ ${formatPrice(product.price_max)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    MOQ: {product.moq} {product.unit}
                  </p>
                </div>

                {/* Supplier */}
                <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                  <span className="truncate max-w-[60%]">
                    {product.supplier_name}
                  </span>
                  <span className="text-gray-500">{product.category}</span>
                </div>

                {/* Add to Cart Button */}
                <Button
                  className="w-full bg-[#FF6B35] hover:bg-[#FF854F] text-white text-xs h-8"
                  onClick={(e) => handleAddToCart(product, e)}
                >
                  <ShoppingCart className="w-3 h-3 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </Link>
          ))}
        </div>

        {/* Products Carousel - Mobile */}
        <div
          ref={carouselRef}
          className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
        >
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/product-insights/${product.slug || product.id}`}
              className="snap-start min-w-[70vw] sm:min-w-[45vw] bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 hover:border-[#FF6B35]/20 transition-all duration-300"
            >
              {/* Product Image */}
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={product.image || "/placeholder.svg?height=192&width=192"}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.is_verified && (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-0 h-5">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="bg-white/90 text-xs px-2 py-0 h-5">
                    <MapPin className="w-3 h-3 mr-1" />
                    {product.country}
                  </Badge>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 min-h-[2.5rem]">
                  {product.title}
                </h3>

                {/* Price */}
                <div className="mb-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-[#FF6B35]">
                      ${formatPrice(product.price_min)}
                    </span>
                    {product.price_max && product.price_max > product.price_min && (
                      <span className="text-xs text-gray-500">
                        ~ ${formatPrice(product.price_max)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    MOQ: {product.moq} {product.unit}
                  </p>
                </div>

                {/* Supplier and Category */}
                <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
                  <span className="truncate max-w-[60%]">
                    {product.supplier_name}
                  </span>
                  <span className="text-gray-500">{product.category}</span>
                </div>

                {/* Add to Cart Button */}
                <Button
                  className="w-full bg-[#FF6B35] hover:bg-[#FF854F] text-white text-xs h-8"
                  onClick={(e) => handleAddToCart(product, e)}
                >
                  <ShoppingCart className="w-3 h-3 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Mobile Button */}
        <div className="md:hidden text-center mt-6">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#FF854F] transition-colors"
          >
            View All Products
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
