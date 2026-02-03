
import React, { useState } from 'react';
import { Search, Camera, Sparkles, Loader2 } from 'lucide-react';
import { TabType } from '../types';
import { getDeepSearchAnalysis } from '../services/geminiService';

const Hero: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.PRODUCTS);
  const [isDeepSearch, setIsDeepSearch] = useState(true);
  const [query, setQuery] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    if (isDeepSearch) {
      setLoading(true);
      const result = await getDeepSearchAnalysis(query);
      setAnalysis(result);
      setLoading(false);
    } else {
      console.log(`Searching: ${query}`);
    }
  };

  return (
    <div className="w-full bg-[#fdfaf7] pt-14 pb-20 px-4 font-sans">
      <div className="max-w-[1000px] mx-auto flex flex-col items-center">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-12 mb-10">
          <div 
            onClick={() => setActiveTab(TabType.AI_MODE)}
            className="relative cursor-pointer flex items-center group"
          >
            <span className={`text-[28px] font-bold transition-colors ${activeTab === TabType.AI_MODE ? 'text-black' : 'text-[#333]'}`}>
              AI Mode
            </span>
            <div className="relative ml-1 -top-1">
              <span className="text-[#FF6600] text-xl">✨</span>
              <span className="absolute -top-1.5 -right-3 text-[#FF6600] text-[8px] font-black uppercase tracking-tighter">AI</span>
            </div>
          </div>

          <div className="text-gray-200 text-3xl font-light opacity-50 select-none">|</div>

          <div 
            onClick={() => setActiveTab(TabType.PRODUCTS)}
            className={`cursor-pointer text-[28px] font-bold border-b-[4px] transition-all pb-1 ${activeTab === TabType.PRODUCTS ? 'text-[#FF6600] border-[#FF6600]' : 'text-[#333] border-transparent hover:text-gray-600'}`}
          >
            Products
          </div>

          <div 
            onClick={() => setActiveTab(TabType.MANUFACTURERS)}
            className={`cursor-pointer text-[28px] font-bold border-b-[4px] transition-all pb-1 ${activeTab === TabType.MANUFACTURERS ? 'text-black border-black' : 'text-[#333] border-transparent hover:text-gray-600'}`}
          >
            Manufacturers
          </div>

          <div 
            onClick={() => setActiveTab(TabType.WORLDWIDE)}
            className={`cursor-pointer text-[28px] font-bold border-b-[4px] transition-all pb-1 ${activeTab === TabType.WORLDWIDE ? 'text-black border-black' : 'text-[#333] border-transparent hover:text-gray-600'}`}
          >
            Worldwide
          </div>
        </div>

        {/* Search Bar Container - With orange border and gradient button */}
        <div className="w-full max-w-[860px] relative">
          <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(255,102,0,0.08)] border-[1.5px] border-[#FF6600] p-5 flex flex-col h-[160px]">
            {/* Top Row: Input */}
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="smart watch"
              className="w-full text-[18px] outline-none text-gray-800 placeholder-gray-400 font-medium bg-transparent pt-1 px-1"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            
            {/* Bottom Row: Actions */}
            <div className="mt-auto flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Deep Search Control Box */}
                <div className="flex items-center bg-[#FFF8F4] border border-[#FFE0CC] rounded-[14px] px-3.5 py-[6px] space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <span className="text-[#FF6600] text-sm">✨</span>
                      <span className="absolute -top-1.5 -right-2 text-[#FF6600] text-[6px] font-black">AI</span>
                    </div>
                    <span className="text-[14px] font-bold text-[#FF6600]">Deep Search</span>
                    <span className="text-[10px] text-gray-800 border border-gray-300 px-1.5 rounded-md font-bold bg-white ml-1">Free</span>
                  </div>
                  {/* Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={isDeepSearch}
                      onChange={() => setIsDeepSearch(!isDeepSearch)}
                    />
                    <div className="w-[38px] h-[20px] bg-gray-200 rounded-full peer peer-checked:bg-[#FF6600] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[18px]"></div>
                  </label>
                </div>

                {/* Image Search */}
                <div className="flex items-center space-x-2.5 cursor-pointer text-gray-800 hover:text-[#FF6600] transition-colors group">
                  <div className="bg-[#f0f2f5] p-1.5 rounded-lg group-hover:bg-orange-50">
                    <Camera size={18} strokeWidth={2.5} />
                  </div>
                  <span className="text-[14px] font-bold">Image Search</span>
                </div>
              </div>

              {/* Search Button - Gradient style */}
              <button 
                onClick={handleSearch}
                className="bg-gradient-to-r from-[#FF9800] to-[#FF5722] text-white flex items-center space-x-2.5 px-10 h-[54px] rounded-full hover:shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98] shadow-md"
              >
                <div className="relative">
                  <Search size={18} strokeWidth={3} />
                  <div className="absolute -top-1.5 -right-1.5 text-[8px] font-black">✨</div>
                </div>
                <span className="font-black text-[17px]">Search</span>
              </button>
            </div>
          </div>
        </div>

        {/* AI Results */}
        {loading && (
          <div className="mt-10 bg-white p-12 rounded-[28px] shadow-sm border border-orange-50 flex flex-col items-center w-full max-w-[860px]">
            <Loader2 className="w-10 h-10 text-[#FF6600] animate-spin mb-4" />
            <p className="text-gray-900 font-black italic text-xl tracking-tight uppercase">Sourcing with AI...</p>
          </div>
        )}

        {analysis && !loading && (
          <div className="mt-10 bg-white p-10 rounded-[28px] shadow-sm border border-gray-100 w-full max-w-[860px] animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-between items-start mb-6 border-b border-gray-50 pb-5">
              <h3 className="text-xl font-black flex items-center text-[#FF6600] tracking-tight">
                <span className="mr-2">✨</span>
                AI MARKET INSIGHTS
              </h3>
              <button onClick={() => setAnalysis(null)} className="text-gray-300 hover:text-gray-500 transition-colors bg-gray-100 p-1 rounded-full">✕</button>
            </div>
            <div className="text-gray-800 leading-relaxed text-lg whitespace-pre-line font-medium prose prose-orange max-w-none">
              {analysis}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;
