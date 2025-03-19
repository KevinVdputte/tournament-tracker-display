import React, { createContext, useContext, useState, useCallback } from 'react';
import { Team, TournamentData, TournamentStage, Match } from '@/types/tournament';
import { toast } from "sonner";
import { initializeTournament } from '@/utils/tournamentUtils';

interface TournamentContextType {
  stage: TournamentStage;
  tournamentData: TournamentData | null;
  initializeNewTournament: (teams: Team[]) => void;
  handleSelectWinner: (matchId: string, winnerId: string) => void;
  handleReset: () => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stage, setStage] = useState<TournamentStage>(TournamentStage.SETUP);
  const [tournamentData, setTournamentData] = useState<TournamentData | null>(null);

  // Initialize the tournament with teams
  const initializeNewTournament = useCallback((teams: Team[]) => {
    if (teams.length !== 16) {
      console.error('Tournament requires exactly 16 teams');
      return;
    }

    const newTournamentData = initializeTournament(teams);
    setTournamentData(newTournamentData);
    setStage(TournamentStage.RUNNING);
    toast.success('Tournament started!', {
      description: 'Select winners for each match to advance',
    });
  }, []);

  // Handle selecting a winner for a match
  const handleSelectWinner = useCallback((matchId: string, winnerId: string) => {
    if (!tournamentData) return;

    setTournamentData(prev => {
      if (!prev) return prev;

      // Create a deep copy of the tournament data
      const newData = JSON.parse(JSON.stringify(prev)) as TournamentData;
      
      // Find the match and update it
      let targetRound = newData.rounds[prev.currentRound];
      let matchIndex = targetRound.matches.findIndex(m => m.id === matchId);
      let targetRoundIndex = prev.currentRound;
      
      // If not found in current round, search all rounds (for matches that can be reverted)
      if (matchIndex === -1) {
        for (let i = 0; i < newData.rounds.length; i++) {
          const roundMatches = newData.rounds[i].matches;
          const foundIndex = roundMatches.findIndex(m => m.id === matchId);
          if (foundIndex !== -1) {
            targetRound = newData.rounds[i];
            matchIndex = foundIndex;
            targetRoundIndex = i;
            break;
          }
        }
      }
      
      if (matchIndex === -1) return prev;
      
      const match = targetRound.matches[matchIndex];
      
      // Handle reversion case
      if (winnerId === 'revert') {
        console.log(`Reverting winner for match ${match.id}`);
        
        // Check if this match has fed teams to a next match
        if (match.nextMatchId) {
          // Find the next match
          let nextMatch: Match | undefined;
          let nextMatchRoundIndex = -1;
          
          for (let i = 0; i < newData.rounds.length; i++) {
            const roundMatches = newData.rounds[i].matches;
            const foundIndex = roundMatches.findIndex(m => m.id === match.nextMatchId);
            if (foundIndex !== -1) {
              nextMatch = roundMatches[foundIndex];
              nextMatchRoundIndex = i;
              break;
            }
          }
          
          if (nextMatch) {
            // If the next match already has a winner, we can't revert this match
            if (nextMatch.winner) {
              console.log(`Cannot revert match ${match.id} because next match ${nextMatch.id} already has a winner`);
              toast.error('Cannot revert this match', {
                description: 'The next match already has a winner selected',
              });
              return prev;
            }
            
            // Determine which team slot to clear in the next match
            if (match.id.startsWith('match-3-')) {
              // For semifinals feeding to finals
              if (match.side === 'left') {
                nextMatch.teamA = undefined;
              } else if (match.side === 'right') {
                nextMatch.teamB = undefined;
              }
            } else if (match.side === 'left') {
              // Left side matches
              const isEvenPosition = match.position % 2 === 0;
              if (isEvenPosition) {
                nextMatch.teamA = undefined;
              } else {
                nextMatch.teamB = undefined;
              }
            } else if (match.side === 'right') {
              // Right side matches
              const isEvenPosition = (match.position - 4) % 2 === 0; // Adjusted for right side
              if (isEvenPosition) {
                nextMatch.teamA = undefined;
              } else {
                nextMatch.teamB = undefined;
              }
            }
            
            console.log(`Cleared team in next match ${nextMatch.id}`);
          }
        }
        
        // Clear the winner
        match.winner = undefined;
        toast.info('Match result reverted', {
          description: 'Please select a winner again',
        });
        
        return newData;
      }
      
      // Normal winner selection logic continues from here
      const winner = match.teamA?.id === winnerId 
        ? match.teamA 
        : match.teamB;
      
      if (!winner) return prev;
      
      // Set the winner
      match.winner = winner;
      console.log(`Set winner for match ${match.id}: ${winner.name}`);
      
      // Update the next match if applicable
      if (match.nextMatchId) {
        console.log(`Updating next match: ${match.nextMatchId} with winner: ${winner.name}`);
        // Find the next match
        for (const round of newData.rounds) {
          const nextMatch = round.matches.find(m => m.id === match.nextMatchId);
          if (nextMatch) {
            console.log(`Found next match in round ${round.id}: ${nextMatch.id}`);
            
            // For semi-finals, ensure proper team assignment
            if (match.id.startsWith('match-3-')) {
              console.log(`Processing semifinal match ${match.id} with side ${match.side}`);
              if (match.side === 'left') {
                nextMatch.teamA = winner;
                console.log(`Set teamA for final: ${winner.name}`);
              } else if (match.side === 'right') {
                nextMatch.teamB = winner;
                console.log(`Set teamB for final: ${winner.name}`);
              }
            }
            // For earlier rounds
            else if (match.side === 'left') {
              // Left side matches
              const isEvenPosition = match.position % 2 === 0;
              if (isEvenPosition) {
                nextMatch.teamA = winner;
                console.log(`Set teamA for next match: ${winner.name}`);
              } else {
                nextMatch.teamB = winner;
                console.log(`Set teamB for next match: ${winner.name}`);
              }
            } else if (match.side === 'right') {
              // Right side matches
              const isEvenPosition = (match.position - 4) % 2 === 0; // Adjusted for right side
              if (isEvenPosition) {
                nextMatch.teamA = winner;
                console.log(`Set teamA for next match: ${winner.name}`);
              } else {
                nextMatch.teamB = winner;
                console.log(`Set teamB for next match: ${winner.name}`);
              }
            }
            break;
          }
        }
      }
      
      // Check if current round is complete - only for the active round
      const currentRound = newData.rounds[prev.currentRound];
      const isRoundComplete = currentRound.matches.every(m => m.winner);
      console.log(`Round ${prev.currentRound} complete: ${isRoundComplete}`);
      
      // Special handling for second round (round 1) - check if matches needed for semifinals
      if (prev.currentRound === 1 && isRoundComplete) {
        // Check if we have winners for all second round matches
        const secondRoundMatches = newData.rounds[1].matches;
        const allSecondRoundComplete = secondRoundMatches.every(m => m.winner);
        
        if (allSecondRoundComplete) {
          // Make sure semifinals are properly set up
          const leftSemiFinal = newData.rounds[2].matches.find(m => m.side === 'left');
          const rightSemiFinal = newData.rounds[2].matches.find(m => m.side === 'right');
          
          console.log("Checking semifinal setup:", { 
            leftSemiFinalId: leftSemiFinal?.id,
            rightSemiFinalId: rightSemiFinal?.id
          });
          
          // Make sure semifinal teams are set
          if (leftSemiFinal && rightSemiFinal) {
            const leftWinners = secondRoundMatches
              .filter(m => m.side === 'left' && m.winner)
              .map(m => m.winner);
            
            const rightWinners = secondRoundMatches
              .filter(m => m.side === 'right' && m.winner)
              .map(m => m.winner);

            console.log("Left winners:", leftWinners.map(w => w?.name));
            console.log("Right winners:", rightWinners.map(w => w?.name));
            
            // Always reassign teams to ensure they're correctly set
            if (leftWinners.length >= 2) {
              leftSemiFinal.teamA = leftWinners[0];
              leftSemiFinal.teamB = leftWinners[1];
              console.log(`Set left semifinal: ${leftWinners[0]?.name} vs ${leftWinners[1]?.name}`);
            }
            
            if (rightWinners.length >= 2) {
              rightSemiFinal.teamA = rightWinners[0];
              rightSemiFinal.teamB = rightWinners[1];
              console.log(`Set right semifinal: ${rightWinners[0]?.name} vs ${rightWinners[1]?.name}`);
            }
          }
          
          newData.currentRound = 2;
          console.log("Advancing to semifinals");
          toast.info(`Semifinals started`, {
            description: 'Select winners for the semifinal matches',
          });
        }
      }
      // Special handling for semifinals (round 2) - check if both matches have winners
      else if (prev.currentRound === 2 && isRoundComplete) {
        console.log("Semifinal round complete");
        const semiFinalMatches = newData.rounds[2].matches;
        const allSemiFinalsComplete = semiFinalMatches.every(m => m.winner);
        
        if (allSemiFinalsComplete) {
          // Both semifinal matches are complete, update the final match
          const leftSemiFinal = semiFinalMatches.find(m => m.side === 'left');
          const rightSemiFinal = semiFinalMatches.find(m => m.side === 'right');
          
          // Find the final match explicitly by ID in the appropriate round
          const finalRound = newData.rounds.find(r => r.id === 3);
          
          // Get matches in the final round for debugging
          console.log("Final round matches before update:", finalRound?.matches.map(m => ({
            id: m.id,
            side: m.side,
            teamA: m.teamA?.name || 'None',
            teamB: m.teamB?.name || 'None'
          })));
          
          // Try multiple methods to find the final match
          let finalMatch = finalRound?.matches.find(m => m.id === 'match-4-0');
          
          // If not found by ID, try alternative methods
          if (!finalMatch && finalRound) {
            // Try by position in array
            if (finalRound.matches.length === 1) {
              finalMatch = finalRound.matches[0];
              console.log("Found final match as the only match in round:", finalMatch.id);
            } 
            // Try by side === 'center'
            else {
              const centerMatch = finalRound.matches.find(m => m.side === 'center');
              if (centerMatch) {
                finalMatch = centerMatch;
                console.log("Found final match by center side:", centerMatch.id);
              }
            }
          }
          
          // If still not found, add diagnostic info
          if (!finalMatch) {
            console.error("Could not find the final match!");
            console.error("Available rounds:", newData.rounds.map(r => ({ 
              id: r.id, 
              name: r.name, 
              matches: r.matches.map(m => m.id) 
            })));
            return prev; // Don't update if we can't find the final match
          }
          
          // Debug log to check the semifinal winners
          console.log("Left semifinal winner:", leftSemiFinal?.winner?.name);
          console.log("Right semifinal winner:", rightSemiFinal?.winner?.name);
          console.log("Final match before update:", {
            id: finalMatch.id,
            teamA: finalMatch.teamA?.name || 'None',
            teamB: finalMatch.teamB?.name || 'None'
          });
          
          // Ensure the final match has both teams even if the nextMatchId logic failed
          if (leftSemiFinal?.winner && rightSemiFinal?.winner) {
            // Create fresh copies of the winners to avoid reference issues
            finalMatch.teamA = JSON.parse(JSON.stringify(leftSemiFinal.winner));
            finalMatch.teamB = JSON.parse(JSON.stringify(rightSemiFinal.winner));
            finalMatch.winner = undefined; // Clear any previous winner
            
            console.log(`Final match set up with ${finalMatch.teamA?.name} vs ${finalMatch.teamB?.name}`);
            
            // Verify the teams are set correctly
            console.log("Final match after update:", {
              teamA: finalMatch.teamA?.name,
              teamB: finalMatch.teamB?.name,
              hasTeamA: !!finalMatch.teamA,
              hasTeamB: !!finalMatch.teamB
            });
            
            newData.currentRound = 3;
            
            toast.info(`Finals started`, {
              description: 'Select the winner for the final match',
            });
          }
        }
      }
      // If it's the final round and complete, set tournament as complete
      else if (prev.currentRound === 3 && isRoundComplete) {
        console.log("Final round complete");
        
        // Get all matches from round 3 (final round) to debug
        const finalRound = newData.rounds.find(r => r.id === 3);
        console.log("Final round matches:", finalRound?.matches.map(m => ({ 
          id: m.id, 
          teamA: m.teamA?.name || 'None', 
          teamB: m.teamB?.name || 'None',
          winner: m.winner?.name || 'None',
          side: m.side 
        })));
        
        // Attempt different ways to find the final match
        let finalMatch = finalRound?.matches.find(match => match.id === 'match-4-0');
        
        // Fallback to other methods of finding the final match if the ID approach fails
        if (!finalMatch && finalRound) {
          // Try to find by being the only match in the final round
          if (finalRound.matches.length === 1) {
            finalMatch = finalRound.matches[0];
            console.log("Found final match by being the only match in final round:", finalMatch.id);
          }
          // Try to find by side === 'center'
          else {
            const centerMatch = finalRound.matches.find(m => m.side === 'center');
            if (centerMatch) {
              finalMatch = centerMatch;
              console.log("Found final match by side === 'center':", finalMatch.id);
            }
          }
        }
        
        console.log("Final match for champion determination:", {
          found: !!finalMatch,
          id: finalMatch?.id || 'Not found',
          hasWinner: !!finalMatch?.winner,
          winnerName: finalMatch?.winner?.name || 'No winner',
          winnerID: finalMatch?.winner?.id || 'No winner ID'
        });
        
        if (finalMatch && finalMatch.winner) {
          // Set the champion in tournament data with detailed logging
          newData.isComplete = true;
          
          // Create a deep copy of the winner to ensure no reference issues
          const championData = JSON.parse(JSON.stringify(finalMatch.winner));
          newData.champion = championData;
          
          console.log("Setting tournament champion:", championData.name);
          
          // Also update the champion match in the last round
          const championRound = newData.rounds.find(r => r.id === 4); // Last round
          console.log("Champion round:", {
            found: !!championRound,
            name: championRound?.name || 'Not found',
            matchCount: championRound?.matches.length || 0
          });
          
          if (championRound && championRound.matches.length > 0) {
            // Update the champion match with the same deep-copied data
            championRound.matches[0].teamA = championData;
            championRound.matches[0].winner = championData;
            championRound.matches[0].teamB = undefined; // No opponent in champion display
            
            console.log("Updated champion round match:", {
              id: championRound.matches[0].id,
              teamA: championRound.matches[0].teamA?.name || 'None',
              winner: championRound.matches[0].winner?.name || 'None'
            });
          } else {
            console.warn("Could not update champion round - not found or no matches");
          }
          
          // Move to the champion round
          newData.currentRound = 4;
          
          setStage(TournamentStage.COMPLETE);
          toast.success('Tournament complete!', {
            description: `${finalMatch.winner.name} is the champion!`,
          });
        } else {
          console.warn("Could not set champion: final match not found or has no winner");
        }
      }
      // For other rounds, just advance if complete
      else if (isRoundComplete && prev.currentRound < 3) {
        newData.currentRound += 1;
        console.log(`Advancing to round ${newData.currentRound}`);
        toast.info(`Round ${newData.currentRound + 1} started`, {
          description: 'Select winners for the new matches',
        });
      }
      
      return newData;
    });
  }, [tournamentData, setStage]);

  // Reset the tournament
  const handleReset = useCallback(() => {
    setTournamentData(null);
    setStage(TournamentStage.SETUP);
  }, []);

  return (
    <TournamentContext.Provider value={{
      stage,
      tournamentData,
      initializeNewTournament,
      handleSelectWinner,
      handleReset
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};
