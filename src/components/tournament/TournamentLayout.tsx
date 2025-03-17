
import React from 'react';
import TournamentHeader from './TournamentHeader';
import { TournamentProvider } from '@/contexts/TournamentContext';

interface TournamentLayoutProps {
  children: React.ReactNode;
}

const TournamentLayout: React.FC<TournamentLayoutProps> = ({ children }) => {
  return (
    <TournamentProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <TournamentHeader />
        <main className="flex-1 container mx-auto">
          {children}
        </main>
      </div>
    </TournamentProvider>
  );
};

export default TournamentLayout;
