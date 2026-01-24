import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Package,
  MessageCircle,
  Store
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, updateQuantity, removeItem, clearCart, total, itemCount } = useCart();
  const { formatPrice, formatPriceOnly, currency } = useCurrency();

  // Group items by seller
  const groupedItems = items.reduce((acc, item) => {
    const sellerId = item.seller_id;
    if (!acc[sellerId]) {
      acc[sellerId] = {
        seller_name: item.seller_name,
        items: []
      };
    }
    acc[sellerId].items.push(item);
    return acc;
  }, {} as Record<string, { seller_name: string; items: typeof items }>);

  const handleCheckout = (productId: string) => {
    if (!user) {
      navigate('/auth?redirect=/cart');
      return;
    }
    navigate(`/checkout?product=${productId}`);
  };

  const handleBulkInquiry = () => {
    if (!user) {
      navigate('/auth?redirect=/cart');
      return;
    }
    // Navigate to RFQ form with cart items
    navigate('/buyer/rfqs/new', { state: { cartItems: items } });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your Inquiry Basket is Empty</h2>
            <p className="text-muted-foreground mb-6">
              Add products to your basket to request quotes from suppliers
            </p>
            <Button onClick={() => navigate('/products')}>
              Browse Products
            </Button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Inquiry Basket</h1>
            <p className="text-muted-foreground">{itemCount} items from {Object.keys(groupedItems).length} supplier(s)</p>
          </div>
          <Button variant="outline" size="sm" onClick={clearCart}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(groupedItems).map(([sellerId, group]) => (
              <Card key={sellerId}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Store className="h-5 w-5" />
                    {group.seller_name}
                    <Badge variant="secondary" className="ml-auto">
                      {group.items.length} item(s)
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 bg-muted/50 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/product/${item.product_id}`}
                          className="font-medium text-sm hover:text-primary line-clamp-2"
                        >
                          {item.title}
                        </Link>
                        <p className="text-primary font-semibold mt-1">
                          {formatPriceOnly(item.price)} / {item.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          MOQ: {item.moq} {item.unit}(s)
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= item.moq}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || item.moq)}
                              className="h-8 w-16 text-center border-0"
                              min={item.moq}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-sm font-medium">
                            {formatPriceOnly(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleCheckout(item.product_id)}
                        >
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate max-w-[150px]">
                        {item.title} x{item.quantity}
                      </span>
                      <span>{formatPriceOnly(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                
                {/* Total with conversion */}
                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Estimated Total</span>
                    <span>{formatPriceOnly(total)}</span>
                  </div>
                  {currency.code !== 'USD' && (
                    <p className="text-xs text-muted-foreground text-right">
                      ≈ ${total.toFixed(2)} USD
                    </p>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground">
                  * Final pricing may vary based on shipping and quantity negotiations
                </p>
                
                <div className="space-y-2 pt-2">
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      if (!user) {
                        navigate('/auth?redirect=/cart/checkout');
                        return;
                      }
                      navigate('/cart/checkout');
                    }}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Proceed to Checkout
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleBulkInquiry}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Bulk Inquiry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
