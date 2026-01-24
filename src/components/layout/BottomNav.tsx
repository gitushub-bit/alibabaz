import { Home, Eye, MessageCircle, ShoppingCart, User } from "lucide-react";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  icon: typeof Home;
  label: string;
  id: string;
  path: string;
  authRequired?: boolean;
  showBadge?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", id: "home", path: "/" },
  { icon: Eye, label: "Explore", id: "explore", path: "/products" },
  { icon: MessageCircle, label: "Messages", id: "messages", path: "/messages", authRequired: true },
  { icon: ShoppingCart, label: "Cart", id: "cart", path: "/cart", showBadge: true },
  { icon: User, label: "Account", id: "account", path: "/profile" },
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, role } = useAuth();
  const { itemCount } = useCart();

  const activeItem = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/messages')) return 'messages';
    if (path.startsWith('/cart')) return 'cart';
    if (path.startsWith('/profile') || path.startsWith('/buyer') || path.startsWith('/seller') || path.startsWith('/admin')) return 'account';
    if (path.startsWith('/products') || path.startsWith('/product')) return 'explore';
    return 'home';
  }, [location.pathname]);

  const handleNav = (id: (typeof navItems)[number]['id'], path: string, authRequired?: boolean) => {
    if (authRequired && !user) {
      navigate(`/auth?redirect=${encodeURIComponent(path)}`);
      return;
    }

    // Account navigation - dashboard access via bottom nav
    if (id === 'account') {
      // Admin goes to admin dashboard
      if (isAdmin) {
        navigate('/admin');
        return;
      }
      // Seller goes to seller dashboard if they specifically want dashboard
      // Otherwise everyone goes to profile (My Alibaba style)
      navigate('/profile');
      return;
    }

    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map(({ icon: Icon, label, id, path, authRequired, showBadge }) => (
          <button
            key={id}
            onClick={() => handleNav(id, path, authRequired)}
            className={`nav-item ${activeItem === id ? "nav-item-active" : ""} px-3 py-2 relative`}
          >
            <div className="relative">
              <Icon className="w-6 h-6" />
              {/* Dynamic Cart Badge */}
              {showBadge && id === 'cart' && itemCount > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 h-5 min-w-[20px] p-0 text-[10px] flex items-center justify-center"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </Badge>
              )}
            </div>
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
