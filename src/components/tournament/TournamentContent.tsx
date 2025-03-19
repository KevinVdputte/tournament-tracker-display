import React, { useEffect } from 'react';
import { TournamentStage } from '@/types/tournament';
import SetupScreen from '@/components/SetupScreen';
import TournamentBracket from '@/components/TournamentBracket';
import { useTournament } from '@/contexts/TournamentContext';

const TournamentContent: React.FC = () => {
  const { 
    stage, 
    tournamentData, 
    initializeNewTournament, 
    handleSelectWinner,
    handleReset
  } = useTournament();

  // Debug logging
  useEffect(() => {
    if (tournamentData) {
      console.log('TournamentContent - Stage:', stage);
      console.log('TournamentContent - Champion:', tournamentData.champion?.name);
      console.log('TournamentContent - Current Round:', tournamentData.currentRound);
    }
  }, [tournamentData, stage]);

  return (
    <>
      {stage === TournamentStage.SETUP && (
        <SetupScreen onStartTournament={initializeNewTournament} />
      )}
      
      {stage === TournamentStage.RUNNING && tournamentData && (
        <TournamentBracket 
          tournamentData={tournamentData}
          onSelectWinner={handleSelectWinner}
        />
      )}
      
      {stage === TournamentStage.COMPLETE && tournamentData?.champion && (
        <TournamentBracket 
          tournamentData={tournamentData}
          onSelectWinner={handleSelectWinner}
        />
      )}
    </>
  );
};

export default TournamentContent;
