import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Newspaper, Type, Link } from 'lucide-react';

interface ArticleInputProps {
  onSummarize: (url: string) => Promise<void>;
  onSummarizeText: (text: string) => Promise<void>;
  isLoading: boolean;
}

export const ArticleInput = ({ onSummarize, onSummarizeText, isLoading }: ArticleInputProps) => {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [inputMode, setInputMode] = useState<'url' | 'text'>('url');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputMode === 'url') {
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
          description: "Failed to process the article. Try the text input option instead.",
          variant: "destructive",
        });
      }
    } else {
      if (!text.trim() || text.trim().length < 100) {
        toast({
          title: "Invalid Text",
          description: "Please enter at least 100 characters of article text",
          variant: "destructive",
        });
        return;
      }

      try {
        await onSummarizeText(text.trim());
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process the text. Please try again.",
          variant: "destructive",
        });
      }
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
      
      {/* Input Mode Toggle */}
      <div className="flex justify-center mb-4">
        <div className="flex border-2 border-ink-dark bg-background">
          <Button
            type="button"
            onClick={() => setInputMode('url')}
            className={`px-4 py-2 font-serif font-bold uppercase tracking-wide border-0 rounded-none ${
              inputMode === 'url' 
                ? 'bg-ink-dark text-background' 
                : 'bg-background text-ink-dark hover:bg-accent'
            }`}
          >
            <Link className="w-4 h-4 mr-2" />
            URL
          </Button>
          <Button
            type="button"
            onClick={() => setInputMode('text')}
            className={`px-4 py-2 font-serif font-bold uppercase tracking-wide border-0 rounded-none ${
              inputMode === 'text' 
                ? 'bg-ink-dark text-background' 
                : 'bg-background text-ink-dark hover:bg-accent'
            }`}
          >
            <Type className="w-4 h-4 mr-2" />
            Text
          </Button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {inputMode === 'url' ? (
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
        ) : (
          <div>
            <label htmlFor="article-text" className="block text-sm font-serif font-bold text-ink-dark mb-2 uppercase tracking-wide">
              Article Text:
            </label>
            <Textarea
              id="article-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the article text here (minimum 100 characters)..."
              className="font-serif bg-background border-2 border-ink-dark focus:ring-ink-dark text-ink-dark min-h-32"
              disabled={isLoading}
            />
            <p className="text-xs text-ink-medium mt-1 font-serif">
              {text.length} characters (minimum 100 required)
            </p>
          </div>
        )}
        
        <div className="flex justify-center">
          <Button 
            type="submit" 
            disabled={isLoading || (inputMode === 'url' ? !url.trim() : !text.trim() || text.trim().length < 100)}
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
          {inputMode === 'url' 
            ? "Enter any news article URL to generate a 60-word summary, or switch to text mode if URL fails"
            : "Paste article text directly to generate a 60-word summary (useful when URL extraction fails)"
          }
        </p>
      </form>
    </div>
  );
};