
import React from 'react';
import { TeamInputProps } from '@/types/tournament';
import { cn } from '@/lib/utils';

const TeamInput: React.FC<TeamInputProps> = ({ 
  label, 
  id, 
  value, 
  onChange, 
  placeholder = "Team name" 
}) => {
  return (
    <div className="mb-3 animate-fade-in">
      <div className="flex items-center mb-1">
        <div className="h-1.5 w-1.5 rounded-full bg-tournament-accent/80 mr-2"></div>
        <label
          htmlFor={id}
          className="text-xs font-medium text-muted-foreground"
        >
          {label}
        </label>
      </div>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full px-3 py-2 rounded-md border border-input",
          "bg-background text-sm focus:outline-none",
          "focus:ring-1 focus:ring-tournament-accent/50",
          "transition-all duration-200"
        )}
      />
    </div>
  );
};

export default TeamInput;
