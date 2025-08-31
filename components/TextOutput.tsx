"use client";

import { useState, useEffect } from 'react';
import { Copy, Download, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';
import type { OCRResult } from '@/app/page';

interface TextOutputProps {
  result: OCRResult | null;
  isProcessing: boolean;
}

export default function TextOutput({ result, isProcessing }: TextOutputProps) {
  const [editableText, setEditableText] = useState('');
  const [copied, setCopied] = useState(false);

  // Update editable text when result changes
  useEffect(() => {
    if (result) {
      setEditableText(result.text);
    }
  }, [result]);

  const handleCopy = async () => {
    if (!editableText) return;
    try {
      await navigator.clipboard.writeText(editableText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleDownloadTxt = () => {
    if (!editableText) return;

    const blob = new Blob([editableText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'handwritten-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    if (!editableText) return;

    const pdf = new jsPDF();
    const margin = 20;
    const lineHeight = 10;
    const maxLineWidth = 170;

    const lines = pdf.splitTextToSize(editableText, maxLineWidth);

    let y = margin;
    lines.forEach((line: string) => {
      if (y > 280) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(line, margin, y);
      y += lineHeight;
    });

    pdf.save('handwritten-text.pdf');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <CheckCircle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  if (isProcessing) {
    return (
      <div className="neo-card rounded-xl border border-border p-6">
        <div className="space-y-4">
          <div className="loading-shimmer h-6 rounded"></div>
          <div className="space-y-2">
            <div className="loading-shimmer h-4 rounded w-3/4"></div>
            <div className="loading-shimmer h-4 rounded w-1/2"></div>
            <div className="loading-shimmer h-4 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="neo-card rounded-xl border border-border p-8">
        <div className="text-center space-y-4">
          <div className="bg-muted p-6 rounded-full w-fit mx-auto">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">Ready for Text</h3>
            <p className="text-muted-foreground">
              Upload an image to extract handwritten text
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-card rounded-xl border border-border p-6 space-y-6">
      {/* Header with confidence score */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <span>Extracted Text</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </h3>
        <div className={`flex items-center space-x-2 ${getConfidenceColor(result.confidence)}`}>
          {getConfidenceIcon(result.confidence)}
          <span className="text-sm font-semibold tracking-wide">
            {result.confidence}% confidence
          </span>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground font-medium">
          <span>Accuracy</span>
          <span className="tabular-nums">{result.confidence}%</span>
        </div>
        <div className="h-3 bg-muted/50 rounded-full overflow-hidden shadow-inner">
          <div className="h-3 bg-muted rounded-full overflow-hidden relative">
            <div 
              className="h-full confidence-bar transition-all duration-700 ease-out"
              style={{ 
                width: `${result.confidence}%`,
                clipPath: `inset(0 ${100 - result.confidence}% 0 0)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Text editor */}
      <div className="space-y-4">
        <textarea
          value={editableText}
          onChange={(e) => setEditableText(e.target.value)}
          placeholder="Extracted text will appear here..."
          className="text-editor w-full h-64 p-4 bg-background border border-border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-inner custom-scrollbar"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopy}
          disabled={!editableText}
          className="flex items-center space-x-2 px-4 py-2 bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all interactive-scale"
        >
          <Copy className="h-4 w-4" />
          <span>{copied ? 'Copied!' : 'Copy Text'}</span>
        </button>

        <button
          onClick={handleDownloadTxt}
          disabled={!editableText}
          className="btn-secondary flex items-center space-x-2 px-4 py-2 text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
        >
          <Download className="h-4 w-4" />
          <span>Download TXT</span>
        </button>

        <button
          onClick={handleDownloadPdf}
          disabled={!editableText}
          className="btn-primary flex items-center space-x-2 px-4 py-2 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
        >
          <FileText className="h-4 w-4" />
          <span>Download PDF</span>
        </button>
      </div>
    </div>
  );
}
