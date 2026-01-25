import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  ShoppingCart,
  Star,
  TrendingUp,
  Globe,
  MessageCircle,
  Shield,
  Truck,
  Package,
  Clock,
  Download,
  Printer,
  CheckCircle,
  Users,
  Eye,
  BarChart3,
  HelpCircle,
  Filter,
  ThumbsUp,
  AlertCircle,
  Award,
  CreditCard,
  ShieldCheck,
  FileText,
  ExternalLink,
  ChevronDown,
  MapPin,
  Factory,
  Briefcase,
  Calendar,
} from 'lucide-react';

interface ProductData {
  id: string;
  title: string;
  description?: string;
  images: string[];
  price: string;
  original_price?: string;
  min_price?: string;
  max_price?: string;
  country?: string;
  country_flag?: string;
  category?: string;
  supplier?: string;
  seller_id?: string;
  moq?: number;
  supply_ability?: string;
  lead_time?: string;
  payment_terms?: string[];
  packaging_details?: string;
  discount?: number;
  is_verified?: boolean;
  slug?: string;
  type: 'industry_hub' | 'deal' | 'featured' | 'product';
  specifications?: Record<string, string>;
  features?: string[];
  certifications?: string[];
}

interface SupplierData {
  company_name: string;
  response_rate: number;
  verified: boolean;
  business_type: string;
  year_established: number;
  employees: string;
  main_markets: string[];
  total_products: number;
  page_views: number;
  inquiries: number;
  online_status: boolean;
  trade_assurance: boolean;
  gold_supplier: boolean;
  assessed_supplier: boolean;
  response_time?: string;
}

interface Review {
  id: string;
  user_name: string;
  user_avatar: string;
  rating: number;
  date: string;
  verified_order: boolean;
  title: string;
  content: string;
  helpful_count: number;
  images: string[];
  product_attributes?: Record<string, string>;
}

