"use client";

import { useState } from 'react';
import { History, Trash2, Edit3, Download, Eye, X, Search, Calendar, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';

export interface HistoryItem {
  id: string;
  image: string;
  text: string;
  confidence: number;
  language: string;
  timestamp: Date;
  filename: string;
}

interface SidebarProps {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (id: string, newText: string) => void;
  selectedItemId?: string;
}

export default function Sidebar({ 
  history, 
  onSelectItem, 
  onDeleteItem, 
  onEditItem, 
  selectedItemId,
  isOpen,
  onToggle
}: SidebarProps & { isOpen: boolean; onToggle: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const filteredHistory = history.filter(item =>
    item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (item: HistoryItem) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  const handleSaveEdit = (id: string) => {
    onEditItem(id, editText);
    setEditingId(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const downloadText = (item: HistoryItem) => {
    const blob = new Blob([item.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.filename.replace(/\.[^/.]+$/, '')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`${isOpen ? 'w-full md:w-80' : 'w-0'} h-screen bg-gradient-to-b from-accent/5 to-primary/5 border-r border-accent/20 flex flex-col shadow-xl transition-all duration-300 overflow-hidden`}>
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-accent/20 bg-gradient-to-r from-accent/10 to-primary/10">
        <div className="flex items-center space-x-1 md:space-x-2 mb-4">
          <div className="p-1 bg-accent/20 rounded-lg">
            <History className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">History</h2>
          <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full font-medium tabular-nums">
            {history.length}
          </span>
        </div>
        
        {/* Search */}
        <div className="relative group flex items-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 md:py-2 bg-accent/5 border border-accent/30 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-inner"
          />
          <button 
            onClick={onToggle}
            className="md:hidden ml-2 p-1 rounded-md hover:bg-muted transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto sidebar-scrollbar bg-gradient-to-b from-accent/5 to-primary/5 max-h-[calc(100vh-8rem)] md:max-h-[calc(100vh-8rem)]">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <div className="bg-accent/10 p-4 rounded-full w-fit mx-auto mb-4">
              <History className="h-8 w-8 opacity-50" />
            </div>
            <p className="text-sm font-medium">
              {searchTerm ? 'No matching results' : 'No history yet'}
            </p>
            <p className="text-xs mt-1 opacity-75">
              {searchTerm ? 'Try a different search term' : 'Upload an image to get started'}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className={`
                  group relative p-3 rounded-lg border transition-all cursor-pointer hover:shadow-lg interactive-scale
                  ${selectedItemId === item.id 
                    ? 'bg-primary/10 border-primary shadow-sm' 
                    : 'bg-accent/5 border-accent/20 hover:bg-accent/10'
                  }
                `}
                onClick={() => onSelectItem(item)}
              >
                {/* Image Preview */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.filename}
                      className="w-12 h-12 object-cover rounded-md border border-accent/30 shadow-sm"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Filename and Date */}
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-card-foreground truncate">
                        {item.filename}
                      </h3>
                      <span className="text-xs text-muted-foreground flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span className="tabular-nums">
                          {format(item.timestamp, 'MMM d')}
                        </span>
                      </span>
                    </div>
                    
                    {/* Text Preview */}
                    {editingId === item.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2 text-xs bg-muted border border-border rounded resize-none shadow-inner"
                          rows={3}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEdit(item.id);
                            }}
                            className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEdit();
                            }}
                            className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {item.text.substring(0, 100)}...
                      </p>
                    )}
                    
                    {/* Confidence and Language */}
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted-foreground flex items-center space-x-1">
                        <span className="font-medium">{item.language}</span>
                        <span className="text-border">•</span>
                        <span className="tabular-nums">{item.confidence}%</span>
                      </span>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(item);
                          }}
                          className="p-1 hover:bg-muted rounded transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadText(item);
                          }}
                          className="p-1 hover:bg-muted rounded transition-colors"
                          title="Download"
                        >
                          <Download className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteItem(item.id);
                          }}
                          className="p-1 hover:bg-destructive/10 text-destructive rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Mini confidence bar */}
                    <div className="w-full h-1 bg-muted/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full confidence-bar transition-all duration-500"
                        style={{ width: `${item.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}