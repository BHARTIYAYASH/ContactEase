"use client";

import { useState, useRef } from 'react';
import { Upload, CreditCard, AlertCircle } from 'lucide-react';
import Tesseract from 'tesseract.js';
import type { ContactInfo } from '@/app/business-card/page';

interface BusinessCardUploadProps {
  onImageUpload: (imageData: string) => void;
  onContactInfoExtracted: (info: ContactInfo) => void;
  onProcessingStart: () => void;
  onProgressUpdate: (progress: number) => void;
  selectedLanguage: string;
}

export default function BusinessCardUpload({ 
  onImageUpload, 
  onContactInfoExtracted, 
  onProcessingStart,
  onProgressUpdate,
  selectedLanguage 
}: BusinessCardUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Map language codes to Tesseract language codes
  const languageMap: Record<string, string> = {
    'eng': 'eng',  // English
    'hin': 'hin',  // Hindi
    'mar': 'mar'   // Marathi
  };

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

  // Extract contact information from OCR text using regex patterns
  const extractContactInfo = (text: string, confidence: number): ContactInfo => {
    // Initialize contact info object
    const contactInfo: ContactInfo = {
      confidence,
      rawText: text
    };

    // Email regex pattern
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex);
    if (emails && emails.length > 0) {
      contactInfo.email = emails[0];
    }

    // Phone regex patterns (handles various formats)
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10}/g;
    const phones = text.match(phoneRegex);
    if (phones && phones.length > 0) {
      contactInfo.phone = phones[0];
    }

    // Website regex pattern
    const websiteRegex = /(?:https?:\/\/)?(?:www\.)?[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+(?:\/[^\s]*)?/gi;
    const websites = text.match(websiteRegex);
    if (websites && websites.length > 0) {
      // Filter out email addresses that might be caught by the website regex
      const filteredWebsites = websites.filter(site => !site.includes('@'));
      if (filteredWebsites.length > 0) {
        contactInfo.website = filteredWebsites[0];
      }
    }

    // Split text into lines for better processing
    const lines = text.split('\n').filter(line => line.trim() !== '');

    // Try to extract name (usually in the first few lines and often in larger font)
    if (lines.length > 0) {
      // Assume the first line that's not an email, phone, or website is the name
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (
          trimmedLine &&
          !emailRegex.test(trimmedLine) &&
          !phoneRegex.test(trimmedLine) &&
          !websiteRegex.test(trimmedLine) &&
          trimmedLine.length > 2 && // Avoid very short strings
          trimmedLine.length < 50 // Avoid very long strings
        ) {
          contactInfo.name = trimmedLine;
          break;
        }
      }
    }

    // Try to extract organization (often on the second or third line)
    if (lines.length > 1) {
      // Look for a line that might be an organization name
      for (let i = 1; i < Math.min(5, lines.length); i++) {
        const trimmedLine = lines[i].trim();
        if (
          trimmedLine &&
          !emailRegex.test(trimmedLine) &&
          !phoneRegex.test(trimmedLine) &&
          !websiteRegex.test(trimmedLine) &&
          trimmedLine !== contactInfo.name &&
          trimmedLine.length > 2 &&
          trimmedLine.length < 50
        ) {
          contactInfo.organization = trimmedLine;
          break;
        }
      }
    }

    // Try to extract position/title (often near the name)
    if (contactInfo.name && lines.length > 1) {
      const nameIndex = lines.findIndex(line => line.includes(contactInfo.name || ''));
      if (nameIndex >= 0 && nameIndex + 1 < lines.length) {
        const potentialPosition = lines[nameIndex + 1].trim();
        if (
          potentialPosition &&
          !emailRegex.test(potentialPosition) &&
          !phoneRegex.test(potentialPosition) &&
          !websiteRegex.test(potentialPosition) &&
          potentialPosition !== contactInfo.organization &&
          potentialPosition.length < 50
        ) {
          contactInfo.position = potentialPosition;
        }
      }
    }

    // Try to extract address (usually longer text, often at the bottom)
    // Look for lines with postal codes or typical address patterns
    const addressRegex = /\d+\s+[A-Za-z\s]+,?\s*[A-Za-z\s]+,?\s*[A-Za-z]{2}\s*\d{5}|\d{6}/i;
    for (const line of lines) {
      if (addressRegex.test(line)) {
        contactInfo.address = line.trim();
        break;
      }
    }

    // If no address found with regex, try to find the longest line that might be an address
    if (!contactInfo.address) {
      let longestLine = '';
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (
          trimmedLine &&
          !emailRegex.test(trimmedLine) &&
          !phoneRegex.test(trimmedLine) &&
          !websiteRegex.test(trimmedLine) &&
          trimmedLine !== contactInfo.name &&
          trimmedLine !== contactInfo.organization &&
          trimmedLine !== contactInfo.position &&
          trimmedLine.length > longestLine.length &&
          trimmedLine.length > 15 // Address is usually longer
        ) {
          longestLine = trimmedLine;
        }
      }
      if (longestLine) {
        contactInfo.address = longestLine;
      }
    }

    return contactInfo;
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
        // Use the mapped language code or default to English
        const tessLanguage = languageMap[selectedLanguage] || 'eng';
        
        const result = await Tesseract.recognize(imageData, tessLanguage, {
          logger: (info) => {
            if (info.status === 'recognizing text') {
              const progress = Math.round(info.progress * 100);
              onProgressUpdate(progress);
            }
          }
        });

        const confidence = Math.round(result.data.confidence);
        const extractedInfo = extractContactInfo(result.data.text, confidence);
        
        onContactInfoExtracted(extractedInfo);
      } catch (error) {
        console.error('OCR Error:', error);
        setError('Failed to process the business card. Please try again.');
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
              <CreditCard className="h-8 w-8 text-primary relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent rounded-full"></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Upload Business Card
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Drag and drop your business card image here, or click to browse
            </p>
            <p className="text-sm text-muted-foreground flex items-center justify-center space-x-2">
              <span className="w-1 h-1 bg-primary rounded-full status-dot"></span>
              <span>Supports PNG, JPG, JPEG</span>
              <span className="text-accent">•</span>
              <span>Max 10MB</span>
            </p>
          </div>

          <div className="flex items-center justify-center space-x-2 text-muted-foreground bg-accent/10 border border-accent/20 rounded-lg py-2 px-4">
            <CreditCard className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium">Best results with clear, well-lit business card images</span>
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