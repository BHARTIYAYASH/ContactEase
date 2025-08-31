"use client";

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Tesseract from 'tesseract.js';
import type { OCRResult } from '@/app/page';

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void;
  onOCRResult: (result: OCRResult) => void;
  onProcessingStart: () => void;
  onProgressUpdate: (progress: number) => void;
  selectedLanguage: string;
}

export default function ImageUpload({ 
  onImageUpload, 
  onOCRResult, 
  onProcessingStart,
  onProgressUpdate,
  selectedLanguage 
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PNG, JPG, or JPEG image.');
      return false;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 10MB.');
      return false;
    }

    return true;
  };

  const processImage = async (file: File) => {
    if (!validateFile(file)) return;

    setError(null);
    onProcessingStart();

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      onImageUpload(imageData);

      try {
        const result = await Tesseract.recognize(imageData, selectedLanguage, {
          logger: (info) => {
            if (info.status === 'recognizing text') {
              const progress = Math.round(info.progress * 100);
              onProgressUpdate(progress);
            }
          }
        });

        const confidence = Math.round(result.data.confidence);
        onOCRResult({
          text: result.data.text,
          confidence: confidence
        });
      } catch (error) {
        console.error('OCR Error:', error);
        setError('Failed to process the image. Please try again.');
        onProgressUpdate(0);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processImage(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processImage(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        className={`
          upload-zone relative neo-card rounded-xl border-2 border-dashed p-8 text-center cursor-pointer
          ${isDragOver ? 'dragover border-primary bg-primary/10' : 'border-accent/30 hover:border-accent/50 bg-gradient-to-br from-accent/5 to-primary/5'}
          transition-all duration-300
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-accent/30 to-primary/20 p-6 rounded-full shadow-inner relative floating-element">
              <Upload className="h-8 w-8 text-primary relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent rounded-full"></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Upload Handwritten Image
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Drag and drop your image here, or click to browse
            </p>
            <p className="text-sm text-muted-foreground flex items-center justify-center space-x-2">
              <span className="w-1 h-1 bg-primary rounded-full status-dot"></span>
              <span>Supports PNG, JPG, JPEG</span>
              <span className="text-accent">•</span>
              <span>Max 10MB</span>
            </p>
          </div>

          <div className="flex items-center justify-center space-x-2 text-muted-foreground bg-accent/10 border border-accent/20 rounded-lg py-2 px-4">
            <ImageIcon className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium">Best results with clear, well-lit images</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}