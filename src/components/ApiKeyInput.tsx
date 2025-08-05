import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Key, Eye, EyeOff, ExternalLink } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
  hasApiKey: boolean;
}

export const ApiKeyInput = ({ onApiKeySet, hasApiKey }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySet(apiKey.trim());
      setApiKey('');
    }
  };

  if (hasApiKey) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <Card className="bg-paper-gradient border-vintage-border p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-ink-dark">
            <Key className="w-5 h-5" />
            <span className="font-serif">API Key Configured</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Card className="bg-paper-gradient border-vintage-border p-6">
        <div className="text-center mb-6">
          <Key className="w-12 h-12 text-ink-dark mx-auto mb-4" />
          <h2 className="text-xl font-newspaper font-bold text-ink-dark mb-2">
            Configure Gemini API Key
          </h2>
          <p className="text-ink-medium font-serif">
            Enter your Google Gemini API key to enable article summarization.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key..."
              className="font-serif bg-background border-vintage-border focus:ring-ink-dark pr-12"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>

          <Button 
            type="submit" 
            disabled={!apiKey.trim()}
            className="w-full bg-ink-dark hover:bg-ink-medium text-primary-foreground font-serif"
          >
            Set API Key
          </Button>
        </form>

        <div className="mt-6 p-4 bg-accent/50 rounded border border-vintage-border">
          <h3 className="font-serif font-semibold text-ink-dark mb-2">
            How to get your API key:
          </h3>
          <ol className="text-sm text-ink-medium font-serif space-y-1 list-decimal list-inside">
            <li>Visit Google AI Studio</li>
            <li>Sign in with your Google account</li>
            <li>Create a new API key</li>
            <li>Copy and paste it above</li>
          </ol>
          
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 text-ink-dark hover:text-ink-medium transition-colors underline font-serif"
          >
            <ExternalLink className="w-4 h-4" />
            Get API Key
          </a>
        </div>

        <p className="text-xs text-ink-medium mt-4 font-serif">
          Your API key is stored locally and never leaves your browser.
        </p>
      </Card>
    </div>
  );
};