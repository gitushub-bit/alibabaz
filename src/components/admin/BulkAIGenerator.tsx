import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';

interface BulkAIGeneratorProps {
  onComplete: () => void;
}

interface ProductToGenerate {
  id: string;
  title: string;
}

export function BulkAIGenerator({ onComplete }: BulkAIGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [products, setProducts] = useState<ProductToGenerate[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentProduct, setCurrentProduct] = useState<string>('');

  const fetchProductsWithMissingDetails = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('products')
      .select('id, title, ai_description, description')
      .or('ai_description.is.null,description.is.null')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch products', variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Filter products that truly need generation
    const needsGeneration = (data || []).filter(p => !p.ai_description && !p.description);
    setProducts(needsGeneration);
    setLoading(false);
  };

  const handleOpen = async () => {
    setOpen(true);
    await fetchProductsWithMissingDetails();
  };

  const handleGenerateAll = async () => {
    if (products.length === 0) return;
    
    setGenerating(true);
    setProgress(0);
    
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      setCurrentProduct(product.title);
      
      try {
        const { error } = await supabase.functions.invoke('generate-ai-content', {
          body: { productId: product.id, mode: 'overwrite' },
        });

        if (error) throw error;
        successCount++;
      } catch (err) {
        console.error('Failed to generate for:', product.title, err);
        errorCount++;
      }

      setProgress(Math.round(((i + 1) / products.length) * 100));
      
      // Small delay to avoid rate limiting
      if (i < products.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    setGenerating(false);
    setCurrentProduct('');
    
    toast({
      title: 'Bulk Generation Complete',
      description: `Generated content for ${successCount} products. ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
    });

    setOpen(false);
    onComplete();
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen} className="gap-2">
        <Wand2 className="h-4 w-4" />
        Generate All Missing
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Bulk AI Content Generation
            </DialogTitle>
            <DialogDescription>
              Generate AI content for all products missing descriptions and details.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2">Scanning products...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                <p>All products have content!</p>
                <p className="text-sm">No products need AI generation.</p>
              </div>
            ) : (
              <>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-lg font-semibold text-center">
                    {products.length} products need content
                  </p>
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    This will generate descriptions, features, and SEO content.
                  </p>
                </div>

                {generating && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      {progress}% - Generating: {currentProduct.slice(0, 30)}...
                    </p>
                  </div>
                )}

                <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
                  {products.slice(0, 10).map((p) => (
                    <div key={p.id} className="text-sm py-1 border-b last:border-0">
                      {p.title}
                    </div>
                  ))}
                  {products.length > 10 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      ... and {products.length - 10} more
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={generating}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateAll} 
              disabled={loading || generating || products.length === 0}
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate All ({products.length})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
