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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Sparkles, Loader2, RefreshCw, FileText } from 'lucide-react';

interface AIContentGeneratorProps {
  productId: string;
  productTitle: string;
  hasExistingContent: boolean;
  onSuccess: () => void;
}

export function AIContentGenerator({
  productId,
  productTitle,
  hasExistingContent,
  onSuccess,
}: AIContentGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'overwrite' | 'append'>('overwrite');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-content', {
        body: { productId, mode },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: 'Content Generated',
        description: `AI content generated successfully (v${data.version})`,
      });
      
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate AI content',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Generate AI
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate AI Content
            </DialogTitle>
            <DialogDescription>
              Generate description, features, specifications, and SEO content for "{productTitle}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Content to Generate
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Product description (2-3 paragraphs)</li>
                <li>Key features (5-7 bullet points)</li>
                <li>Technical specifications</li>
                <li>SEO title (under 60 chars)</li>
                <li>Meta description (under 160 chars)</li>
              </ul>
            </div>

            {hasExistingContent && (
              <div className="space-y-3">
                <Label>Generation Mode</Label>
                <RadioGroup
                  value={mode}
                  onValueChange={(v) => setMode(v as 'overwrite' | 'append')}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value="overwrite" id="overwrite" />
                    <Label htmlFor="overwrite" className="flex-1 cursor-pointer">
                      <div className="font-medium">Overwrite</div>
                      <div className="text-sm text-muted-foreground">
                        Replace existing AI content with new generation
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value="append" id="append" />
                    <Label htmlFor="append" className="flex-1 cursor-pointer">
                      <div className="font-medium">Append</div>
                      <div className="text-sm text-muted-foreground">
                        Add new content after existing AI content
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={generating}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
