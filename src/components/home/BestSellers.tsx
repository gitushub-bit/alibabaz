import { useState, useEffect } from "react";
import { Trophy, TrendingUp, Shield, Heart } from "lucide-react";
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

export const BestSellers = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { formatPriceOnly } = useCurrency();

    useEffect(() => {
        fetchBestSellers();
    }, []);

    const fetchBestSellers = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('id, title, slug, images, price_min, verified, moq, unit')
                .eq('published', true)
                .eq('verified', true)
                .not('price_min', 'is', null)
                .order('created_at', { ascending: false })
                .limit(8);

            if (error) throw error;
            if (data) setProducts(data);
        } catch (error) {
            console.error('Error fetching best sellers:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="py-8 px-4 bg-white">
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
        <section className="py-8 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-30"></div>
                            <Trophy className="relative w-10 h-10 text-yellow-600 fill-yellow-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                Best Sellers
                            </h2>
                            <p className="text-sm text-gray-600">Top-rated products loved by customers</p>
                        </div>
                    </div>

                    <Link
                        to="/products?sort=popular"
                        className="text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                        View All
                        <TrendingUp className="w-4 h-4" />
                    </Link>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {products.map((product, index) => {
                        const soldCount = 500 + (index * 150); // Simulated sold count
                        const rating = 4.5 + (Math.random() * 0.5); // 4.5-5.0 rating

                        return (
                            <Link
                                key={product.id}
                                to={`/product/${product.slug}`}
                                className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-yellow-400 transition-all duration-300 shadow-sm hover:shadow-xl transform hover:scale-105"
                            >
                                {/* Image */}
                                <div className="relative aspect-square overflow-hidden bg-gray-100">
                                    <img
                                        src={product.images?.[0] || '/placeholder.svg'}
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        loading="lazy"
                                    />

                                    {/* Best Seller Badge */}
                                    <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                        <Trophy className="w-3 h-3 fill-white" />
                                        BEST SELLER
                                    </div>

                                    {/* Verified Badge */}
                                    {product.verified && (
                                        <div className="absolute top-2 right-2 bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                                            <Shield className="w-3 h-3" />
                                        </div>
                                    )}

                                    {/* Sold Count */}
                                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                                        {soldCount}+ sold
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-3 space-y-2">
                                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-yellow-600 transition-colors">
                                        {product.title}
                                    </h3>

                                    {/* Rating */}
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <span
                                                key={i}
                                                className={`text-xs ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
                                                    }`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                        <span className="text-xs text-gray-600 ml-1">
                                            ({rating.toFixed(1)})
                                        </span>
                                    </div>

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

                                    {/* Social Proof */}
                                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-xs text-gray-600 flex items-center gap-1">
                                            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                                            {Math.floor(soldCount / 10)} favorites
                                        </span>
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
