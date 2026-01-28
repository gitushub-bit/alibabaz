import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronRight, TrendingUp, ShoppingCart, Star, MapPin, Shield, ChevronLeft, ChevronRight as ChevronRightIcon, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
  seller_id?: string;
  type?: string; // Add type to handle different product types
}

export const TrendingProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { content } = useSiteContent();
  const { formatPrice } = useCurrency();
  const { addItem } = useCart();
  const navigate = useNavigate();
  
  const carouselRef = useRef<HTMLDivElement>(null);

  // Track scroll for carousel indicators
  const handleScroll = useCallback(() => {
    if (carouselRef.current && products.length > 0) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const cardWidth = carouselRef.current.scrollWidth / products.length;
      const newSlide = Math.round(scrollLeft / cardWidth);
      setCurrentSlide(newSlide);
    }
  }, [products.length]);

  // Fetch random products from database
  const fetchRandomProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching trending products...");
      
      // First try to get featured products
      const { data: featuredData, error: featuredError } = await supabase
        .from("featured_items")
        .select(`
          *,
          product:products(
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
            supplier:profiles(id, company_name),
            rating,
            slug,
            seller_id,
            published,
            type
          )
        `)
        .eq("section", "trending")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(8);

      if (!featuredError && featuredData && featuredData.length > 0) {
        console.log("Found featured items:", featuredData.length);
        const processedFeatured = featuredData
          .filter(item => item.product && item.product.published)
          .map(item => ({
            id: item.product.id,
            title: item.product.title || "Unnamed Product",
            image: getSafeImage(item.product.images) || getSafeImage(item.image),
            price_min: item.product.price_min || item.price || 0,
            price_max: item.product.price_max || item.original_price || item.product.price_min || 0,
            moq: item.product.moq || item.moq || 1,
            unit: item.product.unit || "piece",
            country: item.product.country || "Global",
            is_verified: item.product.is_verified || item.is_verified || false,
            category: item.product.category?.name || item.category || "Uncategorized",
            supplier_name: item.product.supplier?.company_name || item.supplier || "Supplier",
            rating: item.product.rating || Math.floor(Math.random() * 2) + 4,
            slug: item.product.slug || item.slug || item.product.id,
            seller_id: item.product.seller_id,
            type: item.product.type || item.type || 'product'
          }));
        
        if (processedFeatured.length > 0) {
          setProducts(processedFeatured);
          setLoading(false);
          return;
        }
      }

      // Fallback to regular products
      console.log("Falling back to regular products...");
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
          supplier:profiles(id, company_name),
          rating,
          slug,
          seller_id,
          published,
          type
        `)
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) {
        console.error("Error fetching trending products:", error);
        setError("Failed to load products");
        createSampleProducts();
        return;
      }

      if (data && data.length > 0) {
        console.log(`Found ${data.length} regular products`);
        processProducts(data);
      } else {
        console.log("No products found");
        setError("No trending products available");
        createSampleProducts();
      }
    } catch (error) {
      console.error("Error in fetchRandomProducts:", error);
      setError("Failed to load products");
      createSampleProducts();
    } finally {
      setLoading(false);
    }
  }, []);

  const processProducts = (productsData: any[]) => {
    console.log("Processing products data:", productsData);
    
    const processed = productsData.map((item: any) => ({
      id: item.id,
      title: item.title || "Unnamed Product",
      image: getSafeImage(item.images),
      price_min: item.price_min || 0,
      price_max: item.price_max || item.price_min || 0,
      moq: item.moq || 1,
      unit: item.unit || "piece",
      country: item.country || "Global",
      is_verified: item.is_verified || false,
      category: item.category?.name || "Uncategorized",
      supplier_name: item.supplier?.company_name || "Supplier",
      rating: item.rating || Math.floor(Math.random() * 2) + 4,
      slug: item.slug || item.id,
      seller_id: item.seller_id,
      type: item.type || 'product'
    }));

    console.log("Processed products:", processed);
    setProducts(processed);
  };

  const getSafeImage = (images: any): string | null => {
    if (!images) return null;
    
    try {
      if (Array.isArray(images) && images.length > 0) {
        const img = images[0];
        if (img && typeof img === 'string') {
          // Check if it's already a URL
          if (img.startsWith('http') || img.startsWith('https') || img.startsWith('data:')) {
            return img;
          }
          
          // Try to get from Supabase storage
          if (img.includes('supabase.co')) {
            return img;
          }
          
          // Try to construct a URL
          const { data } = supabase.storage
            .from('product-images')
            .getPublicUrl(img);
            
          return data.publicUrl || null;
        }
      } else if (typeof images === 'string') {
        try {
          const parsed = JSON.parse(images);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return getSafeImage(parsed);
          }
        } catch {
          // If it's a string URL, return it
          if (images.startsWith('http') || images.startsWith('https') || images.startsWith('data:')) {
            return images;
          }
        }
      }
    } catch (error) {
      console.error("Error getting safe image:", error);
    }
    
    return null;
  };

  const createSampleProducts = () => {
    const sampleProducts: Product[] = [
      {
        id: "sample-1",
        title: "Premium Wireless Headphones",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
        price_min: 29.99,
        price_max: 39.99,
        moq: 50,
        unit: "piece",
        country: "China",
        is_verified: true,
        category: "Electronics",
        supplier_name: "Global Suppliers Inc.",
        rating: 4.8,
        slug: "premium-wireless-headphones",
        type: "product"
      },
      {
        id: "sample-2",
        title: "Smart Watch Series 7",
        image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop",
        price_min: 89.99,
        price_max: 99.99,
        moq: 100,
        unit: "piece",
        country: "Taiwan",
        is_verified: true,
        category: "Wearables",
        supplier_name: "Tech Manufacturers Ltd.",
        rating: 4.5,
        slug: "smart-watch-series-7",
        type: "product"
      },
      {
        id: "sample-3",
        title: "Ergonomic Office Chair",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        price_min: 149.99,
        price_max: 199.99,
        moq: 10,
        unit: "piece",
        country: "Vietnam",
        is_verified: true,
        category: "Furniture",
        supplier_name: "Comfort Furniture Co.",
        rating: 4.7,
        slug: "ergonomic-office-chair",
        type: "product"
      },
      {
        id: "sample-4",
        title: "Multi-Port USB-C Hub",
        image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=400&fit=crop",
        price_min: 39.99,
        price_max: 49.99,
        moq: 100,
        unit: "piece",
        country: "China",
        is_verified: true,
        category: "Computer Accessories",
        supplier_name: "Connect Tech Ltd.",
        rating: 4.6,
        slug: "multi-port-usb-c-hub",
        type: "product"
      }
    ];
    
    setProducts(sampleProducts);
  };

  // Initial load
  useEffect(() => {
    fetchRandomProducts();
  }, [fetchRandomProducts]);

  // Add scroll event listener
  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll);
      return () => carousel.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

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
      seller_id: product.seller_id,
      seller_name: product.supplier_name,
      supplier_company: product.supplier_name,
      supplier_verified: product.is_verified,
    });

    toast.success(`Added ${product.title} to cart`);
  };

  const handleProductClick = (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Determine the correct URL based on product type
    let productUrl = `/product-insights/${product.slug || product.id}`;
    
    // If it's a featured item or has a specific type
    if (product.type === 'featured' || product.type === 'deal') {
      productUrl = `/product-insights/${product.type}/${product.slug || product.id}`;
    }
    
    console.log(`Navigating to: ${productUrl}`);
    
    // Navigate to product page
    navigate(productUrl);
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.85;
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

        {error && !products.length ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">{error}</div>
            <Button 
              onClick={fetchRandomProducts}
              className="bg-[#FF6B35] hover:bg-[#FF854F]"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Grid - Responsive columns */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#FF6B35]/30"
                  onClick={() => handleProductClick(product)}
                >
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer">
                    <img
                      src={product.image || "/placeholder.svg?height=192&width=192"}
                      alt={product.title}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=192&width=192";
                      }}
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

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 
                      className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[2.5rem] group-hover:text-[#FF6B35] transition-colors mb-3 cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      {product.title}
                    </h3>

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
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product, e);
                        }}
                      >
                        <Eye className="w-4 h-4" />
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
                    onClick={() => handleProductClick(product)}
                  >
                    {/* Product Image */}
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer">
                      <img
                        src={product.image || "/placeholder.svg?height=224&width=224"}
                        alt={product.title}
                        className="w-full h-full object-contain p-6"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=224&width=224";
                        }}
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

                    {/* Product Info */}
                    <div className="p-5">
                      <h3 
                        className="text-base font-semibold text-gray-800 line-clamp-2 min-h-[3rem] mb-3 cursor-pointer"
                        onClick={() => handleProductClick(product)}
                      >
                        {product.title}
                      </h3>

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
                      <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product, e);
                          }}
                        >
                          <Eye className="w-5 h-5 mr-2" />
                          View
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
          </>
        )}

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
