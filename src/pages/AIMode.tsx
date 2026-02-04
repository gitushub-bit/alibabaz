import { useState, useEffect, useRef } from "react";
import AlibabaHeader from "@/components/layout/AlibabaHeader";
import { Footer } from "@/components/layout/Footer";
import {
    Paperclip,
    ArrowRight,
    Search,
    Store,
    PenTool,
    BarChart3,
    Box,
    Sparkles,
    Zap,
    ShieldCheck,
    Globe2,
    Cpu,
    Target,
    Compass,
    Layers,
    ChevronDown,
    ChevronRight,
    Lock,
    MessageSquare,
    TrendingUp,
    FileText,
    CheckCircle2,
    XCircle,
    Upload,
    X,
    Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * ─── TYPES & DATA ───
 */

interface Suggestion {
    icon: React.ReactNode;
    category: string;
    title: string;
    bg: string;
    image: string;
    prompt: string;
    hasButton?: boolean;
    buttonText?: string;
    complexity?: 'Fundamental' | 'Advanced' | 'Strategic';
    tags?: string[];
}

interface UploadedFile {
    name: string;
    type: string;
    size: number;
}

export default function AIMode() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState("All");
    const [mounted, setMounted] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [region, setRegion] = useState("Global");
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [showQuickInsights, setShowQuickInsights] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [query]);

    const categories = [
        "All",
        "Supplier sourcing",
        "Business analysis",
        "Product design",
        "Product research"
    ];

    const allSuggestions: Suggestion[] = [
        {
            icon: <Target className="w-5 h-5 text-orange-600" />,
            category: "Supplier sourcing",
            title: "Precision Sourcing: ISO-Certified Manufacturers",
            bg: "bg-orange-50/50",
            image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&q=80",
            prompt: "Find ISO-certified manufacturers for high-quality facial cleansing brushes with low lead times and minimum order quantities under 500 units",
            complexity: 'Strategic',
            tags: ['ISO', 'Quality', 'Manufacturing']
        },
        {
            icon: <ShieldCheck className="w-5 h-5 text-amber-600" />,
            category: "Supplier sourcing",
            title: "Risk Mitigation: Full Supplier Verification",
            bg: "bg-amber-50/50",
            image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&q=80",
            prompt: "Perform a comprehensive business profile audit for Shandong Liansheng Construction Co., Ltd. including financial health, certifications, and compliance history",
            complexity: 'Advanced',
            tags: ['Verification', 'Compliance', 'Risk']
        },
        {
            icon: <BarChart3 className="w-5 h-5 text-amber-600" />,
            category: "Business analysis",
            title: "Feasibility Matrix: Trends & Price Indices",
            bg: "bg-amber-50/50",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80",
            prompt: "Provide a multi-vector market analysis for Smart Wearables specializing in healthcare scenarios with demand forecasts and competitive pricing benchmarks",
            complexity: 'Strategic',
            tags: ['Market Analysis', 'Pricing', 'Forecasting']
        },
        {
            icon: <Compass className="w-5 h-5 text-blue-600" />,
            category: "Product research",
            title: "Opportunity Discovery: Niche Market Penetration",
            bg: "bg-blue-50/50",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80",
            prompt: "Identify unmet consumer needs in the Thailand Sneaker Market and propose 3 innovative design concepts with target demographics and price positioning",
            complexity: 'Strategic',
            tags: ['Market Research', 'Innovation', 'Design']
        },
        {
            icon: <Cpu className="w-5 h-5 text-orange-500" />,
            category: "Product design",
            title: "AI-Driven Ideation: Concept Visualization",
            bg: "bg-orange-50/50",
            image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&q=80",
            prompt: "Generate visual concepts for eco-friendly portable speakers targeting Gen Z demographics with sustainability certifications and modular design features",
            complexity: 'Advanced',
            tags: ['Design', 'Sustainability', 'Gen Z']
        },
        {
            icon: <Layers className="w-5 h-5 text-orange-700" />,
            category: "Product design",
            title: "Iterative Design: Function & Form Synergy",
            bg: "bg-orange-50/50",
            image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&q=80",
            prompt: "Merge architectural aesthetics with functional household items for event gift prototypes combining minimalist design with practical utility",
            complexity: 'Advanced',
            tags: ['Architecture', 'Functionality', 'Gifting']
        },
        {
            icon: <Globe2 className="w-5 h-5 text-orange-600" />,
            category: "Supplier sourcing",
            title: "Global Logistics: Agile Supply Chain Search",
            bg: "bg-orange-50/50",
            image: "https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=500&q=80",
            prompt: "Source agile suppliers for custom jewelry with small MOQ under 100 units and global express shipping capabilities to 50+ countries",
            complexity: 'Fundamental',
            tags: ['Logistics', 'Custom', 'Global']
        },
        {
            icon: <Zap className="w-5 h-5 text-amber-600" />,
            category: "Product research",
            title: "Velocity Insights: Real-time Bestseller Data",
            bg: "bg-amber-50/50",
            image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=500&q=80",
            prompt: "List the top 10 trending infant products by growth rate over the last 30 days in North America with sales velocity metrics and competitor analysis",
            complexity: 'Fundamental',
            tags: ['Trending', 'Analytics', 'Infant']
        }
    ];

    const filteredSuggestions = activeTab === "All"
        ? allSuggestions
        : allSuggestions.filter(item => item.category === activeTab);

    const handleSearch = async () => {
        if (!query.trim()) {
            toast({
                title: "Input required",
                description: "Enter your sourcing requirements to initiate the Accio Neural Engine.",
                variant: "destructive"
            });
            return;
        }

        setIsSearching(true);
        toast({
            title: "Neural Engine Initiated",
            description: "Synchronizing global supplier databases...",
        });

        // Professional simulation of AI processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        const fileParams = uploadedFiles.length > 0 ? '&files=' + uploadedFiles.map(f => f.name).join(',') : '';
        navigate(`/products?q=${encodeURIComponent(query)}&aiMode=true&region=${region}${fileParams}`);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newFiles = files.map(file => ({
            name: file.name,
            type: file.type,
            size: file.size
        }));

        setUploadedFiles(prev => [...prev, ...newFiles]);
        toast({
            title: "Files Uploaded",
            description: `${files.length} file(s) successfully indexed for analysis.`,
        });
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSearch();
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50/30 to-white selection:bg-orange-100 selection:text-orange-900">
            <AlibabaHeader />

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".csv,.json,.pdf,.xlsx,.xls,.doc,.docx"
                multiple
            />

            {/* ─── PREMIUM BACKGROUND ELEMENTS ─── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-gradient-to-br from-orange-100/40 to-amber-100/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] bg-gradient-to-tr from-orange-50/30 to-white rounded-full blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-gradient-to-br from-orange-100/10 to-transparent rounded-full blur-[140px]" />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.015]"
                style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            {/* ─── HERO SECTION ─── */}
            <div className="relative z-10 pt-20 pb-32 px-4 text-center">
                <div className="max-w-[1100px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white border border-orange-100 rounded-full mb-10 shadow-sm hover:shadow-md transition-shadow">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-lg shadow-orange-200" />
                        <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-orange-600">Accio Neural Engine v4.2</span>
                        <div className="w-px h-4 bg-orange-100" />
                        <span className="text-[10px] font-bold text-orange-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Live
                        </span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 mb-8 tracking-tight leading-[0.95]">
                        Enterprise Sourcing
                        <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400 animate-gradient">
                            Reinvented by AI
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg md:text-xl text-slate-600 font-medium max-w-3xl mx-auto mb-6 leading-relaxed">
                        Transform complex sourcing requirements into actionable business insights.
                        Powered by enterprise-grade AI with verified supplier intelligence.
                    </p>

                    {/* Stats Bar */}
                    <div className="flex flex-wrap items-center justify-center gap-8 mb-20 text-sm">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            <span className="font-bold text-slate-700">2.4M+ Suppliers</span>
                        </div>
                        <div className="w-px h-4 bg-slate-200" />
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-orange-600" />
                            <span className="font-bold text-slate-700">ISO Verified</span>
                        </div>
                        <div className="w-px h-4 bg-slate-200" />
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-orange-500" />
                            <span className="font-bold text-slate-700">&lt;2s Response Time</span>
                        </div>
                    </div>

                    {/* ─── AI COMMAND CENTER ─── */}
                    <div className="max-w-[920px] mx-auto relative group">
                        {/* Enhanced glow effect */}
                        <div className={cn(
                            "absolute -inset-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-[40px] blur-xl transition-all duration-700",
                            isFocused ? "opacity-30 scale-105" : "opacity-0 group-hover:opacity-10 scale-100"
                        )} />

                        <div className={cn(
                            "relative bg-white border-2 rounded-[40px] p-8 md:p-10 overflow-hidden transition-all duration-500",
                            isFocused
                                ? "border-orange-400 shadow-[0_48px_96px_-16px_rgba(255,102,0,0.15)] bg-slate-50/50"
                                : "border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] group-hover:border-orange-200"
                        )}>

                            {/* Subtle sparkle decoration */}
                            <div className={cn(
                                "absolute top-6 right-8 text-orange-200 transition-opacity duration-500",
                                isFocused ? "opacity-100" : "opacity-40"
                            )}>
                                <Sparkles className="w-8 h-8 animate-pulse" />
                            </div>

                            {/* Subtle gradient overlay */}
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-orange-50/20 to-transparent pointer-events-none rounded-t-[40px]" />

                            {/* Main Textarea */}
                            <textarea
                                ref={textareaRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder="Describe your sourcing needs in detail..."
                                className="w-full text-lg md:text-xl font-medium outline-none text-slate-900 placeholder-slate-400 bg-transparent resize-none scrollbar-hide relative z-10"
                                rows={3}
                                style={{ minHeight: '100px', maxHeight: '240px' }}
                            />

                            {/* Quick Insights / Help Tags */}
                            {!query && (
                                <div className="mt-6 flex flex-wrap gap-2 relative z-10">
                                    {[
                                        "ISO Verified Suppliers",
                                        "MOQ under 100 units",
                                        "Eco-friendly materials",
                                        "Fast shipping solutions"
                                    ].map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => setQuery(p => p ? p + " " + tag : "Find " + tag)}
                                            className="px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-lg text-[11px] font-bold text-orange-600 hover:bg-orange-100 transition-colors"
                                        >
                                            + {tag}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Uploaded Files Display */}
                            {uploadedFiles.length > 0 && (
                                <div className="mt-6 space-y-2 relative z-10">
                                    {uploadedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-orange-50/50 border border-orange-100 rounded-xl group/file">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <FileText className="w-4 h-4 text-orange-600 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
                                                    <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="ml-2 p-1.5 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover/file:opacity-100"
                                            >
                                                <X className="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Action Bar */}
                            <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-8 border-t border-slate-100 relative z-10">
                                <div className="flex items-center gap-4 flex-wrap">
                                    {/* Upload Button */}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-orange-600 hover:bg-orange-50/50 rounded-xl transition-all text-[13px] font-bold group/btn border border-slate-100 hover:border-orange-200 bg-white"
                                    >
                                        <Upload className={cn(
                                            "w-3.5 h-3.5 transition-transform group-hover/btn:-translate-y-0.5",
                                            uploadedFiles.length > 0 ? 'text-orange-500' : ''
                                        )} />
                                        <span>{uploadedFiles.length > 0 ? `${uploadedFiles.length} File${uploadedFiles.length > 1 ? 's' : ''}` : 'Attach Context'}</span>
                                    </button>

                                    {/* Region Selector */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-orange-600 hover:bg-orange-50/50 rounded-xl transition-all text-[13px] font-bold border border-slate-100 hover:border-orange-200 bg-white shadow-sm hover:shadow-md">
                                                <Globe2 className="w-3.5 h-3.5" />
                                                <span>Region: {region}</span>
                                                <ChevronDown className="w-3 h-3 opacity-50 group-hover:rotate-180 transition-transform" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="rounded-2xl p-2 min-w-[180px] shadow-xl border-slate-200">
                                            {["Global", "SE Asia", "Europe", "N. America", "East Asia", "Middle East", "Africa"].map(r => (
                                                <DropdownMenuItem
                                                    key={r}
                                                    onClick={() => setRegion(r)}
                                                    className={cn(
                                                        "rounded-xl font-bold text-slate-700 focus:bg-orange-50 focus:text-orange-600 cursor-pointer py-2.5",
                                                        region === r && "bg-orange-50 text-orange-600"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>{r}</span>
                                                        {region === r && <CheckCircle2 className="w-4 h-4" />}
                                                    </div>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Keyboard Shortcut Hint */}
                                    <div className={cn(
                                        "hidden lg:flex items-center gap-1.5 text-xs ml-2 transition-opacity duration-300",
                                        isFocused ? "text-orange-400" : "text-slate-400"
                                    )}>
                                        <kbd className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono shadow-sm">⌘</kbd>
                                        <span>+</span>
                                        <kbd className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono shadow-sm">↵</kbd>
                                        <span className="ml-1">to search</span>
                                    </div>
                                </div>

                                {/* Main CTA */}
                                <button
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#FF6600] to-orange-500 hover:from-[#e65c00] hover:to-[#FF6600] disabled:from-slate-400 disabled:to-slate-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 disabled:shadow-none"
                                >
                                    {isSearching ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Analyzing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Start Analysis</span>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── STRATEGY FRAMEWORKS SECTION ─── */}
            <div className="relative z-10 max-w-[1440px] mx-auto px-6 pb-32">
                <div className="flex flex-col items-center mb-16">
                    <div className="h-px w-32 bg-gradient-to-r from-transparent via-slate-300 to-transparent mb-10" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-3">AI-Powered Workflows</span>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-12 tracking-tight">Strategy Frameworks</h2>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap justify-center gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={cn(
                                    "px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 border-2",
                                    activeTab === cat
                                        ? "bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-100"
                                        : "bg-white border-slate-200 text-slate-500 hover:border-orange-400 hover:text-orange-600 hover:shadow-md"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredSuggestions.map((card, i) => (
                        <div
                            key={i}
                            className="group bg-white border-2 border-slate-100 rounded-[32px] p-2.5 hover:shadow-[0_24px_48px_-12px_rgba(255,102,0,0.12)] hover:-translate-y-2 hover:border-orange-200 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full"
                            onClick={() => {
                                setQuery(card.prompt);
                                window.scrollTo({ top: 300, behavior: 'smooth' });
                                setTimeout(() => textareaRef.current?.focus(), 100);
                            }}
                        >
                            <div className="bg-gradient-to-br from-slate-50 to-white rounded-[26px] p-6 flex-1 flex flex-col relative overflow-hidden">
                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity"
                                    style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                                {/* Header */}
                                <div className="flex items-start justify-between mb-5 relative z-10">
                                    <div className="p-3 bg-white rounded-2xl text-orange-600 shadow-sm border border-slate-100 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                                        {card.icon}
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-sm",
                                        card.complexity === "Strategic" ? "bg-orange-100 text-orange-700 border border-orange-200" :
                                            card.complexity === "Advanced" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                                                "bg-orange-100 text-orange-700 border border-orange-200"
                                    )}>
                                        {card.complexity}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-base md:text-lg font-black text-slate-800 leading-tight mb-4 group-hover:text-orange-600 transition-colors relative z-10 line-clamp-2">
                                    {card.title}
                                </h3>

                                {/* Tags */}
                                {card.tags && (
                                    <div className="flex flex-wrap gap-1.5 mb-4 relative z-10">
                                        {card.tags.map((tag, idx) => (
                                            <span key={idx} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Image */}
                                <div className="mt-auto overflow-hidden rounded-2xl grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 relative z-10 shadow-inner">
                                    <img
                                        src={card.image}
                                        alt={card.title}
                                        className="w-full h-40 object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                                    />
                                </div>

                                {/* CTA */}
                                <div className="mt-5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                                    <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Load template
                                    </span>
                                    <ChevronRight className="w-5 h-5 text-orange-600 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── TRUST BAR ─── */}
            <div className="bg-gradient-to-br from-slate-100/50 to-slate-50/50 border-y border-slate-200 py-24 relative z-10 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} />

                <div className="max-w-[1440px] mx-auto px-10 relative z-10">
                    <div className="flex flex-col items-center mb-16">
                        <span className="text-xs font-black uppercase tracking-[0.4em] text-orange-600 mb-4">Powered By</span>
                        <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">Enterprise Neural Ecosystem</h3>
                        <p className="text-slate-600 font-medium max-w-2xl text-center">
                            Built on verified datasets and compliance registries trusted by Fortune 500 companies
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-16 items-center">
                        {[
                            { name: "ALIBABA", sub: "Core Dataset", icon: <Box className="w-8 h-8" /> },
                            { name: "1688 INSIGHTS", sub: "Deep Analysis", icon: <BarChart3 className="w-8 h-8" /> },
                            { name: "ISO REGISTRY", sub: "V4.2 Compliance", icon: <ShieldCheck className="w-8 h-8" /> },
                            { name: "ML LOGISTICS", sub: "Neural Routing", icon: <Cpu className="w-8 h-8" /> }
                        ].map(item => (
                            <div key={item.name} className="flex flex-col items-center text-center group cursor-pointer">
                                <div className="mb-4 text-slate-400 group-hover:text-orange-600 transition-colors">
                                    {item.icon}
                                </div>
                                <div className="text-lg font-black tracking-tight text-slate-800 mb-1 group-hover:text-orange-600 transition-colors">
                                    {item.name}
                                </div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    {item.sub}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── ENHANCED FOOTER ─── */}
            <div className="bg-white relative z-10 pt-32 pb-20">
                <div className="max-w-[1440px] mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pb-20 border-b-2 border-slate-100">
                        {/* Company Section */}
                        <div className="lg:col-span-5 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-3xl font-black tracking-tighter text-slate-900">ACCIO</span>
                            </div>
                            <p className="text-slate-600 font-medium leading-relaxed max-w-md text-lg">
                                The world's first enterprise-grade AI sourcing platform. Delivering verified supplier intelligence for globally connected businesses.
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="py-2.5 px-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center gap-2 shadow-sm">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-300" />
                                    <span className="text-xs font-bold text-emerald-700 uppercase">System: Operational</span>
                                </div>
                                <div className="py-2.5 px-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl flex items-center gap-2 shadow-sm">
                                    <span className="text-xs font-bold text-indigo-700 uppercase">Uptime: 99.98%</span>
                                </div>
                            </div>
                        </div>

                        {/* Link Columns */}
                        <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
                            <div>
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Platform</h4>
                                <ul className="space-y-4">
                                    {["Neural Search", "Supplier Graph", "Logistics ML", "Price Prediction", "Risk Scoring"].map(link => (
                                        <li key={link}>
                                            <a href="#" className="text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors flex items-center gap-2 group">
                                                <ChevronRight className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Compliance</h4>
                                <ul className="space-y-4">
                                    {["Verification Hub", "ISO Protocols", "ESG Auditing", "Financial Health", "Trade Compliance"].map(link => (
                                        <li key={link}>
                                            <a href="#" className="text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors flex items-center gap-2 group">
                                                <ChevronRight className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Resources</h4>
                                <ul className="space-y-4">
                                    {["Enterprise API", "Documentation", "Security Center", "System Status", "Support"].map(link => (
                                        <li key={link}>
                                            <a href="#" className="text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors flex items-center gap-2 group">
                                                <ChevronRight className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-8 pt-8">
                        <div className="flex items-center gap-8">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">© 2026 Accio Neural Systems</span>
                            <div className="flex items-center gap-4">
                                {[ShieldCheck, Lock, Globe2].map((Icon, i) => (
                                    <Icon key={i} className="w-5 h-5 text-slate-300 hover:text-orange-600 cursor-pointer transition-colors" />
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider border-b-2 border-orange-500 pb-1">
                                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                                Enterprise Verified
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── FLOATING ACTION BUTTON (FAB) ─── */}
            <div className="fixed bottom-8 right-8 z-[100]">
                <button
                    onClick={() => setShowQuickInsights(!showQuickInsights)}
                    className="w-16 h-16 bg-gradient-to-br from-orange-600 to-[#FF6600] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <MessageSquare className="w-6 h-6 relative z-10" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-bold shadow-lg">
                        AI
                    </span>
                </button>
            </div>
        </div>
    );
}