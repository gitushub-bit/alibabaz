import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useCurrency } from '@/hooks/useCurrency';
import AlibabaHeader from '@/components/layout/AlibabaHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';
import {
  Heart,
  MessageCircle,
  Shield,
  Truck,
  Building2,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  CreditCard,
  Plus,
  Minus,
  Star,
  Send,
  Filter,
  ThumbsUp,
  MessageSquare,
  CheckCircle,
  RefreshCw,
  Globe,
  Award,
  Package,
  Check,
  Eye,
  Share2,
  Download,
  Printer,
  BarChart,
  TrendingUp,
  ShieldCheck,
  Zap,
  Flag,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { SimilarProducts } from '@/components/product/SimilarProducts';
import { RecommendedProducts } from '@/components/product/RecommendedProducts';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price_min: number | null;
  price_max: number | null;
  moq: number;
  unit: string;
  images: string[] | null;
  verified: boolean;
  specifications: Json | null;
  seller_id: string;
  category_id: string | null;
}

interface Supplier {
  company_info: string | null;
  year_established: number | null;
  employees: string | null;
  main_markets: string[] | null;
  verified: boolean;
  response_rate: number;
}

interface Profile {
  full_name: string | null;
  company_name: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  orders?: {
    product_id: string;
    buyer_id: string;
  };
  profile?: {
    full_name: string | null;
  };
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { formatPrice, formatPriceOnly } = useCurrency();

