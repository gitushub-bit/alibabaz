import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronRight, TrendingUp, ShoppingCart, Star, MapPin, Shield, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
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
  const [currentSlide, setCurrentSlide] = useState(0);
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

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.8;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!content.trendingProducts?.enabled) return null;

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3">
                <Skeleton className="h-36 w-full mb-3 rounded-lg" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-[#FF6B35] to-orange-500 rounded-lg shadow-sm">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                {content.trendingProducts?.title || "Trending Products"}
              </h2>
            </div>
            <p className="text-gray-600 ml-11 text-lg">
              Discover our most popular products this week
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200 shadow-sm"
          >
            View All Products
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Desktop Grid - Responsive columns */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#FF6B35]/30"
            >
              {/* Product Image */}
              <Link to={`/product-insights/${product.slug || product.id}`}>
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <img
                    src={product.image || "/placeholder.svg?height=192&width=192"}
                    alt={product.title}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.is_verified && (
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs px-3 py-1 h-6 shadow-sm">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {product.rating >= 4 && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white text-xs px-3 py-1 h-6 shadow-sm">
                        <Star className="w-3 h-3 mr-1 fill-white" />
                        {product.rating.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Country Flag */}
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-white/95 backdrop-blur-sm text-xs px-3 py-1 h-6 border-gray-200 shadow-sm">
                      <MapPin className="w-3 h-3 mr-1 text-gray-600" />
                      <span className="text-gray-700">{product.country}</span>
                    </Badge>
                  </div>
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-4">
                <Link to={`/product-insights/${product.slug || product.id}`}>
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[2.5rem] group-hover:text-[#FF6B35] transition-colors mb-3">
                    {product.title}
                  </h3>
                </Link>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xl font-bold text-[#FF6B35]">
                      ${formatPrice(product.price_min)}
                    </span>
                    {product.price_max && product.price_max > product.price_min && (
                      <span className="text-sm text-gray-500">
                        ~ ${formatPrice(product.price_max)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      MOQ: {product.moq} {product.unit}
                    </p>
                    <Badge variant="outline" className="text-xs border-gray-200 bg-gray-50">
                      {product.category}
                    </Badge>
                  </div>
                </div>

                {/* Supplier */}
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-4 p-2 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 flex items-center justify-center">
                    <span className="text-blue-600 text-xs font-bold">S</span>
                  </div>
                  <span className="truncate flex-1">{product.supplier_name}</span>
                </div>

                {/* Add to Cart Button */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-gradient-to-r from-[#FF6B35] to-orange-500 hover:from-[#FF854F] hover:to-orange-600 text-white text-sm h-10 shadow-md hover:shadow-lg"
                    onClick={(e) => handleAddToCart(product, e)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 px-3 border-gray-200 hover:border-[#FF6B35] hover:text-[#FF6B35]"
                    asChild
                  >
                    <Link to={`/product-insights/${product.slug || product.id}`}>
                      View
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Trending Now</h3>
              <p className="text-gray-600 text-sm">Swipe to browse</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-gray-300 hover:border-[#FF6B35]"
                onClick={() => scrollCarousel('left')}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-gray-300 hover:border-[#FF6B35]"
                onClick={() => scrollCarousel('right')}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 pl-2 pr-2"
          >
            {products.map((product, index) => (
              <div
                key={product.id}
                className="snap-start min-w-[85vw] sm:min-w-[70vw] bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100"
              >
                <Link to={`/product-insights/${product.slug || product.id}`}>
                  {/* Product Image */}
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    <img
                      src={product.image || "/placeholder.svg?height=224&width=224"}
                      alt={product.title}
                      className="w-full h-full object-contain p-6"
                      loading="lazy"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {product.is_verified && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-3 py-1.5 shadow-md">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {product.rating >= 4 && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-xs px-3 py-1.5 shadow-md">
                          <Star className="w-3 h-3 mr-1 fill-white" />
                          {product.rating.toFixed(1)}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="absolute top-4 right-4">
                      <Badge variant="outline" className="bg-white/95 backdrop-blur-sm text-xs px-3 py-1.5 border-gray-200 shadow-md">
                        <MapPin className="w-3 h-3 mr-1" />
                        {product.country}
                      </Badge>
                    </div>
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-5">
                  <Link to={`/product-insights/${product.slug || product.id}`}>
                    <h3 className="text-base font-semibold text-gray-800 line-clamp-2 min-h-[3rem] mb-3">
                      {product.title}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold text-[#FF6B35]">
                        ${formatPrice(product.price_min)}
                      </span>
                      {product.price_max && product.price_max > product.price_min && (
                        <span className="text-sm text-gray-500">
                          ~ ${formatPrice(product.price_max)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        MOQ: {product.moq} {product.unit}
                      </p>
                      <Badge variant="outline" className="text-sm border-gray-200 bg-gray-50">
                        {product.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Supplier */}
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-5 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 flex items-center justify-center shadow-sm">
                      <span className="text-blue-600 text-sm font-bold">S</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium truncate">{product.supplier_name}</p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-gradient-to-r from-[#FF6B35] to-orange-500 hover:from-[#FF854F] hover:to-orange-600 text-white text-base h-12 shadow-lg hover:shadow-xl"
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 px-4 border-gray-300 hover:border-[#FF6B35] hover:text-[#FF6B35] text-base"
                      asChild
                    >
                      <Link to={`/product-insights/${product.slug || product.id}`}>
                        Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {products.slice(0, 4).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (carouselRef.current) {
                    const scrollAmount = carouselRef.current.clientWidth * 0.85 * index;
                    carouselRef.current.scrollTo({
                      left: scrollAmount,
                      behavior: 'smooth'
                    });
                  }
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-[#FF6B35] w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Mobile View All Button */}
        <div className="md:hidden text-center mt-10">
          <Link
            to="/products"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-orange-500 text-white rounded-xl font-semibold hover:from-[#FF854F] hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl text-base"
          >
            Browse All Products
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
