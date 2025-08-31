"use client";

import { Loader2, Brain } from 'lucide-react';

interface ProcessingStatusProps {
  progress: number;
}

export default function ProcessingStatus({ progress }: ProcessingStatusProps) {
  return (
    <div className="neo-card rounded-xl border border-border p-6 bg-gradient-to-r from-card to-card/95">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="relative p-2 bg-primary/10 rounded-lg">
            <Brain className="h-6 w-6 text-primary relative z-10" />
            <Loader2 className="h-4 w-4 text-primary/80 absolute -top-0.5 -right-0.5 animate-spin" />
            <div className="absolute inset-0 bg-primary/5 rounded-lg animate-pulse"></div>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground tracking-tight">Processing Image</p>
            <p className="text-sm text-muted-foreground flex items-center space-x-1">
              <span>Extracting handwritten text</span>
              <span className="flex space-x-0.5">
                <span className="w-1 h-1 bg-primary rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground font-medium">
          <span>Progress</span>
          <span className="tabular-nums">{progress}%</span>
        </div>
        <div className="h-3 bg-muted/50 rounded-full overflow-hidden shadow-inner relative">
          <div 
            className="h-full bg-gradient-to-r from-primary via-primary to-primary/80 transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}