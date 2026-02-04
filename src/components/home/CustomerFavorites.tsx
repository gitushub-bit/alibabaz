import { useState, useEffect } from "react";
import { Heart, Sparkles, TrendingUp, Shield } from "lucide-react";
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

export const CustomerFavorites = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { formatPriceOnly } = useCurrency();

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('id, title, slug, images, price_min, verified, moq, unit')
                .eq('published', true)
                .not('price_min', 'is', null)
                .order('created_at', { ascending: false })
                .limit(8);

            if (error) throw error;
            if (data) setProducts(data);
        } catch (error) {
            console.error('Error fetching customer favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="py-8 px-4 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
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
        <section className="py-8 px-4 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-pink-500 blur-xl opacity-30 animate-pulse"></div>
                            <Heart className="relative w-10 h-10 text-pink-600 fill-pink-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                                Customer Favorites
                                <Sparkles className="w-6 h-6 text-purple-600" />
                            </h2>
                            <p className="text-sm text-gray-600">Most loved products by our community</p>
                        </div>
                    </div>

                    <Link
                        to="/products?sort=favorites"
                        className="text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                        View All
                        <TrendingUp className="w-4 h-4" />
                    </Link>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {products.map((product, index) => {
                        const favoriteCount = 250 + (index * 80); // Simulated favorite count
                        const trendingScore = Math.floor(Math.random() * 100); // 0-100

                        return (
                            <Link
                                key={product.id}
                                to={`/product/${product.slug}`}
                                className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-pink-400 transition-all duration-300 shadow-sm hover:shadow-xl transform hover:scale-105"
                            >
                                {/* Image */}
                                <div className="relative aspect-square overflow-hidden bg-gray-100">
                                    <img
                                        src={product.images?.[0] || '/placeholder.svg'}
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        loading="lazy"
                                    />

                                    {/* Trending Badge */}
                                    {trendingScore > 70 && (
                                        <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse">
                                            <TrendingUp className="w-3 h-3" />
                                            TRENDING
                                        </div>
                                    )}

                                    {/* Verified Badge */}
                                    {product.verified && (
                                        <div className="absolute top-2 right-2 bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                                            <Shield className="w-3 h-3" />
                                        </div>
                                    )}

                                    {/* Favorite Count Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                        <div className="flex items-center gap-2 text-white">
                                            <Heart className="w-4 h-4 fill-pink-500 text-pink-500 animate-pulse" />
                                            <span className="text-sm font-semibold">{favoriteCount} favorites</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-3 space-y-2">
                                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-pink-600 transition-colors">
                                        {product.title}
                                    </h3>

                                    {/* Price */}
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-lg font-bold text-gray-900">
                                            {formatPriceOnly(product.price_min || 0)}
                                        </span>
                                    </div>

                                    {/* MOQ */}
                                    <p className="text-xs text-gray-500">
                                        Min. order: {product.moq || 1} {product.unit || 'piece'}
                                    </p>

                                    {/* Popularity Bar */}
                                    <div className="pt-2 space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-purple-600 font-semibold">Popularity</span>
                                            <span className="text-gray-600">{trendingScore}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${trendingScore}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
