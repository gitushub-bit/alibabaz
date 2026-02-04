import { useState, useEffect } from "react";
import { Globe, TrendingUp, Shield, Package } from "lucide-react";
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
            <section className="py-8 px-4 bg-gray-50">
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
        <section className="py-12 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-[#FF6600]"></div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                Trending Globally
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">Popular products across international markets</p>
                        </div>
                    </div>

                    <Link
                        to="/products?sort=trending"
                        className="text-[#FF6600] hover:text-[#E65C00] font-semibold flex items-center gap-1 text-sm transition-colors"
                    >
                        Explore More
                        <Globe className="w-4 h-4" />
                    </Link>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {products.map((product) => {
                        return (
                            <Link
                                key={product.id}
                                to={`/product/${product.slug}`}
                                className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-[#FF6600] transition-all duration-300 hover:shadow-lg"
                            >
                                {/* Image */}
                                <div className="relative aspect-square overflow-hidden bg-gray-50">
                                    <img
                                        src={product.images?.[0] || '/placeholder.svg'}
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />

                                    {/* Verified Badge */}
                                    {product.verified && (
                                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-blue-700 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 shadow-sm">
                                            <Shield className="w-3 h-3" />
                                            Verified
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-3">
                                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#FF6600] transition-colors min-h-[40px]">
                                        {product.title}
                                    </h3>

                                    {/* Price */}
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-lg font-bold text-gray-900">
                                            {formatPriceOnly(product.price_min || 0)}
                                        </span>
                                        <span className="text-xs text-gray-500">/ {product.unit || 'piece'}</span>
                                    </div>

                                    {/* MOQ */}
                                    <div className="pt-3 border-t border-gray-100">
                                        <p className="text-xs text-gray-600">
                                            MOQ: <span className="font-semibold text-gray-900">{product.moq || 1} {product.unit || 'piece'}(s)</span>
                                        </p>
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
