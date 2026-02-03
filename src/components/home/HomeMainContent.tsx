import { ChevronRight, Zap, Factory, ShoppingBag, Star, Shirt, Smartphone, Trophy, Sparkles, Briefcase, Home, Car, Wrench, Watch } from "lucide-react";
import { Link } from "react-router-dom";
import { CATEGORIES, FREQUENTLY_SEARCHED } from "../../constants";

const ICON_MAP: Record<string, any> = {
    Star, Shirt, Smartphone, Trophy, Sparkles, Briefcase, Home, Car, Wrench, Watch
};

export const HomeMainContent = () => {
    return (
        <div className="w-full bg-white pb-10">
            <div className="max-w-[1440px] mx-auto px-4 lg:px-[60px]">
                {/* ─── WELCOME SECTION ─── */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-6 gap-4">
                    <h1 className="text-xl md:text-2xl font-bold text-[#222]">
                        Welcome to Alibaba.com, Brian
                    </h1>

                    <div className="flex items-center gap-6 text-sm font-medium text-[#222]">
                        <Link to="/rfq" className="flex items-center gap-2 hover:text-[#FF6600] transition-colors">
                            <div className="p-1.5 bg-gray-100 rounded-full"><Zap size={16} /></div>
                            Request for Quotation
                        </Link>
                        <div className="h-4 w-[1px] bg-gray-300 hidden md:block" />
                        <Link to="/ranking" className="flex items-center gap-2 hover:text-[#FF6600] transition-colors">
                            <div className="p-1.5 bg-gray-100 rounded-full"><Factory size={16} /></div>
                            Top Ranking
                        </Link>
                        <div className="h-4 w-[1px] bg-gray-300 hidden md:block" />
                        <Link to="/custom" className="flex items-center gap-2 hover:text-[#FF6600] transition-colors">
                            <div className="p-1.5 bg-gray-100 rounded-full"><ShoppingBag size={16} /></div>
                            Fast customization
                        </Link>
                    </div>
                </div>

                {/* ─── MAIN GRID ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Sidebar: Categories (Visible on LG) */}
                    <div className="hidden lg:col-span-3 xl:col-span-3 lg:block bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 cursor-pointer group">
                            <span className="font-bold text-[16px] text-[#222] group-hover:text-[#FF6600]">Categories for you</span>
                            <ChevronRight size={16} className="text-gray-400 group-hover:text-[#FF6600]" />
                        </div>
                        <div className="space-y-1">
                            {CATEGORIES.map((cat) => {
                                const Icon = ICON_MAP[cat.icon] || Star;
                                return (
                                    <div key={cat.id} className="flex items-center justify-between group cursor-pointer text-[#333] hover:text-[#FF6600] hover:bg-gray-50 p-2.5 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Icon size={18} className="text-gray-400 group-hover:text-[#FF6600]" />
                                            <span className="text-[14px] font-medium">{cat.name}</span>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-300 group-hover:text-[#FF6600]" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Center: Frequently Searched */}
                    <div className="col-span-12 lg:col-span-6 xl:col-span-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="font-bold text-[16px] text-[#222]">Frequently searched</span>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {FREQUENTLY_SEARCHED.map((item) => (
                                <div key={item.id} className="flex flex-col gap-2 group cursor-pointer">
                                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-transparent group-hover:border-[#FF6600] transition-all">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover mix-blend-multiply hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-[14px] font-medium text-[#222] leading-tight group-hover:underline text-center mt-2">{item.name}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Explore Banner */}
                    <div className="col-span-12 lg:col-span-3 xl:col-span-3">
                        <div className="w-full h-full min-h-[300px] rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden text-white">
                            {/* Background Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#E2CEFF] via-[#D8C3F8] to-[#C0A8E8] z-0" />
                            <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1620799140408-ed5341cd2431?w=500')" }} />

                            <div className="relative z-10 text-[#331D56]">
                                <div className="flex -space-x-2 mb-4">
                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" className="w-full h-full object-cover" /></div>
                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100" className="w-full h-full object-cover" /></div>
                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" className="w-full h-full object-cover" /></div>
                                </div>
                                <h3 className="text-2xl font-bold leading-tight mb-2">Explore More High-Quality Products</h3>
                            </div>

                            <div className="relative z-10 mt-auto">
                                <button className="bg-[#331D56] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-black transition-colors">
                                    Explore now
                                </button>

                                {/* Dots indicator */}
                                <div className="flex gap-1.5 justify-center mt-6">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#331D56]" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#331D56] opacity-30" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#331D56] opacity-30" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#331D56] opacity-30" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#331D56] opacity-30" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ─── PURPLE BANNER (Fast Customization) ─── */}
                <div className="mt-8 relative rounded-2xl overflow-hidden min-h-[220px] bg-[#341d5b] text-white p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between relative z-10">
                        <div className="mb-6 md:mb-0 max-w-md">
                            <div className="flex items-center gap-2 mb-2 text-[#E7CCFF]">
                                <Zap size={20} fill="#E7CCFF" />
                                <h2 className="text-xl font-bold">Fast customization</h2>
                            </div>
                            <p className="text-lg opacity-90 mb-6">Realize your custom product ideas fast and easy</p>

                            <div className="space-y-2 text-sm opacity-80 mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">✓</div>
                                    Low MOQ
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">✓</div>
                                    14-day dispatch
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">✓</div>
                                    True to design
                                </div>
                            </div>

                            <button className="bg-white text-[#341d5b] px-5 py-2 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors">
                                Explore now
                            </button>
                        </div>

                        {/* Right side products for purple banner */}
                        <div className="flex gap-4 overflow-x-auto pb-4 md:pb-0">
                            <div className="min-w-[140px] bg-white rounded-lg p-2 text-[#222]">
                                <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200" className="w-full aspect-square object-cover rounded mb-2" />
                                <div className="text-xs font-bold">Ksh 727</div>
                                <div className="text-[10px] text-gray-500">MOQ: 1</div>
                            </div>
                            <div className="min-w-[140px] bg-white rounded-lg p-2 text-[#222]">
                                <img src="https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=200" className="w-full aspect-square object-cover rounded mb-2" />
                                <div className="text-xs font-bold">Ksh 8,671</div>
                                <div className="text-[10px] text-gray-500">MOQ: 10</div>
                            </div>
                            <div className="min-w-[140px] bg-white rounded-lg p-2 text-[#222]">
                                <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200" className="w-full aspect-square object-cover rounded mb-2" />
                                <div className="text-xs font-bold">Ksh 437</div>
                                <div className="text-[10px] text-gray-500">MOQ: 20</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
