
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
      teamA: teams[i * 2],
      teamB: teams[i * 2 + 1],
      nextMatchId: `match-2-${Math.floor(i / 2)}`,
      side: 'left'
    });
  }
  
  // Right side of the bracket (last 5 matches)
  for (let i = 0; i < 5; i++) {
    firstRoundMatches.push({
      id: `match-1-${i + 5}`,
      round: 0,
      position: i + 5,
      teamA: teams[i * 2 + 10],
      teamB: teams[i * 2 + 11],
      nextMatchId: `match-2-${Math.floor(i / 2) + 3}`,
      side: 'right'
    });
  }
  
  rounds.push({
    id: 0,
    name: 'First Round',
    matches: firstRoundMatches
  });

  // Second round (6 matches - 3 on each side)
  const secondRoundMatches: Match[] = [];
  
  // Left side (3 matches)
  for (let i = 0; i < 3; i++) {
    secondRoundMatches.push({
      id: `match-2-${i}`,
      round: 1,
      position: i,
      nextMatchId: i < 2 ? `match-3-0` : `match-3-1`,
      side: 'left'
    });
  }
  
  // Right side (3 matches)
  for (let i = 0; i < 3; i++) {
    secondRoundMatches.push({
      id: `match-2-${i + 3}`,
      round: 1,
      position: i + 3,
      nextMatchId: i < 2 ? `match-3-2` : `match-3-3`,
      side: 'right'
    });
  }
  
  rounds.push({
    id: 1,
    name: 'Second Round',
    matches: secondRoundMatches
  });

  // Third round (4 matches - 2 on each side)
  const thirdRoundMatches: Match[] = [];
  
  // Left quarter-finals
  thirdRoundMatches.push({
    id: `match-3-0`,
    round: 2,
    position: 0,
    nextMatchId: `match-4-0`,
    side: 'left'
  });
  
  thirdRoundMatches.push({
    id: `match-3-1`,
    round: 2,
    position: 1,
    nextMatchId: `match-4-0`,
    side: 'left'
  });
  
  // Right quarter-finals
  thirdRoundMatches.push({
    id: `match-3-2`,
    round: 2,
    position: 2,
    nextMatchId: `match-4-1`,
    side: 'right'
  });
  
  thirdRoundMatches.push({
    id: `match-3-3`,
    round: 2,
    position: 3,
    nextMatchId: `match-4-1`,
    side: 'right'
  });
  
  rounds.push({
    id: 2,
    name: 'Quarter Finals',
    matches: thirdRoundMatches
  });

  // Fourth round (2 matches - semifinals)
  const fourthRoundMatches: Match[] = [
    {
      id: 'match-4-0',
      round: 3,
      position: 0,
      nextMatchId: 'match-5-0',
      side: 'left'
    },
    {
      id: 'match-4-1',
      round: 3,
      position: 1,
      nextMatchId: 'match-5-0',
      side: 'right'
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
