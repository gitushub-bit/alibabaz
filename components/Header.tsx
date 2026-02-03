
import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, User, Globe, MessageSquare, ClipboardList, X, Check, ChevronDown, Search } from 'lucide-react';
import { COUNTRIES } from '../constants';
import { Country } from '../types';

const AlibabaLogo = () => (
  <div className="flex items-center group cursor-pointer shrink-0">
    <div className="mr-3">
      <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M78.6 34.3c-2.4-4.8-6.8-8.5-12.1-10.2-5.3-1.7-11-.9-15.6 2.3-1.8 1.3-3.4 2.8-4.7 4.5-.3.4-.6.8-.9 1.2-1.7-5.5-5.5-10.1-10.7-12.6-5.2-2.5-11.2-2.7-16.6-.7-5.4 2-9.6 6.3-11.6 11.7-2 5.4-1.4 11.4 1.7 16.3 3.1 4.9 8.2 8.3 13.9 9.3 5.7 1 11.5-.7 15.8-4.5 1-.9 1.9-1.9 2.7-3 1.2 5.2 4.4 9.7 9 12.3 4.6 2.6 10.1 3.2 15.1 1.6 5-1.6 9-5.1 11-9.9 2-4.8 1.8-10.2-.5-14.8l-1-2z" fill="#FF6600"/>
        <path d="M47.5 45c0 8.3-6.7 15-15 15s-15-6.7-15-15 6.7-15 15-15 15 6.7 15 15z" fill="white"/>
        <path d="M41 45c0 4.7-3.8 8.5-8.5 8.5S24 49.7 24 45s3.8-8.5 8.5-8.5 8.5 3.8 8.5 8.5z" fill="#FF6600"/>
      </svg>
    </div>
    <div className="flex items-baseline">
      <span className="text-[#FF6600] text-[28px] font-[900] tracking-[-0.04em] leading-none">Alibaba.com</span>
    </div>
  </div>
);

