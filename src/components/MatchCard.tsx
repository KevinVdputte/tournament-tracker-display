import React, { useState } from 'react';
import { MatchDisplayProps, Team } from '@/types/tournament';
import { cn } from '@/lib/utils';
import { ChevronRight, Trophy, RotateCcw } from 'lucide-react';

const MatchCard: React.FC<MatchDisplayProps> = ({ 
  match, 
  onSelectWinner,
  isActive
}) => {
  const [hoverTeam, setHoverTeam] = useState<string | null>(null);
  
  const handleWinnerSelection = (team: Team) => {
    // Always allow selection if both teams are present, even if the match is not marked as active
    // This ensures reverted matches can still be selected
    if ((!isActive && !match.winner) && (!match.teamA || !match.teamB)) return;
    
    // If team is already the winner, revert the selection
    if (match.winner && match.winner.id === team.id) {
      onSelectWinner(match.id, 'revert');
      return;
    }
    
    // Otherwise set team as winner
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
    const canRevert = isWinner && match.winner;
    
    return (
      <div 
        className={cn(
          "px-3 py-2 rounded-md transition-all duration-200 cursor-pointer",
          isActive && !isWinner && "hover:bg-tournament-accent/5",
          isWinner && "bg-tournament-muted font-medium",
          isWinner && isHovered && "bg-red-100/20",
          !isWinner && isHovered && "bg-tournament-accent/10"
        )}
        onClick={() => team && handleWinnerSelection(team)}
        onMouseEnter={() => team && setHoverTeam(team.id)}
        onMouseLeave={() => setHoverTeam(null)}
      >
        <div className="flex items-center justify-between">
          <span className={cn(
            "truncate max-w-[130px] sm:max-w-[180px]",
            isWinner && !isHovered && "text-tournament-accent",
            isWinner && isHovered && "text-red-500"
          )}>
            {team ? team.name : "TBD"}
          </span>
          {isWinner && (
            <div className="flex items-center ml-2">
              {isHovered ? (
                <div className="flex items-center gap-1 text-red-500 animate-pulse">
                  <RotateCcw size={14} />
                  <span className="text-xs">Revert</span>
                </div>
              ) : (
                <Trophy size={14} className="text-tournament-accent animate-pulse-light" />
              )}
            </div>
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
