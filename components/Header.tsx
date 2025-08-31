import { FileText, CreditCard } from 'lucide-react';
import { PanelLeft, Sparkles } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import Link from 'next/link';

interface HeaderProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  onToggleSidebar: () => void;
  showBusinessCardLink?: boolean;
}

export default function Header({ selectedLanguage, onLanguageChange, onToggleSidebar, showBusinessCardLink = true }: HeaderProps) {
  return (
    <header className="glass border-b border-border/50 shadow-sm sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-r from-accent/10 to-primary/5">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-white/20 dark:hover:bg-black/20 rounded-lg transition-all duration-300 interactive-scale group"
              title="Toggle sidebar"
            >
              <PanelLeft className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
            </button>
            <div className="bg-gradient-to-br from-primary to-secondary/90 p-3 rounded-xl shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <FileText className="h-6 w-6 text-white relative z-10" />
              <Sparkles className="h-3 w-3 text-white/60 absolute top-1 right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ContactEase
              </h1>
              <p className="text-sm text-muted-foreground flex items-center space-x-1">
                <span>Manage and organize your contacts effortlessly</span>
                <span className="w-1 h-1 bg-primary rounded-full animate-pulse"></span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {showBusinessCardLink && (
              <Link href="/business-card" className="flex items-center space-x-2 px-3 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg transition-colors border border-accent/20">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Business Cards</span>
              </Link>
            )}
            <Link href="/" className="flex items-center space-x-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-primary/20">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Contacts</span>
            </Link>
            <LanguageSelector 
              selectedLanguage={selectedLanguage}
              onLanguageChange={onLanguageChange}
              compact={true}
            />
            <div className="w-px h-6 bg-border/50"></div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}