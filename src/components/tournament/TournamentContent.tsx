
import React from 'react';
import { TournamentStage } from '@/types/tournament';
import SetupScreen from '@/components/SetupScreen';
import TournamentBracket from '@/components/TournamentBracket';
import WinnerDisplay from '@/components/WinnerDisplay';
import { useTournament } from '@/contexts/TournamentContext';

const TournamentContent: React.FC = () => {
  const { 
    stage, 
    tournamentData, 
    initializeNewTournament, 
    handleSelectWinner 
  } = useTournament();

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
        <WinnerDisplay
          champion={tournamentData.champion}
          onReset={useTournament().handleReset}
        />
      )}
    </>
  );
};

export default TournamentContent;
