
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
    if (teams.length !== 20) {
      console.error('Tournament requires exactly 20 teams');
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
      
      // Update the next match if applicable
      if (match.nextMatchId) {
        // Find the next match
        for (const round of newData.rounds) {
          const nextMatch = round.matches.find(m => m.id === match.nextMatchId);
          if (nextMatch) {
            // Determine if this should be teamA or teamB in the next match based on side and position
            if (match.side === 'left') {
              // Left side matches
              if (prev.currentRound === 1 && match.position === 2) {
                // Special handling for the third match in second round (left side)
                nextMatch.teamA = winner; // Goes to the wildcard match
              } else {
                const isEvenPosition = match.position % 2 === 0;
                nextMatch.teamA = isEvenPosition ? winner : nextMatch.teamA;
                nextMatch.teamB = !isEvenPosition ? winner : nextMatch.teamB;
              }
            } else if (match.side === 'right') {
              // Right side matches
              const isEvenPosition = (match.position - 5) % 2 === 0; // Adjusted for right side
              nextMatch.teamA = isEvenPosition ? winner : nextMatch.teamA;
              nextMatch.teamB = !isEvenPosition ? winner : nextMatch.teamB;
            } else if (match.side === 'center') {
              // For the wildcard match, winner goes to semi-final as teamB
              nextMatch.teamB = winner;
            }
            break;
          }
        }
      }
      
      // Check if current round is complete
      const isRoundComplete = currentRound.matches.every(m => m.winner);
      
      // If round is complete, proceed to next round
      if (isRoundComplete) {
        // If it's the final round, set tournament as complete
        if (prev.currentRound === newData.rounds.length - 2) {
          const finalMatch = newData.rounds[prev.currentRound].matches[0];
          newData.isComplete = true;
          newData.champion = finalMatch.winner;
          setStage(TournamentStage.COMPLETE);
          toast.success('Tournament complete!', {
            description: `${finalMatch.winner?.name} is the champion!`,
          });
        } else {
          newData.currentRound += 1;
          toast.info(`Round ${newData.currentRound} started`, {
            description: 'Select winners for the new matches',
          });
        }
      }
      
      return newData;
    });
  }, [tournamentData]);

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
