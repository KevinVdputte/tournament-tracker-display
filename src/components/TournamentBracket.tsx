import React, { useState, useEffect } from 'react';
import { TournamentBracketProps, Match, Team } from '@/types/tournament';
import MatchCard from './MatchCard';
import RoundHeader from './RoundHeader';
import { Trophy } from 'lucide-react';

const TournamentBracket: React.FC<TournamentBracketProps> = ({
  tournamentData,
  onSelectWinner
}) => {
  const [activeMatches, setActiveMatches] = useState<string[]>([]);
  const [localFinalTeams, setLocalFinalTeams] = useState<{teamA?: Team, teamB?: Team} | null>(null);

  // Determine active matches whenever the tournament data changes
  useEffect(() => {
    // Get matches from the current round
    const currentRoundMatches = tournamentData.rounds[tournamentData.currentRound]?.matches || [];
    let newActiveMatches = currentRoundMatches
      .filter(match => match.teamA && match.teamB && !match.winner)
      .map(match => match.id);
    
    // Always check if there's a final match that should be active
    const finalRound = tournamentData.rounds.find(r => r.id === 3);
    if (finalRound) {
      const finalMatches = finalRound.matches
        .filter(match => match.teamA && match.teamB && !match.winner)
        .map(match => match.id);
      
      // Add final matches to the active matches if they're not already included
      finalMatches.forEach(matchId => {
        if (!newActiveMatches.includes(matchId)) {
          newActiveMatches.push(matchId);
        }
      });
      
      if (finalMatches.length > 0) {
        console.log("Active final matches:", finalMatches);
      }
    }
    
    // Log current state for debugging
    console.log("Current round:", tournamentData.currentRound);
    console.log("Active matches:", newActiveMatches);
    
    setActiveMatches(newActiveMatches);
  }, [tournamentData]);

  // Check for semifinal winners and update the final match if needed
  useEffect(() => {
    // Find the semifinal matches
    const semifinalRound = tournamentData.rounds.find(r => r.id === 2);
    if (!semifinalRound) return;
    
    const leftSemifinal = semifinalRound.matches.find(m => m.side === 'left');
    const rightSemifinal = semifinalRound.matches.find(m => m.side === 'right');
    
    // Find the final match
    const finalRound = tournamentData.rounds.find(r => r.id === 3);
    if (!finalRound || finalRound.matches.length === 0) return;
    
    const finalMatch = finalRound.matches[0];
    
    // If both semifinal winners exist but final match doesn't have teams set,
    // update our local state to ensure the UI shows the finalists
    if (leftSemifinal?.winner && rightSemifinal?.winner) {
      const isFinalistsSetInMatch = finalMatch.teamA && finalMatch.teamB;
      
      if (!isFinalistsSetInMatch) {
        console.log("Setting local final teams from semifinal winners:", {
          teamA: leftSemifinal.winner?.name,
          teamB: rightSemifinal.winner?.name
        });
        
        setLocalFinalTeams({
          teamA: leftSemifinal.winner,
          teamB: rightSemifinal.winner
        });
      } else {
        // If the final match already has teams set, clear our local state
        setLocalFinalTeams(null);
      }
    }
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

  // Find the final match to check for a winner - use the round index dynamically
  // Look in round 3 for the final match with id 'match-4-0'
  const finalMatch = tournamentData.rounds.find(r => r.id === 3)?.matches?.find(m => m.id === 'match-4-0');
  const finalWinner = finalMatch?.winner;

  // Debug logging for final match to troubleshoot
  if (finalMatch) {
    console.log("Final match found:", {
      id: finalMatch.id,
      hasTeamA: !!finalMatch.teamA,
      hasTeamB: !!finalMatch.teamB,
      teamAName: finalMatch.teamA?.name || 'None',
      teamBName: finalMatch.teamB?.name || 'None',
      winner: finalMatch.winner?.name || 'None'
    });
  } else {
    console.log("No final match found in round 3 with id 'match-4-0'");
    
    // Log all rounds and their matches for debugging
    tournamentData.rounds.forEach(round => {
      console.log(`Round ${round.id} (${round.name}):`, 
        round.matches.map(m => ({ id: m.id, teamA: m.teamA?.name, teamB: m.teamB?.name }))
      );
    });
  }

  // Find semifinal matches - look in round with id 2
  const semifinalRound = tournamentData.rounds.find(r => r.id === 2);
  const leftSemifinal = semifinalRound?.matches?.find(m => m.side === 'left');
  const rightSemifinal = semifinalRound?.matches?.find(m => m.side === 'right');

  // Check for semifinal winners and their connection to finals
  if (leftSemifinal?.winner || rightSemifinal?.winner) {
    console.log("Semifinal winners found:", {
      leftWinner: leftSemifinal?.winner?.name || 'None',
      rightWinner: rightSemifinal?.winner?.name || 'None',
      leftNextMatchId: leftSemifinal?.nextMatchId || 'None',
      rightNextMatchId: rightSemifinal?.nextMatchId || 'None'
    });
    
    // Verify these winners are correctly assigned to the final match
    const finalRound = tournamentData.rounds.find(r => r.id === 3);
    const finalMatch = finalRound?.matches[0];
    
    if (finalMatch) {
      console.log("Final match teams:", {
        teamA: finalMatch.teamA?.name || 'None',
        teamB: finalMatch.teamB?.name || 'None',
        teamAId: finalMatch.teamA?.id || 'None',
        teamBId: finalMatch.teamB?.id || 'None',
        leftWinnerId: leftSemifinal?.winner?.id || 'None',
        rightWinnerId: rightSemifinal?.winner?.id || 'None',
        matchesLeftWinner: finalMatch.teamA?.id === leftSemifinal?.winner?.id,
        matchesRightWinner: finalMatch.teamB?.id === rightSemifinal?.winner?.id
      });
    }
  }

  // Check if the champion match is in the last round
  const championMatch = tournamentData.rounds[tournamentData.rounds.length - 1]?.matches[0];
  const championFromRound = championMatch?.winner;

  // Debug console logging
  console.log("Current Round:", tournamentData.currentRound);
  console.log("Left Semifinal:", leftSemifinal ? {
    id: leftSemifinal.id,
    teamA: leftSemifinal.teamA?.name || 'None',
    teamB: leftSemifinal.teamB?.name || 'None',
    winner: leftSemifinal.winner?.name || 'None'
  } : 'None');
  console.log("Right Semifinal:", rightSemifinal ? {
    id: rightSemifinal.id,
    teamA: rightSemifinal.teamA?.name || 'None',
    teamB: rightSemifinal.teamB?.name || 'None',
    winner: rightSemifinal.winner?.name || 'None'
  } : 'None');
  console.log("Final Match:", finalMatch ? {
    id: finalMatch.id,
    teamA: finalMatch.teamA?.name || 'None',
    teamB: finalMatch.teamB?.name || 'None',
    winner: finalMatch.winner?.name || 'None',
    round: finalMatch.round,
    position: finalMatch.position,
    side: finalMatch.side
  } : 'None');

  if (finalWinner) {
    console.log('Final match winner:', finalWinner.name);
  }

  if (championFromRound) {
    console.log('Champion from round:', championFromRound.name);
  }
  
  // Check if all rounds are properly set up
  tournamentData.rounds.forEach((round, idx) => {
    console.log(`Round ${idx} (ID: ${round.id}): ${round.name}`, {
      matches: round.matches.length,
      firstMatch: round.matches[0] ? {
        id: round.matches[0].id,
        teamA: round.matches[0].teamA?.name || 'None',
        teamB: round.matches[0].teamB?.name || 'None'
      } : 'No matches'
    });
  });

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
                {(() => {
                  // Get the final round explicitly
                  const finalsRound = tournamentData.rounds.find(r => r.id === 3);
                  
                  if (!finalsRound || finalsRound.matches.length === 0) {
                    console.error("Finals round not found or has no matches");
                    return null;
                  }
                  
                  // Get the first (and should be only) match from the finals round
                  const finalMatch = finalsRound.matches[0];
                  
                  // If we have local final teams but the match doesn't have teams set, use our local state
                  const displayMatch = {
                    ...finalMatch,
                    teamA: finalMatch.teamA || localFinalTeams?.teamA,
                    teamB: finalMatch.teamB || localFinalTeams?.teamB
                  };
                  
                  console.log("Rendering final match:", {
                    id: displayMatch.id,
                    teamA: displayMatch.teamA?.name || 'None',
                    teamB: displayMatch.teamB?.name || 'None',
                    hasTeamA: !!displayMatch.teamA,
                    hasTeamB: !!displayMatch.teamB,
                    winner: displayMatch.winner?.name || 'None',
                    usingLocalTeams: !finalMatch.teamA && !!localFinalTeams
                  });
                  
                  // Check if the final match should be interactive
                  const isInteractive = displayMatch.teamA && 
                                        displayMatch.teamB && 
                                        !displayMatch.winner && 
                                        tournamentData.currentRound >= 3;
                  
                  return (
                    <div key={displayMatch.id} className="relative">
                      <MatchCard
                        match={displayMatch}
                        onSelectWinner={onSelectWinner}
                        isActive={isInteractive}
                      />
                      {/* Add highlighted border if finalists are set */}
                      {displayMatch.teamA && displayMatch.teamB && (
                        <div 
                          className="absolute inset-0 rounded-lg border-2 border-tournament-accent/50 pointer-events-none"
                          style={{ 
                            transform: 'scale(1.05)',
                            opacity: 0.5,
                            boxShadow: '0 0 15px rgba(var(--tournament-accent-rgb), 0.3)'
                          }}
                        />
                      )}
                    </div>
                  );
                })()}
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
        
        {/* Debug champion display */}
        <div style={{ display: 'none' }}>
          {(() => {
            console.log("Champion display conditions:", {
              hasTournamentChampion: !!tournamentData.champion,
              hasChampionFromRound: !!championFromRound,
              hasFinalWinner: !!finalWinner,
              tournamentChampion: tournamentData.champion?.name || 'None',
              championFromRound: championFromRound?.name || 'None',
              finalWinnerName: finalWinner?.name || 'None',
              finalMatchId: finalMatch?.id || 'No final match',
              shouldShowChampion: !!(tournamentData.champion || championFromRound || finalWinner)
            });
            return null;
          })()}
        </div>
        
        {/* Champion Display */}
        <div className="flex justify-center mt-20">
          <div className="text-center">
            <div className="glass-panel shadow-lg p-4 rounded-lg mb-2">
              {(() => {
                // Check multiple possible sources for the champion
                const tournamentChampion = tournamentData.champion;
                
                // Find the final match to check for a winner
                const finalRound = tournamentData.rounds.find(r => r.id === 3);
                const finalMatch = finalRound?.matches[0];
                const finalWinner = finalMatch?.winner;
                
                // Find the champion round match
                const championRound = tournamentData.rounds.find(r => r.id === 4);
                const championMatch = championRound?.matches[0];
                const championFromMatch = championMatch?.teamA || championMatch?.winner;
                
                // Use the first available champion source
                const champion = tournamentChampion || finalWinner || championFromMatch;
                
                console.log("Champion detection:", {
                  hasTournamentChampion: !!tournamentChampion,
                  hasFinalWinner: !!finalWinner, 
                  hasChampionFromMatch: !!championFromMatch,
                  tournamentChampionName: tournamentChampion?.name || 'None',
                  finalWinnerName: finalWinner?.name || 'None',
                  championFromMatchName: championFromMatch?.name || 'None',
                  isDisplayingChampion: !!champion
                });
                
                return (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-tournament-accent/10 mb-2">
                      <Trophy size={16} className="text-tournament-accent" />
                    </div>
                    <div className="font-bold text-lg">
                      {champion ? champion.name : "Determining Champion..."}
                    </div>
                  </div>
                );
              })()}
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Champion</div>
            </div>
          </div>
        </div>
        
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
