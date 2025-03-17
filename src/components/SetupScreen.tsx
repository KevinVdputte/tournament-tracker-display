
import React, { useState, useCallback } from 'react';
import { SetupScreenProps, Team } from '@/types/tournament';
import { Button } from '@/components/ui/button';
import TeamInput from './TeamInput';
import { AlertTriangle, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from "sonner";

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartTournament }) => {
  const [teams, setTeams] = useState<Team[]>(
    Array.from({ length: 20 }, (_, i) => ({
      id: `team-${i + 1}`,
      name: ''
    }))
  );

  const handleTeamNameChange = (id: string, name: string) => {
    setTeams(prev => 
      prev.map(team => 
        team.id === id ? { ...team, name } : team
      )
    );
  };

  const handleStartTournament = useCallback(() => {
    // Validate that all teams have names
    const emptyTeams = teams.filter(team => !team.name.trim());
    
    if (emptyTeams.length > 0) {
      toast.error(`Please fill in all team names`, {
        description: `${emptyTeams.length} teams are missing names`,
      });
      return;
    }
    
    // Check for duplicate names
    const teamNames = teams.map(t => t.name.trim());
    const uniqueNames = new Set(teamNames);
    
    if (uniqueNames.size !== teams.length) {
      toast.error('Duplicate team names found', {
        description: 'Please ensure all team names are unique',
      });
      return;
    }
    
    onStartTournament(teams);
  }, [teams, onStartTournament]);

  const handleRandomize = () => {
    const placeholders = [
      "Alpha Team", "Beta Squad", "Team Nova", "Quantum Force", "Nebula Group",
      "Fusion Team", "Enigma Squad", "Phoenix Group", "Stellar Team", "Omega Squad",
      "Team Apex", "Kronos Group", "Vector Team", "Eclipse Squad", "Matrix Team",
      "Infiniti Group", "Zenith Squad", "Cosmic Team", "Spectrum Group", "Horizon Team"
    ];
    
    // Shuffle the array
    const shuffled = [...placeholders].sort(() => 0.5 - Math.random());
    
    setTeams(prev => 
      prev.map((team, index) => ({
        ...team,
        name: shuffled[index]
      }))
    );
    
    toast.success('Team names randomized', {
      description: 'All teams have been assigned random names',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8 staggered-fade-in">
        <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center bg-tournament-accent/10 mb-3">
          <Trophy size={20} className="text-tournament-accent" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Tournament Setup</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Enter the names of all 20 teams that will participate in the tournament.
        </p>
      </div>

      <div className="glass-panel rounded-xl p-6 md:p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Team Names</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRandomize}
          >
            Randomize Names
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6">
          <div className="sm:col-span-2 md:col-span-2">
            <div className="mb-3">
              <span className={cn(
                "text-xs font-medium uppercase tracking-wider",
                "bg-tournament-accent/10 text-tournament-accent",
                "px-2 py-0.5 rounded-full"
              )}>
                Left Bracket
              </span>
            </div>
            {teams.slice(0, 10).map((team, index) => (
              <TeamInput
                key={team.id}
                id={team.id}
                label={`Team ${index + 1}`}
                value={team.name}
                onChange={handleTeamNameChange}
                placeholder={`Enter team ${index + 1} name`}
              />
            ))}
          </div>

          <div className="sm:col-span-2 md:col-span-2 mt-6 sm:mt-0">
            <div className="mb-3">
              <span className={cn(
                "text-xs font-medium uppercase tracking-wider",
                "bg-tournament-accent/10 text-tournament-accent",
                "px-2 py-0.5 rounded-full"
              )}>
                Right Bracket
              </span>
            </div>
            {teams.slice(10, 20).map((team, index) => (
              <TeamInput
                key={team.id}
                id={team.id}
                label={`Team ${index + 11}`}
                value={team.name}
                onChange={handleTeamNameChange}
                placeholder={`Enter team ${index + 11} name`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={handleStartTournament}
          size="lg"
          className="px-8 py-6 text-base"
        >
          Start Tournament
        </Button>
      </div>
    </div>
  );
};

export default SetupScreen;
