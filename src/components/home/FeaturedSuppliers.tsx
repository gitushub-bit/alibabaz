import { useState, useEffect } from "react";
import { ChevronRight, BadgeCheck, Clock, MapPin, Package, Star, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  title: string;
  image: string | null;
  price?: number;
  price_min?: number;
  price_max?: number;
  moq?: number;
  unit?: string;
  country?: string;
  is_verified?: boolean;
  category?: string;
  supplier_name?: string;
  rating?: number;
}

interface FeaturedSupplier {
  id: string;
  title: string;
  image: string | null;
  metadata: {
    category?: string;
    years?: number;
    location?: string;
    verified?: boolean;
    responseRate?: string;
  };
}

export const FeaturedSuppliers = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredSuppliers, setFeaturedSuppliers] = useState<FeaturedSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProducts, setShowProducts] = useState(false);
  const { content } = useSiteContent();
  const navigate = useNavigate();

  useEffect(() => {
    if (showProducts) {
      fetchRandomProducts();
    } else {
      fetchSuppliers();
    }
  }, [showProducts]);

  const fetchRandomProducts = async () => {
    try {
      setLoading(true);
      
      // First try to get products with images
      const { data: productsWithImages, error } = await supabase
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
          rating
        `)
        .eq("published", true)
        .not("images", "is", null)
        .order("created_at", { ascending: false })
        .limit(16);

      if (error) {
        console.error("Error loading random products:", error);
        // Fallback to any products
        const { data: allProducts } = await supabase
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
            supplier:profiles(company_name)
          `)
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(16);

        if (allProducts) {
          processProducts(allProducts);
        }
      } else if (productsWithImages) {
        processProducts(productsWithImages);
      }
    } catch (error) {
      console.error("Error in fetchRandomProducts:", error);
    } finally {
      setLoading(false);
    }
  };

  const processProducts = (productsData: any[]) => {
    const processed = productsData.map((item: any) => ({
      id: item.id,
      title: item.title || "Unnamed Product",
      image: item.images 
        ? (Array.isArray(item.images) ? item.images[0] : item.images)
        : null,
      price: item.price_min || 0,
      price_min: item.price_min,
      price_max: item.price_max,
      moq: item.moq || 1,
      unit: item.unit || "piece",
      country: item.country || "Global",
      is_verified: item.is_verified || false,
      category: item.category?.name || "Uncategorized",
      supplier_name: item.supplier?.company_name || "Supplier",
      rating: item.rating || Math.floor(Math.random() * 2) + 4, // Random rating 4-5
    }));

    setProducts(processed);
  };

  const fetchSuppliers = async () => {
    const { data, error } = await supabase
      .from("featured_items")
      .select("*")
      .eq("section", "suppliers")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(content.featuredSuppliers?.itemCount || 6);

    if (error) {
      console.error("Error loading featured suppliers:", error);
      setLoading(false);
      return;
    }

    if (data) {
      setFeaturedSuppliers(
        data.map((item: any) => ({
          id: item.id,
          title: item.title,
          image: item.image || null,
          metadata: item.metadata || {},
        }))
      );
    }

    setLoading(false);
  };

  const formatPrice = (price?: number) => {
    if (!price) return "Contact";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price).replace('$', '');
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    // Add your cart logic here
    console.log("Added to cart:", product);
    // toast.success(`${product.title} added to cart`);
  };

  if (!content.featuredSuppliers?.enabled) return null;

  if (loading) {
    return (
      <section className="py-6 bg-muted/50">
        <div className="section-header px-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-5 w-16" />
        </div>

        <div className="flex gap-4 overflow-x-auto px-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-72 shrink-0 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {showProducts 
                ? "Featured Products" 
                : content.featuredSuppliers?.title || "Featured Suppliers"}
            </h2>
            <p className="text-gray-600 mt-1">
              {showProducts 
                ? "Browse our handpicked selection of quality products" 
                : "Verified suppliers with proven track records"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant={showProducts ? "default" : "outline"}
              size="sm"
              onClick={() => setShowProducts(true)}
              className="bg-[#FF6B35] hover:bg-[#FF854F]"
            >
              <Package className="w-4 h-4 mr-2" />
              Products
            </Button>
            <Button
              variant={!showProducts ? "default" : "outline"}
              size="sm"
              onClick={() => setShowProducts(false)}
              className="bg-[#FF6B35] hover:bg-[#FF854F]"
            >
              <BadgeCheck className="w-4 h-4 mr-2" />
              Suppliers
            </Button>
          </div>
        </div>

        {showProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200"
                onClick={() => navigate(`/product-insights/${product.id}`)}
              >
                {/* Product Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={product.image || "/placeholder.svg?height=200&width=300"}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.is_verified && (
                      <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs px-2">
                        <BadgeCheck className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {product.moq && product.moq > 1 && (
                      <Badge variant="outline" className="bg-white/90 text-xs">
                        MOQ: {product.moq}
                      </Badge>
                    )}
                  </div>
                  
                  {product.rating && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs">
                        <Star className="w-3 h-3 mr-1 fill-white" />
                        {product.rating.toFixed(1)}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800 line-clamp-2 min-h-[2.5rem] group-hover:text-[#FF6B35]">
                      {product.title}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-[#FF6B35]">
                        ${formatPrice(product.price)}
                      </span>
                      {product.price_max && product.price_max > (product.price || 0) && (
                        <span className="text-sm text-gray-500">
                          ~ ${formatPrice(product.price_max)}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 ml-auto">
                        /{product.unit}
                      </span>
                    </div>

                    {/* Category and Supplier */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="truncate max-w-[50%]">
                        {product.category}
                      </span>
                      <span className="truncate max-w-[50%]">
                        {product.supplier_name}
                      </span>
                    </div>

                    {/* Country */}
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{product.country}</span>
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      className="w-full mt-3 bg-[#FF6B35] hover:bg-[#FF854F] text-white"
                      size="sm"
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Inquiry
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 pt-2">
            {featuredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="shrink-0 w-80 bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200"
                onClick={() => navigate(`/supplier/${supplier.id}`)}
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={supplier.image || "/placeholder.svg?height=160&width=320"}
                    alt={supplier.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-1">
                      {supplier.title}
                    </h3>

                    {supplier.metadata?.verified && (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <BadgeCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    {supplier.metadata?.category || "General Supplier"}
                  </p>

                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{" "}
                        {supplier.metadata?.years ? `${supplier.metadata.years} years` : "N/A"}
                      </span>

                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{" "}
                        {supplier.metadata?.location || "Global"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-[#FF6B35] font-medium">
                        {supplier.metadata?.responseRate || "N/A"} response rate
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        View Profile →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="flex justify-center mt-8">
          <button
            className="px-6 py-2 bg-white border border-[#FF6B35] text-[#FF6B35] rounded-lg font-medium hover:bg-[#FF6B35] hover:text-white transition-colors duration-200 flex items-center gap-2"
            onClick={() => navigate(showProducts ? "/products" : "/suppliers")}
          >
            View all {showProducts ? "Products" : "Suppliers"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
