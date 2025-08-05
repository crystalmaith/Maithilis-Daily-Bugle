import { useState } from 'react';
import headerImage from '@/assets/daily-bugle-header.jpg';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header = ({ isDarkMode, onToggleDarkMode }: HeaderProps) => {
  return (
    <header className="relative overflow-hidden">
      {/* Header Image */}
      <div className="relative h-40 md:h-48 bg-paper-gradient shadow-paper border-b border-vintage-border flex items-center justify-center">
        <img 
          src={headerImage} 
          alt="The Daily Bugle" 
          className={`max-w-full max-h-full object-contain ${isDarkMode ? 'opacity-80 filter invert' : 'opacity-90'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/10 pointer-events-none"></div>
      </div>
      
      {/* Dark Mode Toggle */}
      <button
        onClick={onToggleDarkMode}
        className="absolute top-4 right-4 p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors border border-vintage-border"
        title="Toggle vintage newsprint mode"
      >
        <span className="text-ink-dark text-sm font-serif">
          {isDarkMode ? '☀️' : '🌙'}
        </span>
      </button>
      
      {/* Decorative border */}
      <div className="h-1 bg-ink-gradient"></div>
    </header>
  );
};