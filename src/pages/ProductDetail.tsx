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
    
    toast({ title: 'Added to inquiry basket' });
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
      <div className="min-h-screen bg-background pb-20 md:pb-0">
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

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Helmet>
        <title>{product.title} | Your Store</title>
        <meta name="description" content={product.description || 'Product details'} />
        <meta property="og:title" content={product.title} />
        <meta property="og:description" content={product.description || 'Product details'} />
        <meta property="og:image" content={images[0]} />
        <meta property="og:type" content="product" />
        <link rel="canonical" href={`https://yourdomain.com/product/${product.slug}`} />
      </Helmet>

      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Images */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={images[currentImageIndex]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              
              {images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    onClick={() => setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                      i === currentImageIndex ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            
            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between">
                  <h1 className="text-2xl font-bold">{product.title}</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFavorite}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </div>
                
                {product.verified && (
                  <Badge className="mt-2 bg-amber-100 text-amber-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified Product
                  </Badge>
                )}
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  {product.price_min !== null && product.price_max !== null
                    ? `${formatPriceOnly(product.price_min)} - ${formatPriceOnly(product.price_max)}`
                    : product.price_min !== null
                      ? formatPrice(product.price_min)
                      : product.price_max !== null
                        ? formatPrice(product.price_max)
                        : t('product.contactSupplier')
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('product.minOrder')}: {product.moq} {product.unit}(s)
                </div>
                
                {/* Quantity Selector */}
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(minQty, quantity - 1))}
                      disabled={quantity <= minQty}
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
                      className="w-24 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleBuyNow}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Buy Now
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleAddToCart}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Inquiry
                  </Button>
                </div>
              </div>
              
              <Tabs defaultValue="description">
                <TabsList>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="specs">Specifications</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="mt-4">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {product.description || 'No description available.'}
                  </p>
                </TabsContent>

                <TabsContent value="specs" className="mt-4">
                  {product.specifications && typeof product.specifications === 'object' && !Array.isArray(product.specifications) ? (
                    <div className="border rounded-lg divide-y">
                      {Object.entries(product.specifications as Record<string, unknown>).map(([key, value]) => (
                        <div key={key} className="flex">
                          <div className="w-1/3 p-3 bg-muted font-medium">{key}</div>
                          <div className="w-2/3 p-3">{String(value)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No specifications available.</p>
                  )}
                </TabsContent>

                {/* Modern Reviews Tab */}
                <TabsContent value="reviews" className="mt-6">
                  {/* Reviews Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-6 w-6 ${
                                  star <= Math.floor(avgRating)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-gray-200 text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-3xl font-bold">{avgRating.toFixed(1)}</div>
                        </div>
                        <p className="text-gray-600">
                          Based on <span className="font-semibold">{reviews.length} reviews</span>
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
                        <div className="text-sm font-medium text-gray-500">Overall Rating</div>
                        <div className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}/5.0</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Submit Review */}
                    <div className="lg:col-span-1">
                      <Card className="sticky top-4 border-0 shadow-lg">
                        <CardHeader className="border-b">
                          <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            Share Your Experience
                          </CardTitle>
                          <CardDescription>
                            Your feedback helps others make better decisions
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="space-y-6">
                            {/* Star Rating Selector */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium">Your Rating</Label>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="p-1 hover:scale-110 transition-transform"
                                  >
                                    <Star
                                      className={`h-8 w-8 ${
                                        star <= rating
                                          ? 'fill-amber-400 text-amber-400'
                                          : 'fill-gray-200 text-gray-200'
                                      }`}
                                    />
                                  </button>
                                ))}
                                <span className="ml-2 text-lg font-semibold">{rating}.0</span>
                              </div>
                            </div>

                            {/* Review Text Area */}
                            <div className="space-y-3">
                              <Label htmlFor="review" className="text-sm font-medium">
                                Your Review
                              </Label>
                              <textarea
                                id="review"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your thoughts... What did you like? What could be improved?"
                                className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                                rows={4}
                              />
                              <div className="flex justify-between text-sm text-gray-500">
                                <span>Be honest and specific</span>
                                <span>{comment.length}/500</span>
                              </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                              onClick={submitReview}
                              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-lg transition-all hover:shadow-lg"
                              size="lg"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Submit Review
                            </Button>

                            <div className="text-center text-xs text-gray-500 pt-4 border-t">
                              <p>Reviews are verified from actual purchases</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right: Reviews List */}
                    <div className="lg:col-span-2">
                      <div className="space-y-6">
                        {/* Reviews Count */}
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold">Customer Reviews</h3>
                          <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <select className="text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                              <option>Most Recent</option>
                              <option>Highest Rated</option>
                              <option>Lowest Rated</option>
                            </select>
                          </div>
                        </div>

                        {/* Reviews List */}
                        {reviews.length === 0 ? (
                          <Card className="border-dashed border-2">
                            <CardContent className="py-12 text-center">
                              <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                              <h4 className="text-lg font-semibold text-gray-700 mb-2">
                                No reviews yet
                              </h4>
                              <p className="text-gray-500 max-w-md mx-auto">
                                Be the first to share your experience with this product. Your review will help other buyers make informed decisions.
                              </p>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="space-y-4">
                            {reviews.map((review) => (
                              <Card 
                                key={review.id} 
                                className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200"
                              >
                                <CardContent className="p-6">
                                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                    {/* Avatar & Name */}
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                                        <span className="font-bold text-blue-600 text-lg">
                                          {review.profile?.full_name?.charAt(0) || 'U'}
                                        </span>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-gray-900">
                                          {review.profile?.full_name || 'Anonymous Buyer'}
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                          {new Date(review.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                          })}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Rating & Comment */}
                                    <div className="flex-1 space-y-3">
                                      <div className="flex items-center gap-2">
                                        <div className="flex">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                              key={star}
                                              className={`h-4 w-4 ${
                                                star <= review.rating
                                                  ? 'fill-amber-400 text-amber-400'
                                                  : 'fill-gray-200 text-gray-200'
                                              }`}
                                            />
                                          ))}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">
                                          {review.rating}.0
                                        </span>
                                        <Badge 
                                          variant="outline" 
                                          className="ml-2 text-xs border-green-200 text-green-700"
                                        >
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          Verified Purchase
                                        </Badge>
                                      </div>
                                      
                                      <p className="text-gray-700 leading-relaxed">
                                        {review.comment}
                                      </p>
                                      
                                      {/* Review Actions */}
                                      <div className="flex items-center gap-4 pt-2">
                                        <button 
                                          onClick={() => console.log('Helpful clicked')}
                                          className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                                        >
                                          <ThumbsUp className="h-4 w-4" />
                                          <span>Helpful ({Math.floor(Math.random() * 20)})</span>
                                        </button>
                                        <button 
                                          onClick={() => console.log('Reply clicked')}
                                          className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                                        >
                                          <MessageSquare className="h-4 w-4" />
                                          <span>Reply</span>
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
                        {reviews.length > 0 && (
                          <div className="text-center pt-6">
                            <Button
                              variant="outline"
                              className="border-gray-300 hover:border-blue-500 hover:text-blue-600"
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
              </Tabs>
            </div>

            {/* Similar Products */}
            <SimilarProducts 
              categoryId={product.category_id} 
              currentProductId={product.id} 
            />

            {/* Recommended Products */}
            <RecommendedProducts currentProductId={product.id} />

          </div>
          
          {/* Right: Supplier info */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {profile?.company_name || 'Supplier'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supplier?.verified && (
                  <div className="flex items-center gap-2">
                    <VerifiedBadge size="md" />
                    <span className="text-sm font-medium">Verified Supplier</span>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {supplier?.year_established && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Est. {supplier.year_established}</span>
                    </div>
                  )}
                  {supplier?.employees && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{supplier.employees}</span>
                    </div>
                  )}
                  {supplier?.response_rate !== undefined && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span>{supplier.response_rate}% response</span>
                    </div>
                  )}
                </div>
                
                {supplier?.main_markets && supplier.main_markets.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Main Markets</p>
                    <div className="flex flex-wrap gap-1">
                      {supplier.main_markets.map((market, i) => (
                        <Badge key={i} variant="outline">{market}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={startConversation}
                    disabled={user?.id === product.seller_id}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Supplier
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
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
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  <span>Shipping available worldwide</span>
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
