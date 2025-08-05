import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Newspaper } from 'lucide-react';

interface ArticleInputProps {
  onSummarize: (url: string) => Promise<void>;
  isLoading: boolean;
}

export const ArticleInput = ({ onSummarize, isLoading }: ArticleInputProps) => {
  const [url, setUrl] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid article URL",
        variant: "destructive",
      });
      return;
    }

    try {
      await onSummarize(url.trim());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the article. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-paper-gradient rounded-lg shadow-paper border border-vintage-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Newspaper className="w-6 h-6 text-ink-dark" />
          <h2 className="text-xl font-newspaper font-bold text-ink-dark">
            Submit Article for Summary
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="article-url" className="block text-sm font-serif text-ink-medium mb-2">
              Article URL
            </label>
            <Input
              id="article-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/news-article"
              className="font-serif bg-background border-vintage-border focus:ring-ink-dark"
              disabled={isLoading}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading || !url.trim()}
            className="bg-ink-dark hover:bg-ink-medium text-primary-foreground font-serif px-8 py-2 h-10"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Summarize'
            )}
          </Button>
        </form>
        
        <p className="text-xs text-ink-medium mt-3 font-serif">
          Enter any news article URL to generate a concise 60-word summary in classic editorial style.
        </p>
      </div>
    </div>
  );
};