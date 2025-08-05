import { useState } from 'react';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header = ({ isDarkMode, onToggleDarkMode }: HeaderProps) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <header className="relative bg-paper-gradient border-2 border-ink-dark">
      {/* Top border lines */}
      <div className="border-b-2 border-ink-dark"></div>
      <div className="border-b border-ink-dark"></div>
      
      {/* Newspaper Header */}
      <div className="p-6 text-center">
        {/* Top line with info */}
        <div className="flex justify-between items-center text-sm font-serif text-ink-dark mb-4 border-b border-ink-dark pb-2">
          <span>VOL 1</span>
          <span>{formattedDate}</span>
          <span>PRICE: FREE</span>
        </div>
        
        {/* Main Masthead */}
        <div className="mb-4">
          <h1 className="text-6xl md:text-7xl font-newspaper font-black text-ink-dark tracking-wider leading-none">
            THE DAILY BUGLE
          </h1>
          <div className="h-1 bg-ink-dark mx-auto mt-2 mb-3"></div>
          <p className="text-lg font-serif text-ink-medium italic">
            ESTABLISHED 2025 • MAITHILI's AI POWERED NEWS SUMMARIZER
          </p>
        </div>
        
        {/* Bottom decorative lines */}
        <div className="border-t-2 border-ink-dark pt-2">
          <div className="border-t border-ink-dark"></div>
        </div>
      </div>
      
      /* Dark Mode Toggle 
      <button
        onClick={onToggleDarkMode}
        className="absolute top-4 right-4 p-2 rounded bg-ink-dark text-background hover:bg-ink-medium transition-colors text-sm font-serif"
        title="Toggle vintage newsprint mode"
      >
        {isDarkMode ? '☀️ Light' : '🌙 Dark'}
      </button>*/
    </header>
  );
};
