import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Product = {
  id: string;
  title: string;
  category: string;
  images: string[] | null;
  image_confidence: string | null;
  image_approved: boolean | null;
};

export default function AdminImageReview() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("products")
      .select("id, title, category, images, image_confidence, image_approved")
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

  const rescrape = async (id: string) => {
    try {
      const res = await fetch("/api/rescrape-product", {
        method: "POST",
        body: JSON.stringify({ productId: id }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast({
        title: "Rescrape triggered",
        description: "Product will be re-processed on next cron run",
      });
    } catch (err: any) {
      toast({
        title: "Rescrape failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Image Review Queue</h2>

      {products.length === 0 && (
        <div className="p-4 bg-muted rounded-md">
          <p>No products found.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {p.title}
                <Badge variant={p.image_approved ? "default" : "destructive"}>
                  {p.image_approved ? "Approved" : "Needs Review"}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {p.category} • Confidence: {p.image_confidence || "unknown"}
              </p>
            </CardHeader>

            <CardContent>
              {p.images?.[0] ? (
                <img
                  src={p.images[0]}
                  className="w-full h-40 object-cover rounded-md"
                  alt={p.title}
                />
              ) : (
                <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center">
                  <span>No Image</span>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <Button onClick={() => approve(p.id)} className="flex-1">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>

                <Button variant="destructive" onClick={() => reject(p.id)} className="flex-1">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>

                <Button variant="outline" onClick={() => rescrape(p.id)} className="flex-1">
                  Rescrape
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
