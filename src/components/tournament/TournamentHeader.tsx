import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TournamentStage } from '@/types/tournament';
import { useTournament } from '@/contexts/TournamentContext';

const TournamentHeader: React.FC = () => {
  const { stage, tournamentData, handleReset } = useTournament();

  return (
    <header className="border-b border-border/50">
      <div className="container mx-auto py-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {stage !== TournamentStage.SETUP && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="mr-2"
            >
              <ArrowLeft size={18} />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-tournament-accent/10">
              <Trophy size={16} className="text-tournament-accent" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">Solar Olympiad Finalists</h1>
          </div>
        </div>
        
        {stage === TournamentStage.RUNNING && tournamentData && (
          <div className="flex items-center">
            <span className={cn(
              "text-xs uppercase tracking-wider px-2 py-1 rounded-full",
              "bg-tournament-accent/10 text-tournament-accent font-medium"
            )}>
              Round {tournamentData.currentRound + 1}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default TournamentHeader;
