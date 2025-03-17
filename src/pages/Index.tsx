
import React, { useState, useCallback, useEffect } from 'react';
import { Team, TournamentData, TournamentStage, Match, Round } from '@/types/tournament';
import SetupScreen from '@/components/SetupScreen';
import TournamentBracket from '@/components/TournamentBracket';
import WinnerDisplay from '@/components/WinnerDisplay';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const Index = () => {
  const [stage, setStage] = useState<TournamentStage>(TournamentStage.SETUP);
  const [tournamentData, setTournamentData] = useState<TournamentData | null>(null);

  // Initialize the tournament with teams
  const initializeTournament = useCallback((teams: Team[]) => {
    if (teams.length !== 20) {
      console.error('Tournament requires exactly 20 teams');
      return;
    }

    // Organize teams into rounds
    const rounds: Round[] = [];
    
    // First round (10 matches)
    const firstRoundMatches: Match[] = [];
    for (let i = 0; i < 10; i++) {
      firstRoundMatches.push({
        id: `match-1-${i}`,
        round: 0,
        position: i,
        teamA: teams[i],
        teamB: teams[i + 10],
        nextMatchId: `match-2-${Math.floor(i / 2)}`
      });
    }
    rounds.push({
      id: 0,
      name: 'First Round',
      matches: firstRoundMatches
    });

    // Second round (5 matches)
    const secondRoundMatches: Match[] = [];
    for (let i = 0; i < 5; i++) {
      secondRoundMatches.push({
        id: `match-2-${i}`,
        round: 1,
        position: i,
        nextMatchId: `match-3-${Math.floor(i / 2)}`
      });
    }
    rounds.push({
      id: 1,
      name: 'Second Round',
      matches: secondRoundMatches
    });

    // Third round (2 matches + 1 remainder)
    const thirdRoundMatches: Match[] = [];
    for (let i = 0; i < 3; i++) {
      thirdRoundMatches.push({
        id: `match-3-${i}`,
        round: 2,
        position: i,
        nextMatchId: i < 2 ? `match-4-0` : undefined
      });
    }
    rounds.push({
      id: 2,
      name: 'Quarter Finals',
      matches: thirdRoundMatches
    });

    // Fourth round (1 match - semifinal)
    const fourthRoundMatches: Match[] = [
      {
        id: 'match-4-0',
        round: 3,
        position: 0,
        nextMatchId: 'match-5-0'
      }
    ];
    rounds.push({
      id: 3,
      name: 'Semi Finals',
      matches: fourthRoundMatches
    });

    // Fifth round (1 match - final)
    const fifthRoundMatches: Match[] = [
      {
        id: 'match-5-0',
        round: 4,
        position: 0
      }
    ];
    rounds.push({
      id: 4,
      name: 'Final',
      matches: fifthRoundMatches
    });

    // Champion display
    rounds.push({
      id: 5,
      name: 'Champion',
      matches: []
    });

    setTournamentData({
      rounds,
      currentRound: 0,
      isComplete: false
    });
    
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
            // Determine if this should be teamA or teamB in the next match
            const isEvenPosition = match.position % 2 === 0;
            if (isEvenPosition) {
              nextMatch.teamA = winner;
            } else {
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
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/50">
        <div className="container mx-auto py-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {stage !== TournamentStage.SETUP && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                className="mr-2"
              >
                <ArrowLeft size={18} />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-tournament-accent/10">
                <Trophy size={16} className="text-tournament-accent" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight">STEM Tournament Tracker</h1>
            </div>
          </div>
          
          {stage === TournamentStage.RUNNING && tournamentData && (
            <div className="flex items-center">
              <span className={cn(
                "text-xs uppercase tracking-wider px-2 py-1 rounded-full",
                "bg-tournament-accent/10 text-tournament-accent font-medium"
              )}>
                Round {tournamentData.currentRound + 1}
              </span>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1 container mx-auto">
        {stage === TournamentStage.SETUP && (
          <SetupScreen onStartTournament={initializeTournament} />
        )}
        
        {stage === TournamentStage.RUNNING && tournamentData && (
          <TournamentBracket 
            tournamentData={tournamentData}
            onSelectWinner={handleSelectWinner}
          />
        )}
        
        {stage === TournamentStage.COMPLETE && tournamentData?.champion && (
          <WinnerDisplay
            champion={tournamentData.champion}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
