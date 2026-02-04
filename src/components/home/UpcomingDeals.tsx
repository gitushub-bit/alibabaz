import { useState, useEffect } from "react";
import { Bell, Clock, Star } from "lucide-react";
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
}

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
                .select('id, title, slug, images, price_min')
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
        <section className="py-8 px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2 mb-2">
                            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                            Upcoming Flash Sales
                        </h2>
                        <p className="text-gray-300">Get ready for amazing deals starting soon!</p>
                    </div>

                    {/* Countdown */}
                    <div className="mt-4 md:mt-0 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-full shadow-lg">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5" />
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
                        const futureDiscount = 50 + Math.floor(Math.random() * 20); // 50-70% off
                        const futurePrice = (product.price_min || 0) * (1 - futureDiscount / 100);

                        return (
                            <div
                                key={product.id}
                                className="group bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-500/30 hover:border-purple-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
                            >
                                {/* Image with overlay */}
                                <div className="relative aspect-square overflow-hidden bg-slate-700">
                                    <img
                                        src={product.images?.[0] || '/placeholder.svg'}
                                        alt={product.title}
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500"
                                        loading="lazy"
                                    />

                                    {/* Coming Soon Badge */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                                            COMING SOON
                                        </div>
                                    </div>

                                    {/* Discount Preview */}
                                    <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                        -{futureDiscount}%
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-3 space-y-3">
                                    <h3 className="text-sm font-medium line-clamp-2 group-hover:text-purple-300 transition-colors">
                                        {product.title}
                                    </h3>

                                    {/* Price Preview */}
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-400">Expected price:</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-lg font-bold text-yellow-400">
                                                {formatPriceOnly(futurePrice)}
                                            </span>
                                            <span className="text-xs text-gray-400 line-through">
                                                {formatPriceOnly(product.price_min || 0)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Notify Button */}
                                    <button
                                        onClick={() => handleNotifyMe(product.id, product.title)}
                                        disabled={isNotified}
                                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${isNotified
                                                ? 'bg-green-600 text-white cursor-default'
                                                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
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
