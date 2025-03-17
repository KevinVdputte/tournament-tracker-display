
import React, { useState } from 'react';
import { MatchDisplayProps, Team } from '@/types/tournament';
import { cn } from '@/lib/utils';
import { ChevronRight, Trophy } from 'lucide-react';

const MatchCard: React.FC<MatchDisplayProps> = ({ 
  match, 
  onSelectWinner,
  isActive
}) => {
  const [hoverTeam, setHoverTeam] = useState<string | null>(null);
  
  const handleWinnerSelection = (team: Team) => {
    if (!isActive) return;
    onSelectWinner(match.id, team.id);
  };

  if (!match.teamA && !match.teamB) {
    return (
      <div className="match-card glass-panel p-3 sm:p-4 rounded-lg mb-3 opacity-60">
        <div className="h-12 sm:h-16 flex items-center justify-center">
          <p className="text-xs sm:text-sm text-muted-foreground italic">Awaiting teams</p>
        </div>
      </div>
    );
  }

  const renderTeam = (team?: Team, isWinner?: boolean) => {
    const isHovered = team && hoverTeam === team.id;
    
    return (
      <div 
        className={cn(
          "px-3 py-2 rounded-md transition-all duration-200 cursor-pointer",
          isActive && "hover:bg-tournament-accent/5",
          isWinner && "bg-tournament-muted font-medium",
          isHovered && "bg-tournament-accent/10"
        )}
        onClick={() => team && isActive && handleWinnerSelection(team)}
        onMouseEnter={() => team && setHoverTeam(team.id)}
        onMouseLeave={() => setHoverTeam(null)}
      >
        <div className="flex items-center justify-between">
          <span className={cn(
            "truncate max-w-[130px] sm:max-w-[180px]",
            isWinner && "text-tournament-accent"
          )}>
            {team ? team.name : "TBD"}
          </span>
          {isWinner && (
            <Trophy size={14} className="text-tournament-accent ml-2 animate-pulse-light" />
          )}
          {isActive && isHovered && !isWinner && (
            <ChevronRight size={14} className="text-tournament-accent ml-2 animate-pulse-light" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "match-card glass-panel p-2 sm:p-3 rounded-lg mb-3 animate-scale-in",
      isActive && "active shadow-match",
      match.winner && "winner"
    )}>
      <div className="space-y-1">
        {renderTeam(match.teamA, match.winner?.id === match.teamA?.id)}
        {renderTeam(match.teamB, match.winner?.id === match.teamB?.id)}
      </div>
    </div>
  );
};

export default MatchCard;
