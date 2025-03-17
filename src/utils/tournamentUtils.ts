
import { Team, TournamentData, Round, Match } from '@/types/tournament';

export const initializeTournament = (teams: Team[]): TournamentData => {
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

  return {
    rounds,
    currentRound: 0,
    isComplete: false
  };
};
