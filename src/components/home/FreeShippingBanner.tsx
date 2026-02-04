import { Truck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const FreeShippingBanner = () => {
    return (
        <section className="py-4 px-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-y border-emerald-100">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Left side - Icon and Message */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-30 animate-pulse"></div>
                            <div className="relative bg-white p-3 rounded-full shadow-lg">
                                <Truck className="w-8 h-8 text-emerald-600 animate-bounce" style={{ animationDuration: '2s' }} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900">
                                Free Shipping on Orders Over <span className="text-emerald-600">$50</span>
                            </h3>
                            <p className="text-sm text-gray-600">
                                Get your products delivered at no extra cost
                            </p>
                        </div>
                    </div>

                    {/* Right side - CTA Button */}
                    <Link
                        to="/products?free_shipping=true"
                        className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        Shop Now
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
};
