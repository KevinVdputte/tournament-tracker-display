
import React from 'react';
import { RoundHeaderProps } from '@/types/tournament';
import { cn } from '@/lib/utils';

const RoundHeader: React.FC<RoundHeaderProps> = ({ name, matchCount }) => {
  return (
    <div className="text-center mb-6 animate-slide-down">
      <div className="inline-block">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full mb-1 inline-block">
          {matchCount > 0 ? `${matchCount} matches` : ''}
        </span>
        <h3 className={cn(
          "text-sm sm:text-base font-semibold tracking-tight",
          name === "Champion" && "text-lg sm:text-xl text-tournament-accent"
        )}>
          {name}
        </h3>
      </div>
    </div>
  );
};

export default RoundHeader;
