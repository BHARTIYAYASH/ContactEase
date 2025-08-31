"use client";

import { useState } from 'react';
import { CreditCard, Save, Download, AlertCircle, CheckCircle, Edit3, Copy } from 'lucide-react';
import type { ContactInfo } from '@/app/business-card/page';

interface BusinessCardOutputProps {
  contactInfo: ContactInfo | null;
  isProcessing: boolean;
  onEdit: (id: string, updatedInfo: ContactInfo) => void;
  selectedHistoryItemId?: string;
}

export default function BusinessCardOutput({ 
  contactInfo, 
  isProcessing,
  onEdit,
  selectedHistoryItemId
}: BusinessCardOutputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<ContactInfo | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Start editing mode
  const handleStartEdit = () => {
    setEditedInfo(contactInfo);
    setIsEditing(true);
  };

  // Save edited information
  const handleSaveEdit = () => {
    if (editedInfo && selectedHistoryItemId) {
      onEdit(selectedHistoryItemId, editedInfo);
    }
    setIsEditing(false);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedInfo(null);
  };

  // Handle input changes
  const handleInputChange = (field: keyof ContactInfo, value: string) => {
    if (editedInfo) {
      setEditedInfo({
        ...editedInfo,
        [field]: value
      });
    }
  };

  // Copy field to clipboard
  const handleCopy = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  // Download as vCard
  const downloadVCard = () => {
    if (!contactInfo) return;

    const vCardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      contactInfo.name ? `FN:${contactInfo.name}` : '',
      contactInfo.organization ? `ORG:${contactInfo.organization}` : '',
      contactInfo.position ? `TITLE:${contactInfo.position}` : '',
      contactInfo.email ? `EMAIL:${contactInfo.email}` : '',
      contactInfo.phone ? `TEL:${contactInfo.phone}` : '',
      contactInfo.website ? `URL:${contactInfo.website}` : '',
      contactInfo.address ? `ADR:;;${contactInfo.address};;;` : '',
      'END:VCARD'
    ].filter(Boolean).join('\n');

    const blob = new Blob([vCardData], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contact_${Date.now()}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download as CSV
  const downloadCSV = () => {
    if (!contactInfo) return;

    const csvHeader = 'Name,Organization,Position,Email,Phone,Website,Address\n';
    const csvData = [
      contactInfo.name || '',
      contactInfo.organization || '',
      contactInfo.position || '',
      contactInfo.email || '',
      contactInfo.phone || '',
      contactInfo.website || '',
      contactInfo.address || ''
    ].map(field => `"${field.replace(/"/g, '""')}"`).join(',');

    const csvContent = csvHeader + csvData;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contact_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render confidence indicator
  const renderConfidenceIndicator = (confidence: number) => {
    let color = 'text-red-500';
    let message = 'Low';
    
    if (confidence >= 80) {
      color = 'text-green-500';
      message = 'High';
    } else if (confidence >= 60) {
      color = 'text-yellow-500';
      message = 'Medium';
    }

    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">Confidence:</span>
        <span className={`text-sm font-medium ${color}`}>{message} ({confidence}%)</span>
      </div>
    );
  };

  // If processing or no contact info, show placeholder
  if (isProcessing) {
    return (
      <div className="neo-card rounded-xl border border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 p-4 md:p-6 h-full flex items-center justify-center">
        <div className="text-center space-y-3 md:space-y-4">
          <div className="animate-pulse flex justify-center">
            <div className="bg-gradient-to-br from-accent/30 to-primary/20 p-4 md:p-6 rounded-full shadow-inner relative">
              <CreditCard className="h-8 w-8 md:h-12 md:w-12 text-primary" />
            </div>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">Processing business card...</p>
        </div>
      </div>
    );
  }

  if (!contactInfo) {
    return (
      <div className="neo-card rounded-xl border border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 p-6 h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="bg-gradient-to-br from-accent/30 to-primary/20 p-6 rounded-full shadow-inner relative mx-auto">
            <CreditCard className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">No Contact Information</h3>
            <p className="text-muted-foreground mt-2">Upload a business card to extract contact details</p>
          </div>
        </div>
      </div>
    );
  }

  // Render edit mode
  if (isEditing && editedInfo) {
    return (
      <div className="neo-card rounded-xl border border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 p-4 md:p-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-base md:text-lg font-semibold flex items-center space-x-1 md:space-x-2">
            <Edit3 className="h-4 w-4 md:h-5 md:w-5 text-accent" />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Edit Contact Information</span>
          </h3>
        </div>

        <div className="space-y-3 md:space-y-4">
          <div>
            <label className="text-xs md:text-sm font-medium text-muted-foreground block mb-1">Name</label>
            <input 
              type="text" 
              value={editedInfo.name || ''} 
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full p-1.5 md:p-2 border border-accent/30 rounded-md bg-accent/5 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm md:text-base"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">Organization</label>
            <input 
              type="text" 
              value={editedInfo.organization || ''} 
              onChange={(e) => handleInputChange('organization', e.target.value)}
              className="w-full p-2 border border-accent/30 rounded-md bg-accent/5 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">Position</label>
            <input 
              type="text" 
              value={editedInfo.position || ''} 
              onChange={(e) => handleInputChange('position', e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-muted/30 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">Email</label>
            <input 
              type="email" 
              value={editedInfo.email || ''} 
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-muted/30 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">Phone</label>
            <input 
              type="text" 
              value={editedInfo.phone || ''} 
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-muted/30 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">Website</label>
            <input 
              type="text" 
              value={editedInfo.website || ''} 
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-muted/30 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">Address</label>
            <textarea 
              value={editedInfo.address || ''} 
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-muted/30 focus:ring-2 focus:ring-primary focus:border-primary transition-all min-h-[80px]"
            />
          </div>

          <div className="flex space-x-2 pt-2">
            <button 
              onClick={handleSaveEdit}
              className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-1.5 md:py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-xs md:text-sm"
            >
              <Save className="h-3 w-3 md:h-4 md:w-4" />
              <span>Save Changes</span>
            </button>
            <button 
              onClick={handleCancelEdit}
              className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-1.5 md:py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors text-xs md:text-sm"
            >
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render view mode
  return (
    <div className="neo-card rounded-xl border border-border p-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <span>Contact Information</span>
        </h3>
        {renderConfidenceIndicator(contactInfo.confidence)}
      </div>

      <div className="space-y-4">
        {/* Missing information alert */}
        {(!contactInfo.name || !contactInfo.email || !contactInfo.phone) && (
          <div className="flex items-center space-x-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <p className="text-amber-500 text-sm">Some information may be missing or incorrect. Please review and edit if needed.</p>
          </div>
        )}

        {/* Contact fields */}
        <div className="space-y-3 divide-y divide-border">
          {/* Name */}
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Name</span>
              {contactInfo.name && (
                <button 
                  onClick={() => handleCopy('name', contactInfo.name || '')}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                  title="Copy to clipboard"
                >
                  {copied === 'name' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </button>
              )}
            </div>
            <p className="text-foreground">{contactInfo.name || 'Not detected'}</p>
          </div>

          {/* Organization */}
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Organization</span>
              {contactInfo.organization && (
                <button 
                  onClick={() => handleCopy('organization', contactInfo.organization || '')}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                  title="Copy to clipboard"
                >
                  {copied === 'organization' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </button>
              )}
            </div>
            <p className="text-foreground">{contactInfo.organization || 'Not detected'}</p>
          </div>

          {/* Position */}
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Position</span>
              {contactInfo.position && (
                <button 
                  onClick={() => handleCopy('position', contactInfo.position || '')}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                  title="Copy to clipboard"
                >
                  {copied === 'position' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </button>
              )}
            </div>
            <p className="text-foreground">{contactInfo.position || 'Not detected'}</p>
          </div>

          {/* Email */}
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Email</span>
              {contactInfo.email && (
                <button 
                  onClick={() => handleCopy('email', contactInfo.email || '')}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                  title="Copy to clipboard"
                >
                  {copied === 'email' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </button>
              )}
            </div>
            {contactInfo.email ? (
              <a href={`mailto:${contactInfo.email}`} className="text-primary hover:underline">{contactInfo.email}</a>
            ) : (
              <p className="text-foreground">Not detected</p>
            )}
          </div>

          {/* Phone */}
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Phone</span>
              {contactInfo.phone && (
                <button 
                  onClick={() => handleCopy('phone', contactInfo.phone || '')}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                  title="Copy to clipboard"
                >
                  {copied === 'phone' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </button>
              )}
            </div>
            {contactInfo.phone ? (
              <a href={`tel:${contactInfo.phone}`} className="text-primary hover:underline">{contactInfo.phone}</a>
            ) : (
              <p className="text-foreground">Not detected</p>
            )}
          </div>

          {/* Website */}
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Website</span>
              {contactInfo.website && (
                <button 
                  onClick={() => handleCopy('website', contactInfo.website || '')}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                  title="Copy to clipboard"
                >
                  {copied === 'website' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </button>
              )}
            </div>
            {contactInfo.website ? (
              <a href={contactInfo.website.startsWith('http') ? contactInfo.website : `https://${contactInfo.website}`} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="text-primary hover:underline break-all">
                {contactInfo.website}
              </a>
            ) : (
              <p className="text-foreground">Not detected</p>
            )}
          </div>

          {/* Address */}
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Address</span>
              {contactInfo.address && (
                <button 
                  onClick={() => handleCopy('address', contactInfo.address || '')}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                  title="Copy to clipboard"
                >
                  {copied === 'address' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </button>
              )}
            </div>
            <p className="text-foreground break-words">{contactInfo.address || 'Not detected'}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 pt-4">
          {selectedHistoryItemId && (
            <button 
              onClick={handleStartEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit</span>
            </button>
          )}
          
          <button 
            onClick={downloadVCard}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download vCard</span>
          </button>
          
          <button 
            onClick={downloadCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}