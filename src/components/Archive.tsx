import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Archive as ArchiveIcon, Trash2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ArchiveEntry {
  id: string;
  summary: string;
  url: string;
  timestamp: Date;
}

interface ArchiveProps {
  entries: ArchiveEntry[];
  onDeleteEntry: (id: string) => void;
}

export const Archive = ({ entries, onDeleteEntry }: ArchiveProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    onDeleteEntry(id);
    toast({
      title: "Deleted",
      description: "Summary removed from archive",
    });
  };

  if (entries.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <Card className="bg-paper-gradient border-vintage-border p-8 text-center">
          <ArchiveIcon className="w-12 h-12 text-ink-medium mx-auto mb-4" />
          <h3 className="text-lg font-newspaper font-bold text-ink-dark mb-2">
            Archive Empty
          </h3>
          <p className="text-ink-medium font-serif">
            Your saved summaries will appear here. Start by summarizing an article above.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-paper-gradient rounded-lg shadow-paper border border-vintage-border p-6">
        {/* Archive header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ArchiveIcon className="w-6 h-6 text-ink-dark" />
            <h2 className="text-xl font-newspaper font-bold text-ink-dark">
              Archive ({entries.length})
            </h2>
          </div>
          
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            size="sm"
            className="font-serif border-vintage-border"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Expand
              </>
            )}
          </Button>
        </div>

        {/* Archive entries */}
        {isExpanded && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {entries.map((entry) => (
              <Card 
                key={entry.id} 
                className="bg-background border-vintage-border p-4 hover:shadow-paper transition-shadow"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-ink-dark font-serif leading-relaxed mb-3">
                      {entry.summary}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-ink-medium">
                      <span className="font-serif">
                        {entry.timestamp.toLocaleDateString()} at {entry.timestamp.toLocaleTimeString()}
                      </span>
                      
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-ink-dark transition-colors underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {new URL(entry.url).hostname}
                      </a>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleDelete(entry.id)}
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};