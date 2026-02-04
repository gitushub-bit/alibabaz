import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AlibabaHeader from '@/components/layout/AlibabaHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import {
    Building2,
    MapPin,
    Globe,
    Users,
    Clock,
    ShieldCheck,
    Star,
    MessageSquare,
    Package,
    TrendingUp,
    Award,
    ChevronRight,
    Heart
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Supplier {
    user_id: string;
    year_established: number | null;
    employees: string | null;
    main_markets: string[] | null;
    verified: boolean;
    response_rate: number;
    company_info: string | null;
    location?: string | null;
}

interface Profile {
    full_name: string | null;
    company_name: string | null;
    avatar_url: string | null;
    country: string | null;
    city: string | null;
}

interface Product {
    id: string;
    title: string;
    slug: string;
    price_min: number | null;
    price_max: number | null;
    moq: number;
    images: string[] | null;
    unit: string;
}

export default function SupplierDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        if (id) {
            fetchSupplierData();
        }
    }, [id]);

    const fetchSupplierData = async () => {
        setLoading(true);
        try {
            const [supplierRes, profileRes, productsRes] = await Promise.all([
                supabase.from('suppliers').select('*').eq('user_id', id).maybeSingle(),
                supabase.from('profiles').select('*').eq('user_id', id).maybeSingle(),
                supabase.from('products').select('*').eq('seller_id', id).eq('published', true).order('created_at', { ascending: false }).limit(20)
            ]);

            if (supplierRes.data) setSupplier(supplierRes.data);
            if (profileRes.data) setProfile(profileRes.data);
            if (productsRes.data) setProducts(productsRes.data);

        } catch (error) {
            console.error('Error fetching supplier data:', error);
        } finally {
            setLoading(false);
        }
    };

    const startConversation = async () => {
        if (!user) {
            navigate('/auth');
            return;
        }

        const { data: existing } = await supabase
            .from('conversations')
            .select('id')
            .eq('buyer_id', user.id)
            .eq('seller_id', id)
            .maybeSingle();

        if (existing) {
            navigate(`/messages/${existing.id}`);
            return;
        }

        const { data: newConv } = await supabase
            .from('conversations')
            .insert({
                buyer_id: user.id,
                seller_id: id
            })
            .select()
            .maybeSingle();

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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
                <AlibabaHeader />
                <main className="container mx-auto px-4 py-6 space-y-6">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <div className="grid md:grid-cols-3 gap-6">
                        <Skeleton className="h-64 rounded-xl" />
                        <Skeleton className="h-64 md:col-span-2 rounded-xl" />
                    </div>
                </main>
            </div>
        );
    }

    if (!profile && !supplier) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <AlibabaHeader />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center">
                        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Supplier Not Found</h2>
                        <p className="text-gray-500 mb-6">This supplier profile is unavailable or doesn't exist.</p>
                        <Button onClick={() => navigate('/')}>Back to Home</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] pb-20 md:pb-12">
            <AlibabaHeader />

            {/* ─── HERO BANNER ─── */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-[60px] py-6 sm:py-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 sm:gap-6">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl border-2 border-gray-100 flex items-center justify-center text-3xl font-bold text-gray-700 shadow-sm overflow-hidden flex-shrink-0">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt={profile.company_name || ""} className="w-full h-full object-cover" />
                                ) : (
                                    profile?.company_name?.[0] || 'S'
                                )}
                            </div>
                            <div className="space-y-1 sm:space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#111] leading-tight break-words">
                                        {profile?.company_name || 'Global Strategic Partner'}
                                    </h1>
                                    {supplier?.verified && <Badge className="bg-orange-50 text-orange-600 border-orange-100 px-2 py-0.5 rounded text-[10px] font-bold">Verified Professional</Badge>}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" />
                                        {profile?.country || 'International'}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        {supplier?.year_established ? `${new Date().getFullYear() - supplier.year_established} Yrs` : 'Est. 5+ Yrs'}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-orange-600">
                                        <ShieldCheck className="w-4 h-4" />
                                        Trade Assurance
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <Button
                                onClick={startConversation}
                                className="flex-1 md:flex-none bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold h-11 px-6 rounded-full"
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Contact Now
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsFollowing(!isFollowing)}
                                className={`flex-1 md:flex-none h-11 px-6 rounded-full border-2 font-bold transition-all ${isFollowing ? 'border-orange-500 text-orange-600 bg-orange-50' : 'border-gray-200 text-gray-700'}`}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── MAIN CONTENT ─── */}
            <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-[60px] py-8">
                <div className="grid lg:grid-cols-4 gap-8">

                    {/* SIDEBAR: COMPANY STATS */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
                            <CardContent className="p-0">
                                <div className="bg-gradient-to-br from-[#222] to-[#444] p-5 text-white">
                                    <div className="text-[10px] uppercase tracking-widest font-bold opacity-70 mb-1">Response Rating</div>
                                    <div className="text-3xl font-black">{supplier?.response_rate || 98}%</div>
                                    <p className="text-[11px] opacity-60 mt-1 font-medium">Replied in &lt; 3 hours (Last 30 days)</p>
                                </div>
                                <div className="p-5 space-y-4 bg-white">
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                        <span className="text-gray-500 text-xs font-bold uppercase tracking-tight">Main Markets</span>
                                        <span className="text-sm font-bold text-gray-900">{supplier?.main_markets?.[0] || 'North America'}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                        <span className="text-gray-500 text-xs font-bold uppercase tracking-tight">Business Type</span>
                                        <span className="text-sm font-bold text-gray-900">OEM/ODM</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                        <span className="text-gray-500 text-xs font-bold uppercase tracking-tight">Employees</span>
                                        <span className="text-sm font-bold text-gray-900">{supplier?.employees || '50-100'}+</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-xs font-bold uppercase tracking-tight">Certification</span>
                                        <Badge variant="outline" className="text-[10px] border-green-200 text-green-700 bg-green-50 font-bold">ISO 9001</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm rounded-2xl bg-white p-5">
                            <h3 className="font-bold text-[#111] mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-[#FF6600]" />
                                Company Profile
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed overflow-hidden line-clamp-6">
                                {supplier?.company_info || "Industry-leading manufacturer specializing in high-performance solutions for global markets. Our factory utilizes cutting-edge automated systems to maintain consistent quality and rapid lead times. Built on a foundation of professional excellence and customer-centric service."}
                            </p>
                            <Button variant="link" className="p-0 mt-2 text-[#FF6600] font-bold text-sm h-auto">View Full Profile <ChevronRight className="w-4 h-4" /></Button>
                        </Card>
                    </div>

                    {/* MAIN COLUMN: PRODUCTS */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-[#111] tracking-tight">Supplier's Popular Products</h2>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="font-bold text-gray-500">New Arrivals</Button>
                                <div className="w-[1px] h-4 bg-gray-200 self-center"></div>
                                <Button variant="ghost" size="sm" className="font-bold text-[#FF6600]">Hot Sale</Button>
                            </div>
                        </div>

                        {products.length === 0 ? (
                            <div className="bg-white rounded-3xl p-12 border border-dashed border-gray-200 text-center">
                                <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-700">No products found</h3>
                                <p className="text-gray-500">This supplier hasn't listed any public products yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                {products.map((product) => (
                                    <Link key={product.id} to={`/product/${product.slug}`} className="group h-full">
                                        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                                            <div className="aspect-square relative overflow-hidden bg-[#F9F9FB]">
                                                <img
                                                    src={product.images?.[0] || '/placeholder.svg'}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                                                </button>
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col">
                                                <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#FF6600] transition-colors line-clamp-2 leading-tight mb-2">
                                                    {product.title}
                                                </h3>
                                                <div className="mt-auto pt-2">
                                                    <div className="text-lg font-black text-[#111]">
                                                        {product.price_min ? `$${product.price_min.toFixed(2)}` : 'Contact Price'}
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-tighter mt-1">
                                                        MOQ: {product.moq} {product.unit}s
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {products.length > 0 && (
                            <div className="text-center pt-8">
                                <Button variant="outline" className="rounded-full px-8 h-12 font-bold border-2 border-gray-200 text-gray-700 hover:border-orange-500 hover:text-orange-600 transition-all">
                                    View All {products.length}+ Products
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
