
import { useState } from "react";
import AlibabaHeader from "@/components/layout/AlibabaHeader";
import { Footer } from "@/components/layout/Footer";
import { Paperclip, ArrowRight, Search, Store, PenTool, BarChart3, Box } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function AIMode() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState("All");

    const tabs = [
        "All",
        "Supplier sourcing",
        "Business analysis",
        "Product design",
        "Product research"
    ];

    const allSuggestions = [
        {
            icon: <Store className="w-4 h-4 text-purple-600" />,
            category: "Supplier sourcing",
            title: "Quickly source products that meet all key certifications",
            bg: "bg-purple-50",
            image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&q=80",
            prompt: "Find ISO-certified manufacturers for high-quality facial cleansing brushes"
        },
        {
            icon: <Store className="w-4 h-4 text-blue-600" />,
            category: "Supplier sourcing",
            title: "Fully investigate suppliers to avoid sourcing risks",
            bg: "bg-blue-50",
            image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&q=80",
            prompt: "Comprehensive Business Profile: Shandong Liansheng Construction Co., Ltd."
        },
        {
            icon: <BarChart3 className="w-4 h-4 text-orange-600" />,
            category: "Business analysis",
            title: "Full feasibility analysis: trends, price, supply",
            bg: "bg-orange-50",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80",
            prompt: "Market Analysis: Smart Wearables Scenario"
        },
        {
            icon: <Store className="w-4 h-4 text-pink-600" />,
            category: "Supplier sourcing",
            title: "Discover qualified suppliers by uploading product image",
            bg: "bg-pink-50",
            image: "https://images.unsplash.com/photo-1576402187878-974f70c890a5?w=500&q=80",
            prompt: "Find manufacturers for this specific product image",
            hasButton: true,
            buttonText: "View Result"
        },
        {
            icon: <PenTool className="w-4 h-4 text-yellow-600" />,
            category: "Product design",
            title: "Turn iconic buildings into event gift design visuals",
            bg: "bg-yellow-50",
            image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&q=80",
            prompt: "Product Design: Shape & Function Combination"
        },
        {
            icon: <PenTool className="w-4 h-4 text-yellow-600" />,
            category: "Product design",
            title: "Validate and visualize innovative product ideas",
            bg: "bg-yellow-50",
            image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=500&q=80",
            prompt: "Scene Inspiration: Portable speakers"
        },
        {
            icon: <PenTool className="w-4 h-4 text-yellow-600" />,
            category: "Product design",
            title: "Turn viral IP into product ideas with visual designs",
            bg: "bg-yellow-50",
            image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&q=80",
            prompt: "Visual Concepts Generation: Target Demographics Analysis"
        },
        {
            icon: <PenTool className="w-4 h-4 text-yellow-600" />,
            category: "Product design",
            title: "Turn common items into bestsellers with drawings",
            bg: "bg-yellow-50",
            image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&q=80",
            prompt: "Trend Analysis: Top Selling Pens"
        },
        {
            icon: <PenTool className="w-4 h-4 text-yellow-600" />,
            category: "Product design",
            title: "Turn inspiration into designs and matching suppliers",
            bg: "bg-yellow-50",
            image: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=500&q=80",
            prompt: "Find matching suppliers for my sketch"
        },
        {
            icon: <Store className="w-4 h-4 text-purple-600" />,
            category: "Supplier sourcing",
            title: "Find style-fit factories and draft inquiry emails",
            bg: "bg-purple-50",
            image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=500&q=80",
            prompt: "Draft inquiry email for Japanese-style ceramic bowls"
        },
        {
            icon: <Store className="w-4 h-4 text-blue-600" />,
            category: "Supplier sourcing",
            title: "Fully investigate suppliers to avoid sourcing risks",
            bg: "bg-blue-50",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80",
            prompt: "Analyze supplier background and credit checks"
        },
        {
            icon: <PenTool className="w-4 h-4 text-yellow-600" />,
            category: "Product design",
            title: "Design products tailored to specific users and scenarios",
            bg: "bg-yellow-50",
            image: "https://images.unsplash.com/photo-1582234372579-242943729d5b?w=500&q=80",
            prompt: "Auto Pet Feeder Product Development Report"
        },
        {
            icon: <PenTool className="w-4 h-4 text-yellow-600" />,
            category: "Product design",
            title: "Improve bestsellers with smart design tweaks",
            bg: "bg-yellow-50",
            image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80",
            prompt: "Tote bag market analysis and design differentiation"
        },
        {
            icon: <Search className="w-4 h-4 text-green-600" />,
            category: "Product research",
            title: "Analyze bestsellers in your niche and why they succeed",
            bg: "bg-green-50",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80",
            prompt: "Top-selling toys for kids from the past month"
        },
        {
            icon: <Search className="w-4 h-4 text-green-600" />,
            category: "Product research",
            title: "Uncover unmet needs and design product concepts",
            bg: "bg-green-50",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80",
            prompt: "Thailand Sneaker Market Unmet Needs Analysis"
        },
        {
            icon: <Search className="w-4 h-4 text-green-600" />,
            category: "Product research",
            title: "Spot rising trends early to guide sourcing and design",
            bg: "bg-green-50",
            image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=500&q=80",
            prompt: "Infant Product Trend Analysis"
        },
        {
            icon: <Store className="w-4 h-4 text-blue-600" />,
            category: "Supplier sourcing",
            title: "Search & compare products across complex specs",
            bg: "bg-blue-50",
            image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=500&q=80",
            prompt: "Refrigerator suppliers Comparison",
            hasButton: true,
            buttonText: "View details"
        },
        {
            icon: <Store className="w-4 h-4 text-purple-600" />,
            category: "Supplier sourcing",
            title: "Recommend products based on audience and scenario",
            bg: "bg-purple-50",
            image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&q=80",
            prompt: "New employee onboarding kits suggestions"
        },
        {
            icon: <Store className="w-4 h-4 text-orange-600" />,
            category: "Supplier sourcing",
            title: "Source agile suppliers for small custom runs",
            bg: "bg-orange-50",
            image: "https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=500&q=80",
            prompt: "Find suppliers for custom jewelry with small MOQ"
        },
        {
            icon: <Store className="w-4 h-4 text-blue-600" />,
            category: "Supplier sourcing",
            title: "Smart, fast sourcing lists for any event or party",
            bg: "bg-blue-50",
            image: "https://images.unsplash.com/photo-1530103862676-de3c9a59af57?w=500&q=80",
            prompt: "Birthday Party Sourcing List & Comprehensive Problem & Supplier Analysis"
        }
    ];

    const filteredSuggestions = activeTab === "All"
        ? allSuggestions
        : allSuggestions.filter(item => item.category === activeTab);

    const handleSearch = () => {
        if (!query.trim()) return;
        toast({
            title: "AI Agent Processing",
            description: "Accio is analyzing your request...",
        });
        setTimeout(() => {
            navigate(`/products?q=${encodeURIComponent(query)}&aiMode=true`);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            <AlibabaHeader />

            <main className="flex flex-col items-center pt-12 pb-24 px-4 w-full max-w-[1440px] mx-auto">
                {/* Hero Text */}
                <h1 className="text-3xl md:text-4xl font-bold text-[#111] mb-8 text-center tracking-tight">
                    All tasks in one ask, smart sourcing with AI
                </h1>

                {/* Main Input Area */}
                <div className="w-full max-w-3xl relative mb-4">
                    <div className="relative group">
                        <div className="absolute inset-x-0 top-0 bottom-0 bg-gradient-to-r from-orange-200 via-purple-200 to-blue-200 rounded-3xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
                        <div className="relative bg-white border border-gray-100 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-2 focus-within:ring-2 focus-within:ring-[#FF6600]/20 focus-within:border-[#FF6600] transition-all duration-300">
                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Describe your needs..."
                                className="w-full min-h-[100px] p-5 text-lg resize-none outline-none text-gray-800 placeholder:text-gray-300 font-medium bg-transparent"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSearch();
                                    }
                                }}
                            />

                            <div className="flex items-center justify-between px-3 pb-2 pt-2">
                                <button className="p-2.5 text-gray-400 hover:text-[#FF6600] hover:bg-orange-50 rounded-full transition-colors">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-300 font-medium hidden sm:block">Powered by AI sourcing agent - Accio</span>
                                    <button
                                        onClick={handleSearch}
                                        disabled={!query.trim()}
                                        className={`p-2 rounded-full transition-all duration-200 ${query.trim() ? 'bg-[#FF6600] text-white shadow-lg shadow-orange-200 scale-100' : 'bg-gray-100 text-gray-300 scale-95'}`}
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 md:gap-8 mb-10 w-full justify-start md:justify-center overflow-x-auto pb-2 scrollbar-hide px-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-2 text-[15px] font-medium transition-all relative whitespace-nowrap ${activeTab === tab
                                ? "text-[#111] font-bold after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-full after:h-[2px] after:bg-[#111]"
                                : "text-gray-500 hover:text-gray-800"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 w-full">
                    {filteredSuggestions.map((card, i) => (
                        <div
                            key={i}
                            className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full relative overflow-hidden"
                            onClick={() => setQuery(card.prompt)}
                        >
                            <h3 className="font-bold text-[#111] text-[15px] leading-snug mb-3 group-hover:text-[#FF6600] transition-colors line-clamp-2">
                                {card.title}
                            </h3>

                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-3">
                                {card.icon}
                                <span className="text-gray-400">{card.category}</span>
                            </div>

                            <div className="mt-auto w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-50 relative">
                                <img
                                    src={card.image}
                                    alt={card.title}
                                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                                />
                                {card.hasButton && (
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[90%]">
                                        <button className="w-full bg-[#111] text-white text-xs font-bold py-2 rounded-full shadow-lg opacity-90 hover:opacity-100">
                                            {card.buttonText}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <div className="border-t bg-gray-50 mt-12 pb-12 w-full">
                <div className="max-w-[1440px] mx-auto px-4 pt-10">
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6 text-sm text-gray-600">
                        {["AliExpress", "1688.com", "Tmall Taobao World", "Alipay", "Lazada", "Taobao Global", "TAO", "Trendyol", "Europages"].map(link => (
                            <a key={link} href="#" className="hover:text-[#FF6600] transition-colors">{link}</a>
                        ))}
                    </div>

                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8 text-xs text-gray-500">
                        {["Policies and rules", "Legal Notice", "Product Listing Policy", "Intellectual Property Protection", "Privacy Policy", "Terms of Use", "Integrity Compliance"].map(link => (
                            <a key={link} href="#" className="hover:text-gray-800 transition-colors">{link}</a>
                        ))}
                    </div>

                    <div className="text-center text-xs text-gray-400 leading-relaxed">
                        <p className="mb-1">© 1999-2026 Alibaba.com。版权所有：杭州阿里巴巴海外信息技术有限公司</p>
                        <p className="mb-2">增值电信业务经营许可证：浙B2-20241358</p>
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="flex items-center gap-1">
                                <Box className="w-3 h-3" /> Business license verification
                            </span>
                            <span className="flex items-center gap-1">
                                <Store className="w-3 h-3" /> GSXT verification
                            </span>
                        </div>
                        <p>浙公网安备33010002000366 | 浙ICP备2024067534号-3</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Sparkles({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.636-1.636L13.287 18.5l1.183-.394a2.25 2.25 0 001.636-1.636L16.5 15.25l.394 1.183a2.25 2.25 0 001.636 1.636l1.183.394-1.183.394a2.25 2.25 0 00-1.636 1.636z" />
        </svg>
    )
}
