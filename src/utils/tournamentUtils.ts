import { Team, TournamentData, Round, Match } from '@/types/tournament';

export const initializeTournament = (teams: Team[]): TournamentData => {
  // Organize teams into rounds
  const rounds: Round[] = [];
  
  console.log("Initializing tournament with teams:", teams.map(t => t.name));
  
  // First round (8 matches)
  const firstRoundMatches: Match[] = [];
  
  // Left side of the bracket (first 4 matches)
  for (let i = 0; i < 4; i++) {
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
  
  // Right side of the bracket (last 4 matches)
  for (let i = 0; i < 4; i++) {
    firstRoundMatches.push({
      id: `match-1-${i + 4}`,
      round: 0,
      position: i + 4,
      teamA: teams[i * 2 + 8],
      teamB: teams[i * 2 + 9],
      nextMatchId: `match-2-${Math.floor(i / 2) + 2}`,
      side: 'right'
    });
  }
  
  rounds.push({
    id: 0,
    name: 'First Round',
    matches: firstRoundMatches
  });

  // Second round (4 matches - 2 on each side)
  const secondRoundMatches: Match[] = [];
  
  // Left side (2 matches)
  for (let i = 0; i < 2; i++) {
    secondRoundMatches.push({
      id: `match-2-${i}`,
      round: 1,
      position: i,
      nextMatchId: `match-3-0`,
      side: 'left'
    });
  }
  
  // Right side (2 matches)
  for (let i = 0; i < 2; i++) {
    secondRoundMatches.push({
      id: `match-2-${i + 2}`,
      round: 1,
      position: i + 2,
      nextMatchId: `match-3-1`,
      side: 'right'
    });
  }
  
  rounds.push({
    id: 1,
    name: 'Second Round',
    matches: secondRoundMatches
  });

  // Third round (2 matches - 1 on each side)
  const thirdRoundMatches: Match[] = [
    {
      id: `match-3-0`,
      round: 2,
      position: 0,
      nextMatchId: `match-4-0`,
      side: 'left'
    },
    {
      id: `match-3-1`,
      round: 2,
      position: 1,
      nextMatchId: `match-4-0`,
      side: 'right'
    }
  ];
  
  rounds.push({
    id: 2,
    name: 'Semi Finals',
    matches: thirdRoundMatches
  });

  // Fourth round (1 match - final)
  const fourthRoundMatches: Match[] = [
    {
      id: 'match-4-0',
      round: 3,
      position: 0,
      side: 'center'
    }
  ];
  
  rounds.push({
    id: 3,
    name: 'Final',
    matches: fourthRoundMatches
  });

  // Champion display
  rounds.push({
    id: 4,
    name: 'Champion',
    matches: [{
      id: 'match-champion',
      round: 4,
      position: 0,
      side: 'center'
    }]
  });

  // Log match structure for debugging
  console.log("Tournament structure initialized:");
  rounds.forEach((round, i) => {
    console.log(`Round ${i} (${round.name}):`);
    round.matches.forEach(match => {
      console.log(`  Match ${match.id}: Side ${match.side}, Position ${match.position}, Next: ${match.nextMatchId || 'None'}`);
      if (match.teamA) console.log(`    TeamA: ${match.teamA.name}`);
      if (match.teamB) console.log(`    TeamB: ${match.teamB.name}`);
    });
  });

  return {
    rounds,
    currentRound: 0,
    isComplete: false
  };
};
