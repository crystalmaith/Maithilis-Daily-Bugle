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
      <div className="border-2 border-ink-dark bg-background p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-ink-dark">
          <Key className="w-5 h-5" />
          <span className="font-serif font-bold uppercase tracking-wide">API Key Configured</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-ink-dark bg-background p-6">
      {/* Newspaper section header */}
      <div className="border-b-2 border-ink-dark pb-3 mb-6">
        <h3 className="text-xl font-newspaper font-bold text-ink-dark text-center uppercase tracking-wide">
          Configure News Service
        </h3>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="h-px bg-ink-dark flex-1"></div>
          <Key className="w-4 h-4 text-ink-dark" />
          <div className="h-px bg-ink-dark flex-1"></div>
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-ink-medium font-serif">
          Enter your Google Gemini API key to enable article summarization service.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-serif font-bold text-ink-dark mb-2 uppercase tracking-wide">
            Gemini API Key:
          </label>
          <Input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API key..."
            className="font-serif bg-background border-2 border-ink-dark focus:ring-ink-dark pr-12"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-8 h-8 w-8 p-0"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>

        <div className="flex justify-center">
          <Button 
            type="submit" 
            disabled={!apiKey.trim()}
            className="bg-ink-dark hover:bg-ink-medium text-background font-serif px-8 py-3 text-lg font-bold uppercase tracking-wide border-2 border-ink-dark"
          >
            Configure Service
          </Button>
        </div>
      </form>

      <div className="mt-6 border border-ink-dark bg-paper-gradient p-4">
        <h4 className="font-serif font-bold text-ink-dark mb-2 uppercase tracking-wide text-sm">
          How to obtain API key:
        </h4>
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
          className="inline-flex items-center gap-2 mt-3 text-ink-dark hover:text-ink-medium transition-colors underline font-serif font-bold"
        >
          <ExternalLink className="w-4 h-4" />
          Get API Key
        </a>
      </div>

      <p className="text-xs text-ink-medium mt-4 font-serif text-center border-t border-ink-dark pt-3 italic">
        Your API key is stored locally and never leaves your browser.
      </p>
    </div>
  );
};