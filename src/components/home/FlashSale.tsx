import { useState, useEffect } from "react";
import { Flame, Clock, Shield, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/hooks/useCurrency";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
    id: string;
    title: string;
    slug: string;
    images: string[] | null;
    price_min: number | null;
    verified: boolean | null;
    moq: number | null;
    unit: string | null;
}

export const FlashSale = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const { formatPriceOnly } = useCurrency();

    useEffect(() => {
        fetchFlashSaleProducts();

        // Set countdown to end of day
        const now = new Date();
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        const updateTimer = () => {
            const diff = endOfDay.getTime() - Date.now();
            setTimeLeft(diff > 0 ? diff : 0);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, []);

    const fetchFlashSaleProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('id, title, slug, images, price_min, verified, moq, unit')
                .eq('published', true)
                .eq('verified', true)
                .not('price_min', 'is', null)
                .order('price_min', { ascending: true })
                .limit(8);

            if (error) throw error;
            if (data) setProducts(data);
        } catch (error) {
            console.error('Error fetching flash sale products:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (ms: number) => {
        if (ms <= 0) return { hours: '00', minutes: '00', seconds: '00' };
        const totalSeconds = Math.floor(ms / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return { hours, minutes, seconds };
    };

    const time = formatTime(timeLeft);
    const getDiscount = (price: number) => Math.floor(40 + (price % 30)); // 40-70% discount

    if (loading) {
        return (
            <section className="py-8 px-4 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
                <div className="max-w-7xl mx-auto">
                    <Skeleton className="h-12 w-64 mb-6" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={i} className="h-80" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-8 px-4 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 border-y-2 border-red-200">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                    <div className="flex items-center gap-3 mb-4 md:mb-0">
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500 blur-xl opacity-40 animate-pulse"></div>
                            <Flame className="relative w-10 h-10 text-red-600 fill-red-600 animate-bounce" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                                Flash Sale
                                <span className="text-red-600">🔥</span>
                            </h2>
                            <p className="text-sm text-gray-600">Limited time wholesale prices - Bulk orders welcome</p>
                        </div>
                    </div>

                    {/* Countdown Timer */}
                    <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border-2 border-red-200">
                        <Clock className="w-5 h-5 text-red-600" />
                        <div className="flex items-center gap-2 font-mono text-lg font-bold">
                            <div className="flex flex-col items-center">
                                <span className="text-red-600">{time.hours}</span>
                                <span className="text-xs text-gray-500">Hours</span>
                            </div>
                            <span className="text-red-600">:</span>
                            <div className="flex flex-col items-center">
                                <span className="text-red-600">{time.minutes}</span>
                                <span className="text-xs text-gray-500">Mins</span>
                            </div>
                            <span className="text-red-600">:</span>
                            <div className="flex flex-col items-center">
                                <span className="text-red-600">{time.seconds}</span>
                                <span className="text-xs text-gray-500">Secs</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {products.map((product) => {
                        const discount = getDiscount(product.price_min || 0);
                        const originalPrice = (product.price_min || 0) / (1 - discount / 100);

                        return (
                            <Link
                                key={product.id}
                                to={`/product/${product.slug}`}
                                className="group bg-white rounded-xl overflow-hidden border-2 border-transparent hover:border-red-400 transition-all duration-300 shadow-md hover:shadow-2xl transform hover:scale-105"
                            >
                                {/* Image */}
                                <div className="relative aspect-square overflow-hidden bg-gray-100">
                                    <img
                                        src={product.images?.[0] || '/placeholder.svg'}
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        loading="lazy"
                                    />

                                    {/* Discount Badge */}
                                    <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                        -{discount}%
                                    </div>

                                    {/* Flash Sale Badge */}
                                    <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                        <Flame className="w-3 h-3 fill-white" />
                                        FLASH
                                    </div>

                                    {/* Verified Badge */}
                                    {product.verified && (
                                        <div className="absolute bottom-2 left-2 bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                                            <Shield className="w-3 h-3" />
                                            Verified
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-3 space-y-2">
                                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors">
                                        {product.title}
                                    </h3>

                                    {/* Price */}
                                    <div className="space-y-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-bold text-red-600">
                                                {formatPriceOnly(product.price_min || 0)}
                                            </span>
                                            <span className="text-xs text-gray-400 line-through">
                                                {formatPriceOnly(originalPrice)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Wholesale Information */}
                                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                        <Package className="w-4 h-4 text-blue-600" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-600">
                                                MOQ: <span className="font-semibold text-gray-900">{product.moq || 1} {product.unit || 'piece'}</span>
                                            </p>
                                            <p className="text-xs text-blue-600 font-medium">Wholesale Ready</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* View All Link */}
                <div className="text-center mt-6">
                    <Link
                        to="/products?flash_sale=true"
                        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        View All Flash Deals
                        <Flame className="w-5 h-5 fill-white" />
                    </Link>
                </div>
            </div>
        </section>
    );
};
