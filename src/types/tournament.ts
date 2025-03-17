
export interface Team {
  id: string;
  name: string;
}

export interface Match {
  id: string;
  round: number;
  position: number;
  teamA?: Team;
  teamB?: Team;
  winner?: Team;
  nextMatchId?: string;
}

export interface Round {
  id: number;
  name: string;
  matches: Match[];
}

export interface TournamentData {
  rounds: Round[];
  currentRound: number;
  isComplete: boolean;
  champion?: Team;
}

export enum TournamentStage {
  SETUP = 'setup',
  RUNNING = 'running', 
  COMPLETE = 'complete'
}

export interface MatchDisplayProps {
  match: Match;
  onSelectWinner: (matchId: string, winnerId: string) => void;
  isActive: boolean;
}

export interface RoundHeaderProps {
  name: string;
  matchCount: number;
}

export interface TournamentBracketProps {
  tournamentData: TournamentData;
  onSelectWinner: (matchId: string, winnerId: string) => void;
}

export interface TeamInputProps {
  label: string;
  id: string;
  value: string;
  onChange: (id: string, value: string) => void;
  placeholder?: string;
}

export interface WinnerDisplayProps {
  champion: Team;
  onReset: () => void;
}

export interface SetupScreenProps {
  onStartTournament: (teams: Team[]) => void;
}
