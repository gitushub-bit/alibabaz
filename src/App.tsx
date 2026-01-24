import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { CurrencyProvider } from "@/hooks/useCurrency";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import ProductInsights from "./pages/ProductInsights";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import Cart from "./pages/Cart";
import CartCheckout from "./telegram/CartCheckout";
import OrderTracking from "./pages/OrderTracking";
import Profile from "./pages/Profile";

// Buyer Dashboard
import BuyerDashboard from "./pages/dashboard/BuyerDashboard";
import BuyerHome from "./pages/dashboard/buyer/BuyerHome";
import BuyerRFQs from "./pages/dashboard/buyer/BuyerRFQs";
import RFQForm from "./pages/dashboard/buyer/RFQForm";
import BuyerFavorites from "./pages/dashboard/buyer/BuyerFavorites";

// Seller Dashboard
import SellerDashboard from "./pages/dashboard/SellerDashboard";
import SellerHome from "./pages/dashboard/seller/SellerHome";
import SellerProducts from "./pages/dashboard/seller/SellerProducts";
import ProductForm from "./pages/dashboard/seller/ProductForm";

// Admin Dashboard
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHome from "./pages/admin/AdminHome";
import AdminDeals from "./pages/admin/AdminDeals";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSuppliers from "./pages/admin/AdminSuppliers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminRFQs from "./pages/admin/AdminRFQs";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminSiteContent from "./pages/admin/AdminSiteContent";
import AdminIntegrations from "./pages/admin/AdminIntegrations";
import AdminTelegram from "./telegram/AdminTelegram";
import AdminPromoSlides from "./pages/admin/AdminPromoSlides";
import AdminPopups from "./pages/admin/AdminPopups";
import AdminImageQueue from "./pages/admin/AdminImageQueue";
import Checkout from "./telegram/Checkout";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <CurrencyProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/product-insights/:id" element={<ProductInsights />} />
                <Route path="/product-insights/:type/:id" element={<ProductInsights />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/messages/:conversationId" element={<Messages />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/cart/checkout" element={<CartCheckout />} />
                <Route path="/orders" element={<OrderTracking />} />
                <Route path="/profile" element={<Profile />} />

            <Route path="/buyer" element={<BuyerDashboard />}>
              <Route index element={<BuyerHome />} />
              <Route path="rfqs" element={<BuyerRFQs />} />
              <Route path="rfqs/new" element={<RFQForm />} />
              <Route path="favorites" element={<BuyerFavorites />} />
            </Route>

            {/* Seller Dashboard */}
            <Route path="/seller" element={<SellerDashboard />}>
              <Route index element={<SellerHome />} />
              <Route path="products" element={<SellerProducts />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id/edit" element={<ProductForm />} />
            </Route>

            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<AdminHome />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="suppliers" element={<AdminSuppliers />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="deals" element={<AdminDeals />} />
              <Route path="promo-slides" element={<AdminPromoSlides />} />
              <Route path="popups" element={<AdminPopups />} />
              <Route path="image-queue" element={<AdminImageQueue />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="rfqs" element={<AdminRFQs />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="content" element={<AdminSiteContent />} />
              <Route path="integrations" element={<AdminIntegrations />} />
              <Route path="telegram" element={<AdminTelegram />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

              <Route path="/checkout" element={<Checkout />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CurrencyProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
