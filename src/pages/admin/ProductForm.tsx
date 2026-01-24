import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type ProductFormProps = {
  productId?: string; // if provided, we are in edit mode
  onSaved?: () => void;
};

export default function ProductForm({ productId, onSaved }: ProductFormProps) {


  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [published, setPublished] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (data) {
      const product = data as any;
      setTitle(product.title);
      setCategory(product.category);
      setPrice(product.price);
      setDescription(product.description);
      setSlug(product.slug);
      setPublished(product.published);
      setImages(product.images || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!title || !category || !price) {
      toast({
        title: "Missing required fields",
        description: "Title, category and price are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast({ title: "Error", description: "You must be logged in", variant: "destructive" });
      setLoading(false);
      return;
    }

    const payload = {
      title,
      category,
      price,
      description,
      slug: slug || generateSlug(title),
      published,
      images,
      updated_at: new Date().toISOString(),
      seller_id: user.id
    };

    try {
      if (productId) {
        // Exclude seller_id from update if not needed or strict
        const { seller_id, ...updatePayload } = payload;
        await supabase.from("products").update(updatePayload).eq("id", productId);
      } else {
        await supabase.from("products").insert({
          ...payload,
          created_at: new Date().toISOString(),
        } as any);
      }

      toast({
        title: "Saved",
        description: productId ? "Product updated" : "Product created",
      });

      onSaved?.();
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, { upsert: true });

    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    setImages([...images, publicUrl.publicUrl]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{productId ? "Edit Product" : "Add Product"}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <Label>Category</Label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>

        <div>
          <Label>Price</Label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
          />
        </div>

        <div>
          <Label>Slug</Label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Auto generated" />
        </div>

        <div className="md:col-span-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={published} onCheckedChange={setPublished} />
          <Label>Published</Label>
        </div>
      </div>

      <div>
        <Label>Images</Label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadImage(file);
          }}
        />

        <div className="flex flex-wrap gap-2 mt-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative">
              <img src={img} className="w-24 h-24 object-cover rounded-md" alt="product" />
              <button
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                onClick={() => removeImage(idx)}
              >
                X
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => { /* clear form or close */ }}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Product"}
        </Button>
      </div>
    </div>
  );
}
