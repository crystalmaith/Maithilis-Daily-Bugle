import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ArticleInput } from '@/components/ArticleInput';
import { SummaryDisplay } from '@/components/SummaryDisplay';
import { Archive } from '@/components/Archive';
import { ApiKeyInput } from '@/components/ApiKeyInput';
import { ArticleSummarizer } from '@/utils/summarizer';
import { useToast } from '@/components/ui/use-toast';

interface ArchiveEntry {
  id: string;
  summary: string;
  url: string;
  timestamp: Date;
}

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [summarizer, setSummarizer] = useState<ArticleSummarizer | null>(null);
  const [currentSummary, setCurrentSummary] = useState<string>('');
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [archive, setArchive] = useState<ArchiveEntry[]>([]);
  const { toast } = useToast();

  // Load saved data on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('daily-bugle-api-key');
    const savedArchive = localStorage.getItem('daily-bugle-archive');
    const savedDarkMode = localStorage.getItem('daily-bugle-dark-mode');

    if (savedApiKey) {
      setApiKey(savedApiKey);
      setSummarizer(new ArticleSummarizer(savedApiKey));
    }

    if (savedArchive) {
      try {
        const parsed = JSON.parse(savedArchive);
        const entriesWithDates = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        setArchive(entriesWithDates);
      } catch (error) {
        console.error('Failed to parse saved archive:', error);
      }
    }

    if (savedDarkMode === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const handleToggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('daily-bugle-dark-mode', newMode.toString());
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Set API key
  const handleApiKeySet = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('daily-bugle-api-key', newApiKey);
    setSummarizer(new ArticleSummarizer(newApiKey));
    
    toast({
      title: "API Key Set",
      description: "You can now summarize articles!",
    });
  };

  // Summarize article from URL
  const handleSummarize = async (url: string) => {
    if (!summarizer) {
      toast({
        title: "Error",
        description: "Please configure your API key first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setCurrentSummary('');
    setCurrentUrl(url);

    try {
      const result = await summarizer.summarizeArticle(url);
      
      if (result.success && result.summary) {
        setCurrentSummary(result.summary);
        setCurrentUrl(url);
      } else {
        toast({
          title: "URL Extraction Failed",
          description: `${result.error || "Unable to process the article."} Try using the text input option instead.`,
          variant: "destructive",
        });
        setCurrentSummary('');
        setCurrentUrl('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Try the text input option.",
        variant: "destructive",
      });
      setCurrentSummary('');
      setCurrentUrl('');
    } finally {
      setIsLoading(false);
    }
  };

  // Summarize text directly
  const handleSummarizeText = async (text: string) => {
    if (!summarizer) {
      toast({
        title: "Error",
        description: "Please configure your API key first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setCurrentSummary('');
    setCurrentUrl('direct-text');

    try {
      const result = await summarizer.summarizeText(text);
      
      if (result.success && result.summary) {
        setCurrentSummary(result.summary);
        setCurrentUrl('direct-text');
      } else {
        toast({
          title: "Text Summarization Failed",
          description: result.error || "Unable to process the text.",
          variant: "destructive",
        });
        setCurrentSummary('');
        setCurrentUrl('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      setCurrentSummary('');
      setCurrentUrl('');
    } finally {
      setIsLoading(false);
    }
  };

  // Save to archive
  const handleSaveToArchive = (summary: string, url: string) => {
    const newEntry: ArchiveEntry = {
      id: Date.now().toString(),
      summary,
      url: url === 'direct-text' ? 'Direct Text Input' : url,
      timestamp: new Date(),
    };

    const updatedArchive = [newEntry, ...archive];
    setArchive(updatedArchive);
    localStorage.setItem('daily-bugle-archive', JSON.stringify(updatedArchive));
  };

  // Delete from archive
  const handleDeleteFromArchive = (id: string) => {
    const updatedArchive = archive.filter(entry => entry.id !== id);
    setArchive(updatedArchive);
    localStorage.setItem('daily-bugle-archive', JSON.stringify(updatedArchive));
  };

  return (
    <div className="min-h-screen bg-paper-gradient">
      <Header isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />
      
      {/* Newspaper Content Area */}
      <main className="max-w-6xl mx-auto bg-paper-gradient border-l-2 border-r-2 border-ink-dark min-h-screen">
        {/* Content columns like a real newspaper */}
        <div className="border-b-2 border-ink-dark p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-newspaper font-bold text-ink-dark border-b border-ink-dark inline-block px-4 pb-1">
              NEWS DIGEST SERVICE
            </h2>
            <p className="text-ink-medium font-serif mt-2 italic">
              Submit any article URL for instant 60-word editorial summary
            </p>
          </div>
          
          {!apiKey ? (
            <ApiKeyInput onApiKeySet={handleApiKeySet} hasApiKey={!!apiKey} />
          ) : (
            <div className="space-y-8">
              <ArticleInput onSummarize={handleSummarize} onSummarizeText={handleSummarizeText} isLoading={isLoading} />
              
              {currentSummary && (
                <SummaryDisplay
                  summary={currentSummary}
                  originalUrl={currentUrl}
                  isVisible={!!currentSummary}
                  onSaveToArchive={handleSaveToArchive}
                />
              )}
              
              <Archive 
                entries={archive}
                onDeleteEntry={handleDeleteFromArchive}
              />
            </div>
          )}
        </div>
      </main>
      
      {/* Newspaper Footer */}
      <footer className="max-w-6xl mx-auto bg-paper-gradient border-2 border-t-0 border-ink-dark">
        <div className="border-t-2 border-ink-dark p-4 text-center">
          <p className="text-ink-medium font-serif text-sm">
            © 2025 The Daily Bugle • All Rights Reserved • Published Daily in the Digital Age
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
