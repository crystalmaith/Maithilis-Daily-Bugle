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

  // Summarize article
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
          title: "Summarization Failed",
          description: result.error || "Unable to process the article.",
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
      url,
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
    <div className="min-h-screen bg-background">
      <Header isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {!apiKey ? (
          <ApiKeyInput onApiKeySet={handleApiKeySet} hasApiKey={!!apiKey} />
        ) : (
          <>
            <ArticleInput onSummarize={handleSummarize} isLoading={isLoading} />
            
            <SummaryDisplay
              summary={currentSummary}
              originalUrl={currentUrl}
              isVisible={!!currentSummary}
              onSaveToArchive={handleSaveToArchive}
            />
            
            <Archive 
              entries={archive}
              onDeleteEntry={handleDeleteFromArchive}
            />
          </>
        )}
      </main>
      
      <footer className="border-t border-vintage-border bg-paper-gradient py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-ink-medium font-serif text-sm">
            © 2024 The Daily Bugle - Classic Journalism, Modern Technology
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
