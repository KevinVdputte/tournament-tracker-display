import React, { useEffect } from 'react';
import { WinnerDisplayProps } from '@/types/tournament';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const WinnerDisplay: React.FC<WinnerDisplayProps> = ({ champion, onReset }) => {
  // Debug logging
  useEffect(() => {
    console.log('WinnerDisplay - Champion:', champion?.name);
  }, [champion]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div 
        className={cn(
          "max-w-md w-full mx-4 glass-panel rounded-xl p-6 sm:p-8 text-center",
          "animate-winner shadow-winner"
        )}
      >
        <div className="mb-6 staggered-fade-in">
          {champion.name === "SO black.png" ? (
            <div className="flex items-center justify-center mb-4" style={{ position: 'relative', height: '96px' }}>
              <img 
                src="/SO_transparent_fixed.png" 
                alt="SO Logo" 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  backgroundColor: 'transparent'
                }}
                onError={(e) => {
                  console.error('WinnerDisplay - Image load error');
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
          ) : (
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-tournament-accent/10 mb-4">
              <Trophy size={32} className="text-tournament-accent" />
            </div>
          )}
          
          <span className="text-sm uppercase tracking-widest text-muted-foreground font-medium block mb-1">
            Champion
          </span>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            {champion.name === "SO black.png" ? "SO" : champion.name}
          </h2>
          
          <p className="text-sm text-muted-foreground">
            Congratulations to the tournament winner!
          </p>
        </div>
        
        <Button 
          onClick={onReset}
          variant="outline"
          className="gap-2"
        >
          <RotateCcw size={14} />
          <span>New Tournament</span>
        </Button>
      </div>
    </div>
  );
};

export default WinnerDisplay;