export default function ProductInsights() {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<ProductData | null>(null);
  const [supplier, setSupplier] = useState<SupplierData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const imagesRef = useRef<HTMLDivElement>(null);

  // Alibaba brand colors
  const alibabaColors = {
    primary: '#FF6B35',
    primaryHover: '#FF854F',
    secondary: '#F5F5F5',
    success: '#00A854',
    warning: '#FFC107',
    danger: '#F04134',
    textPrimary: '#333333',
    textSecondary: '#666666',
    textLight: '#999999',
    border: '#E8E8E8',
    background: '#FFFFFF',
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, type]);

  const fetchProduct = async () => {
    setLoading(true);
    
    try {
      const productType = type || 'product';

      if (productType === 'product') {
        const { data: productData } = await supabase
          .from('products')
          .select('*, category:categories(name)')
          .eq('id', id)
          .eq('published', true)
          .maybeSingle();

        if (productData) {
          // Fetch supplier data
          const { data: supplierData } = await supabase
            .from('suppliers')
            .select('*')
            .eq('user_id', productData.seller_id)
            .single();

          if (supplierData) {
            setSupplier({
              company_name: supplierData.company_name,
              response_rate: supplierData.response_rate || 85,
              verified: supplierData.verified || false,
              business_type: supplierData.business_type || 'Manufacturer',
              year_established: supplierData.year_established || 2015,
              employees: supplierData.employees || '51-200',
              main_markets: supplierData.main_markets || ['Global', 'North America', 'Europe'],
              total_products: 128,
              page_views: 2450,
              inquiries: 156,
              online_status: true,
              trade_assurance: true,
              gold_supplier: Math.random() > 0.5,
              assessed_supplier: Math.random() > 0.3,
              response_time: 'Within 24 hours',
            });
          }

          // Fetch reviews
          const mockReviews: Review[] = [
            {
              id: '1',
              user_name: 'John D.',
              user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
              rating: 5,
              date: '2024-01-15',
              verified_order: true,
              title: 'Excellent Quality',
              content: 'The product exceeded my expectations. Packaging was perfect and shipping was fast.',
              helpful_count: 12,
              images: [],
              product_attributes: { color: 'Black', size: 'Medium' },
            },
            {
              id: '2',
              user_name: 'Sarah M.',
              user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
              rating: 4,
              date: '2024-01-10',
              verified_order: true,
              title: 'Good Value',
              content: 'Good quality for the price. Communication with supplier was excellent.',
              helpful_count: 8,
              images: [],
            },
          ];
          setReviews(mockReviews);

          setProduct({
            id: productData.id,
            title: productData.title,
            description: productData.description,
            images: productData.images || ['/placeholder.svg'],
            price: productData.price_min?.toString() || 'Contact for price',
            min_price: productData.price_min?.toString(),
            max_price: productData.price_max?.toString(),
            original_price: productData.original_price?.toString(),
            country: productData.country,
            category: productData.category?.name || productData.category_id,
            supplier: supplierData?.company_name || 'Verified Supplier',
            seller_id: productData.seller_id,
            moq: productData.moq || 100,
            supply_ability: '10000 Piece/Pieces per Month',
            lead_time: '15-30 days',
            payment_terms: ['T/T', 'L/C', 'Western Union', 'PayPal'],
            packaging_details: 'Standard export packaging',
            discount: productData.discount,
            is_verified: supplierData?.verified || productData.verified || false,
            slug: productData.slug,
            type: 'product',
            specifications: {
              'Material': 'Stainless Steel',
              'Color': 'Silver, Black, Gold',
              'Size': 'Customizable',
              'Weight': '200g',
              'Warranty': '1 Year',
            },
            features: [
              'High durability',
              'Corrosion resistant',
              'Easy to install',
              'CE Certified',
            ],
            certifications: ['CE', 'ISO9001', 'ROHS'],
          });
        }
      }

      // Fetch related products
      const { data: relatedData } = await supabase
        .from('products')
        .select('id, title, images, price_min, country, moq, seller_id')
        .neq('id', id)
        .eq('published', true)
        .limit(4);

      if (relatedData) {
        const relatedWithSuppliers = await Promise.all(
          relatedData.map(async (item) => {
            const { data: supplierData } = await supabase
              .from('suppliers')
              .select('company_name, verified')
              .eq('user_id', item.seller_id)
              .single();

            return {
              id: item.id,
              title: item.title,
              images: item.images || ['/placeholder.svg'],
              price: item.price_min?.toString() || 'Contact',
              country: item.country,
              moq: item.moq,
              supplier: supplierData?.company_name || 'Supplier',
              is_verified: supplierData?.verified || false,
              type: 'product' as const,
            };
          })
        );
        setRelatedProducts(relatedWithSuppliers);
      }

    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    addItem({
      product_id: product.id,
      title: product.title,
      price: parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0,
      image: product.images[0] || '/placeholder.svg',
      quantity: Math.max(quantity, product.moq || 1),
      moq: product.moq || 1,
      unit: 'piece',
      seller_id: product.seller_id || '',
      seller_name: product.supplier || 'Verified Supplier',
    });

    toast.success('Added to cart!');
  };

  const handleContactSupplier = () => {
    navigate(`/messages?supplier=${product?.seller_id}`);
  };

  const handleRequestQuotation = () => {
    toast.success('Quotation request sent to supplier');
  };

  const scrollImages = (direction: 'left' | 'right') => {
    if (imagesRef.current) {
      const scrollAmount = 120;
      imagesRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const formatPrice = (price: string) => {
    if (price.toLowerCase().includes('contact')) return price;
    const num = parseFloat(price);
    if (isNaN(num)) return price;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const calculateTotal = () => {
    if (!product || !product.price) return '0.00';
    const price = parseFloat(product.price.replace(/[^0-9.]/g, ''));
    if (isNaN(price)) return '0.00';
    return (price * quantity).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <Skeleton className="aspect-square rounded-lg" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 w-20 rounded" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-4 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/')} className="bg-[#FF6B35] hover:bg-[#FF854F]">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center text-sm text-gray-500">
            <Link to="/" className="hover:text-[#FF6B35]">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link to="/products" className="hover:text-[#FF6B35]">Products</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link to={`/category/${product.category}`} className="hover:text-[#FF6B35] capitalize">
              {product.category}
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-700 truncate max-w-xs">{product.title}</span>
          </nav>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Product Images & Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Product Images */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Main Image */}
                  <div className="lg:w-2/3">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                      <img
                        src={product.images[selectedImage] || '/placeholder.svg'}
                        alt={product.title}
                        className="w-full h-full object-contain p-4"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="rounded-full bg-white/90 backdrop-blur-sm shadow-sm"
                          onClick={() => setIsFavorite(!isFavorite)}
                        >
                          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="rounded-full bg-white/90 backdrop-blur-sm shadow-sm"
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success('Link copied!');
                          }}
                        >
                          <Share2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Thumbnail Gallery */}
                    <div className="relative">
                      <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2" ref={imagesRef}>
                        {product.images.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${
                              selectedImage === index 
                                ? 'border-[#FF6B35]' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={img || '/placeholder.svg'}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                      {product.images.length > 4 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 shadow-sm"
                            onClick={() => scrollImages('left')}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 shadow-sm"
                            onClick={() => scrollImages('right')}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Product Actions */}
                  <div className="lg:w-1/3 space-y-6">
                    <div>
                      <h1 className="text-2xl font-semibold text-gray-800 mb-3">{product.title}</h1>
                      
                      {/* Price */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-bold text-[#FF6B35]">
                            ${formatPrice(product.price)}
                          </span>
                          {product.original_price && (
                            <span className="text-lg text-gray-400 line-through">
                              ${formatPrice(product.original_price)}
                            </span>
                          )}
                          {product.discount && product.discount > 0 && (
                            <Badge className="bg-red-100 text-red-600 hover:bg-red-100">
                              -{product.discount}%
                            </Badge>
                          )}
                        </div>
                        {product.min_price && product.max_price && (
                          <p className="text-sm text-gray-500">
                            Price Range: ${formatPrice(product.min_price)} - ${formatPrice(product.max_price)} / piece
                          </p>
                        )}
                      </div>

                      {/* MOQ & Order Quantity */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Order Quantity
                          </label>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setQuantity(Math.max(product.moq || 1, quantity - 1))}
                              disabled={quantity <= (product.moq || 1)}
                            >
                              -
                            </Button>
                            <input
                              type="number"
                              min={product.moq || 1}
                              value={quantity}
                              onChange={(e) => setQuantity(Math.max(product.moq || 1, parseInt(e.target.value) || 1))}
                              className="w-20 text-center border border-gray-300 rounded-md py-2 px-3"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setQuantity(quantity + 1)}
                            >
                              +
                            </Button>
                            <span className="text-sm text-gray-500 ml-2">
                              (Min. Order: {product.moq || 1} pieces)
                            </span>
                          </div>
                        </div>

                        {/* Total Price */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">Total Price:</span>
                          <span className="text-xl font-bold text-[#FF6B35]">${calculateTotal()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Button 
                        className="w-full bg-[#FF6B35] hover:bg-[#FF854F] text-white"
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Add to Cart
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35]/10"
                        onClick={handleContactSupplier}
                      >
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Contact Supplier
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline"
                          className="border-gray-300"
                          onClick={handleRequestQuotation}
                        >
                          Request Quotation
                        </Button>
                        <Button 
                          variant="outline"
                          className="border-gray-300"
                          onClick={() => navigate('/cart')}
                        >
                          Buy Now
                        </Button>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Page Views:</span>
                        <span className="font-medium">{supplier?.page_views || 2450}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Inquiries:</span>
                        <span className="font-medium">{supplier?.inquiries || 156}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Response Rate:</span>
                        <span className="font-medium text-green-600">
                          {supplier?.response_rate || 85}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Tabs */}
            <Card className="border border-gray-200 shadow-sm">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b">
                  <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
                    <TabsTrigger 
                      value="description" 
                      className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B35] rounded-none px-6 py-3"
                    >
                      Product Details
                    </TabsTrigger>
                    <TabsTrigger 
                      value="specifications" 
                      className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B35] rounded-none px-6 py-3"
                    >
                      Specifications
                    </TabsTrigger>
                    <TabsTrigger 
                      value="reviews" 
                      className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B35] rounded-none px-6 py-3"
                    >
                      Reviews ({reviews.length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="shipping" 
                      className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B35] rounded-none px-6 py-3"
                    >
                      Shipping & Support
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="description" className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Description</h3>
                      <p className="text-gray-600 whitespace-pre-line">
                        {product.description || 'No description available.'}
                      </p>
                    </div>

                    {product.features && product.features.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {product.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-gray-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {product.certifications && product.certifications.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Certifications</h3>
                        <div className="flex gap-2 flex-wrap">
                          {product.certifications.map((cert, index) => (
                            <Badge key={index} variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="specifications" className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Product Specifications</h3>
                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <tbody>
                            {Object.entries(product.specifications).map(([key, value], index) => (
                              <tr key={key} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="px-4 py-3 border-r border-gray-200 font-medium text-gray-700 w-1/3">
                                  {key}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {value}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No specifications available.</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Customer Reviews</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-5 w-5 ${
                                  star <= 4.8 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-lg font-bold ml-2">4.8</span>
                          <span className="text-gray-500">({reviews.length} reviews)</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <Card key={review.id} className="border border-gray-200">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={review.user_avatar}
                                  alt={review.user_name}
                                  className="h-10 w-10 rounded-full"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{review.user_name}</span>
                                    {review.verified_order && (
                                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-xs">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Verified Order
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <div className="flex items-center">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                          key={star}
                                          className={`h-4 w-4 ${
                                            star <= review.rating 
                                              ? 'fill-yellow-400 text-yellow-400' 
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span>{review.date}</span>
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                Helpful ({review.helpful_count})
                              </Button>
                            </div>

                            <div className="space-y-3">
                              <h4 className="font-medium">{review.title}</h4>
                              <p className="text-gray-600">{review.content}</p>
                              
                              {review.product_attributes && (
                                <div className="flex gap-4 text-sm">
                                  {Object.entries(review.product_attributes).map(([key, value]) => (
                                    <div key={key} className="text-gray-500">
                                      <span className="font-medium">{key}:</span> {value}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {review.images && review.images.length > 0 && (
                                <div className="flex gap-2 mt-3">
                                  {review.images.map((img, idx) => (
                                    <img
                                      key={idx}
                                      src={img}
                                      alt={`Review ${idx + 1}`}
                                      className="h-20 w-20 rounded-lg object-cover"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex gap-4 mt-4 pt-4 border-t">
                              <Button variant="ghost" size="sm" className="text-gray-500">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Reply
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-500">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Report
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="shipping" className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Shipping Info */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Truck className="h-5 w-5 text-[#FF6B35]" />
                          Shipping Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">Lead Time</p>
                            <p className="font-medium">{product.lead_time}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Supply Ability</p>
                            <p className="font-medium">{product.supply_ability}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Port</p>
                            <p className="font-medium">Shanghai, Ningbo, Shenzhen</p>
                          </div>
                        </div>
                      </div>

                      {/* Payment & Support */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-[#FF6B35]" />
                          Payment & Support
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">Payment Terms</p>
                            <div className="flex gap-2 flex-wrap mt-1">
                              {product.payment_terms?.map((term, index) => (
                                <Badge key={index} variant="secondary">
                                  {term}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Packaging Details</p>
                            <p className="font-medium">{product.packaging_details}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Trade Assurance */}
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <ShieldCheck className="h-12 w-12 text-blue-600" />
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                              Trade Assurance
                              <Badge className="bg-blue-600 text-white">Protected</Badge>
                            </h3>
                            <p className="text-gray-600 mb-3">
                              Your payment is protected by Trade Assurance. Get refunded if your order is not shipped or as described.
                            </p>
                            <div className="flex gap-4">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="text-sm">On-time shipment</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="text-sm">Product quality</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Related Products</h2>
                  <Button variant="ghost" className="text-[#FF6B35]">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedProducts.map((item) => (
                    <Link
                      key={item.id}
                      to={`/product-insights/product/${item.id}`}
                      className="group"
                    >
                      <Card className="border border-gray-200 hover:border-[#FF6B35] transition-colors overflow-hidden">
                        <div className="aspect-square overflow-hidden bg-gray-100">
                          <img
                            src={item.images[0] || '/placeholder.svg'}
                            alt={item.title}
                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="text-sm font-medium line-clamp-2 mb-2 group-hover:text-[#FF6B35]">
                            {item.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#FF6B35]">${item.price}</span>
                            {item.is_verified && (
                              <Shield className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">MOQ: {item.moq} pieces</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Supplier Info & Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Sticky Container */}
            <div className="sticky top-24 space-y-6">
              {/* Supplier Card */}
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{supplier?.company_name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        {supplier?.gold_supplier && (
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            <Award className="h-3 w-3 mr-1" />
                            Gold Supplier
                          </Badge>
                        )}
                        {supplier?.assessed_supplier && (
                          <Badge variant="outline" className="border-blue-200 text-blue-600">
                            Assessed
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Factory className="h-4 w-4" />
                        <span>{supplier?.business_type}</span>
                      </div>
                    </div>
                    {supplier?.online_status && (
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-green-600">Online</span>
                      </div>
                    )}
                  </div>

                  {/* Supplier Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-[#FF6B35]">{supplier?.response_rate}%</p>
                      <p className="text-xs text-gray-500">Response Rate</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-[#FF6B35]">
                        {new Date().getFullYear() - (supplier?.year_established || 2015)}
                      </p>
                      <p className="text-xs text-gray-500">Years on Platform</p>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {product.country_flag} {product.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{supplier?.employees} Employees</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{supplier?.total_products} Products</span>
                    </div>
                  </div>

                  {/* Contact Button */}
                  <Button 
                    className="w-full mt-6 bg-[#FF6B35] hover:bg-[#FF854F]"
                    onClick={handleContactSupplier}
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Contact Supplier
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Download Specification
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Request Catalog
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Printer className="h-4 w-4 mr-2" />
                      Print This Page
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Company Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trade Assurance Card */}
              <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <ShieldCheck className="h-8 w-8 text-blue-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Trade Assurance</h3>
                      <p className="text-sm text-gray-600">
                        Order protection from payment to delivery
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Secure payment protection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>On-time shipment guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Product quality inspection</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="hidden md:flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-500">Unit Price</p>
                <p className="text-xl font-bold text-[#FF6B35]">${formatPrice(product.price)}</p>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div>
                <p className="text-sm text-gray-500">Total Price</p>
                <p className="text-xl font-bold text-[#FF6B35]">${calculateTotal()}</p>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div>
                <p className="text-sm text-gray-500">Min. Order</p>
                <p className="font-medium">{product.moq} pieces</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                className="border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35]/10"
                onClick={handleContactSupplier}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Now
              </Button>
              <Button 
                className="bg-[#FF6B35] hover:bg-[#FF854F]"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/cart')}
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
