import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useCurrency } from '@/hooks/useCurrency';
import { Header } from '@/components/layout/Header';
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
    }
  }, [slug]);

  useEffect(() => {
    if (product && user) {
      let isMounted = true;

      const checkFav = async () => {
        const { data } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .single();
        
        if (isMounted) setIsFavorite(!!data);
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
    const { data: productData, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !productData) {
      navigate('/404');
      return;
    }

    setProduct(productData);

    const [supplierRes, profileRes] = await Promise.all([
      supabase.from('suppliers').select('*').eq('user_id', productData.seller_id).single(),
      supabase.from('profiles').select('full_name, company_name').eq('user_id', productData.seller_id).single(),
    ]);

    if (supplierRes.data) setSupplier(supplierRes.data);
    if (profileRes.data) setProfile(profileRes.data);

    setLoading(false);
  };

  const fetchReviews = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          buyer_id,
          profiles!reviews_buyer_id_profiles_fkey (
            full_name
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
        return;
      }

      const formattedReviews = (data || []).map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment || '',
        created_at: review.created_at,
        profile: review.profiles ? { full_name: review.profiles.full_name } : undefined
      }));

      console.log(`Loaded ${formattedReviews.length} reviews for product ${productId}`);
      setReviews(formattedReviews);
    } catch (err) {
      console.error('Unexpected error:', err);
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
      seller_name: profile?.company_name || profile?.full_name || 'Seller',
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
      .single();

    if (existing) {
      navigate(`/messages/${existing.id}`);
      return;
    }

    const { data: newConv } = await supabase
      .from('conversations')
      .insert({
        buyer_id: user.id,
        seller_id: product.seller_id,
        product_id: product.id
      })
      .select()
      .single();

    if (newConv) {
      navigate(`/messages/${newConv.id}`);
    } else {
      toast({ 
        title: 'Error', 
        description: 'Could not start conversation',
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
        <Header />
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

      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <span className="hover:text-orange-500 cursor-pointer">Home</span>
          <span className="mx-2">›</span>
          <span className="hover:text-orange-500 cursor-pointer">Products</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium">{product.title}</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column: Product Images & Details (8 columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Product Card */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Product Images - Alibaba Style */}
                  <div className="space-y-4">
                    <div className="relative bg-white border border-gray-200 rounded-lg p-4">
                      <img
                        src={images[currentImageIndex]}
                        alt={product.title}
                        className="w-full h-auto max-h-[400px] object-contain"
                      />
                      
                      {images.length > 1 && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                            onClick={() => setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                            onClick={() => setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                    
                    {/* Thumbnail Gallery */}
                    {images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {images.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentImageIndex(i)}
                            className={`flex-shrink-0 w-16 h-16 border-2 rounded overflow-hidden ${
                              i === currentImageIndex 
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

                    {/* Image Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        View Larger
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>

                  {/* Product Info - Alibaba Style */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={toggleFavorite}
                          className="text-gray-500 hover:text-orange-500"
                        >
                          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-orange-500 text-orange-500' : ''}`} />
                        </Button>
                      </div>
                      
                      {/* Verification Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {product.verified && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Verified Product
                          </Badge>
                        )}
                        <Badge variant="outline" className="border-blue-200 text-blue-700">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                        <Badge variant="outline" className="border-purple-200 text-purple-700">
                          <Award className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      </div>

                      {/* Price Section - Alibaba Style */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-sm text-gray-600">Unit Price:</span>
                          <div className="text-3xl font-bold text-orange-600">
                            {formatPriceOnly(unitPrice)}
                          </div>
                          {priceRange && (
                            <span className="text-gray-500">
                              ~ {formatPriceOnly(product.price_max || 0)}
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">MOQ:</span>
                            <span className="ml-2 font-medium">{product.moq} {product.unit}(s)</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Supply Ability:</span>
                            <span className="ml-2 font-medium">10,000 {product.unit}s/month</span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity & Total */}
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-700">Order Quantity</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setQuantity(Math.max(minQty, quantity - 1))}
                              disabled={quantity <= minQty}
                              className="border-gray-300"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={quantity}
                              min={minQty}
                              onChange={(e) => {
                                const val = parseInt(e.target.value || "0", 10);
                                setQuantity(Math.max(minQty, val));
                              }}
                              className="w-20 text-center border-gray-300"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setQuantity(quantity + 1)}
                              className="border-gray-300"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-gray-600 ml-2">{product.unit}(s)</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t pt-4">
                          <span className="font-medium text-gray-700">Total Price:</span>
                          <div className="text-2xl font-bold text-green-600">
                            {formatPriceOnly(totalPrice)}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons - Alibaba Style */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          onClick={handleBuyNow}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-medium h-12"
                        >
                          <CreditCard className="h-5 w-5 mr-2" />
                          Order Now
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={handleAddToCart}
                          className="border-orange-500 text-orange-500 hover:bg-orange-50 h-12"
                        >
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          Add to Inquiry
                        </Button>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center justify-between mt-6 pt-6 border-t text-sm">
                        <button className="flex items-center gap-2 text-gray-600 hover:text-orange-500">
                          <MessageSquare className="h-4 w-4" />
                          Chat Now
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 hover:text-orange-500">
                          <Download className="h-4 w-4" />
                          Download Spec
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 hover:text-orange-500">
                          <Printer className="h-4 w-4" />
                          Print
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Tabs - Alibaba Style */}
            <Card className="border border-gray-200 shadow-sm">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
                  <TabsTrigger 
                    value="description" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 rounded-none px-6 py-4"
                  >
                    Product Details
                  </TabsTrigger>
                  <TabsTrigger 
                    value="specs" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 rounded-none px-6 py-4"
                  >
                    Specifications
                  </TabsTrigger>
                  <TabsTrigger 
                    value="reviews" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 rounded-none px-6 py-4"
                  >
                    Customer Reviews ({reviews.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="shipping" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 rounded-none px-6 py-4"
                  >
                    Shipping & Packaging
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="p-6">
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold mb-4">Product Description</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {product.description || 'No description available.'}
                    </p>
                    
                    {/* Features List */}
                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium">High Quality</h4>
                          <p className="text-sm text-gray-600">Manufactured with premium materials</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Fast Delivery</h4>
                          <p className="text-sm text-gray-600">15-30 days production time</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Globe className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Global Shipping</h4>
                          <p className="text-sm text-gray-600">Available to 200+ countries</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-purple-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Quality Assurance</h4>
                          <p className="text-sm text-gray-600">100% quality inspection</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="specs" className="p-6">
                  <div className="space-y-6">
                    {/* Specification Tabs */}
                    <div className="flex gap-2 border-b">
                      <button
                        onClick={() => setActiveSpecTab('details')}
                        className={`px-4 py-2 text-sm font-medium ${
                          activeSpecTab === 'details'
                            ? 'border-b-2 border-orange-500 text-orange-500'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        General Details
                      </button>
                      <button
                        onClick={() => setActiveSpecTab('technical')}
                        className={`px-4 py-2 text-sm font-medium ${
                          activeSpecTab === 'technical'
                            ? 'border-b-2 border-orange-500 text-orange-500'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Technical Specs
                      </button>
                    </div>

                    {product.specifications && typeof product.specifications === 'object' && !Array.isArray(product.specifications) ? (
                      <div className="border rounded-lg overflow-hidden">
                        {Object.entries(product.specifications as Record<string, unknown>).map(([key, value]) => (
                          <div key={key} className="flex even:bg-gray-50">
                            <div className="w-1/3 p-4 bg-gray-100 font-medium border-r">{key}</div>
                            <div className="w-2/3 p-4">{String(value)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No specifications available.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Modern Reviews Tab */}
                <TabsContent value="reviews" className="p-6">
                  {/* Reviews Header */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-7 w-7 ${
                                  star <= Math.floor(avgRating)
                                    ? 'fill-amber-500 text-amber-500'
                                    : 'fill-gray-300 text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
                        </div>
                        <p className="text-gray-700">
                          Based on <span className="font-semibold">{reviews.length} verified reviews</span>
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg px-6 py-4 shadow-sm border">
                        <div className="text-sm font-medium text-gray-500">Overall Rating</div>
                        <div className="text-3xl font-bold text-gray-900">{avgRating.toFixed(1)}/5.0</div>
                        <div className="text-sm text-gray-600 mt-1">Global Supplier Score</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Submit Review */}
                    <div className="lg:col-span-1">
                      <Card className="sticky top-4 border border-gray-200 shadow-md">
                        <CardHeader className="border-b bg-gray-50">
                          <CardTitle className="flex items-center gap-2 text-gray-900">
                            <MessageCircle className="h-5 w-5" />
                            Share Your Experience
                          </CardTitle>
                          <CardDescription className="text-gray-600">
                            Your feedback helps global buyers make better decisions
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="space-y-6">
                            {/* Star Rating Selector */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-gray-700">Your Rating</Label>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="p-1 hover:scale-110 transition-transform"
                                  >
                                    <Star
                                      className={`h-9 w-9 ${
                                        star <= rating
                                          ? 'fill-amber-500 text-amber-500'
                                          : 'fill-gray-300 text-gray-300'
                                      }`}
                                    />
                                  </button>
                                ))}
                                <span className="ml-2 text-xl font-semibold text-gray-900">{rating}.0</span>
                              </div>
                            </div>

                            {/* Review Text Area */}
                            <div className="space-y-3">
                              <Label htmlFor="review" className="text-sm font-medium text-gray-700">
                                Your Review
                              </Label>
                              <textarea
                                id="review"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience with this product... What was good? What could be improved?"
                                className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all"
                                rows={4}
                              />
                              <div className="flex justify-between text-sm text-gray-500">
                                <span>Be specific and detailed</span>
                                <span>{comment.length}/500</span>
                              </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                              onClick={submitReview}
                              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium py-3 rounded-lg transition-all hover:shadow-lg"
                              size="lg"
                            >
                              <Send className="h-5 w-5 mr-2" />
                              Submit Review
                            </Button>

                            <div className="text-center text-xs text-gray-500 pt-4 border-t">
                              <p className="flex items-center justify-center gap-1">
                                <ShieldCheck className="h-3 w-3" />
                                Reviews are verified from actual orders
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right: Reviews List */}
                    <div className="lg:col-span-2">
                      <div className="space-y-6">
                        {/* Reviews Count & Filter */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <h3 className="text-xl font-bold text-gray-900">Customer Reviews</h3>
                          <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white">
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
                            <CardContent className="py-12 text-center">
                              <MessageCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                              <h4 className="text-lg font-semibold text-gray-700 mb-2">
                                No reviews yet
                              </h4>
                              <p className="text-gray-500 max-w-md mx-auto mb-6">
                                Be the first to share your experience with this product. Your review will help other global buyers make informed decisions.
                              </p>
                              <Button
                                onClick={submitReview}
                                className="bg-orange-500 hover:bg-orange-600"
                              >
                                Write First Review
                              </Button>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="space-y-4">
                            {reviews.map((review) => (
                              <Card 
                                key={review.id} 
                                className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
                              >
                                <CardContent className="p-6">
                                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                    {/* Avatar & Name */}
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 flex items-center justify-center border border-orange-200">
                                        <span className="font-bold text-orange-600 text-lg">
                                          {review.profile?.full_name?.charAt(0) || 'U'}
                                        </span>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-gray-900">
                                          {review.profile?.full_name || 'Anonymous Buyer'}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                          <p className="text-sm text-gray-500">
                                            {new Date(review.created_at).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric'
                                            })}
                                          </p>
                                          <span className="text-gray-300">•</span>
                                          <Badge 
                                            variant="outline" 
                                            className="text-xs border-green-200 text-green-700 bg-green-50"
                                          >
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Verified Order
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Rating & Comment */}
                                    <div className="flex-1 space-y-3">
                                      <div className="flex items-center gap-2">
                                        <div className="flex">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                              key={star}
                                              className={`h-5 w-5 ${
                                                star <= review.rating
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
                                      
                                      <p className="text-gray-700 leading-relaxed">
                                        {review.comment}
                                      </p>
                                      
                                      {/* Review Actions */}
                                      <div className="flex items-center gap-4 pt-3">
                                        <button 
                                          onClick={() => console.log('Helpful clicked')}
                                          className="flex items-center gap-1 text-sm text-gray-600 hover:text-orange-600 transition-colors"
                                        >
                                          <ThumbsUp className="h-4 w-4" />
                                          <span>Helpful ({Math.floor(Math.random() * 20)})</span>
                                        </button>
                                        <button 
                                          onClick={() => console.log('Reply clicked')}
                                          className="flex items-center gap-1 text-sm text-gray-600 hover:text-orange-600 transition-colors"
                                        >
                                          <MessageSquare className="h-4 w-4" />
                                          <span>Reply</span>
                                        </button>
                                        <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-orange-600 transition-colors">
                                          <Flag className="h-4 w-4" />
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
                          <div className="text-center pt-6">
                            <Button
                              variant="outline"
                              className="border-gray-300 hover:border-orange-500 hover:text-orange-600 text-gray-700"
                              onClick={() => console.log('Load more reviews')}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Load More Reviews
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="shipping" className="p-6">
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="border border-gray-200">
                        <CardHeader className="bg-gray-50">
                          <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Shipping Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Lead Time:</span>
                              <span className="font-medium">15-30 days</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Shipping Port:</span>
                              <span className="font-medium">Shanghai, China</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Payment Terms:</span>
                              <span className="font-medium">T/T, L/C, Western Union</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Packaging Details:</span>
                              <span className="font-medium">Standard Export Packaging</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200">
                        <CardHeader className="bg-gray-50">
                          <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Packaging Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Carton box with foam protection</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Waterproof plastic wrapping</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Palletized for bulk orders</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Custom packaging available</span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
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

          {/* Right Column: Supplier & Stats (4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Supplier Card - Alibaba Style */}
            <Card className="border border-gray-200 shadow-sm sticky top-4">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Building2 className="h-5 w-5" />
                  Supplier Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Supplier Basic Info */}
                  <div className="flex items-start gap-4 pb-4 border-b">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center border-2 border-white shadow-sm">
                      <Building2 className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {profile?.company_name || 'Global Supplier'}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        {supplier?.verified && (
                          <VerifiedBadge size="md" />
                        )}
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Verified Supplier
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Response Rate:</span> {supplier?.response_rate || 95}%
                      </div>
                    </div>
                  </div>

                  {/* Supplier Stats */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-5 w-5 mx-auto text-gray-600 mb-1" />
                        <div className="text-sm text-gray-600">Established</div>
                        <div className="font-bold text-gray-900">{supplier?.year_established || '2010'}</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Users className="h-5 w-5 mx-auto text-gray-600 mb-1" />
                        <div className="text-sm text-gray-600">Employees</div>
                        <div className="font-bold text-gray-900">{supplier?.employees || '50-100'}</div>
                      </div>
                    </div>

                    {/* Main Markets */}
                    {supplier?.main_markets && supplier.main_markets.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Main Markets
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {supplier.main_markets.map((market, i) => (
                            <Badge key={i} variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                              {market}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Business Type */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Business Type</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-indigo-100 text-indigo-800">Manufacturer</Badge>
                        <Badge className="bg-purple-100 text-purple-800">Trading Company</Badge>
                        <Badge className="bg-blue-100 text-blue-800">Exporter</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4 border-t">
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      onClick={startConversation}
                      disabled={user?.id === product.seller_id}
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Contact Supplier
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        if (!user) {
                          navigate('/auth');
                        } else {
                          navigate('/rfq/new', { state: { productId: product.id } });
                        }
                      }}
                    >
                      Send Inquiry
                    </Button>
                    <Button 
                      variant="ghost"
                      className="w-full text-gray-600 hover:text-blue-600"
                      onClick={() => navigate(`/supplier/${product.seller_id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Company Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trade Assurance Card */}
            <Card className="border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-8 w-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Trade Assurance</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Your payment is protected by our secure payment system
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>On-time shipment protection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Product quality protection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Secure payment methods</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Info Card */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="h-6 w-6 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Shipping & Logistics</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping Method:</span>
                    <span className="font-medium">Sea Freight, Air Freight</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Time:</span>
                    <span className="font-medium">30-45 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Port of Loading:</span>
                    <span className="font-medium">Shanghai Port</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Terms:</span>
                    <span className="font-medium">T/T, L/C, Credit Card</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Stats Card */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BarChart className="h-4 w-4" />
                  Product Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Page Views:</span>
                    <span className="font-bold text-gray-900">1,245</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Inquiries This Month:</span>
                    <span className="font-bold text-gray-900">28</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Orders This Month:</span>
                    <span className="font-bold text-gray-900">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Product Ranking:</span>
                    <Badge className="bg-amber-100 text-amber-800">Top 10%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}

// Add missing Flag icon component
const Flag = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
  </svg>
);