const Header: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES.find(c => c.code === 'ke') || COUNTRIES[0]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSelectorOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isSelectorOpen) {
      setSearchQuery('');
    }
  }, [isSelectorOpen]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsSelectorOpen(false);
  };

  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-white font-sans sticky top-0 z-[100] shadow-sm">
      {/* Top Promo Banner */}
      <div className="w-full bg-[#FFE8D6] py-[10px] px-4 flex justify-center items-center border-b border-[#ffd7b5]">
        <div className="flex items-center space-x-2 max-w-[1440px] w-full justify-center">
          <p className="text-[#111] text-[15px] font-bold tracking-tight">
            Research smarter • Design easier • Source better — All-in-one with <span className="font-extrabold">AI Mode</span>
          </p>
          <div className="relative">
            <span className="text-[#FF6600] text-xl ml-1">✨</span>
            <span className="absolute -top-1 -right-3 text-[#FF6600] text-[8px] font-black uppercase tracking-tighter">AI</span>
          </div>
          <button className="bg-[#FF6600] text-white px-6 py-[8px] rounded-full text-[14px] font-extrabold hover:bg-[#E65C00] transition-colors ml-8">
            Try it now →
          </button>
        </div>
      </div>

      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 h-[74px] flex items-center justify-between">
          <AlibabaLogo />

          <div className="flex items-center space-x-8">
            {/* Country Selector Group */}
            <div className="relative" ref={dropdownRef}>
              <div 
                onClick={() => setIsSelectorOpen(!isSelectorOpen)} 
                className="flex flex-col items-start cursor-pointer group hover:opacity-80 transition-all"
              >
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-1">Deliver to:</span>
                <div className="flex items-center space-x-1.5">
                  <img 
                    src={`https://flagcdn.com/w20/${selectedCountry.code}.png`} 
                    className="w-[18px] h-3 rounded-[1px] shadow-sm border border-gray-100 object-cover" 
                    alt={selectedCountry.name} 
                  />
                  <span className="text-[13px] font-bold text-[#111] uppercase tracking-tighter">{selectedCountry.code}</span>
                  <ChevronDown size={14} className={`text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${isSelectorOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Global Selector Dropdown */}
              {isSelectorOpen && (
                <div className="absolute top-[calc(100%+12px)] right-0 w-[320px] bg-white border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.18)] rounded-2xl z-[110] p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50">
                    <span className="text-[14px] font-bold text-gray-900">Ship to location</span>
                    <X 
                      size={18} 
                      className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" 
                      onClick={() => setIsSelectorOpen(false)} 
                    />
                  </div>
                  
                  {/* Country Search Bar */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      ref={searchInputRef}
                      type="text" 
                      placeholder="Search country or region"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pl-10 pr-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#FF6600] transition-all"
                    />
                  </div>

                  <div className="max-h-[380px] overflow-y-auto custom-scrollbar pr-1 -mr-1">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((c) => (
                        <div 
                          key={c.code} 
                          onClick={() => handleCountrySelect(c)} 
                          className={`flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-xl cursor-pointer group transition-all mb-1 ${selectedCountry.code === c.code ? 'bg-orange-50' : ''}`}
                        >
                          <div className="flex items-center space-x-3">
                            <img 
                              src={`https://flagcdn.com/w40/${c.code}.png`} 
                              className="w-6 h-4 object-cover rounded shadow-sm border border-gray-100" 
                              alt={c.name} 
                            />
                            <div className="flex flex-col">
                              <span className={`text-[14px] transition-colors ${selectedCountry.code === c.code ? 'font-bold text-[#FF6600]' : 'font-medium text-gray-700'}`}>
                                {c.name}
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{c.currency}</span>
                            </div>
                          </div>
                          {selectedCountry.code === c.code && (
                            <Check size={16} className="text-[#FF6600]" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-gray-400">
                        <Globe size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-[13px]">No countries found matching "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Language & Currency Indicator */}
            <div className="flex items-center space-x-2 cursor-pointer text-gray-800 hover:text-[#FF6600] transition-colors group">
              <Globe size={19} strokeWidth={2} />
              <span className="text-[13px] font-bold">English-{selectedCountry.currency}</span>
            </div>

            {/* Utility Icons */}
            <div className="flex items-center space-x-7 text-gray-800">
              <MessageSquare size={24} strokeWidth={1.5} className="cursor-pointer hover:text-[#FF6600] transition-colors" />
              <ClipboardList size={24} strokeWidth={1.5} className="cursor-pointer hover:text-[#FF6600] transition-colors" />
              <ShoppingCart size={24} strokeWidth={1.5} className="cursor-pointer hover:text-[#FF6600] transition-colors" />
              <User size={24} strokeWidth={1.5} className="cursor-pointer hover:text-[#FF6600] transition-colors" />
            </div>
          </div>
        </div>

        {/* Navigation Categories Row */}
        <div className="max-w-[1440px] mx-auto px-6 h-11 flex items-center justify-between text-[14px] font-bold text-gray-800">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2.5 cursor-pointer hover:text-[#FF6600] group transition-colors">
              <div className="w-4 flex flex-col space-y-[3px]">
                <div className="h-[2px] bg-black group-hover:bg-[#FF6600] transition-colors"></div>
                <div className="h-[2px] bg-black group-hover:bg-[#FF6600] transition-colors"></div>
                <div className="h-[2px] bg-black group-hover:bg-[#FF6600] transition-colors"></div>
              </div>
              <span>All categories</span>
            </div>
            <span className="cursor-pointer hover:text-[#FF6600] transition-colors">Featured selections</span>
            <span className="cursor-pointer hover:text-[#FF6600] transition-colors">Order protections</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-[13px] text-gray-500 font-bold uppercase tracking-tight">
            <span className="cursor-pointer hover:text-[#FF6600] transition-colors">Connect on WhatsApp</span>
            <span className="cursor-pointer hover:text-[#FF6600] transition-colors">Help Center</span>
            <span className="cursor-pointer hover:text-[#FF6600] transition-colors">App & extension</span>
            <span className="cursor-pointer hover:text-[#FF6600] transition-colors">Sell on Alibaba.com</span>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
