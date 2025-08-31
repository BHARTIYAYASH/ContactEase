"use client";

import { useState, useEffect } from 'react';
import { FileText, CreditCard, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BusinessCardUpload from '@/components/BusinessCardUpload';
import BusinessCardOutput from '@/components/BusinessCardOutput';
import ProcessingStatus from '@/components/ProcessingStatus';
import ContactImportExport from '@/components/ContactImportExport';

export interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  organization?: string;
  position?: string;
  address?: string;
  website?: string;
  confidence: number;
  rawText: string;
}

export interface BusinessCardHistoryItem {
  id: string;
  image: string;
  contactInfo: ContactInfo;
  language: string;
  timestamp: Date;
  filename: string;
}

export default function BusinessCardScanner() {
  const [selectedLanguage, setSelectedLanguage] = useState('eng');
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<BusinessCardHistoryItem[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<BusinessCardHistoryItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showImportExport, setShowImportExport] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('business-card-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setHistory(historyWithDates);
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('business-card-history', JSON.stringify(history));
  }, [history]);

  const handleImageUpload = (imageData: string) => {
    setUploadedImage(imageData);
    setContactInfo(null);
  };

  const handleContactInfoExtracted = (info: ContactInfo) => {
    setContactInfo(info);
    setIsProcessing(false);
    setProgress(0);

    // Add to history if we have an uploaded image
    if (uploadedImage) {
      const historyItem: BusinessCardHistoryItem = {
        id: Date.now().toString(),
        image: uploadedImage,
        contactInfo: info,
        language: selectedLanguage,
        timestamp: new Date(),
        filename: `business-card-${Date.now()}.jpg`
      };
      setHistory(prev => [historyItem, ...prev]);
    }
  };

  const handleProcessingStart = () => {
    setIsProcessing(true);
    setProgress(0);
  };

  const handleProgressUpdate = (progressValue: number) => {
    setProgress(progressValue);
  };

  const handleSelectHistoryItem = (item: BusinessCardHistoryItem) => {
    setSelectedHistoryItem(item);
    setUploadedImage(item.image);
    setContactInfo(item.contactInfo);
    setSelectedLanguage(item.language);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    if (selectedHistoryItem?.id === id) {
      setSelectedHistoryItem(null);
    }
  };

  const handleEditContact = (id: string, updatedInfo: ContactInfo) => {
    // Update in history
    setHistory(prev => prev.map(item => 
      item.id === id ? { ...item, contactInfo: updatedInfo } : item
    ));
    
    // Update current contact info if this is the selected item
    if (selectedHistoryItem?.id === id) {
      setSelectedHistoryItem(prev => prev ? { ...prev, contactInfo: updatedInfo } : null);
      setContactInfo(updatedInfo);
    }
  };

  // Handle bulk import of contacts
  const handleImportContacts = (importedContacts: ContactInfo[]) => {
    const newHistoryItems: BusinessCardHistoryItem[] = importedContacts.map(contact => ({
      id: `imported-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      image: '', // No image for imported contacts
      contactInfo: {
        ...contact,
        confidence: 100, // Set high confidence for manually imported contacts
        rawText: ''
      },
      language: selectedLanguage,
      timestamp: new Date(),
      filename: `imported-contact-${Date.now()}.csv`
    }));

    setHistory(prev => [...newHistoryItems, ...prev]);
    
    // Select the first imported contact
    if (newHistoryItems.length > 0) {
      setSelectedHistoryItem(newHistoryItems[0]);
      setContactInfo(newHistoryItems[0].contactInfo);
    }
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-bg to-accent/5 flex flex-col md:flex-row">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-80 h-screen bg-sidebar border-r border-accent/20 flex flex-col shadow-xl">
          {/* Header */}
          <div className="p-4 border-b border-accent/20 bg-gradient-to-r from-sidebar to-sidebar/95">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-1 bg-accent/20 rounded-lg">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-sidebar-foreground tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Business Cards</h2>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium tabular-nums">
                {history.length}
              </span>
            </div>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto sidebar-scrollbar bg-gradient-to-b from-sidebar to-sidebar/98">
            {history.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <div className="bg-muted/30 p-4 rounded-full w-fit mx-auto mb-4">
                  <CreditCard className="h-6 w-6" />
                </div>
                <p>No business cards scanned yet</p>
                <p className="text-sm mt-1">Scanned business cards will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {history.map(item => (
                  <div 
                    key={item.id}
                    className={`p-4 hover:bg-muted/20 cursor-pointer transition-colors ${selectedHistoryItem?.id === item.id ? 'bg-muted/30' : ''}`}
                    onClick={() => handleSelectHistoryItem(item)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="h-16 w-16 rounded-md border border-border overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt="Business Card" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {item.contactInfo.name || 'Unnamed Contact'}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.contactInfo.organization || 'Unknown Organization'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.contactInfo.email || item.contactInfo.phone || 'No contact details'}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {format(item.timestamp, 'MMM d, yyyy')}
                          </span>
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            {item.language === 'eng' ? 'English' : 
                             item.language === 'hin' ? 'Hindi' : 
                             item.language === 'mar' ? 'Marathi' : item.language}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex mt-2 space-x-2 justify-end">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHistoryItem(item.id);
                        }}
                        className="p-1 hover:bg-destructive/10 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header 
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          onToggleSidebar={handleToggleSidebar}
          showBusinessCardLink={false}
        />
        
        <main className="flex-1 container mx-auto px-4 py-8 bg-gradient-to-br from-cream-bg to-accent/5">
          <div className="max-w-6xl mx-auto">
            {showImportExport && (
              <div className="mb-6 md:mb-8">
                <ContactImportExport 
                  contacts={history.map(item => item.contactInfo)}
                  onImport={handleImportContacts}
                />
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-dark-green to-medium-green bg-clip-text text-transparent">
                Business Card Scanner
              </h1>
              <button 
                onClick={() => setShowImportExport(!showImportExport)}
                className="px-3 py-1.5 text-xs sm:text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors border border-primary/20 self-start sm:self-auto"
              >
                {showImportExport ? 'Hide Import/Export' : 'Import/Export Contacts'}
              </button>
            </div>
            {/* Processing Status */}
            {isProcessing && (
              <div className="mb-8 animate-in slide-in-from-top duration-500">
                <ProcessingStatus progress={progress} />
              </div>
            )}

            {/* Main Content Area */}
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 animate-in fade-in duration-700">
              {/* Left Column - Image Upload */}
              <div className="space-y-6">
                <BusinessCardUpload 
                  onImageUpload={handleImageUpload}
                  onContactInfoExtracted={handleContactInfoExtracted}
                  onProcessingStart={handleProcessingStart}
                  onProgressUpdate={handleProgressUpdate}
                  selectedLanguage={selectedLanguage}
                />
                
                {/* Preview uploaded image */}
                {uploadedImage && (
                  <div className="neo-card rounded-xl border border-border p-6 animate-in slide-in-from-left duration-500">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span>
                      {selectedHistoryItem ? 'Selected Business Card' : 'Uploaded Business Card'}
                      </span>
                    </h3>
                    <div className="relative group">
                      <img 
                        src={uploadedImage} 
                        alt="Business Card" 
                        className="w-full h-auto rounded-lg border border-border shadow-lg max-h-96 object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Contact Info Output */}
              <div>
                <BusinessCardOutput 
                  contactInfo={contactInfo}
                  isProcessing={isProcessing}
                  onEdit={handleEditContact}
                  selectedHistoryItemId={selectedHistoryItem?.id}
                />
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-16 text-center text-muted-foreground">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <span>Built with</span>
                <span className="font-semibold text-primary">Tesseract.js</span>
                <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                <span>Supporting</span>
                <span className="font-semibold text-primary">English, Hindi, and Marathi</span>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}