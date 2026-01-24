import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, RefreshCw, Image } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

type Product = {
  id: string;
  title: string;
  images: string[] | null;
  image_confidence: string | null;
  image_approved: boolean | null;
  category_id: string | null;
};

export default function AdminImageReview() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("products")
      .select("id, title, images, image_confidence, image_approved, category_id")
      .order("updated_at", { ascending: false })
      .limit(50);

    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const approve = async (id: string) => {
    await supabase.from("products").update({
      image_approved: true,
      image_confidence: "high",
      image_review_notes: null,
    }).eq("id", id);

    toast({
      title: "Approved",
      description: "Image approved successfully",
    });

    fetchProducts();
  };

  const reject = async (id: string) => {
    await supabase.from("products").update({
      images: [],
      image_approved: false,
      image_confidence: "low",
      image_review_notes: "Rejected. Needs new image.",
    }).eq("id", id);

    toast({
      title: "Rejected",
      description: "Image rejected. It will be re-scraped.",
      variant: "destructive",
    });

    fetchProducts();
  };

  const triggerImageProcessor = async () => {
    try {
      const { error } = await supabase.functions.invoke('process-image-queue');
      if (error) throw error;
      
      toast({
        title: "Image processor triggered",
        description: "Processing queued images...",
      });
      
      setTimeout(fetchProducts, 3000);
    } catch (err: any) {
      toast({
        title: "Failed to trigger processor",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  const needsReview = products.filter(p => !p.image_approved && p.images?.length);
  const noImages = products.filter(p => !p.images?.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Image Review Queue</h2>
          <p className="text-sm text-muted-foreground">
            {needsReview.length} need review • {noImages.length} missing images
          </p>
        </div>
        <Button variant="outline" onClick={triggerImageProcessor}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Process Queue
        </Button>
      </div>

      {products.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No products to review</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <Card key={p.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-sm font-medium line-clamp-2">{p.title}</CardTitle>
                <Badge variant={p.image_approved ? "default" : "secondary"} className="shrink-0">
                  {p.image_approved ? "Approved" : "Pending"}
                </Badge>
              </div>
              <CardDescription>
                Confidence: {p.image_confidence || "unknown"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {p.images?.[0] ? (
                <img
                  src={p.images[0]}
                  className="w-full h-40 object-cover rounded-md"
                  alt={p.title}
                />
              ) : (
                <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center">
                  <span className="text-muted-foreground">No Image</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" onClick={() => approve(p.id)} className="flex-1">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Approve
                </Button>

                <Button size="sm" variant="destructive" onClick={() => reject(p.id)} className="flex-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
