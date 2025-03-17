
import React, { useState, useEffect } from 'react';
import { TournamentBracketProps, Match } from '@/types/tournament';
import MatchCard from './MatchCard';
import RoundHeader from './RoundHeader';

const TournamentBracket: React.FC<TournamentBracketProps> = ({
  tournamentData,
  onSelectWinner
}) => {
  const [activeMatches, setActiveMatches] = useState<string[]>([]);

  // Determine active matches whenever the tournament data changes
  useEffect(() => {
    const currentRoundMatches = tournamentData.rounds[tournamentData.currentRound]?.matches || [];
    const newActiveMatches = currentRoundMatches
      .filter(match => match.teamA && match.teamB && !match.winner)
      .map(match => match.id);
    
    setActiveMatches(newActiveMatches);
  }, [tournamentData]);

  return (
    <div className="w-full overflow-x-auto py-6">
      <div className="min-w-[960px] px-4">
        <div className="flex justify-between">
          {tournamentData.rounds.map((round) => (
            <div 
              key={round.id} 
              className="flex-1 px-2"
              style={{
                // Adjust vertical position for rounds to create the tournament bracket shape
                marginTop: getMarginForRound(round.id, tournamentData.rounds.length),
                opacity: round.id < tournamentData.currentRound ? 0.7 : 1
              }}
            >
              <RoundHeader 
                name={round.name} 
                matchCount={round.matches.length}
              />
              
              <div className="space-y-6 relative">
                {round.matches.map((match) => (
                  <div 
                    key={match.id}
                    className="relative"
                    style={{
                      marginBottom: getSpacingForMatch(round.id, tournamentData.rounds.length)
                    }}
                  >
                    <MatchCard
                      match={match}
                      onSelectWinner={onSelectWinner}
                      isActive={activeMatches.includes(match.id)}
                    />
                    {renderConnectingLines(match, round.id, tournamentData.rounds.length)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to get the vertical spacing between matches in a round
function getSpacingForMatch(roundId: number, totalRounds: number): string {
  // First round has no spacing
  if (roundId === 0) return '12px';
  
  // Calculate spacing based on round number
  const baseSpacing = 24;
  const multiplier = Math.pow(2, roundId);
  return `${baseSpacing * multiplier}px`;
}

// Helper function to get the top margin for a round
function getMarginForRound(roundId: number, totalRounds: number): string {
  if (roundId === 0) return '0px';
  
  // First round has no margin, subsequent rounds increase
  const spacing = 30 * Math.pow(2, roundId - 1);
  return `${spacing}px`;
}

// Helper function to render connecting lines between matches
function renderConnectingLines(match: Match, roundId: number, totalRounds: number) {
  // Don't render lines for the first round
  if (roundId === 0) return null;
  
  return (
    <div className="tournament-lines">
      {/* Horizontal line */}
      <div 
        className="tournament-line"
        style={{
          top: '50%',
          right: '100%',
        }}
      />
      
      {/* Render vertical line for rounds after the first one */}
      {roundId > 1 && (
        <div 
          className="tournament-vertical-line"
          style={{
            top: '-50%',
            left: '-8px',
            height: '100%',
          }}
        />
      )}
    </div>
  );
}

export default TournamentBracket;
