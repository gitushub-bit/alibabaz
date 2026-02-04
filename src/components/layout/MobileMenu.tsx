import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Home,
  Package,
  ShoppingCart,
  MessageCircle,
  Settings,
  LogOut,
  FileText,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Star,
  HelpCircle,
  Smartphone,
  Store,
  ChevronRight,
  User as UserIcon,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { LocalizationSelector } from '@/components/profile/LocalizationSelector';
import logo from '@/assets/logo.png';
import { useTranslation } from 'react-i18next';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { user, signOut, isAdmin, role } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  const MenuItem = ({ icon: Icon, label, onClick, link, className = "" }: any) => (
    <button
      onClick={() => link ? handleNavigation(link) : onClick?.()}
      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group ${className}`}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-gray-500 group-hover:text-[#FF6600]" />}
        <span className="text-[15px] text-[#333] group-hover:text-[#FF6600] font-medium">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#FF6600]" />
    </button>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 md:hidden animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-background z-50 md:hidden flex flex-col animate-in slide-in-from-left duration-300 shadow-2xl">

        {/* User Header Section */}
        <div className="bg-gradient-to-r from-[#FF6600] to-[#FF8533] p-5 text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          {user ? (
            <div>
              <p className="font-bold text-lg mb-1 truncate">Hi, {user.email?.split('@')[0]}</p>
              <p className="text-white/80 text-xs bg-black/10 inline-block px-2 py-0.5 rounded-full capitalize">{role}</p>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-bold mb-3">Welcome to Alibaba.com</h2>
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-white text-[#FF6600] hover:bg-white/90 font-bold border-none h-9 text-[13px]"
                  onClick={() => handleNavigation('/auth')}
                >
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent text-white border-white hover:bg-white/10 h-9 text-[13px]"
                  onClick={() => handleNavigation('/auth?tab=register')}
                >
                  Register
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 bg-white">

          {/* Localization */}
          <div className="border-b border-gray-100">
            <LocalizationSelector />
          </div>

          <div className="py-2">
            {/* Main Navigation */}
            <MenuItem icon={Home} label="Home" link="/" />
            <MenuItem icon={Package} label="All Products" link="/products" />
            <MenuItem icon={ShoppingCart} label="Cart" link="/cart" />
            <MenuItem icon={MessageCircle} label="Messages" link="/messages" />
            <MenuItem icon={FileText} label="My Orders" link="/orders" />
          </div>

          <div className="h-2 bg-gray-50 border-t border-b border-gray-100"></div>

          <div className="py-2">
            <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Sourcing</div>
            <MenuItem icon={Menu} label="All categories" onClick={() => handleNavigation('/products')} />
            <MenuItem icon={Star} label="Featured selections" link="/products?featured=true" />
            <MenuItem icon={ShieldCheck} label="Order protections" link="/buyer/rfqs/new" />
          </div>

          <div className="h-2 bg-gray-50 border-t border-b border-gray-100"></div>

          <div className="py-2">
            <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Services</div>
            <MenuItem icon={MessageCircle} label="Connect on WhatsApp" onClick={() => window.open('https://wa.me/1234567890', '_blank')} />
            <MenuItem icon={HelpCircle} label="Help Center" link="/help" />
            <MenuItem icon={Smartphone} label="App & extension" onClick={() => toast({ title: "Coming Soon", description: "Mobile app is under development." })} />
            <MenuItem icon={Store} label="Sell on Alibaba.com" link="/seller" />
          </div>

          {user && (
            <>
              <div className="h-2 bg-gray-50 border-t border-b border-gray-100"></div>
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Account</div>
                {isAdmin && <MenuItem icon={LayoutDashboard} label="Admin Dashboard" link="/admin" />}
                {role !== 'buyer' && <MenuItem icon={Settings} label="Seller Dashboard" link="/seller" />}
                <button
                  onClick={() => { signOut(); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}

          <div className="h-10"></div> {/* Bottom padding */}
        </ScrollArea>
      </div>
    </>
  );
};
