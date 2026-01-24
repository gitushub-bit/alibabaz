import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Package, 
  FileText, 
  Settings,
  LogOut,
  Menu,
  ShieldCheck,
  Tag,
  CreditCard,
  Palette,
  Plug,
  Crown,
  Send
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface SidebarLink {
  to: string;
  icon: any;
  label: string;
  exact?: boolean;
  superAdminOnly?: boolean;
}

const sidebarLinks: SidebarLink[] = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/suppliers', icon: Building2, label: 'Suppliers' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/categories', icon: FileText, label: 'Categories' },
  { to: '/admin/deals', icon: Tag, label: 'Deals & Promotions' },
  { to: '/admin/orders', icon: Package, label: 'Orders' },
  { to: '/admin/rfqs', icon: FileText, label: 'RFQs' },
  { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/content', icon: Palette, label: 'Site Content' },
  { to: '/admin/integrations', icon: Plug, label: 'Integrations', superAdminOnly: true },
  { to: '/admin/telegram', icon: Send, label: 'Telegram API' },
  { to: '/admin/settings', icon: Settings, label: 'Settings', superAdminOnly: true },
];

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, loading, signOut, isSuperAdmin, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const filteredLinks = sidebarLinks.filter(link => 
    !link.superAdminOnly || isSuperAdmin
  );

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            {isSuperAdmin ? (
              <Crown className="h-5 w-5 text-primary-foreground" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            )}
          </div>
          <div>
            <h1 className="font-bold text-lg">Admin Panel</h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {isSuperAdmin ? 'Super Admin' : 'Admin'}
              </p>
              {isSuperAdmin && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Full Access
                </Badge>
              )}
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(link.to, link.exact)
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            <link.icon className="h-5 w-5" />
            <span>{link.label}</span>
            {link.superAdminOnly && (
              <Crown className="h-3 w-3 ml-auto opacity-50" />
            )}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="mb-3 px-4 py-2 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">Logged in as</p>
          <p className="text-sm font-medium truncate">{user.email}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-background border-r">
        <Sidebar />
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden sticky top-0 z-50 bg-background border-b px-4 py-3 flex items-center justify-between">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2">
            <h1 className="font-bold">Admin Panel</h1>
            {isSuperAdmin && (
              <Badge variant="secondary" className="text-[10px]">Super</Badge>
            )}
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
