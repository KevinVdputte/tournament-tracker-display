import React, { createContext, useContext, useState, useCallback } from 'react';
import { Team, TournamentData, TournamentStage } from '@/types/tournament';
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
      const currentRound = newData.rounds[prev.currentRound];
      const matchIndex = currentRound.matches.findIndex(m => m.id === matchId);
      
      if (matchIndex === -1) return prev;
      
      const match = currentRound.matches[matchIndex];
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
      
      // Check if current round is complete
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
          
          // Make sure semifinal teams are set
          if (leftSemiFinal && rightSemiFinal) {
            if (!leftSemiFinal.teamA || !leftSemiFinal.teamB || !rightSemiFinal.teamA || !rightSemiFinal.teamB) {
              // Find the second round winners that feed into semifinals
              console.log("Fixing semifinal teams");
              const leftWinners = secondRoundMatches
                .filter(m => m.side === 'left' && m.winner)
                .map(m => m.winner);
              
              const rightWinners = secondRoundMatches
                .filter(m => m.side === 'right' && m.winner)
                .map(m => m.winner);
              
              if (leftWinners.length >= 2) {
                leftSemiFinal.teamA = leftWinners[0];
                leftSemiFinal.teamB = leftWinners[1];
              }
              
              if (rightWinners.length >= 2) {
                rightSemiFinal.teamA = rightWinners[0];
                rightSemiFinal.teamB = rightWinners[1];
              }
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
          const finalMatch = newData.rounds[3].matches[0];
          
          if (leftSemiFinal?.winner && rightSemiFinal?.winner) {
            finalMatch.teamA = leftSemiFinal.winner;
            finalMatch.teamB = rightSemiFinal.winner;
            console.log(`Final match set up with ${finalMatch.teamA?.name} vs ${finalMatch.teamB?.name}`);
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
        // Get the winner of the final match
        const finalMatch = currentRound.matches.find(match => match.id === 'match-4-0');
        if (finalMatch && finalMatch.winner) {
          // Set the champion in both tournament data and the champion round
          newData.isComplete = true;
          newData.champion = finalMatch.winner;
          
          // Also update the champion match in the last round
          const championRound = newData.rounds[4]; // Last round
          if (championRound && championRound.matches.length > 0) {
            championRound.matches[0].teamA = finalMatch.winner;
            championRound.matches[0].winner = finalMatch.winner;
          }
          
          // Explicitly log to check the champion is set
          console.log('Setting champion:', finalMatch.winner.name);
          
          // Move to the champion round
          newData.currentRound = 4;
          
          setStage(TournamentStage.COMPLETE);
          toast.success('Tournament complete!', {
            description: `${finalMatch.winner.name} is the champion!`,
          });
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
