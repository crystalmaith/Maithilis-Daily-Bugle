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
    <div className="border-2 border-ink-dark bg-background p-6">
      {/* Newspaper section header */}
      <div className="border-b-2 border-ink-dark pb-3 mb-6">
        <h3 className="text-xl font-newspaper font-bold text-ink-dark text-center">
          ARTICLE SUBMISSION DESK
        </h3>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="h-px bg-ink-dark flex-1"></div>
          <Newspaper className="w-4 h-4 text-ink-dark" />
          <div className="h-px bg-ink-dark flex-1"></div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="article-url" className="block text-sm font-serif font-bold text-ink-dark mb-2 uppercase tracking-wide">
            News Article URL:
          </label>
          <Input
            id="article-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/news-article"
            className="font-serif bg-background border-2 border-ink-dark focus:ring-ink-dark text-ink-dark"
            disabled={isLoading}
          />
        </div>
        
        <div className="flex justify-center">
          <Button 
            type="submit" 
            disabled={isLoading || !url.trim()}
            className="bg-ink-dark hover:bg-ink-medium text-background font-serif px-8 py-3 text-lg font-bold uppercase tracking-wide border-2 border-ink-dark"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing Story...
              </>
            ) : (
              'Generate Summary'
            )}
          </Button>
        </div>
        
        <p className="text-xs text-ink-medium text-center font-serif border-t border-ink-dark pt-3 italic">
          Enter any news article URL to generate a concise 60-word summary in classic editorial style
        </p>
      </form>
    </div>
  );
};