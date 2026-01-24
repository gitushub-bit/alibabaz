import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Home, Search, ArrowLeft, ShoppingBag } from "lucide-react";
import logo from "@/assets/logo.png";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <img 
              src={logo} 
              alt="Logo" 
              className="h-16 w-auto opacity-80"
            />
          </div>

          {/* 404 Illustration */}
          <div className="relative">
            <div className="text-[120px] md:text-[160px] font-bold text-primary/10 leading-none select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-primary/5 rounded-full p-8">
                <Search className="h-16 w-16 text-primary/40" />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Page Not Found
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-sm mx-auto">
              Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button 
              onClick={() => navigate('/')}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </div>

          {/* Quick Links */}
          <div className="pt-8 border-t">
            <p className="text-sm text-muted-foreground mb-4">Or explore these popular sections:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/products')}
                className="text-primary hover:text-primary"
              >
                <ShoppingBag className="h-4 w-4 mr-1" />
                Products
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/cart')}
                className="text-primary hover:text-primary"
              >
                Cart
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/messages')}
                className="text-primary hover:text-primary"
              >
                Messages
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/profile')}
                className="text-primary hover:text-primary"
              >
                My Account
              </Button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default NotFound;
