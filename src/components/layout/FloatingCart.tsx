import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";

export const FloatingCart = () => {
    const { itemCount } = useCart();

    return (
        <Link
            to="/cart"
            className="fixed top-20 md:top-4 right-4 md:right-8 z-50 group"
            aria-label="Shopping Cart"
        >
            <div className="relative">
                {/* Cart Button */}
                <div className="bg-[#FF6600] hover:bg-[#E65C00] text-white rounded-full p-4 shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6" />
                </div>

                {/* Item Count Badge */}
                {itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white border-2 border-white min-w-[24px] h-6 rounded-full flex items-center justify-center px-2 font-bold text-xs animate-pulse">
                        {itemCount > 99 ? '99+' : itemCount}
                    </Badge>
                )}

                {/* Ripple Effect on Hover */}
                <div className="absolute inset-0 rounded-full bg-[#FF6600] opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500"></div>
            </div>

            {/* Tooltip */}
            <div className="absolute top-full right-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                    {itemCount > 0 ? `${itemCount} item${itemCount > 1 ? 's' : ''} in cart` : 'View Cart'}
                    <div className="absolute bottom-full right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                </div>
            </div>
        </Link>
    );
};
