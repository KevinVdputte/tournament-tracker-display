import React, { useState, useEffect } from 'react';
import { TournamentBracketProps, Match, Team } from '@/types/tournament';
import MatchCard from './MatchCard';
import RoundHeader from './RoundHeader';
import { Trophy, Medal } from 'lucide-react';

const TournamentBracket: React.FC<TournamentBracketProps> = ({
  tournamentData,
  onSelectWinner
}) => {
  const [activeMatches, setActiveMatches] = useState<string[]>([]);
  const [localFinalTeams, setLocalFinalTeams] = useState<{teamA?: Team, teamB?: Team} | null>(null);
  const [thirdPlaceMatch, setThirdPlaceMatch] = useState<Match | null>(null);

  // Determine active matches whenever the tournament data changes
  useEffect(() => {
    // Get matches from the current round
    const currentRoundMatches = tournamentData.rounds[tournamentData.currentRound]?.matches || [];
    
    // Matches without winners in the current round should be active
    let newActiveMatches = currentRoundMatches
      .filter(match => match.teamA && match.teamB && !match.winner)
      .map(match => match.id);
    
    // Add matches with winners that can be reverted (all completed matches)
    // We'll determine in the handler if they can actually be reverted
    const completedMatches = tournamentData.rounds
      .flatMap(round => round.matches)
      .filter(match => match.winner)
      .map(match => match.id);
    
    // Add final matches with both teams but no winner
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
    
    // Add 3rd place match to active matches if it exists and has no winner
    if (thirdPlaceMatch && thirdPlaceMatch.teamA && thirdPlaceMatch.teamB && !thirdPlaceMatch.winner) {
      if (!newActiveMatches.includes(thirdPlaceMatch.id)) {
        newActiveMatches.push(thirdPlaceMatch.id);
      }
      console.log("Adding 3rd place match to active matches:", thirdPlaceMatch.id);
    }
    
    // Add 3rd place match to completed matches if it has a winner
    if (thirdPlaceMatch && thirdPlaceMatch.winner) {
      if (!completedMatches.includes(thirdPlaceMatch.id)) {
        completedMatches.push(thirdPlaceMatch.id);
      }
    }
    
    // Log current state for debugging
    console.log("Current round:", tournamentData.currentRound);
    console.log("Active matches:", newActiveMatches);
    console.log("Completed matches (can be reverted):", completedMatches);
    
    // Combine active matches and completed matches that can be reverted
    setActiveMatches([...newActiveMatches, ...completedMatches]);
  }, [tournamentData, thirdPlaceMatch]);

  // Check for semifinal winners and update the final match if needed
  // Also create or update the third place match for semifinal losers
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
    
    // Create a 3rd place match as soon as at least one semifinal has a winner
    if (leftSemifinal?.winner || rightSemifinal?.winner) {
      // Determine semifinal losers based on available information
      let leftLoser, rightLoser;
      
      // For left semifinal
      if (leftSemifinal?.winner) {
        leftLoser = leftSemifinal.winner.id === leftSemifinal.teamA?.id 
          ? leftSemifinal.teamB 
          : leftSemifinal.teamA;
      }
      
      // For right semifinal
      if (rightSemifinal?.winner) {
        rightLoser = rightSemifinal.winner.id === rightSemifinal.teamA?.id 
          ? rightSemifinal.teamB 
          : rightSemifinal.teamA;
      }
      
      // Create 3rd place match with available losers
      setThirdPlaceMatch({
        id: 'match-3rd-place',
        round: 3, // Same round as finals
        position: 1, // Below the final match
        teamA: leftLoser,
        teamB: rightLoser,
        winner: undefined, // Reset winner if match is being updated
        side: 'center'
      });
      
      console.log("Setting up third place match with available semifinal losers:", {
        teamA: leftLoser?.name || 'Awaiting left semifinal result',
        teamB: rightLoser?.name || 'Awaiting right semifinal result'
      });
    }
    
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

  // Check if 3rd place match has been created
  if (thirdPlaceMatch) {
    console.log("Third place match:", {
      id: thirdPlaceMatch.id,
      teamA: thirdPlaceMatch.teamA?.name || 'None',
      teamB: thirdPlaceMatch.teamB?.name || 'None',
      winner: thirdPlaceMatch.winner?.name || 'None',
      isActive: activeMatches.includes(thirdPlaceMatch.id)
    });
  }

  return (
    <div className="w-full overflow-x-auto py-6">
      <div className="min-w-[960px] px-4 relative pb-[400px]">
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
                    <div>
                      {/* Final Match */}
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
                      
                      {/* 3rd Place Match - Directly under the finals */}
                      <div className="mt-8 mb-4">
                        <div className="text-xs text-muted-foreground mb-1 text-center">3rd Place Match</div>
                        <div className="relative" style={{ transform: 'scale(0.9)' }}>
                          {thirdPlaceMatch ? (
                            <MatchCard
                              match={thirdPlaceMatch}
                              onSelectWinner={(matchId, winnerId) => {
                                console.log("3rd place match selection:", { matchId, winnerId });
                                onSelectWinner(matchId, winnerId);
                                
                                // Update local state to maintain interactivity when winner is selected
                                if (thirdPlaceMatch && winnerId !== 'revert') {
                                  const winner = winnerId === thirdPlaceMatch.teamA?.id 
                                    ? thirdPlaceMatch.teamA 
                                    : thirdPlaceMatch.teamB;
                                  
                                  setThirdPlaceMatch({
                                    ...thirdPlaceMatch,
                                    winner: winner
                                  });
                                } else if (thirdPlaceMatch && winnerId === 'revert') {
                                  // Reset winner when reverting
                                  setThirdPlaceMatch({
                                    ...thirdPlaceMatch,
                                    winner: undefined
                                  });
                                }
                              }}
                              isActive={!!(thirdPlaceMatch.teamA && thirdPlaceMatch.teamB)} // Active if both teams are present
                            />
                          ) : (
                            <div className="match-card glass-panel p-3 rounded-lg opacity-60">
                              <div className="h-12 flex items-center justify-center">
                                <p className="text-xs text-muted-foreground italic">Awaiting semifinal results</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
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
        
        {/* Bottom Tournament Results Section - Positioned in a better way to ensure it's clickable */}
        <div className="absolute left-0 right-0" style={{ bottom: '30px' }}>
          {/* Podium Display */}
          <div className="flex justify-center mb-10 z-10 pointer-events-auto">
            <div className="flex items-end justify-center gap-4">
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
                const hasChampion = !!champion;
                
                // Determine second place (runner-up)
                let runnerUp: Team | undefined = undefined;
                if (finalMatch && finalMatch.winner) {
                  runnerUp = finalMatch.teamA?.id !== finalMatch.winner.id 
                    ? finalMatch.teamA 
                    : finalMatch.teamB;
                }
                
                // Determine third place
                const thirdPlace = thirdPlaceMatch?.winner;
                
                console.log("Medal positions:", {
                  champion: champion?.name || 'None',
                  runnerUp: runnerUp?.name || 'None',
                  thirdPlace: thirdPlace?.name || 'None'
                });

                return (
                  <>
                    {/* 2nd Place */}
                    {runnerUp && (
                      <div className="flex-1 text-center">
                        <div 
                          className="glass-panel shadow-md p-2 rounded-lg inline-block silver-border"
                          style={{
                            background: 'rgba(192, 192, 192, 0.1)',
                            border: '1px solid rgba(192, 192, 192, 0.3)',
                            minWidth: '140px',
                            width: '160px'
                          }}
                        >
                          <div className="flex flex-col items-center">
                            <div 
                              className="w-7 h-7 rounded-full flex items-center justify-center mb-1"
                              style={{
                                background: 'rgba(192, 192, 192, 0.15)'
                              }}
                            >
                              <Medal size={12} className="text-gray-400" />
                            </div>
                            <div className="font-bold text-sm">
                              {runnerUp.name}
                            </div>
                            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-0.5">
                              2nd Place
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Champion/1st Place */}
                    {hasChampion && (
                      <div className="flex-1 text-center" style={{position: 'relative', zIndex: 5}}>
                        <div 
                          className="glass-panel shadow-lg p-3 rounded-lg inline-block champion-golden-border"
                          style={{
                            transition: 'all 0.5s ease',
                            transform: 'scale(1.05)',
                            boxShadow: '0 0 15px rgba(255, 215, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.3), 0 0 45px rgba(255, 215, 0, 0.1)',
                            animation: 'glow-champion 2s infinite alternate',
                            minWidth: '170px',
                            width: '170px'
                          }}
                        >
                          <div className="flex flex-col items-center">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center mb-1"
                              style={{
                                background: 'rgba(255, 215, 0, 0.15)',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <Trophy size={14} className="text-yellow-500" />
                            </div>
                            <div className="font-bold text-base" style={{ 
                              transition: 'all 0.3s ease',
                              color: '#000'
                            }}>
                              {champion.name}
                            </div>
                            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-0.5">
                              Champion
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* 3rd Place */}
                    {thirdPlace && (
                      <div className="flex-1 text-center">
                        <div 
                          className="glass-panel shadow-md p-2 rounded-lg inline-block bronze-border"
                          style={{
                            background: 'rgba(205, 127, 50, 0.1)',
                            border: '1px solid rgba(205, 127, 50, 0.3)',
                            minWidth: '140px',
                            width: '160px'
                          }}
                        >
                          <div className="flex flex-col items-center">
                            <div 
                              className="w-7 h-7 rounded-full flex items-center justify-center mb-1"
                              style={{
                                background: 'rgba(205, 127, 50, 0.15)'
                              }}
                            >
                              <Medal size={12} className="text-amber-700" />
                            </div>
                            <div className="font-bold text-sm">
                              {thirdPlace.name}
                            </div>
                            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-0.5">
                              3rd Place
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
          
          {/* SO black.png logo at the bottom */}
          <div className="flex justify-center z-10 pointer-events-auto">
            <div className="w-[20%] min-w-[160px] max-w-[300px]">
              <div style={{ position: 'relative', width: '100%', height: '60px' }}>
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
    </div>
  );
};

// Helper function to get the vertical spacing between matches in a round
function getSpacingForMatch(roundId: number, position: number, side?: string): string {
  // First round has consistent spacing
  if (roundId === 0) {
    // First round matches should have even spacing
    return position === 3 ? '0px' : '30px';
  }
  
  // For second round
  if (roundId === 1) {
    // Second round matches need more spacing as they're fed by pairs of first round matches
    return '90px';
  }
  
  // Special handling for other rounds
  if (roundId === 2) {
    return '180px'; // Semi-finals need even more space
  }
  
  return '24px'; // Default spacing
}

// Helper function to get additional top margin for specific matches
function getTopMarginForMatch(roundId: number, position: number, side?: string): string {
  // First round - each team starts with no top margin, just spacing between them
  if (roundId === 0) return '0px';
  
  // Second round - each match should be centered between its two first-round matches
  if (roundId === 1) {
    // Top match (position 0) should be between first round positions 0 and 1
    if (position === 0) return '45px';
    
    // Bottom match (position 1) should be between first round positions 2 and 3
    if (position === 1) return '45px';
  }
  
  // Semi-finals
  if (roundId === 2) {
    // Top semi-final aligned with second round position 0
    if (position === 0) return '90px';
    
    // Bottom semi-final aligned with second round position 1
    if (position === 1) return '90px';
  }
  
  // Finals - centered between semi-finals
  if (roundId === 3) {
    return '160px';
  }
  
  return '0px';
}

// Helper function to get the top margin for a round
function getMarginForRound(roundId: number, totalRounds: number): string {
  // First round starts at the top
  if (roundId === 0) return '0px';
  
  // Special handling for the champion display
  if (roundId === totalRounds - 1) {
    return '100px';
  }
  
  // Other rounds need increasing space to accommodate the bracket structure
  if (roundId === 1) return '30px';
  if (roundId === 2) return '60px';
  if (roundId === 3) return '120px';
  
  return '20px';
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
