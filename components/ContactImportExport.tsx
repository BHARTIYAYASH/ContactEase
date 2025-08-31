"use client";

import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import type { ContactInfo } from '@/app/business-card/page';

interface ContactImportExportProps {
  contacts: ContactInfo[];
  onImport: (contacts: ContactInfo[]) => void;
}

export default function ContactImportExport({ contacts, onImport }: ContactImportExportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection for import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);
    setImportSuccess(null);

    const reader = new FileReader();
    const extension = file.name.split('.').pop()?.toLowerCase();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;

        let importedContacts: ContactInfo[] = [];

        if (extension === 'csv') {
          importedContacts = parseCSV(content);
        } else if (extension === 'xlsx' || extension === 'xls') {
          setImportError('Excel format requires client-side libraries. Please use CSV format.');
          setIsImporting(false);
          return;
        } else {
          throw new Error('Unsupported file format. Please use CSV or Excel files.');
        }

        // Validate the number of contacts
        if (importedContacts.length === 0) {
          throw new Error('No valid contacts found in the file.');
        }

        if (importedContacts.length > 50) {
          throw new Error(`File contains ${importedContacts.length} contacts. Maximum allowed is 50.`);
        }

        // Process the imported contacts
        onImport(importedContacts);
        setImportSuccess(`Successfully imported ${importedContacts.length} contacts.`);
      } catch (error) {
        setImportError(error instanceof Error ? error.message : 'Failed to import contacts.');
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      setImportError('Failed to read the file.');
      setIsImporting(false);
    };

    if (extension === 'csv') {
      reader.readAsText(file);
    } else {
      setImportError('Unsupported file format. Please use CSV files.');
      setIsImporting(false);
    }
  };

  // Parse CSV content
  const parseCSV = (content: string): ContactInfo[] => {
    const lines = content.split('\n');
    if (lines.length < 2) throw new Error('CSV file must contain a header row and at least one data row.');

    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredFields = ['name', 'email', 'phone'];
    
    // Check if at least one required field exists in the header
    if (!requiredFields.some(field => header.includes(field))) {
      throw new Error('CSV file must contain at least one of these columns: Name, Email, Phone.');
    }

    const contacts: ContactInfo[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines

      const values = parseCSVLine(lines[i]);
      if (values.length !== header.length) continue; // Skip malformed lines

      const contact: Partial<ContactInfo> = {};
      let hasData = false;

      header.forEach((field, index) => {
        const value = values[index].trim();
        if (!value) return;

        hasData = true;
        
        // Map CSV fields to ContactInfo fields
        switch (field) {
          case 'name':
          case 'full name':
          case 'fullname':
            contact.name = value;
            break;
          case 'organization':
          case 'company':
            contact.organization = value;
            break;
          case 'position':
          case 'title':
          case 'job title':
            contact.position = value;
            break;
          case 'email':
            contact.email = value;
            break;
          case 'phone':
          case 'telephone':
          case 'mobile':
            contact.phone = value;
            break;
          case 'website':
          case 'url':
            contact.website = value;
            break;
          case 'address':
            contact.address = value;
            break;
        }
      });

      // Only add contacts that have at least some data
      if (hasData) {
        contacts.push(contact as ContactInfo);
      }
    }

    return contacts;
  };

  // Parse a CSV line handling quoted values
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          // Double quotes inside quoted string
          current += '"';
          i++;
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current); // Add the last field
    return result;
  };

  // Export contacts as CSV
  const exportCSV = () => {
    if (contacts.length === 0) {
      setImportError('No contacts to export.');
      setTimeout(() => setImportError(null), 3000);
      return;
    }

    const csvHeader = 'Name,Organization,Position,Email,Phone,Website,Address\n';
    const csvRows = contacts.map(contact => {
      return [
        contact.name || '',
        contact.organization || '',
        contact.position || '',
        contact.email || '',
        contact.phone || '',
        contact.website || '',
        contact.address || ''
      ].map(field => `"${field.replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = csvHeader + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setImportSuccess('Contacts exported successfully.');
    setTimeout(() => setImportSuccess(null), 3000);
  };

  return (
    <div className="neo-card rounded-xl border border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 p-3 md:p-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-base md:text-lg font-semibold flex items-center space-x-1 md:space-x-2">
          <FileSpreadsheet className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Import/Export Contacts</span>
        </h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
        <div className="flex-1">
          <label htmlFor="import-file" className="flex flex-col items-center justify-center w-full h-20 md:h-24 border-2 border-dashed border-accent/30 rounded-lg cursor-pointer bg-accent/5 hover:bg-accent/10 transition-colors">
            <div className="flex flex-col items-center justify-center pt-3 md:pt-5 pb-4 md:pb-6">
              <Upload className="h-5 w-5 md:h-6 md:w-6 text-primary mb-1 md:mb-2" />
              <p className="text-xs md:text-sm text-muted-foreground">Import from CSV</p>
              <p className="text-xs text-muted-foreground">(Max 50 contacts)</p>
            </div>
            <input 
              id="import-file" 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </label>
        </div>

        <div className="flex-1">
          <button 
            onClick={exportCSV}
            className="flex flex-col items-center justify-center w-full h-20 md:h-24 border-2 border-accent/30 rounded-lg cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <Download className="h-5 w-5 md:h-6 md:w-6 text-primary mb-1 md:mb-2" />
            <p className="text-xs md:text-sm text-muted-foreground">Export to CSV</p>
            <p className="text-xs text-muted-foreground">{contacts.length} contact(s)</p>
          </button>
        </div>
      </div>

      {/* Status messages */}
      {importError && (
        <div className="mt-3 md:mt-4 p-2 md:p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-red-500 mr-1 md:mr-2 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs md:text-sm text-red-700">{importError}</p>
          </div>
          <button onClick={() => setImportError(null)} className="text-red-500 hover:text-red-700">
            <X className="h-3 w-3 md:h-4 md:w-4" />
          </button>
        </div>
      )}

      {importSuccess && (
        <div className="mt-3 md:mt-4 p-2 md:p-3 bg-green-50 border border-green-200 rounded-lg flex items-start">
          <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 mr-1 md:mr-2 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs md:text-sm text-green-700">{importSuccess}</p>
          </div>
          <button onClick={() => setImportSuccess(null)} className="text-green-500 hover:text-green-700">
            <X className="h-3 w-3 md:h-4 md:w-4" />
          </button>
        </div>
      )}
    </div>
  );
}