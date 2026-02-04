import { useState, useEffect } from "react";
import { Bell, Clock, Star, Shield, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/hooks/useCurrency";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface UpcomingProduct {
    id: string;
    title: string;
    slug: string;
    images: string[] | null;
    price_min: number | null;
    verified: boolean | null;
}

const RotatingPrice = ({ min, max, currentPrice }: { min: number; max: number; currentPrice: number }) => {
    const [price, setPrice] = useState(min);
    const { formatPriceOnly } = useCurrency();
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                const randomPrice = min + Math.random() * (max - min);
                setPrice(randomPrice);
                setIsVisible(true);
            }, 200); // Wait for fade out
        }, 2000); // Change every 2 seconds

        return () => clearInterval(interval);
    }, [min, max]);

    const savings = currentPrice - price;

    return (
        <div className={`transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-lg font-bold text-yellow-400">
                    ~ {formatPriceOnly(price)}
                </span>
                <span className="text-xs text-gray-400 line-through">
                    {formatPriceOnly(currentPrice)}
                </span>
            </div>
            <p className="text-xs text-green-400 font-medium flex items-center gap-1 mt-1">
                <Flame className="w-3 h-3 fill-green-400" />
                Save ~{formatPriceOnly(savings)}
            </p>
        </div>
    );
};

export const UpcomingDeals = () => {
    const [products, setProducts] = useState<UpcomingProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeUntilStart, setTimeUntilStart] = useState<number>(0);
    const [notifiedProducts, setNotifiedProducts] = useState<Set<string>>(new Set());
    const { formatPriceOnly } = useCurrency();
    const { toast } = useToast();

    useEffect(() => {
        fetchUpcomingProducts();

        // Set countdown to tomorrow 9 AM
        const now = new Date();
        const tomorrow9AM = new Date(now);
        tomorrow9AM.setDate(tomorrow9AM.getDate() + 1);
        tomorrow9AM.setHours(9, 0, 0, 0);

        const updateTimer = () => {
            const diff = tomorrow9AM.getTime() - Date.now();
            setTimeUntilStart(diff > 0 ? diff : 0);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, []);

    const fetchUpcomingProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('id, title, slug, images, price_min, verified')
                .eq('published', true)
                .not('price_min', 'is', null)
                .order('created_at', { ascending: false })
                .limit(4);

            if (error) throw error;
            if (data) setProducts(data);
        } catch (error) {
            console.error('Error fetching upcoming deals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotifyMe = (productId: string, productTitle: string) => {
        if (notifiedProducts.has(productId)) {
            toast({
                title: "Already subscribed!",
                description: "You'll be notified when this deal goes live.",
            });
            return;
        }

        setNotifiedProducts(prev => new Set(prev).add(productId));
        toast({
            title: "Notification set! 🔔",
            description: `We'll notify you when "${productTitle}" goes on sale.`,
        });
    };

    const formatTime = (ms: number) => {
        if (ms <= 0) return { hours: '00', minutes: '00', seconds: '00' };
        const totalSeconds = Math.floor(ms / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return { hours, minutes, seconds };
    };

    // Realistic upcoming discounts: 20-40% (slightly higher than flash sale to build anticipation)
    const getUpcomingDiscount = (productId: string) => {
        const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const discounts = [20, 25, 30, 35, 40]; // Realistic future discounts
        return discounts[hash % discounts.length];
    };

    const time = formatTime(timeUntilStart);

    if (loading) {
        return (
            <section className="py-8 px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="max-w-7xl mx-auto">
                    <Skeleton className="h-12 w-64 mb-6 bg-slate-700" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-72 bg-slate-700" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-8 px-4 bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2 mb-2">
                            <Flame className="w-8 h-8 text-orange-500 fill-orange-500 animate-pulse" />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-yellow-400">
                                Upcoming Flash Sales
                            </span>
                        </h2>
                        <p className="text-gray-300">Get ready! These hot deals drop starts tomorrow.</p>
                    </div>

                    {/* Countdown */}
                    <div className="mt-4 md:mt-0 bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 rounded-full shadow-lg border border-orange-500/30">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 animate-pulse" />
                            <div className="flex items-center gap-2 font-mono text-lg font-bold">
                                <span>{time.hours}h</span>
                                <span>:</span>
                                <span>{time.minutes}m</span>
                                <span>:</span>
                                <span>{time.seconds}s</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {products.map((product) => {
                        const isNotified = notifiedProducts.has(product.id);
                        // Show a small range of uncertainty for the upcoming price
                        const baseDiscount = getUpcomingDiscount(product.id);
                        const discountRange = 5; // +/- 5% variance
                        const minDiscount = Math.max(5, baseDiscount - discountRange);
                        const maxDiscount = Math.min(90, baseDiscount);

                        const currentPrice = product.price_min || 0;
                        const futurePriceMax = currentPrice * (1 - minDiscount / 100);
                        const futurePriceMin = currentPrice * (1 - maxDiscount / 100);

                        return (
                            <div
                                key={product.id}
                                className="group bg-slate-800/80 backdrop-blur-md rounded-xl overflow-hidden border border-orange-500/20 hover:border-orange-500 transition-all duration-300 shadow-lg hover:shadow-orange-500/30"
                            >
                                {/* Image with overlay */}
                                <div className="relative aspect-square overflow-hidden bg-slate-700">
                                    <img
                                        src={product.images?.[0] || '/placeholder.svg'}
                                        alt={product.title}
                                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                                        loading="lazy"
                                    />

                                    {/* Coming Soon Badge */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-black/60 backdrop-blur-sm p-4 rounded-xl text-center transform group-hover:scale-105 transition-transform">
                                            <p className="text-orange-400 font-bold text-sm tracking-widest mb-1">STARTS IN</p>
                                            <p className="text-white font-mono font-bold text-xl">{time.hours}:{time.minutes}:{time.seconds}</p>
                                        </div>
                                    </div>

                                    {/* Discount Preview */}
                                    <div className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                        -{maxDiscount}%
                                    </div>

                                    {/* Verified Badge */}
                                    {product.verified && (
                                        <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1 border border-white/10">
                                            <Shield className="w-3 h-3 text-green-400" />
                                            Verified
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-3 space-y-3">
                                    <h3 className="text-sm font-medium line-clamp-2 group-hover:text-orange-300 transition-colors">
                                        {product.title}
                                    </h3>

                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-gray-400">Expected price:</p>
                                            <span className="text-[10px] bg-red-900/50 text-red-300 px-1.5 py-0.5 rounded border border-red-800/50">HOT</span>
                                        </div>
                                        <RotatingPrice min={futurePriceMin} max={futurePriceMax} currentPrice={currentPrice} />
                                    </div>

                                    {/* Notify Button */}
                                    <button
                                        onClick={() => handleNotifyMe(product.id, product.title)}
                                        disabled={isNotified}
                                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${isNotified
                                            ? 'bg-green-600 text-white cursor-default'
                                            : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-orange-500/25'
                                            }`}
                                    >
                                        <Bell className={`w-4 h-4 ${isNotified ? '' : 'animate-bounce'}`} />
                                        {isNotified ? 'Notification Set' : 'Notify Me'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
