
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
        let nextMatchFound = false;
        for (const round of newData.rounds) {
          const nextMatch = round.matches.find(m => m.id === match.nextMatchId);
          if (nextMatch) {
            // Special handling for the third round's last match (position 2)
            if (prev.currentRound === 2 && match.position === 2) {
              // For the special match, always assign to teamB of the next match
              nextMatch.teamB = winner;
            } else {
              // Normal case: determine if this should be teamA or teamB based on position
              const isEvenPosition = match.position % 2 === 0;
              if (isEvenPosition) {
                nextMatch.teamA = winner;
              } else {
                nextMatch.teamB = winner;
              }
            }
            nextMatchFound = true;
            break;
          }
        }

        // Special handling for second round (5 matches) to third round (3 matches)
        if (prev.currentRound === 1 && match.position === 4) {
          // The 5th winner goes directly to the special match in round 3
          const specialMatch = newData.rounds[2].matches[2]; // The special match at position 2
          if (specialMatch) {
            specialMatch.teamA = winner;
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
