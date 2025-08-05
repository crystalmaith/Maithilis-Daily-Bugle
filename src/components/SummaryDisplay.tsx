import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Save, Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SummaryDisplayProps {
  summary: string;
  originalUrl: string;
  isVisible: boolean;
  onSaveToArchive: (summary: string, url: string) => void;
}

export const SummaryDisplay = ({ summary, originalUrl, isVisible, onSaveToArchive }: SummaryDisplayProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Typewriter effect
  useEffect(() => {
    if (isVisible && summary) {
      setIsTyping(true);
      setDisplayedText('');
      
      let currentIndex = 0;
      const typeInterval = setInterval(() => {
        if (currentIndex < summary.length) {
          setDisplayedText(summary.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typeInterval);
        }
      }, 30); // Typewriter speed

      return () => clearInterval(typeInterval);
    }
  }, [summary, isVisible]);

  const wordCount = summary.split(' ').filter(word => word.length > 0).length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Summary copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    onSaveToArchive(summary, originalUrl);
    toast({
      title: "Saved!",
      description: "Summary added to archive",
    });
  };

  if (!isVisible || !summary) return null;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 animate-fade-in-text">
      {/* Rustic paper summary box */}
      <div className="relative bg-paper-gradient rounded-lg shadow-paper border-2 border-vintage-border p-8">
        {/* Word count badge */}
        <Badge 
          variant="outline" 
          className="absolute -top-3 right-4 bg-ink-dark text-primary-foreground font-serif border-vintage-border"
        >
          {wordCount} words
        </Badge>

        {/* Summary text with typewriter effect */}
        <div className="mb-6">
          <h3 className="text-lg font-newspaper font-bold text-ink-dark mb-4 border-b border-vintage-border pb-2">
            Editorial Summary
          </h3>
          
          <div className="relative">
            <p className="text-ink-dark font-serif leading-relaxed text-lg">
              {displayedText}
              {isTyping && (
                <span className="inline-block w-0.5 h-5 bg-ink-dark ml-1 animate-pulse"></span>
              )}
            </p>
          </div>
        </div>

        {/* Source URL */}
        <div className="border-t border-vintage-border pt-4 mb-4">
          <p className="text-sm text-ink-medium font-serif">
            <span className="font-semibold">Source:</span>{' '}
            <a 
              href={originalUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-ink-dark transition-colors"
            >
              {new URL(originalUrl).hostname}
            </a>
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="font-serif border-vintage-border hover:bg-accent"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </>
            )}
          </Button>
          
          <Button
            onClick={handleSave}
            size="sm"
            className="bg-ink-dark hover:bg-ink-medium text-primary-foreground font-serif"
          >
            <Save className="w-4 h-4 mr-2" />
            Save to Archive
          </Button>
        </div>

        {/* Decorative corner elements */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-vintage-border opacity-50"></div>
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-vintage-border opacity-50"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-vintage-border opacity-50"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-vintage-border opacity-50"></div>
      </div>
    </div>
  );
};