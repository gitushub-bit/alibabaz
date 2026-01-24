import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Home,
  Package,
  ShoppingCart,
  MessageCircle,
  User,
  Settings,
  LogOut,
  FileText,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo.png';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { user, signOut, isAdmin, role } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 md:hidden"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-background z-50 md:hidden flex flex-col">
        {/* Header */}
        <div className="relative flex items-center justify-center p-4 border-b border-border">
          <img src={logo} alt="Logo" className="h-14 md:h-16 w-auto" />

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            <nav className="space-y-1">
              <button 
                onClick={() => handleNavigation('/')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </button>

              <button 
                onClick={() => handleNavigation('/products')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                <Package className="h-5 w-5" />
                <span>All Products</span>
              </button>

              <button 
                onClick={() => handleNavigation('/cart')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Cart</span>
              </button>

              <button 
                onClick={() => handleNavigation('/messages')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Messages</span>
              </button>

              <button 
                onClick={() => handleNavigation('/orders')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                <FileText className="h-5 w-5" />
                <span>My Orders</span>
              </button>
            </nav>

            {/* Guest Sign In / Register (Below main links) */}
            {!user && (
              <div className="mt-4 flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => handleNavigation('/auth')}
                >
                  Sign In
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleNavigation('/auth?mode=signup')}
                >
                  Register
                </Button>
              </div>
            )}

            <Separator className="my-4" />

            {user && (
              <>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                  Account
                </h3>

                <nav className="space-y-1">
                  {isAdmin && (
                    <button 
                      onClick={() => handleNavigation('/admin')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      <span>Admin Dashboard</span>
                    </button>
                  )}

                  {role !== 'buyer' && (
                    <button 
                      onClick={() => handleNavigation('/seller')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Settings className="h-5 w-5" />
                      <span>Seller Dashboard</span>
                    </button>
                  )}

                  <button 
                    onClick={() => {
                      signOut();
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-destructive transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </nav>
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};
