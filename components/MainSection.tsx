
import React from 'react';
import { 
  ChevronRight, 
  FileText, 
  Settings, 
  Trophy, 
  Shirt, 
  Smartphone, 
  Sparkles, 
  Briefcase, 
  Home, 
  Star,
  Car,
  Wrench,
  Watch
} from 'lucide-react';
import { CATEGORIES } from '../constants';

const ICON_MAP: Record<string, any> = {
  Star: Star,
  Shirt: Shirt,
  Smartphone: Smartphone,
  Trophy: Trophy,
  Sparkles: Sparkles,
  Briefcase: Briefcase,
  Home: Home,
  Car: Car,
  Wrench: Wrench,
  Watch: Watch,
};

const MainSection: React.FC = () => {
  return (
    <div className="max-w-[1440px] mx-auto px-6 font-sans">
      <div className="bg-white rounded-[16px] shadow-[0_4px_32px_rgba(0,0,0,0.03)] p-6 flex flex-col lg:flex-row gap-8 mb-12">
        
        {/* Sidebar Categories */}
        <div className="w-full lg:w-[280px] border-r border-gray-50 pr-4 relative flex flex-col">
          <div className="flex-1 h-[460px] overflow-y-auto custom-scrollbar pr-2">
            {CATEGORIES.map((cat, idx) => {
              const IconComp = ICON_MAP[cat.icon] || Star;
              return (
                <div 
                  key={cat.id} 
                  className={`relative flex items-center justify-between py-[11px] px-4 rounded-lg cursor-pointer hover:bg-[#f7f8fa] group transition-all ${idx === 0 ? 'bg-[#f7f8fa]' : ''}`}
                >
                  <div className="flex items-center space-x-3.5 text-gray-800 group-hover:text-black transition-colors">
                    <IconComp size={19} strokeWidth={idx === 0 ? 2.5 : 2} className={idx === 0 ? 'text-[#333]' : 'text-gray-500 group-hover:text-black'} />
                    <span className={`text-[15px] truncate max-w-[180px] ${idx === 0 ? 'font-bold' : 'font-medium'}`}>
                      {cat.name}
                    </span>
                  </div>
                  
                  <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              );
            })}
            
            {/* View All Button at the bottom of the list */}
            <div className="mt-4 flex justify-center pb-2">
              <button className="bg-white px-6 py-2 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center space-x-2 hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] hover:scale-105 transition-all duration-200 group">
                <span className="text-[14px] font-bold text-gray-800">View all</span>
                <ChevronRight size={16} strokeWidth={2.5} className="text-gray-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gray-100"></div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="flex items-center justify-end mb-6 space-x-12 text-[14px] font-bold text-[#111]">
             <div className="flex items-center space-x-2.5 cursor-pointer hover:text-[#FF6600] transition-colors group">
               <div className="text-gray-900 group-hover:text-[#FF6600]">
                  <FileText size={20} strokeWidth={2} />
               </div>
               <span>Request for Quotation</span>
             </div>
             <div className="flex items-center space-x-2.5 cursor-pointer hover:text-[#FF6600] transition-colors group">
               <div className="text-gray-900 group-hover:text-[#FF6600]">
                  <Trophy size={20} strokeWidth={2} />
               </div>
               <span>Top Ranking</span>
             </div>
             <div className="flex items-center space-x-2.5 cursor-pointer hover:text-[#FF6600] transition-colors group">
               <div className="text-gray-900 group-hover:text-[#FF6600]">
                  <Settings size={20} strokeWidth={2} />
               </div>
               <span>Fast customization</span>
             </div>
          </div>

          <div className="flex items-center justify-center h-[300px]">
             {/* Main content grid removed per request */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainSection;