  const [product, setProduct] = useState<Product | null>(null);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeSpecTab, setActiveSpecTab] = useState('details');

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (slug) {
      setLoading(true);
      fetchProduct();
      window.scrollTo(0, 0);
    }
  }, [slug]);

  useEffect(() => {
    if (product && user) {
      let isMounted = true;

      const checkFav = async () => {
        try {
          const { data, error } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', product.id)
            .limit(1);

          if (error) {
            console.error('Error checking favorite:', error);
            return;
          }

          if (isMounted) setIsFavorite(data && data.length > 0);
        } catch (err) {
          console.error('Unexpected error checking favorite:', err);
        }
      };

      checkFav();

      return () => {
        isMounted = false;
      };
    }
  }, [product, user]);

  useEffect(() => {
    if (product) {
      const minQty = product.moq || 1;
      setQuantity(minQty);

      // Add to browsing history
      const historyItem = {
        id: product.id,
        slug: product.slug || slug || '',
        title: product.title,
        image: product.images?.[0] || '/placeholder.svg',
        price_min: product.price_min || 0,
        price_max: product.price_max || 0,
      };

      const stored = localStorage.getItem('browsingHistory');
      const history = stored ? JSON.parse(stored) : [];
      const filtered = history.filter((h: any) => h.id !== product.id);
      const newHistory = [{ ...historyItem, viewed_at: Date.now() }, ...filtered].slice(0, 20);
      localStorage.setItem('browsingHistory', JSON.stringify(newHistory));

      // Load reviews
      fetchReviews(product.id);
    }
  }, [product, slug]);

  const fetchProduct = async () => {
    // Try by slug first
    let { data: productData, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    // Fallback: if not found and slug looks like a UUID, try by ID
    if (!productData && slug?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const { data: byId, error: idError } = await supabase
        .from('products')
        .select('*')
        .eq('id', slug)
        .maybeSingle();

      if (byId) {
        productData = byId;
        error = null;
      }
    }

    if (error || !productData) {
      navigate('/404');
      return;
    }

    setProduct(productData);

    const [supplierRes, profileRes] = await Promise.all([
      supabase.from('suppliers').select('*').eq('user_id', productData.seller_id).maybeSingle(),
      supabase.from('profiles').select('full_name, company_name').eq('user_id', productData.seller_id).maybeSingle(),
    ]);

    if (supplierRes.data) setSupplier(supplierRes.data);
    if (profileRes.data) setProfile(profileRes.data);

    setLoading(false);
  };

  const fetchReviews = async (productId: string) => {
    try {
      // Step 1: Find all order IDs for this product
      // This side-steps JOIN discovery issues in PostgREST
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('id')
        .eq('product_id', productId);

      if (orderError) {
        console.error('Error fetching associated orders:', orderError);
        setReviews([]);
        return;
      }

      const orderIds = orderData?.map(o => o.id) || [];

      if (orderIds.length === 0) {
        setReviews([]);
        return;
      }

      // Step 2: Fetch reviews matching those order IDs
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select('*')
        .in('order_id', orderIds)
        .order('created_at', { ascending: false });

      if (reviewError) {
        console.error('Error fetching reviews by order IDs:', reviewError);
        setReviews([]);
        return;
      }

      const formattedReviews = (reviewData || []).map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment || '',
        created_at: review.created_at,
        profile: { full_name: 'Verified Buyer' }
      }));

      setReviews(formattedReviews);
    } catch (err) {
      console.error('Unexpected error in fetchReviews:', err);
      setReviews([]);
    }
  };

  const submitReview = async () => {
    toast({
      title: 'Reviews unavailable',
      description: 'Reviews can only be submitted for completed orders.',
      variant: 'destructive'
    });
  };

  const handleAddToCart = () => {
    if (!product) return;

    const price = product.price_min ?? product.price_max ?? 0;

    if (price === 0) {
      toast({
        title: 'Price not available',
        description: 'Contact supplier for pricing',
        variant: 'destructive',
      });
      return;
    }

    addItem({
      product_id: product.id,
      title: product.title,
      image: product.images?.[0] || '/placeholder.svg',
      price,
      quantity,
      moq: product.moq || 1,
      unit: product.unit || 'piece',
      seller_id: product.seller_id,
      seller_name: profile?.company_name || profile?.full_name || 'Unknown Seller',
    });

    toast({
      title: 'Added to inquiry basket',
      description: 'You can view and manage your inquiry items in the cart'
    });
  };

  const handleBuyNow = () => {
    if (!user) {
      navigate('/auth?redirect=' + encodeURIComponent(`/product/${slug}`));
      return;
    }

    if (!product) return;
    navigate(`/checkout?product=${product.id}&qty=${quantity}`);
  };

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!product) return;

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product.id);

      setIsFavorite(false);
      toast({ title: 'Removed from favorites' });
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, product_id: product.id });

      setIsFavorite(true);
      toast({ title: 'Added to favorites' });
    }
  };

  const startConversation = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!product) return;

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('seller_id', product.seller_id)
      .eq('product_id', product.id)
      .maybeSingle();

    if (existing) {
      navigate(`/messages/${existing.id}`);
      return;
    }

    const { data: newConv, error: convError } = await supabase
      .from('conversations')
      .insert({
        buyer_id: user.id,
        seller_id: product.seller_id,
        product_id: product.id
      })
      .select()
      .maybeSingle();

    if (newConv) {
      // Send initial inquiry message
      await supabase.from('messages').insert({
        conversation_id: newConv.id,
        sender_id: user.id,
        content: `Hi, I'm interested in "${product.title}". Could you provide more details about lead times and customization options?`
      });

      navigate(`/messages/${newConv.id}`);
    } else {
      console.error('Conversation error:', convError);
      toast({
        title: 'Error',
        description: 'Could not start conversation. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const avgRating = reviews.length
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <AlibabaHeader />
        <main className="container mx-auto px-4 py-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="aspect-square rounded-lg" />
              <div className="space-y-4 mt-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length ? product.images : ['/placeholder.svg'];
  const minQty = product.moq || 1;
  const priceRange = product.price_min !== null && product.price_max !== null;
  const unitPrice = product.price_min ?? product.price_max ?? 0;
  const totalPrice = unitPrice * quantity;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Helmet>
        <title>{product.title} - Global B2B Marketplace</title>
        <meta name="description" content={product.description || 'High-quality product from verified supplier'} />
        <meta property="og:title" content={product.title} />
        <meta property="og:description" content={product.description || 'Global sourcing made easy'} />
        <meta property="og:image" content={images[0]} />
        <meta property="og:type" content="product" />
      </Helmet>

      <AlibabaHeader />

      <main className="w-full max-w-[1440px] mx-auto overflow-hidden px-4 sm:px-4 py-4 sm:py-6 pb-24 md:pb-6">
        {/* Breadcrumb - Hidden on very small mobile, compact on others */}
        <div className="hidden sm:flex mb-4 sm:mb-6 text-xs sm:text-sm text-gray-500 overflow-x-auto whitespace-nowrap pb-1 items-center">
          <span className="hover:text-orange-500 cursor-pointer transition-colors">Home</span>
          <ChevronRight className="w-3 h-3 mx-1" />
          <span className="hover:text-orange-500 cursor-pointer transition-colors">Products</span>
          <ChevronRight className="w-3 h-3 mx-1" />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.title}</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column: Product Images & Details (8 columns on desktop, full width on mobile) */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            {/* Product Detail Main Section */}
            <Card className="border-x-0 sm:border border-gray-200 shadow-none sm:shadow-sm overflow-hidden">
              <CardContent className="p-0 sm:p-6">
                <div className="flex flex-col md:grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                  {/* Product Images - Full width on smallest screens */}
                  <div className="space-y-4">
                    <div className="relative bg-white border-b sm:border border-gray-100 sm:rounded-xl overflow-hidden aspect-square flex items-center justify-center">
                      <img
                        src={images[currentImageIndex]}
                        alt={product.title}
                        className="w-full h-full object-contain"
                      />

                      {images.length > 1 && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white h-8 w-8 sm:h-9 sm:w-9"
                            onClick={() => setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                          >
                            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white h-8 w-8 sm:h-9 sm:w-9"
                            onClick={() => setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                          >
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail Gallery - Mobile scrollable */}
                    {images.length > 1 && (
                      <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-2 scrollbar-thin">
                        {images.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentImageIndex(i)}
                            className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-2 rounded overflow-hidden ${i === currentImageIndex
                              ? 'border-orange-500'
                              : 'border-gray-200 hover:border-gray-300'
                              }`}
                          >
                            <img
                              src={img}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}


                  </div>

                  {/* Product Info - Mobile responsive */}
                  <div className="space-y-6 p-4 sm:p-0">
                    <div>
                      {/* Title & Badges */}
                      <div className="mb-6">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4 lg:pr-8 break-words overflow-wrap-anywhere">
                          {product.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2">
                          {product.verified && <VerifiedBadge size="sm" />}
                          <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-100 rounded-sm font-medium px-2 py-0.5 text-[10px] sm:text-xs">
                            Trade Assurance
                          </Badge>
                          <Badge variant="outline" className="text-gray-500 border-gray-200 rounded-sm font-normal px-2 py-0.5 text-[10px] sm:text-xs bg-gray-50/50">
                            <Truck className="w-3 h-3 mr-1" /> Ready to Ship
                          </Badge>
                        </div>
                      </div>

                      {/* Trade Information Block */}
                      <div className="bg-gray-50/80 border border-gray-100 rounded-lg p-3 sm:p-6 mb-6">
                        {/* Price Row */}
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-4 border-b border-gray-200 pb-4 overflow-hidden">
                          <div className="min-w-0">
                            <p className="text-sm text-gray-500 mb-1">FOB Price / Unit</p>
                            <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
                              <span className="text-2xl sm:text-3xl font-bold text-orange-600">
                                {formatPriceOnly(unitPrice)}
                              </span>
                              {priceRange && (
                                <span className="text-base sm:text-lg text-gray-400 font-medium whitespace-nowrap">
                                  - {formatPriceOnly(product.price_max || 0)}
                                </span>
                              )}
                              <span className="text-gray-500 text-xs sm:text-sm font-normal">/ {product.unit}</span>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-tight">Min. Order</p>
                            <span className="text-sm sm:text-base md:text-lg font-bold text-gray-900 whitespace-nowrap">
                              {product.moq} {product.unit}s
                            </span>
                          </div>
                        </div>

                        {/* Logistics Summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 block mb-0.5 sm:mb-1">Lead Time:</span>
                            <span className="font-medium text-gray-900">15-30 days</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-0.5 sm:mb-1">Shipping:</span>
                            <span className="font-medium text-gray-900">Support Express · Sea freight</span>
                          </div>
                        </div>
                      </div>

                      {/* Key Attributes Summary - Compact Grid */}
                      <div className="mb-8 p-4 sm:p-0">
                        <h3 className="text-[10px] sm:text-xs font-bold text-gray-400 mb-4 uppercase tracking-[0.1em]">Key Attributes</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-12 text-sm">
                          {product.specifications && typeof product.specifications === 'object' && !Array.isArray(product.specifications) ? (
                            Object.entries(product.specifications as Record<string, unknown>).slice(0, 6).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-start border-b border-gray-50 pb-2 gap-2 sm:gap-4 overflow-hidden">
                                <span className="text-gray-400 text-[10px] sm:text-xs flex-shrink-0 mt-0.5">{key}</span>
                                <span className="text-gray-900 font-semibold text-right text-[11px] sm:text-sm break-words min-w-0 flex-1">{String(value)}</span>
                              </div>
                            ))
                          ) : (
                            <>
                              <div className="flex justify-between items-baseline border-b border-gray-50 pb-2">
                                <span className="text-gray-400 text-xs">Material</span>
                                <span className="text-gray-900 font-semibold">Premium Grade</span>
                              </div>
                              <div className="flex justify-between items-baseline border-b border-gray-50 pb-2">
                                <span className="text-gray-400 text-xs">Classification</span>
                                <span className="text-gray-900 font-semibold">Standard Class A</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Quantity Selector Row - Enhanced Mobile Layout */}
                      <div className="bg-orange-50/40 p-3 sm:p-5 rounded-xl border border-orange-100/60 mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <Label className="text-gray-600 font-semibold text-sm">Quantity:</Label>
                            <div className="flex items-center bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
                              <button
                                onClick={() => setQuantity(Math.max(minQty, quantity - 1))}
                                disabled={quantity <= minQty}
                                className="px-3 py-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 disabled:opacity-30 transition-colors"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(minQty, parseInt(e.target.value || "0")))}
                                className="w-14 sm:w-16 text-center border-none focus:ring-0 text-gray-900 font-bold py-2 text-sm"
                              />
                              <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="px-3 py-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-none border-orange-100">
                            <span className="text-xs text-gray-500 font-medium">Order Total:</span>
                            <span className="font-extrabold text-orange-600 text-lg sm:text-2xl">
                              {formatPriceOnly(totalPrice)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Primary Actions */}
                      <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Button
                            onClick={startConversation}
                            className="h-12 sm:h-14 text-sm sm:text-base font-black bg-[#FF6600] hover:bg-[#E65C00] text-white shadow-md flex items-center justify-center gap-2 px-8 rounded-full transition-all hover:scale-[1.02] active:scale-95"
                          >
                            <MessageSquare className="w-5 h-5 shrink-0" />
                            <span>Contact Supplier</span>
                          </Button>
                          <Button
                            onClick={handleBuyNow}
                            variant="outline"
                            className="h-12 sm:h-14 text-sm sm:text-base font-black border-2 border-[#FF6600] text-[#FF6600] hover:bg-orange-50 flex items-center justify-center gap-2 px-8 rounded-full transition-all hover:scale-[1.02] active:scale-95"
                          >
                            <Zap className="w-5 h-5 shrink-0" />
                            <span>Start Order</span>
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={handleAddToCart}
                          className="w-full text-gray-500 hover:text-orange-600 h-10 text-xs sm:text-sm"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 mr-1 sm:mr-2" /> <span className="truncate">Add to Inquiry Cart</span>
                        </Button>

                        {/* Trust Badges */}
                        <div className="pt-4 mt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500 justify-center sm:justify-start">
                          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-green-500" /> Secure Payments</span>
                          <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3 text-blue-500" /> Refund Policy</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-gray-500" /> 24/7 Support</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Tabs - Detailed B2B Information */}
            <Card className="border border-gray-200 shadow-sm overflow-hidden">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="w-full flex justify-start border-b rounded-none bg-white h-auto p-0 overflow-x-auto scrollbar-hide">
                  <TabsTrigger
                    value="description"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 rounded-none px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-500 transition-all whitespace-nowrap"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="specs"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 rounded-none px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-500 transition-all whitespace-nowrap"
                  >
                    Specifications
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 rounded-none px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-500 transition-all whitespace-nowrap"
                  >
                    Reviews ({reviews.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="shipping"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 rounded-none px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-500 transition-all whitespace-nowrap"
                  >
                    Shipping
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="p-6 md:p-8">
                  <div className="max-w-4xl mx-auto space-y-8">
                    {/* General Description */}
                    <div className="prose prose-orange max-w-none">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-orange-500" />
                        Product Description
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base italic border-l-4 border-orange-100 pl-4 py-2 bg-orange-50/30 break-words">
                        {product.description || 'Professional-grade solution tailored for enterprise efficiency and high-standard performance.'}
                      </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                          <ShieldCheck className="w-6 h-6 text-orange-600" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Quality Assurance</h4>
                        <p className="text-sm text-gray-600">Rigorous 100% inspection process ensures every unit meets international safety and durability standards.</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                          <Zap className="w-6 h-6 text-blue-600" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Operational Efficiency</h4>
                        <p className="text-sm text-gray-600">Designed for seamless integration into existing workflows with minimal setup time and high-output performance.</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                          <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Competitive Edge</h4>
                        <p className="text-sm text-gray-600">Superior materials and advanced engineering provide a cost-effective solution without compromising on quality.</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                          <Globe className="w-6 h-6 text-purple-600" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Global Compliance</h4>
                        <p className="text-sm text-gray-600">Fully certified for global markets with support for international regulations and documentation.</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="specs" className="p-4 sm:p-6 md:p-8">
                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Filter className="w-5 h-5 text-blue-600" />
                      Technical Datasheet
                    </h3>
                    <div className="border border-gray-200 rounded-lg overflow-x-auto shadow-sm">
                      <table className="w-full text-xs sm:text-sm min-w-[500px] sm:min-w-full">
                        <thead>
                          <tr className="bg-gray-100 border-b border-gray-200">
                            <th className="px-4 sm:px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Attribute</th>
                            <th className="px-4 sm:px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Specifications</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 overflow-x-auto">
                          {product.specifications && typeof product.specifications === 'object' && !Array.isArray(product.specifications) ? (
                            Object.entries(product.specifications as Record<string, unknown>).map(([key, value]) => (
                              <tr key={key} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 sm:px-6 py-4 bg-gray-50/50 font-semibold text-gray-600 w-1/3 border-r border-gray-100 align-top">{key}</td>
                                <td className="px-4 sm:px-6 py-4 text-gray-900 break-words">{String(value)}</td>
                              </tr>
                            ))
                          ) : (
                            ['Material', 'Grade', 'Origin', 'Application', 'Finish', 'Packing'].map((key) => (
                              <tr key={key} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 sm:px-6 py-4 bg-gray-50/50 font-semibold text-gray-600 w-1/3 border-r border-gray-100">{key}</td>
                                <td className="px-4 sm:px-6 py-4 text-gray-900">Standard Industrial Grade {key}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>

                {/* Modern Reviews Tab - Mobile responsive */}
                <TabsContent value="reviews" className="p-3 sm:p-4 md:p-6">
                  {/* Reviews Header */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
                      <div className="space-y-1 sm:space-y-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 ${star <= Math.floor(avgRating)
                                  ? 'fill-amber-500 text-amber-500'
                                  : 'fill-gray-300 text-gray-300'
                                  }`}
                              />
                            ))}
                          </div>
                          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-700">
                          Based on <span className="font-semibold">{reviews.length} verified reviews</span>
                        </p>
                      </div>

                      <div className="bg-white rounded-lg px-4 py-3 sm:px-6 sm:py-4 shadow-sm border w-full md:w-auto">
                        <div className="text-xs sm:text-sm font-medium text-gray-500">Overall Rating</div>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{avgRating.toFixed(1)}/5.0</div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1">Global Supplier Score</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:grid lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Left: Submit Review - Full width on mobile */}
                    <div className="lg:col-span-1">
                      <Card className="sticky top-4 border border-gray-200 shadow-md">
                        <CardHeader className="border-b bg-gray-50 p-4 sm:p-6">
                          <CardTitle className="flex items-center gap-2 text-gray-900 text-sm sm:text-base md:text-lg">
                            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                            Share Your Experience
                          </CardTitle>
                          <CardDescription className="text-gray-600 text-xs sm:text-sm">
                            Your feedback helps global buyers make better decisions
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                          <div className="space-y-4 sm:space-y-6">
                            {/* Star Rating Selector */}
                            <div className="space-y-2 sm:space-y-3">
                              <Label className="text-sm font-medium text-gray-700">Your Rating</Label>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="p-0.5 sm:p-1 hover:scale-110 transition-transform"
                                  >
                                    <Star
                                      className={`h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 ${star <= rating
                                        ? 'fill-amber-500 text-amber-500'
                                        : 'fill-gray-300 text-gray-300'
                                        }`}
                                    />
                                  </button>
                                ))}
                                <span className="ml-2 text-lg sm:text-xl font-semibold text-gray-900">{rating}.0</span>
                              </div>
                            </div>

                            {/* Review Text Area */}
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="review" className="text-sm font-medium text-gray-700">
                                Your Review
                              </Label>
                              <textarea
                                id="review"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience with this product..."
                                className="w-full min-h-[80px] sm:min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all text-sm"
                                rows={3}
                              />
                              <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                                <span>Be specific and detailed</span>
                                <span>{comment.length}/500</span>
                              </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                              onClick={submitReview}
                              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium py-2 sm:py-3 rounded-lg transition-all hover:shadow-lg text-sm sm:text-base"
                              size="lg"
                            >
                              <Send className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                              Submit Review
                            </Button>

                            <div className="text-center text-xs text-gray-500 pt-3 sm:pt-4 border-t">
                              <p className="flex items-center justify-center gap-1">
                                <ShieldCheck className="h-3 w-3" />
                                Reviews from actual orders
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right: Reviews List - Full width on mobile */}
                    <div className="lg:col-span-2">
                      <div className="space-y-4 sm:space-y-6">
                        {/* Reviews Count & Filter */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Customer Reviews</h3>
                          <div className="flex items-center gap-2">
                            <Filter className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                            <select className="text-xs sm:text-sm border border-gray-300 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white w-full sm:w-auto">
                              <option>Most Recent</option>
                              <option>Highest Rated</option>
                              <option>Lowest Rated</option>
                              <option>With Photos</option>
                            </select>
                          </div>
                        </div>

                        {/* Reviews List */}
                        {reviews.length === 0 ? (
                          <Card className="border-dashed border-2 border-gray-300">
                            <CardContent className="py-8 sm:py-12 text-center">
                              <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-300 mb-3 sm:mb-4" />
                              <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
                                No reviews yet
                              </h4>
                              <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto mb-4 sm:mb-6">
                                Be the first to share your experience with this product.
                              </p>
                              <Button
                                onClick={submitReview}
                                className="bg-orange-500 hover:bg-orange-600 text-sm sm:text-base"
                              >
                                Write First Review
                              </Button>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="space-y-3 sm:space-y-4">
                            {reviews.map((review) => (
                              <Card
                                key={review.id}
                                className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
                              >
                                <CardContent className="p-3 sm:p-4 md:p-6">
                                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                                    {/* Avatar & Name */}
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 flex items-center justify-center border border-orange-200 flex-shrink-0">
                                        <span className="font-bold text-orange-600 text-sm sm:text-base">
                                          {review.profile?.full_name?.charAt(0) || 'U'}
                                        </span>
                                      </div>
                                      <div className="min-w-0">
                                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                          {review.profile?.full_name || 'Anonymous Buyer'}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5">
                                          <p className="text-xs text-gray-500">
                                            {new Date(review.created_at).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric'
                                            })}
                                          </p>
                                          <span className="text-gray-300 hidden sm:inline">•</span>
                                          <Badge
                                            variant="outline"
                                            className="text-xs border-green-200 text-green-700 bg-green-50"
                                          >
                                            <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                            Verified
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Rating & Comment */}
                                    <div className="flex-1 space-y-2 sm:space-y-3">
                                      <div className="flex items-center gap-1 sm:gap-2">
                                        <div className="flex">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                              key={star}
                                              className={`h-4 w-4 sm:h-5 sm:w-5 ${star <= review.rating
                                                ? 'fill-amber-500 text-amber-500'
                                                : 'fill-gray-300 text-gray-300'
                                                }`}
                                            />
                                          ))}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                          {review.rating}.0/5.0
                                        </span>
                                      </div>

                                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                                        {review.comment}
                                      </p>

                                      {/* Review Actions */}
                                      <div className="flex items-center gap-2 sm:gap-4 pt-2 sm:pt-3">
                                        <button
                                          onClick={() => console.log('Helpful clicked')}
                                          className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 hover:text-orange-600 transition-colors"
                                        >
                                          <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                                          <span>Helpful ({Math.floor(Math.random() * 20)})</span>
                                        </button>
                                        <button
                                          onClick={() => console.log('Reply clicked')}
                                          className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 hover:text-orange-600 transition-colors"
                                        >
                                          <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                                          <span>Reply</span>
                                        </button>
                                        <button className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 hover:text-orange-600 transition-colors">
                                          <Flag className="h-3 w-3 sm:h-4 sm:w-4" />
                                          <span>Report</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}

                        {/* Load More Button */}
                        {reviews.length > 0 && reviews.length > 3 && (
                          <div className="text-center pt-4 sm:pt-6">
                            <Button
                              variant="outline"
                              className="border-gray-300 hover:border-orange-500 hover:text-orange-600 text-gray-700 text-sm sm:text-base"
                              onClick={() => console.log('Load more reviews')}
                            >
                              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              Load More
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="shipping" className="p-6 md:p-8">
                  <div className="max-w-4xl mx-auto space-y-8">
                    {/* Shipping Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Logistics & Compliance</h3>
                        <p className="text-sm text-gray-500">Global shipping options and enterprise-grade packaging standards.</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-blue-50 text-blue-700 border-blue-100 font-medium">Ocean Freight</Badge>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-100 font-medium">Air Express</Badge>
                      </div>
                    </div>

                    {/* Lead Time Table */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        Lead Time Table
                      </h4>
                      <div className="border border-gray-100 rounded-lg overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm min-w-[500px] sm:min-w-full">
                          <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                              <th className="px-4 sm:px-6 py-3 text-left text-gray-600 font-semibold">Quantity (Pieces)</th>
                              <th className="px-4 sm:px-6 py-3 text-left text-gray-600 font-semibold">1 - 500</th>
                              <th className="px-4 sm:px-6 py-3 text-left text-gray-600 font-semibold">501 - 2000</th>
                              <th className="px-4 sm:px-6 py-3 text-left text-gray-600 font-semibold">{'>'} 2000</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-gray-50">
                              <td className="px-4 sm:px-6 py-4 font-medium text-gray-900 bg-gray-50/50">Est. Time (days)</td>
                              <td className="px-4 sm:px-6 py-4 text-gray-700">15</td>
                              <td className="px-4 sm:px-6 py-4 text-gray-700">25</td>
                              <td className="px-4 sm:px-6 py-4 text-gray-700">Negotiated</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Packaging & Customization */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                          <Package className="w-5 h-5 text-blue-500" />
                          Packaging Details
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm text-gray-600 space-y-2">
                          <p>• Standard export-grade carton packaging.</p>
                          <p>• Inner protection: Bubble film and moisture-proof plastic.</p>
                          <p>• Palletized for large orders to ensure transit safety.</p>
                          <p>• Custom logo printing on boxes available for MOQ {product.moq * 5}+.</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-green-500" />
                          Trade Protection
                        </h4>
                        <div className="bg-green-50/50 p-4 rounded-lg border border-green-100 text-sm text-green-800 space-y-2">
                          <p className="font-semibold">Trade Assurance Protected</p>
                          <p>Your payment is held until you confirm receipt of goods and quality satisfaction.</p>
                          <div className="flex gap-4 pt-2">
                            <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Samples Available</span>
                            <span className="flex items-center gap-1"><Check className="w-3 h-3" /> QC Inspection</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Similar Products */}
            <SimilarProducts
              categoryId={product.category_id}
              currentProductId={product.id}
            />

            {/* Recommended Products */}
            <RecommendedProducts currentProductId={product.id} />
          </div>

          {/* Right Column: Supplier & Stats - Full width on mobile, sidebar on desktop */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            {/* Supplier Card - Professional Company Profile */}
            <Card className="border border-gray-200 shadow-sm lg:sticky lg:top-4 overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-700 shadow-sm">
                  {profile?.company_name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">
                    {profile?.company_name || 'Global Tech Supplier Co., Ltd.'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 border border-orange-100 rounded">CN</span>
                    <span className="text-xs text-gray-500">4 Yrs</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-0">
                {/* Capabilities Grid */}
                <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
                  <div className="p-4 text-center">
                    <div className="text-lg font-bold text-gray-900">{supplier?.response_rate || 98}%</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Response Score</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-lg font-bold text-gray-900">4.8/5</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Review Rating</div>
                  </div>
                </div>

                {/* Business Details */}
                <div className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-gray-50">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Building2 className="w-4 h-4" /> Business Type
                    </span>
                    <span className="font-medium text-gray-900">Manufacturer</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-50">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Employees
                    </span>
                    <span className="font-medium text-gray-900">{supplier?.employees || '100+'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-50">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Globe className="w-4 h-4" /> Main Market
                    </span>
                    <span className="font-medium text-gray-900">North America</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 pt-0 grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/supplier/${product.seller_id}`)}
                    className="w-full text-xs sm:text-sm h-9"
                  >
                    View Profile
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={startConversation}
                    className="w-full text-xs sm:text-sm h-9 hover:bg-orange-50 hover:text-orange-600"
                  >
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trade Assurance Card */}
            <Card className="border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-start gap-2 sm:gap-3">
                  <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1">Trade Assurance</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                      Payment protected by secure system
                    </p>
                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                        <span>On-time shipment</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                        <span>Quality protection</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                        <span>Secure payment</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trade Services Card - Trust Focus */}
            <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
              <div className="bg-amber-50 p-4 border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-gray-900 text-sm">Trade Assurance</h3>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 mb-4">
                  Alibaba.com protects your orders from payment to delivery.
                </p>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Safe & Easy Payments</p>
                      <p className="text-[10px] text-gray-500">Multiple secure payment options.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Logistics Guarantee</p>
                      <p className="text-[10px] text-gray-500">On-time delivery or your money back.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Card */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-gray-900">Supplier Capability</span>
                  <Badge variant="outline" className="text-[10px] border-orange-200 text-orange-600">Verified</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Production Capacity</span>
                    <span className="font-medium text-gray-900">10,000+ pcs/month</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Export Years</span>
                    <span className="font-medium text-gray-900">8 Years</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Response Time</span>
                    <span className="font-medium text-green-600">{'<'} 4 Hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* ─── FIXED MOBILE ACTION BAR ─── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex gap-3 md:hidden z-[100] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <Button
          onClick={startConversation}
          variant="outline"
          className="flex-1 h-12 border-2 border-orange-500 text-orange-600 font-bold rounded-full"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Chat
        </Button>
        <Button
          onClick={handleBuyNow}
          className="flex-[1.5] h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full shadow-lg"
        >
          Start Order
        </Button>
      </div>

      <div className="hidden md:block">
        <BottomNav />
      </div>
    </div>
  );
}
