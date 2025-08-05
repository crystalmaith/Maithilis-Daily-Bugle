import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, RefreshCw, AlertTriangle } from 'lucide-react';

interface APIStatusIndicatorProps {
  isLoading: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export const APIStatusIndicator = ({ isLoading, hasError, errorMessage }: APIStatusIndicatorProps) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const isOverloadError = errorMessage?.includes('overloaded') || errorMessage?.includes('503');

  if (!isLoading && !hasError) {
    return null; // Don't show anything when everything is working
  }

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => setIsRetrying(false), 2000);
    window.location.reload();
  };

  return (
    <Card className="border-2 border-ink-dark bg-background p-4 mb-6">
      <div className="flex items-center gap-3">
        {isLoading ? (
          <>
            <RefreshCw className="w-5 h-5 text-ink-dark animate-spin" />
            <div>
              <h4 className="font-serif font-bold text-ink-dark uppercase tracking-wide text-sm">
                Processing Article
              </h4>
              <p className="text-ink-medium font-serif text-xs">
                Please wait while we extract and summarize the content...
              </p>
            </div>
          </>
        ) : isOverloadError ? (
          <>
            <Clock className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <h4 className="font-serif font-bold text-ink-dark uppercase tracking-wide text-sm">
                ⏳ Google AI Services Busy
              </h4>
              <p className="text-ink-medium font-serif text-xs mb-2">
                High traffic detected. This is temporary and affects all users globally.
              </p>
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                disabled={isRetrying}
                className="font-serif border-ink-dark hover:bg-ink-dark hover:text-background text-xs"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <div>
              <h4 className="font-serif font-bold text-ink-dark uppercase tracking-wide text-sm">
                Service Error
              </h4>
              <p className="text-ink-medium font-serif text-xs">
                {errorMessage || 'An unexpected error occurred'}
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};