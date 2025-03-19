import React, { useState, useEffect } from 'react';
import { TournamentBracketProps, Match } from '@/types/tournament';
import MatchCard from './MatchCard';
import RoundHeader from './RoundHeader';
import { Trophy } from 'lucide-react';

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

  // Split rounds into left, center and right sections
  const leftRounds = tournamentData.rounds.slice(0, -1);
  const rightRounds = [...tournamentData.rounds.slice(0, -1)];
  const finalRound = tournamentData.rounds[tournamentData.rounds.length - 1];

  // Debug log to check if champion exists
  console.log('Tournament data:', {
    currentRound: tournamentData.currentRound,
    isComplete: tournamentData.isComplete,
    champion: tournamentData.champion ? tournamentData.champion.name : 'No champion',
    rounds: tournamentData.rounds.map(r => ({
      name: r.name,
      matchCount: r.matches.length
    }))
  });

  // Find the final match to check for a winner
  const finalMatch = tournamentData.rounds[3]?.matches?.find(m => m.id === 'match-4-0');
  const finalWinner = finalMatch?.winner;

  // Find semifinal matches
  const leftSemifinal = tournamentData.rounds[2]?.matches?.find(m => m.side === 'left');
  const rightSemifinal = tournamentData.rounds[2]?.matches?.find(m => m.side === 'right');

  // Check if the champion match is in the last round
  const championMatch = tournamentData.rounds[tournamentData.rounds.length - 1]?.matches[0];
  const championFromRound = championMatch?.winner;

  // Debug console logging
  console.log("Current Round:", tournamentData.currentRound);
  console.log("Left Semifinal:", leftSemifinal ? {
    teamA: leftSemifinal.teamA?.name || 'None',
    teamB: leftSemifinal.teamB?.name || 'None',
    winner: leftSemifinal.winner?.name || 'None'
  } : 'None');
  console.log("Right Semifinal:", rightSemifinal ? {
    teamA: rightSemifinal.teamA?.name || 'None',
    teamB: rightSemifinal.teamB?.name || 'None',
    winner: rightSemifinal.winner?.name || 'None'
  } : 'None');
  console.log("Final Match:", finalMatch ? {
    teamA: finalMatch.teamA?.name || 'None',
    teamB: finalMatch.teamB?.name || 'None',
    winner: finalMatch.winner?.name || 'None'
  } : 'None');

  if (finalWinner) {
    console.log('Final match winner:', finalWinner.name);
  }

  if (championFromRound) {
    console.log('Champion from round:', championFromRound.name);
  }

  return (
    <div className="w-full overflow-x-auto py-6">
      <div className="min-w-[960px] px-4">
        <div className="flex">
          {/* Left side of the bracket */}
          <div className="flex-1 flex justify-end">
            {leftRounds.map((round) => {
              // Only get matches for the left side
              const leftMatches = round.matches.filter(match => match.side === 'left');
              
              if (leftMatches.length === 0) return null;
              
              return (
                <div 
                  key={round.id} 
                  className="px-2 flex-1 max-w-[200px]"
                  style={{
                    marginTop: getMarginForRound(round.id, tournamentData.rounds.length),
                    opacity: round.id < tournamentData.currentRound ? 0.7 : 1
                  }}
                >
                  <RoundHeader 
                    name={round.name} 
                    matchCount={leftMatches.length}
                  />
                  
                  <div className="space-y-6 relative">
                    {leftMatches.map((match) => (
                      <div 
                        key={match.id}
                        className="relative"
                        style={{
                          marginBottom: getSpacingForMatch(round.id, match.position, 'left'),
                          marginTop: getTopMarginForMatch(round.id, match.position, 'left')
                        }}
                      >
                        <MatchCard
                          match={match}
                          onSelectWinner={onSelectWinner}
                          isActive={activeMatches.includes(match.id)}
                        />
                        {renderConnectingLines(match, round.id, 'left')}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Center/Finals */}
          <div className="px-2 flex-shrink-0 w-[200px]">
            <div 
              style={{
                marginTop: getMarginForRound(finalRound.id, tournamentData.rounds.length),
              }}
            >
              <RoundHeader 
                name={finalRound.name} 
                matchCount={1}
              />
              
              <div className="space-y-6 relative">
                {finalRound.matches.map((match) => (
                  <div 
                    key={match.id}
                    className="relative"
                  >
                    <MatchCard
                      match={match}
                      onSelectWinner={onSelectWinner}
                      isActive={activeMatches.includes(match.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right side of the bracket - reversed order to mirror left side */}
          <div className="flex-1 flex flex-row-reverse">
            {rightRounds.map((round) => {
              // Only get matches for the right side
              const rightMatches = round.matches.filter(match => match.side === 'right');
              
              if (rightMatches.length === 0) return null;
              
              return (
                <div 
                  key={round.id} 
                  className="px-2 flex-1 max-w-[200px]"
                  style={{
                    marginTop: getMarginForRound(round.id, tournamentData.rounds.length),
                    opacity: round.id < tournamentData.currentRound ? 0.7 : 1
                  }}
                >
                  <RoundHeader 
                    name={round.name} 
                    matchCount={rightMatches.length}
                  />
                  
                  <div className="space-y-6 relative">
                    {rightMatches.map((match) => (
                      <div 
                        key={match.id}
                        className="relative"
                        style={{
                          marginBottom: getSpacingForMatch(round.id, match.position, 'right'),
                          marginTop: getTopMarginForMatch(round.id, match.position, 'right')
                        }}
                      >
                        <MatchCard
                          match={match}
                          onSelectWinner={onSelectWinner}
                          isActive={activeMatches.includes(match.id)}
                        />
                        {renderConnectingLines(match, round.id, 'right')}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Champion Display */}
        {(tournamentData.champion || championFromRound || finalWinner) && (
          <div className="flex justify-center mt-20">
            <div className="text-center">
              <div className="glass-panel shadow-lg p-4 rounded-lg mb-2">
                {(() => {
                  // Get the champion from various possible sources
                  const champion = tournamentData.champion || 
                                  championFromRound || 
                                  finalWinner;
                  
                  if (!champion) {
                    return (
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-tournament-accent/10 mb-2">
                          <Trophy size={16} className="text-tournament-accent" />
                        </div>
                        <div className="font-bold text-lg">Determining Champion...</div>
                      </div>
                    );
                  }
                  
                  // Display the champion's name
                  return (
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-tournament-accent/10 mb-2">
                        <Trophy size={16} className="text-tournament-accent" />
                      </div>
                      <div className="font-bold text-lg">{champion.name}</div>
                    </div>
                  );
                })()}
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Champion</div>
              </div>
            </div>
          </div>
        )}
        
        {/* SO black.png logo at the bottom */}
        <div className="flex justify-center mt-12 mb-6">
          <div className="w-[30%] min-w-[300px] max-w-[600px]">
            <div style={{ position: 'relative', width: '100%', height: '100px' }}>
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
                  console.error('Logo image load error');
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get the vertical spacing between matches in a round
function getSpacingForMatch(roundId: number, position: number, side?: string): string {
  // First round has consistent spacing
  if (roundId === 0) return '12px';
  
  // Special handling for the wildcard match
  if (roundId === 2 && position === 2) {
    return '40px'; // Give appropriate space for the wildcard match
  }
  
  // Calculate spacing based on round number and side
  const baseSpacing = 24;
  const multiplier = Math.pow(2, roundId);
  const spacing = baseSpacing * multiplier;
  
  // Adjust spacing for right side matches to ensure proper alignment
  if (side === 'right' && roundId > 0) {
    return `${spacing + 8}px`; // Add a small offset for right side matches
  }
  
  return `${spacing}px`;
}

// Helper function to get additional top margin for specific matches
function getTopMarginForMatch(roundId: number, position: number, side?: string): string {
  // Special handling for the wildcard match
  if (roundId === 2 && position === 2) {
    return '60px'; // Position the wildcard match vertically centered
  }
  
  // For the semi-final and final rounds
  if (roundId === 3) {
    return '40px'; // Give space for the semi-final
  }
  
  if (roundId === 4) {
    return '40px'; // Position the final match nicely
  }
  
  // Adjust top margin for right side matches in first round
  if (roundId === 0 && side === 'right') {
    return '12px'; // Add a small offset for right side matches
  }
  
  return '0px';
}

// Helper function to get the top margin for a round
function getMarginForRound(roundId: number, totalRounds: number): string {
  if (roundId === 0) return '0px';
  
  // Special handling for the champion display
  if (roundId === totalRounds - 1) {
    return '120px'; // Position the champion display nicely
  }
  
  // First round has no margin, subsequent rounds increase
  const spacing = 30 * Math.pow(2, roundId - 1);
  return `${spacing}px`;
}

// Helper function to render connecting lines between matches
function renderConnectingLines(match: Match, roundId: number, side?: string) {
  // Don't render lines for the first round
  if (roundId === 0) return null;
  
  // Special handling for center matches
  if (side === 'center') {
    return (
      <div className="tournament-lines" data-side="center">
        <div 
          className="tournament-line-horizontal"
          style={{
            top: '50%',
            right: '100%',
            width: '20px'
          }}
        />
        <div 
          className="tournament-line-horizontal"
          style={{
            top: '50%',
            left: '100%',
            width: '20px'
          }}
        />
      </div>
    );
  }
  
  return (
    <div className="tournament-lines" data-side={side}>
      {/* Horizontal line */}
      <div 
        className="tournament-line"
        style={{
          top: '50%',
          width: '12px'
        }}
      />
      
      {/* Render vertical line for rounds after the first one */}
      {roundId > 1 && (
        <div 
          className="tournament-vertical-line"
          style={{
            top: '-50%',
            height: '100%',
          }}
        />
      )}
    </div>
  );
}

export default TournamentBracket;
