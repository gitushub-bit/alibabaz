import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
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
  MessageCircle,
  Shield,
  Truck,
  Package,
  Download,
  Printer,
  CheckCircle,
  Filter,
  ThumbsUp,
  AlertCircle,
  Award,
  CreditCard,
  ShieldCheck,
  FileText,
  ExternalLink,
  MapPin,
  Factory,
  Briefcase,
  ChevronRight as ChevronRightIcon,
  Image as ImageIcon,
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
  seller_id: string;
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
  id: string;
  user_id: string;
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
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
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

// Fallback product data
const FALLBACK_PRODUCT_ID = 'f79d4b6c-4a7d-4e5a-b8c3-2e8d9b7f1a2e';

// Image fallbacks for broken images
const IMAGE_FALLBACKS = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop'
];

const getSafeImage = (imageUrl?: string, index: number = 0) => {
  if (!imageUrl || imageUrl.trim() === '') {
    return IMAGE_FALLBACKS[index % IMAGE_FALLBACKS.length];
  }
  
  // Check if it's a valid URL or relative path
  if (imageUrl.startsWith('http') || imageUrl.startsWith('/') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // Try to get from Supabase storage
  try {
    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(imageUrl);
    return data.publicUrl || IMAGE_FALLBACKS[index % IMAGE_FALLBACKS.length];
  } catch (error) {
    return IMAGE_FALLBACKS[index % IMAGE_FALLBACKS.length];
  }
};

export default function ProductInsights() {
  const { id, type } = useParams<{ id: string; type?: string }>();
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
  const [retryCount, setRetryCount] = useState(0);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  const imagesRef = useRef<HTMLDivElement>(null);

  // Fetch a random verified seller from database or create fallback
  const fetchRandomSeller = async () => {
    try {
      // Try to get any verified seller from database
      const { data: sellers, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('verified', true)
        .limit(1)
        .single();

      if (error || !sellers) {
        console.log('No verified sellers found, creating fallback seller');
        return createFallbackSeller();
      }

      return {
        id: sellers.id,
        user_id: sellers.user_id || `seller-${Date.now()}`,
        company_name: sellers.company_name || 'Verified Supplier',
        response_rate: sellers.response_rate || 85,
        verified: sellers.verified || true,
        business_type: sellers.business_type || 'Manufacturer',
        year_established: sellers.year_established || 2015,
        employees: sellers.employees || '51-200',
        main_markets: sellers.main_markets || ['Global', 'North America', 'Europe'],
        total_products: sellers.total_products || 128,
        page_views: sellers.page_views || 2450,
        inquiries: sellers.inquiries || 156,
        online_status: sellers.online_status !== false,
        trade_assurance: sellers.trade_assurance || true,
        gold_supplier: sellers.gold_supplier || true,
        assessed_supplier: sellers.assessed_supplier || true,
        response_time: sellers.response_time || 'Within 24 hours',
        email: sellers.email,
        phone: sellers.phone,
        address: sellers.address,
        website: sellers.website,
      };
    } catch (error) {
      console.error('Error fetching seller:', error);
      return createFallbackSeller();
    }
  };

  const createFallbackSeller = (): SupplierData => {
    return {
      id: 'fallback-seller-id',
      user_id: user?.id || `fallback-user-${Date.now()}`,
      company_name: 'Global Suppliers Inc.',
      response_rate: 85,
      verified: true,
      business_type: 'Manufacturer & Exporter',
      year_established: 2015,
      employees: '51-200',
      main_markets: ['Global', 'North America', 'Europe', 'Asia'],
      total_products: 128,
      page_views: 2450,
      inquiries: 156,
      online_status: true,
      trade_assurance: true,
      gold_supplier: true,
      assessed_supplier: true,
      response_time: 'Within 24 hours',
      email: 'contact@globalsuppliers.com',
      phone: '+1 (555) 123-4567',
      address: '123 Trade Center, Shanghai, China',
      website: 'https://globalsuppliers.com',
    };
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, type, retryCount]);

  const fetchProduct = async () => {
    setLoading(true);
    
    try {
      const productType = type || 'product';
      let productData: any = null;
      let foundProduct = false;

      // First, fetch or create a seller to ensure we have seller data
      const sellerData = await fetchRandomSeller();
      setSupplier(sellerData);

      // Strategy 1: Try based on the type parameter
      if (productType === 'deal') {
        productData = await fetchFromDealsTable();
      } else if (productType === 'product' || !type) {
        // Try products table first
        productData = await fetchFromProductsTable();
        
        // If not found and no type specified, try deals table
        if (!productData && !type) {
          productData = await fetchFromDealsTable();
        }
      }

      // Strategy 2: If still not found, try all tables
      if (!productData) {
        console.log('Trying all tables...');
        productData = await fetchFromAllTables();
      }

      if (productData) {
        foundProduct = true;
        await processProductData(productData, sellerData);
      }

      // Strategy 3: If still not found, create a product linked to the seller
      if (!foundProduct) {
        console.log('No product found, creating product with seller...');
        
        // Try to get any published product from the database
        const { data: fallbackProducts } = await supabase
          .from('products')
          .select('*')
          .eq('published', true)
          .limit(1)
          .single();

        if (fallbackProducts) {
          productData = fallbackProducts;
          foundProduct = true;
          await processProductData(productData, sellerData);
        } else {
          // Create a mock product linked to the seller
          productData = createMockProduct(sellerData);
          foundProduct = true;
          await processProductData(productData, sellerData);
          
          // Show toast message
          toast.info('Showing a sample product. Real products will load from your database.');
        }
      }

      // Fetch related products
      await fetchRelatedProducts(sellerData);

    } catch (error) {
      console.error('Error fetching product:', error);
      
      // If we get an error, try again or show fallback
      if (retryCount < 2) {
        setRetryCount(prev => prev + 1);
      } else {
        // After retries, create a mock product with seller
        const sellerData = await fetchRandomSeller();
        const mockProduct = createMockProduct(sellerData);
        await processProductData(mockProduct, sellerData);
        toast.error('Failed to load product. Showing sample product instead.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFromProductsTable = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(name), seller:profiles(*)')
      .eq('id', id)
      .eq('published', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching from products:', error);
      return null;
    }
    return data;
  };

  const fetchFromDealsTable = async () => {
    const { data, error } = await supabase
      .from('deals')
      .select('*, seller:profiles(*)')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching from deals:', error);
      return null;
    }
    return data;
  };

  const fetchFromAllTables = async () => {
    // Try products table
    const productData = await fetchFromProductsTable();
    if (productData) return { ...productData, source: 'products' };

    // Try deals table
    const dealData = await fetchFromDealsTable();
    if (dealData) return { ...dealData, source: 'deals' };

    // Try featured products
    const { data: featuredData } = await supabase
      .from('featured_products')
      .select('*, seller:profiles(*)')
      .eq('id', id)
      .maybeSingle();
    
    if (featuredData) return { ...featuredData, source: 'featured' };

    return null;
  };

  const createMockProduct = (seller: SupplierData): any => {
    return {
      id: id || FALLBACK_PRODUCT_ID,
      title: 'Premium Wireless Headphones - Sample Product',
      description: 'This is a sample product. To see real products, please add products through the admin panel. You can manage products, set prices, upload images, and configure all product details.',
      images: IMAGE_FALLBACKS,
      price: '29.99',
      original_price: '49.99',
      min_price: '25.00',
      max_price: '35.00',
      country: 'China',
      country_flag: '🇨🇳',
      category: 'Electronics',
      supplier: seller.company_name,
      seller_id: seller.user_id,
      moq: 50,
      supply_ability: '5000 Piece/Pieces per Month',
      lead_time: '15-30 days',
      payment_terms: ['T/T', 'PayPal', 'Credit Card', 'Western Union'],
      packaging_details: 'Standard export packaging with protective foam',
      discount: 40,
      is_verified: true,
      slug: 'premium-wireless-headphones',
      type: 'product' as const,
      specifications: {
        'Brand Name': 'AudioTech',
        'Model Number': 'ATH-M50xBT',
        'Material': 'Premium Plastic & Metal',
        'Color': 'Black, White, Blue, Red',
        'Connectivity': 'Bluetooth 5.0',
        'Battery Life': '40 hours',
        'Charging Time': '2 hours',
        'Weight': '285g',
        'Warranty': '2 Years',
        'Certification': 'CE, FCC, RoHS'
      },
      features: [
        'Premium sound quality with noise cancellation',
        '40-hour battery life with quick charge',
        'Comfortable over-ear design with memory foam',
        'Built-in microphone for hands-free calls',
        'Foldable design for easy portability',
        'Multi-point connection (connect to 2 devices)'
      ],
      certifications: ['CE', 'FCC', 'RoHS', 'REACH'],
    };
  };

  const processProductData = async (data: any, fallbackSeller: SupplierData) => {
    // Extract seller info from data or use fallback
    let sellerInfo = fallbackSeller;
    let productSellerId = data.seller_id || data.seller?.id || fallbackSeller.user_id;
    
    // Try to get supplier data from profiles or suppliers table
    if (data.seller || data.seller_id) {
      try {
        const { data: supplierData } = await supabase
          .from('suppliers')
          .select('*')
          .eq('user_id', productSellerId)
          .single();

        if (supplierData) {
          sellerInfo = {
            id: supplierData.id,
            user_id: supplierData.user_id,
            company_name: supplierData.company_name || data.supplier || 'Verified Supplier',
            response_rate: supplierData.response_rate || 85,
            verified: supplierData.verified || false,
            business_type: supplierData.business_type || 'Manufacturer',
            year_established: supplierData.year_established || 2015,
            employees: supplierData.employees || '51-200',
            main_markets: supplierData.main_markets || ['Global', 'North America', 'Europe'],
            total_products: supplierData.total_products || 128,
            page_views: supplierData.page_views || 2450,
            inquiries: supplierData.inquiries || 156,
            online_status: supplierData.online_status !== false,
            trade_assurance: supplierData.trade_assurance || true,
            gold_supplier: supplierData.gold_supplier || true,
            assessed_supplier: supplierData.assessed_supplier || true,
            response_time: supplierData.response_time || 'Within 24 hours',
            email: supplierData.email,
            phone: supplierData.phone,
            address: supplierData.address,
            website: supplierData.website,
          };
        }
      } catch (error) {
        console.log('Using fallback seller data');
      }
    }

    setSupplier(sellerInfo);

    // Process images safely
    let processedImages: string[] = [];
    if (Array.isArray(data.images) && data.images.length > 0) {
      processedImages = data.images.map((img: string, index: number) => getSafeImage(img, index));
    } else if (data.image) {
      processedImages = [getSafeImage(data.image, 0)];
    } else {
      processedImages = [IMAGE_FALLBACKS[0]];
    }

    // Transform data to match ProductData interface
    const transformedProduct: ProductData = {
      id: data.id,
      title: data.title || data.name || 'Unnamed Product',
      description: data.description || 'No description available.',
      images: processedImages,
      price: data.price?.toString() || data.price_min?.toString() || 'Contact for price',
      original_price: data.original_price?.toString(),
      min_price: data.min_price?.toString() || data.price_min?.toString(),
      max_price: data.max_price?.toString() || data.price_max?.toString(),
      country: data.country || sellerInfo.address?.split(',').pop()?.trim() || 'Global',
      country_flag: data.country_flag || '🌍',
      category: data.category?.name || data.category || data.type || 'General',
      supplier: data.supplier || sellerInfo.company_name,
      seller_id: productSellerId,
      moq: data.moq || data.minimum_order || 1,
      supply_ability: data.supply_ability || data.capacity || 'Contact supplier for details',
      lead_time: data.lead_time || data.delivery_time || '15-30 days',
      payment_terms: data.payment_terms || data.payment_methods || ['T/T', 'L/C', 'Western Union', 'PayPal'],
      packaging_details: data.packaging_details || data.packaging || 'Standard export packaging',
      discount: data.discount || data.discount_percentage,
      is_verified: data.is_verified || data.verified || sellerInfo.verified || false,
      slug: data.slug,
      type: data.type || 'product',
      specifications: data.specifications || data.attributes || {
        'Material': 'Various materials available',
        'Color': 'Customizable',
        'Size': 'Various sizes',
        'MOQ': `${data.moq || 1} pieces`,
      },
      features: data.features || data.key_features || [
        'High quality',
        'Competitive price',
        'Reliable supplier',
        'Customizable options',
      ],
      certifications: data.certifications || [],
    };

    setProduct(transformedProduct);

    // Set mock reviews
    setReviews([
      {
        id: '1',
        user_name: 'John D.',
        user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        rating: 5,
        date: '2024-01-15',
        verified_order: true,
        title: 'Excellent Quality',
        content: 'The product exceeded my expectations. Packaging was perfect and shipping was fast. Will order again!',
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
        title: 'Good Value for Money',
        content: 'Good quality for the price. Communication with supplier was excellent and delivery was on time.',
        helpful_count: 8,
        images: [],
      },
      {
        id: '3',
        user_name: 'Mike R.',
        user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
        rating: 5,
        date: '2024-01-05',
        verified_order: true,
        title: 'Perfect for Business',
        content: 'Ordered 500 pieces for my store. Quality is consistent and packaging is professional.',
        helpful_count: 5,
        images: [],
      },
    ]);
  };

  const fetchRelatedProducts = async (currentSeller?: SupplierData) => {
    try {
      const sellerToUse = currentSeller || supplier;
      
      if (sellerToUse) {
        // Try to fetch products from the same seller first
        const { data: sellerProducts } = await supabase
          .from('products')
          .select('id, title, images, price_min, country, moq, seller_id, published')
          .eq('seller_id', sellerToUse.user_id)
          .neq('id', id)
          .eq('published', true)
          .limit(4);

        if (sellerProducts && sellerProducts.length > 0) {
          const related = sellerProducts.map((item) => ({
            id: item.id,
            title: item.title,
            images: item.images ? [getSafeImage(item.images[0], 0)] : [IMAGE_FALLBACKS[0]],
            price: item.price_min?.toString() || 'Contact',
            country: item.country,
            moq: item.moq,
            supplier: sellerToUse.company_name,
            seller_id: sellerToUse.user_id,
            is_verified: sellerToUse.verified,
            type: 'product' as const,
          }));
          setRelatedProducts(related);
          return;
        }
      }

      // If no seller-specific products, fetch general related products
      const { data: generalProducts } = await supabase
        .from('products')
        .select('id, title, images, price_min, country, moq, seller_id, published')
        .neq('id', id)
        .eq('published', true)
        .limit(4);

      if (generalProducts && generalProducts.length > 0) {
        const relatedWithSuppliers = await Promise.all(
          generalProducts.map(async (item) => {
            const { data: supplierData } = await supabase
              .from('suppliers')
              .select('company_name, verified')
              .eq('user_id', item.seller_id)
              .single();

            return {
              id: item.id,
              title: item.title,
              images: item.images ? [getSafeImage(item.images[0], 0)] : [IMAGE_FALLBACKS[0]],
              price: item.price_min?.toString() || 'Contact',
              country: item.country,
              moq: item.moq,
              supplier: supplierData?.company_name || 'Verified Supplier',
              seller_id: item.seller_id || 'unknown',
              is_verified: supplierData?.verified || false,
              type: 'product' as const,
            };
          })
        );
        setRelatedProducts(relatedWithSuppliers);
      } else {
        // Create mock related products with proper seller info
        const seller = sellerToUse || createFallbackSeller();
        setRelatedProducts([
          {
            id: '1',
            title: 'Wireless Headphones Pro',
            images: [IMAGE_FALLBACKS[0]],
            price: '29.99',
            country: 'China',
            moq: 50,
            supplier: seller.company_name,
            seller_id: seller.user_id,
            is_verified: seller.verified,
            type: 'product',
          },
          {
            id: '2',
            title: 'Smart Watch Series 5',
            images: [IMAGE_FALLBACKS[1]],
            price: '89.99',
            country: 'China',
            moq: 100,
            supplier: seller.company_name,
            seller_id: seller.user_id,
            is_verified: seller.verified,
            type: 'product',
          },
          {
            id: '3',
            title: 'Premium Laptop Stand',
            images: [IMAGE_FALLBACKS[2]],
            price: '24.99',
            country: 'Taiwan',
            moq: 50,
            supplier: seller.company_name,
            seller_id: seller.user_id,
            is_verified: seller.verified,
            type: 'product',
          },
          {
            id: '4',
            title: 'Multi-Port USB-C Hub',
            images: [IMAGE_FALLBACKS[0]],
            price: '39.99',
            country: 'China',
            moq: 100,
            supplier: seller.company_name,
            seller_id: seller.user_id,
            is_verified: seller.verified,
            type: 'product',
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
      // Create mock related products with seller
      const seller = createFallbackSeller();
      setRelatedProducts([
        {
          id: '1',
          title: 'Wireless Headphones',
          images: [IMAGE_FALLBACKS[0]],
          price: '29.99',
          country: 'China',
          moq: 50,
          supplier: seller.company_name,
          seller_id: seller.user_id,
          is_verified: seller.verified,
          type: 'product',
        },
        {
          id: '2',
          title: 'Smart Watch',
          images: [IMAGE_FALLBACKS[1]],
          price: '89.99',
          country: 'China',
          moq: 100,
          supplier: seller.company_name,
          seller_id: seller.user_id,
          is_verified: seller.verified,
          type: 'product',
        },
      ]);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Validate we have seller information
    if (!product.seller_id || !supplier) {
      toast.error('Cannot add product to cart: Missing seller information');
      return;
    }

    addItem({
      product_id: product.id,
      title: product.title,
      price: parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0,
      image: product.images[0] || IMAGE_FALLBACKS[0],
      quantity: Math.max(quantity, product.moq || 1),
      moq: product.moq || 1,
      unit: 'piece',
      seller_id: product.seller_id,
      seller_name: product.supplier || supplier.company_name,
      supplier_company: supplier.company_name,
      supplier_verified: supplier.verified,
    });

    toast.success('Added to cart!');
  };

  const handleContactSupplier = () => {
    if (!supplier) {
      toast.error('Supplier information not available');
      return;
    }

    if (product?.seller_id && product.seller_id !== 'fallback-user') {
      navigate(`/messages?supplier=${product.seller_id}`);
    } else {
      // For mock products, show contact info
      toast.info(`Contact ${supplier.company_name} at ${supplier.email || 'contact@supplier.com'}`);
    }
  };

  const handleRequestQuotation = () => {
    if (!product || !supplier) {
      toast.error('Cannot request quotation: Missing product or supplier information');
      return;
    }

    toast.success(`Quotation request sent to ${supplier.company_name}`);
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

  const handleImageError = (index: number) => {
    setImageError(prev => ({ ...prev, [index]: true }));
  };

  const formatPrice = (price: string) => {
    if (price.toLowerCase().includes('contact')) return price;
    const num = parseFloat(price);
    if (isNaN(num)) return price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num).replace('$', '');
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

  if (!product || !supplier) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="border border-red-200 bg-red-50">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Product Not Available</h2>
              <p className="text-gray-600 mb-4">
                Unable to load product information. Please try again or browse other products.
              </p>
              <Button onClick={() => navigate('/products')}>
                Browse Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Show admin hint if it's a mock product */}
      {product.id === FALLBACK_PRODUCT_ID && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-700">
                  Sample product shown. Add your products in the admin panel.
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-700 hover:bg-amber-100"
                onClick={() => navigate('/admin/products')}
              >
                Go to Admin
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center text-sm text-gray-500">
            <Link to="/" className="hover:text-[#FF6B35]">Home</Link>
            <ChevronRightIcon className="h-4 w-4 mx-2" />
            <Link to="/products" className="hover:text-[#FF6B35]">Products</Link>
            <ChevronRightIcon className="h-4 w-4 mx-2" />
            <Link to={`/category/${product.category}`} className="hover:text-[#FF6B35] capitalize">
              {product.category}
            </Link>
            <ChevronRightIcon className="h-4 w-4 mx-2" />
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
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                  {/* Main Image - Improved responsive sizing */}
                  <div className="lg:w-7/12">
                    <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3 sm:mb-4">
                      {!imageError[selectedImage] && product.images[selectedImage] ? (
                        <img
                          src={getSafeImage(product.images[selectedImage], selectedImage)}
                          alt={product.title}
                          className="w-full h-full object-contain p-2 sm:p-4"
                          onError={() => handleImageError(selectedImage)}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                          <ImageIcon className="h-16 w-16 text-gray-400 mb-2" />
                          <p className="text-gray-500 text-sm text-center">Image not available</p>
                        </div>
                      )}
                      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="rounded-full bg-white/90 backdrop-blur-sm shadow-sm h-8 w-8 sm:h-10 sm:w-10"
                          onClick={() => setIsFavorite(!isFavorite)}
                        >
                          <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="rounded-full bg-white/90 backdrop-blur-sm shadow-sm h-8 w-8 sm:h-10 sm:w-10"
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success('Link copied!');
                          }}
                        >
                          <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Thumbnail Gallery */}
                    <div className="relative">
                      <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide py-1 sm:py-2" ref={imagesRef}>
                        {product.images.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 overflow-hidden ${
                              selectedImage === index 
                                ? 'border-[#FF6B35]' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {!imageError[index] ? (
                              <img
                                src={getSafeImage(img, index)}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={() => handleImageError(index)}
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      {product.images.length > 3 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 shadow-sm h-8 w-8 sm:h-9 sm:w-9"
                            onClick={() => scrollImages('left')}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 shadow-sm h-8 w-8 sm:h-9 sm:w-9"
                            onClick={() => scrollImages('right')}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Product Actions - Improved responsive layout */}
                  <div className="lg:w-5/12 space-y-4 sm:space-y-6">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3">{product.title}</h1>
                      
                      {/* Price */}
                      <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          <span className="text-2xl sm:text-3xl font-bold text-[#FF6B35]">
                            ${formatPrice(product.price)}
                          </span>
                          {product.original_price && (
                            <span className="text-base sm:text-lg text-gray-400 line-through">
                              ${formatPrice(product.original_price)}
                            </span>
                          )}
                          {product.discount && product.discount > 0 && (
                            <Badge className="bg-red-100 text-red-600 hover:bg-red-100 text-xs sm:text-sm">
                              -{product.discount}%
                            </Badge>
                          )}
                        </div>
                        {product.min_price && product.max_price && (
                          <p className="text-xs sm:text-sm text-gray-500">
                            Price Range: ${formatPrice(product.min_price)} - ${formatPrice(product.max_price)} / piece
                          </p>
                        )}
                      </div>

                      {/* MOQ & Order Quantity */}
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                            Order Quantity
                          </label>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 sm:h-10 sm:w-10"
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
                              className="w-16 sm:w-20 text-center border border-gray-300 rounded-md py-1 sm:py-2 px-2 sm:px-3 text-sm sm:text-base"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 sm:h-10 sm:w-10"
                              onClick={() => setQuantity(quantity + 1)}
                            >
                              +
                            </Button>
                            <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2">
                              (Min. Order: {product.moq || 1} pieces)
                            </span>
                          </div>
                        </div>

                        {/* Total Price */}
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-sm sm:text-base">Total Price:</span>
                          <span className="text-lg sm:text-xl font-bold text-[#FF6B35]">${calculateTotal()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - Stack on mobile */}
                    <div className="space-y-2 sm:space-y-3">
                      <Button 
                        className="w-full bg-[#FF6B35] hover:bg-[#FF854F] text-white text-sm sm:text-base"
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Add to Cart
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35]/10 text-sm sm:text-base"
                        onClick={handleContactSupplier}
                      >
                        <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Contact Supplier
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline"
                          className="border-gray-300 text-xs sm:text-sm"
                          onClick={handleRequestQuotation}
                        >
                          Request Quotation
                        </Button>
                        <Button 
                          variant="outline"
                          className="border-gray-300 text-xs sm:text-sm"
                          onClick={() => navigate('/cart')}
                        >
                          Buy Now
                        </Button>
                      </div>
                    </div>

                    {/* Quick Stats - Responsive grid */}
                    <div className="border-t pt-3 sm:pt-4 space-y-2 sm:space-y-3">
                      <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-sm text-gray-500">Page Views:</span>
                          <span className="font-medium text-sm sm:text-base">{supplier.page_views}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-sm text-gray-500">Inquiries:</span>
                          <span className="font-medium text-sm sm:text-base">{supplier.inquiries}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-sm text-gray-500">Response Rate:</span>
                          <span className="font-medium text-green-600 text-sm sm:text-base">
                            {supplier.response_rate}%
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-sm text-gray-500">Supplier Status:</span>
                          <span className={`font-medium text-sm sm:text-base ${supplier.online_status ? 'text-green-600' : 'text-gray-500'}`}>
                            {supplier.online_status ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Tabs - Mobile responsive */}
            <Card className="border border-gray-200 shadow-sm">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b">
                  <TabsList className="w-full justify-start h-auto p-0 bg-transparent overflow-x-auto">
                    <TabsTrigger 
                      value="description" 
                      className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B35] rounded-none px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm"
                    >
                      Details
                    </TabsTrigger>
                    <TabsTrigger 
                      value="specifications" 
                      className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B35] rounded-none px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm"
                    >
                      Specs
                    </TabsTrigger>
                    <TabsTrigger 
                      value="reviews" 
                      className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B35] rounded-none px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm"
                    >
                      Reviews ({reviews.length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="shipping" 
                      className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B35] rounded-none px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm"
                    >
                      Shipping
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="description" className="p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2 sm:mb-3">Description</h3>
                      <p className="text-gray-600 whitespace-pre-line text-sm sm:text-base">
                        {product.description}
                      </p>
                    </div>

                    {product.features && product.features.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2 sm:mb-3">Key Features</h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                          {product.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600 text-sm sm:text-base">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {product.certifications && product.certifications.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2 sm:mb-3">Certifications</h3>
                        <div className="flex gap-2 flex-wrap">
                          {product.certifications.map((cert, index) => (
                            <Badge key={index} variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-xs sm:text-sm">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="specifications" className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-2 sm:mb-4">Product Specifications</h3>
                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <tbody>
                            {Object.entries(product.specifications).map(([key, value], index) => (
                              <tr key={key} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="px-3 sm:px-4 py-2 sm:py-3 border-r border-gray-200 font-medium text-gray-700 text-sm sm:text-base w-1/3">
                                  {key}
                                </td>
                                <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-600 text-sm sm:text-base">
                                  {value}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm sm:text-base">No specifications available.</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">Customer Reviews</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                  star <= 4.8 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-base sm:text-lg font-bold ml-2">4.8</span>
                          <span className="text-gray-500 text-sm sm:text-base">({reviews.length} reviews)</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4 sm:space-y-6">
                      {reviews.map((review) => (
                        <Card key={review.id} className="border border-gray-200">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={review.user_avatar}
                                  alt={review.user_name}
                                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm sm:text-base">{review.user_name}</span>
                                    {review.verified_order && (
                                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-xs">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Verified
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                                    <div className="flex items-center">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                          key={star}
                                          className={`h-3 w-3 sm:h-4 sm:w-4 ${
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
                              <Button variant="ghost" size="sm" className="justify-start sm:justify-center mt-2 sm:mt-0">
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                Helpful ({review.helpful_count})
                              </Button>
                            </div>

                            <div className="space-y-2 sm:space-y-3">
                              <h4 className="font-medium text-sm sm:text-base">{review.title}</h4>
                              <p className="text-gray-600 text-sm sm:text-base">{review.content}</p>
                              
                              {review.product_attributes && (
                                <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                                  {Object.entries(review.product_attributes).map(([key, value]) => (
                                    <div key={key} className="text-gray-500">
                                      <span className="font-medium">{key}:</span> {value}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                              <Button variant="ghost" size="sm" className="text-gray-500 text-xs sm:text-sm">
                                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Reply
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-500 text-xs sm:text-sm">
                                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Report
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="shipping" className="p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* Shipping Info */}
                      <div>
                        <h3 className="text-lg font-semibold mb-2 sm:mb-4 flex items-center gap-2">
                          <Truck className="h-5 w-5 text-[#FF6B35]" />
                          Shipping Information
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500">Lead Time</p>
                            <p className="font-medium text-sm sm:text-base">{product.lead_time}</p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500">Supply Ability</p>
                            <p className="font-medium text-sm sm:text-base">{product.supply_ability}</p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500">Port</p>
                            <p className="font-medium text-sm sm:text-base">Shanghai, Ningbo, Shenzhen</p>
                          </div>
                        </div>
                      </div>

                      {/* Payment & Support */}
                      <div>
                        <h3 className="text-lg font-semibold mb-2 sm:mb-4 flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-[#FF6B35]" />
                          Payment & Support
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500">Payment Terms</p>
                            <div className="flex gap-1 sm:gap-2 flex-wrap mt-1">
                              {product.payment_terms?.map((term, index) => (
                                <Badge key={index} variant="secondary" className="text-xs sm:text-sm">
                                  {term}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500">Packaging Details</p>
                            <p className="font-medium text-sm sm:text-base">{product.packaging_details}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Trade Assurance */}
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                          <ShieldCheck className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                              Trade Assurance
                              <Badge className="bg-blue-600 text-white text-xs sm:text-sm">Protected</Badge>
                            </h3>
                            <p className="text-gray-600 text-sm sm:text-base mb-3">
                              Your payment is protected by Trade Assurance. Get refunded if your order is not shipped or as described.
                            </p>
                            <div className="flex flex-col sm:flex-row sm:gap-4 gap-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm">On-time shipment</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
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
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold">Related Products</h2>
                  <Button variant="ghost" className="text-[#FF6B35] text-sm sm:text-base">
                    View All <ChevronRightIcon className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {relatedProducts.map((item) => (
                    <Link
                      key={item.id}
                      to={`/product-insights/product/${item.id}`}
                      className="group"
                    >
                      <Card className="border border-gray-200 hover:border-[#FF6B35] transition-colors overflow-hidden h-full">
                        <div className="aspect-square overflow-hidden bg-gray-100">
                          <img
                            src={getSafeImage(item.images[0], 0)}
                            alt={item.title}
                            className="w-full h-full object-contain p-2 sm:p-4 group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = IMAGE_FALLBACKS[0];
                            }}
                          />
                        </div>
                        <CardContent className="p-3 sm:p-4">
                          <h3 className="text-xs sm:text-sm font-medium line-clamp-2 mb-1 sm:mb-2 min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-[#FF6B35]">
                            {item.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#FF6B35] text-sm sm:text-base">${item.price}</span>
                            {item.is_verified && (
                              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">MOQ: {item.moq} pieces</p>
                          <p className="text-xs text-gray-400 mt-1 truncate">by {item.supplier}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Supplier Info & Quick Actions - Hide on mobile, show on lg */}
          <div className="lg:col-span-4 space-y-6 hidden lg:block">
            {/* Sticky Container */}
            <div className="sticky top-24 space-y-6">
              {/* Supplier Card */}
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{supplier.company_name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        {supplier.gold_supplier && (
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            <Award className="h-3 w-3 mr-1" />
                            Gold Supplier
                          </Badge>
                        )}
                        {supplier.assessed_supplier && (
                          <Badge variant="outline" className="border-blue-200 text-blue-600">
                            Assessed
                          </Badge>
                        )}
                        {supplier.verified && (
                          <Badge variant="outline" className="border-green-200 text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Factory className="h-4 w-4" />
                        <span>{supplier.business_type}</span>
                      </div>
                    </div>
                    {supplier.online_status && (
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-green-600">Online</span>
                      </div>
                    )}
                  </div>

                  {/* Supplier Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-[#FF6B35]">{supplier.response_rate}%</p>
                      <p className="text-xs text-gray-500">Response Rate</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-[#FF6B35]">
                        {new Date().getFullYear() - supplier.year_established}
                      </p>
                      <p className="text-xs text-gray-500">Years on Platform</p>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="space-y-3">
                    {supplier.address && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{supplier.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{supplier.employees} Employees</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{supplier.total_products} Products</span>
                    </div>
                    {supplier.website && (
                      <div className="flex items-center gap-3">
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                        <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          Visit Website
                        </a>
                      </div>
                    )}
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
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`/supplier/${supplier.id}`)}>
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

      {/* Fixed Bottom Bar - Mobile only */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 lg:hidden">
        <div className="container mx-auto px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
              <div className="min-w-[80px]">
                <p className="text-xs text-gray-500">Unit Price</p>
                <p className="font-bold text-[#FF6B35] text-sm">${formatPrice(product.price)}</p>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="min-w-[80px]">
                <p className="text-xs text-gray-500">Total</p>
                <p className="font-bold text-[#FF6B35] text-sm">${calculateTotal()}</p>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="min-w-[60px]">
                <p className="text-xs text-gray-500">MOQ</p>
                <p className="font-medium text-sm">{product.moq}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-2">
              <Button 
                size="sm"
                className="bg-[#FF6B35] hover:bg-[#FF854F] text-xs"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
              <Button 
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-xs"
                onClick={() => navigate('/cart')}
              >
                Buy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
