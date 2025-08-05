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
    <div className="border-2 border-ink-dark bg-background p-6 animate-fade-in-text">
      {/* Newspaper article header */}
      <div className="border-b-2 border-ink-dark pb-3 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-newspaper font-bold text-ink-dark uppercase tracking-wide">
            Editorial Summary
          </h3>
          <Badge 
            variant="outline" 
            className="bg-ink-dark text-background font-serif border-ink-dark font-bold"
          >
            {wordCount} WORDS
          </Badge>
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="h-px bg-ink-dark flex-1"></div>
          <div className="w-2 h-2 bg-ink-dark transform rotate-45"></div>
          <div className="h-px bg-ink-dark flex-1"></div>
        </div>
      </div>

      {/* Summary text with typewriter effect */}
      <div className="mb-6">
        <div className="relative bg-paper-gradient border border-ink-dark p-4">
          <p className="text-ink-dark font-serif leading-relaxed text-lg text-justify">
            {displayedText}
            {isTyping && (
              <span className="inline-block w-0.5 h-5 bg-ink-dark ml-1 animate-pulse"></span>
            )}
          </p>
        </div>
      </div>

      {/* Source information */}
      {originalUrl !== 'direct-text' && (
        <div className="border-t border-ink-dark pt-4 mb-4">
          <p className="text-sm text-ink-medium font-serif">
            <span className="font-bold uppercase tracking-wide">Source:</span>{' '}
            <a 
              href={originalUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-ink-dark transition-colors font-medium"
            >
              {new URL(originalUrl).hostname}
            </a>
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 justify-center border-t border-ink-dark pt-4">
        <Button
          onClick={handleCopy}
          variant="outline"
          className="font-serif border-2 border-ink-dark hover:bg-ink-dark hover:text-background font-bold uppercase tracking-wide"
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
          className="bg-ink-dark hover:bg-ink-medium text-background font-serif border-2 border-ink-dark font-bold uppercase tracking-wide"
        >
          <Save className="w-4 h-4 mr-2" />
          Archive Story
        </Button>
      </div>
    </div>
  );
};