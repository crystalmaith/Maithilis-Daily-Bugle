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
      <div className="border-2 border-ink-dark bg-background p-8">
        <div className="border-b-2 border-ink-dark pb-3 mb-6">
          <h3 className="text-xl font-newspaper font-bold text-ink-dark text-center uppercase tracking-wide">
            Story Archive
          </h3>
        </div>
        <div className="text-center">
          <ArchiveIcon className="w-12 h-12 text-ink-medium mx-auto mb-4" />
          <h4 className="text-lg font-newspaper font-bold text-ink-dark mb-2">
            Archive Empty
          </h4>
          <p className="text-ink-medium font-serif">
            Your saved summaries will appear here. Start by summarizing an article above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-ink-dark bg-background p-6">
      {/* Archive header */}
      <div className="border-b-2 border-ink-dark pb-3 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-newspaper font-bold text-ink-dark uppercase tracking-wide">
            Story Archive ({entries.length})
          </h3>
          
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            size="sm"
            className="font-serif border-2 border-ink-dark hover:bg-ink-dark hover:text-background font-bold uppercase"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show
              </>
            )}
          </Button>
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="h-px bg-ink-dark flex-1"></div>
          <ArchiveIcon className="w-4 h-4 text-ink-dark" />
          <div className="h-px bg-ink-dark flex-1"></div>
        </div>
      </div>

      {/* Archive entries */}
      {isExpanded && (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {entries.map((entry, index) => (
            <div 
              key={entry.id} 
              className="border border-ink-dark bg-paper-gradient p-4"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="text-sm font-serif font-bold text-ink-dark mb-2 uppercase tracking-wide">
                    Story #{entries.length - index}
                  </div>
                  
                  <p className="text-ink-dark font-serif leading-relaxed mb-3 text-justify">
                    {entry.summary}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-ink-medium font-serif border-t border-ink-dark pt-2">
                    <span>
                      {entry.timestamp.toLocaleDateString()} • {entry.timestamp.toLocaleTimeString()}
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
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground font-serif"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};