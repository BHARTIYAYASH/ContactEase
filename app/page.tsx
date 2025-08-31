"use client";

import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import TextOutput from '@/components/TextOutput';
import Header from '@/components/Header';
import ProcessingStatus from '@/components/ProcessingStatus';
import Sidebar, { type HistoryItem } from '@/components/Sidebar';

export interface OCRResult {
  text: string;
  confidence: number;
}

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState('eng');
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('ocr-history');
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
    localStorage.setItem('ocr-history', JSON.stringify(history));
  }, [history]);

  const handleImageUpload = (imageData: string) => {
    setUploadedImage(imageData);
    setOcrResult(null);
  };

  const handleOCRResult = (result: OCRResult) => {
    const newResult = { ...result };
    setOcrResult(newResult);
    setIsProcessing(false);
    setProgress(0);

    // Add to history if we have an uploaded image
    if (uploadedImage) {
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        image: uploadedImage,
        text: result.text,
        confidence: result.confidence,
        language: selectedLanguage,
        timestamp: new Date(),
        filename: `handwriting-${Date.now()}.jpg`
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

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
    setUploadedImage(item.image);
    setOcrResult({
      text: item.text,
      confidence: item.confidence
    });
    setSelectedLanguage(item.language);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    if (selectedHistoryItem?.id === id) {
      setSelectedHistoryItem(null);
    }
  };

  const handleEditHistoryItem = (id: string, newText: string) => {
    setHistory(prev => prev.map(item => 
      item.id === id ? { ...item, text: newText } : item
    ));
    if (selectedHistoryItem?.id === id) {
      setSelectedHistoryItem(prev => prev ? { ...prev, text: newText } : null);
      setOcrResult(prev => prev ? { ...prev, text: newText } : null);
    }
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen gradient-bg flex">
      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar
          history={history}
          onSelectItem={handleSelectHistoryItem}
          onDeleteItem={handleDeleteHistoryItem}
          onEditItem={handleEditHistoryItem}
          selectedItemId={selectedHistoryItem?.id}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header 
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          onToggleSidebar={handleToggleSidebar}
        />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Processing Status */}
            {isProcessing && (
              <div className="mb-8 animate-in slide-in-from-top duration-500">
                <ProcessingStatus progress={progress} />
              </div>
            )}

            {/* Main Content Area */}
            <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in duration-700">
              {/* Left Column - Image Upload */}
              <div className="space-y-6">
                <ImageUpload 
                  onImageUpload={handleImageUpload}
                  onOCRResult={handleOCRResult}
                  onProcessingStart={handleProcessingStart}
                  onProgressUpdate={handleProgressUpdate}
                  selectedLanguage={selectedLanguage}
                />
                
                {/* Preview uploaded image */}
                {uploadedImage && (
                  <div className="neo-card rounded-xl border border-border p-6 animate-in slide-in-from-left duration-500">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span>
                      {selectedHistoryItem ? 'Selected Image' : 'Uploaded Image'}
                      </span>
                    </h3>
                    <div className="relative group">
                      <img 
                        src={uploadedImage} 
                        alt="Handwritten note" 
                        className="w-full h-auto rounded-lg border border-border shadow-lg max-h-96 object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Text Output */}
              <div>
                <TextOutput 
                  result={ocrResult}
                  isProcessing={isProcessing}
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
                <span className="font-semibold text-primary tabular-nums">100+</span>
                <span>languages</span>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}