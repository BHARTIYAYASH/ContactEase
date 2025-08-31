"use client";

import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  compact?: boolean;
}

const languages = [
  { code: 'eng', name: 'English' },
  { code: 'hin', name: 'Hindi' },
  { code: 'mar', name: 'Marathi' },
];

export default function LanguageSelector({ selectedLanguage, onLanguageChange, compact = false }: LanguageSelectorProps) {
  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Globe className="h-4 w-4 text-accent" />
        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-transparent border-none text-sm text-foreground focus:ring-0 focus:outline-none cursor-pointer hover:text-primary transition-colors"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-background text-foreground">
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="neo-card rounded-xl border border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 p-4">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-foreground">
          <Globe className="h-5 w-5 text-accent" />
          <span className="font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Language:</span>
        </div>
        
        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="flex-1 max-w-xs px-3 py-2 bg-accent/5 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}