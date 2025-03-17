
import { Team, TournamentData, Round, Match } from '@/types/tournament';

export const initializeTournament = (teams: Team[]): TournamentData => {
  // Organize teams into rounds
  const rounds: Round[] = [];
  
  // First round (10 matches)
  const firstRoundMatches: Match[] = [];
  
  // Left side of the bracket (first 5 matches)
  for (let i = 0; i < 5; i++) {
    firstRoundMatches.push({
      id: `match-1-${i}`,
      round: 0,
      position: i,
      teamA: teams[i],
      teamB: teams[i + 5],
      nextMatchId: `match-2-${Math.floor(i / 2)}`,
      side: 'left'
    });
  }
  
  // Right side of the bracket (last 5 matches)
  for (let i = 5; i < 10; i++) {
    firstRoundMatches.push({
      id: `match-1-${i}`,
      round: 0,
      position: i,
      teamA: teams[i + 5],
      teamB: teams[i + 10],
      nextMatchId: `match-2-${Math.floor((i - 5) / 2) + 3}`,
      side: 'right'
    });
  }
  
  rounds.push({
    id: 0,
    name: 'First Round',
    matches: firstRoundMatches
  });

  // Second round (5 matches)
  const secondRoundMatches: Match[] = [];
  
  // Left side (2 matches)
  for (let i = 0; i < 3; i++) {
    secondRoundMatches.push({
      id: `match-2-${i}`,
      round: 1,
      position: i,
      nextMatchId: i < 2 ? `match-3-0` : `match-3-2`, // First two go to first quarter, third to wildcard
      side: 'left'
    });
  }
  
  // Right side (2 matches)
  for (let i = 3; i < 5; i++) {
    secondRoundMatches.push({
      id: `match-2-${i}`,
      round: 1,
      position: i,
      nextMatchId: `match-3-1`, // Both go to second quarter
      side: 'right'
    });
  }
  
  rounds.push({
    id: 1,
    name: 'Second Round',
    matches: secondRoundMatches
  });

  // Third round (3 matches - 2 quarters + 1 wildcard)
  const thirdRoundMatches: Match[] = [];
  
  // Left quarter-final
  thirdRoundMatches.push({
    id: `match-3-0`,
    round: 2,
    position: 0,
    nextMatchId: `match-4-0`,
    side: 'left'
  });
  
  // Right quarter-final
  thirdRoundMatches.push({
    id: `match-3-1`,
    round: 2,
    position: 1,
    nextMatchId: `match-4-0`,
    side: 'right'
  });
  
  // Wildcard match (center position)
  thirdRoundMatches.push({
    id: `match-3-2`,
    round: 2,
    position: 2,
    nextMatchId: `match-4-0`,
    side: 'center'
  });
  
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
      nextMatchId: 'match-5-0',
      side: 'center'
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
      position: 0,
      side: 'center'
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
