'use client';

import { useState, useCallback } from 'react';
import { useAppStore, Transaction } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Upload,
  FileText,
  Check,
  X,
  AlertCircle,
  FileSpreadsheet,
  FileImage,
  Loader2,
} from 'lucide-react';
import { format, parse } from 'date-fns';

interface ParsedTransaction {
  transactionDate: string;
  clearingDate?: string;
  description: string;
  merchant?: string;
  category: string;
  type: string;
  amount: number;
  source: string;
}

interface ParseResult {
  transactions: ParsedTransaction[];
  duplicates: number;
  errors: string[];
}

export function FileUpload() {
  const { transactions, addTransactions } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);

  // Generate unique ID for deduplication
  const generateExternalId = (t: ParsedTransaction): string => {
    const dateStr = new Date(t.transactionDate).toISOString().split('T')[0];
    const merchantStr = (t.merchant || t.description || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const amountStr = Math.abs(t.amount).toFixed(2);
    return `${dateStr}-${merchantStr}-${amountStr}`;
  };

  // Parse Apple Card CSV
  const parseAppleCardCSV = (content: string): ParsedTransaction[] => {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const results: ParsedTransaction[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      // Handle quoted values
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      // Map to object
      const getField = (name: string): string => {
        const index = headers.findIndex(h => h.includes(name.toLowerCase()));
        return index >= 0 ? values[index] || '' : '';
      };
      
      const transactionDate = getField('transaction date');
      const clearingDate = getField('clearing date');
      const description = getField('description');
      const merchant = getField('merchant');
      const category = getField('category');
      const type = getField('type');
      const amountStr = getField('amount').replace(/[$,]/g, '');
      
      if (!transactionDate || !amountStr) continue;
      
      const amount = parseFloat(amountStr);
      if (isNaN(amount)) continue;
      
      results.push({
        transactionDate,
        clearingDate: clearingDate || undefined,
        description,
        merchant: merchant || undefined,
        category: category || 'Other',
        type: type || 'Purchase',
        amount: Math.abs(amount) * (type === 'Payment' ? -1 : 1),
        source: 'apple-card',
      });
    }
    
    return results;
  };

  // Parse generic bank CSV
  const parseGenericCSV = (content: string): ParsedTransaction[] => {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const results: ParsedTransaction[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      const getField = (names: string[]): string => {
        for (const name of names) {
          const index = headers.findIndex(h => h.includes(name));
          if (index >= 0 && values[index]) return values[index];
        }
        return '';
      };
      
      const dateStr = getField(['date', 'transaction date', 'post date']);
      const description = getField(['description', 'payee', 'merchant', 'name']);
      const amountStr = getField(['amount', 'debit', 'credit']).replace(/[$,]/g, '');
      const category = getField(['category', 'type']);
      
      if (!dateStr || !amountStr) continue;
      
      let amount = parseFloat(amountStr);
      if (isNaN(amount)) continue;
      
      results.push({
        transactionDate: dateStr,
        description,
        category: category || 'Other',
        type: amount < 0 ? 'Payment' : 'Purchase',
        amount: Math.abs(amount),
        source: 'bank-statement',
      });
    }
    
    return results;
  };

  // Handle file drop
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    await processFiles(files);
  }, []);

  // Handle file select
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    await processFiles(files);
  };

  // Process uploaded files
  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    setImportProgress(0);
    
    const allTransactions: ParsedTransaction[] = [];
    const errors: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadedFile(file);
      
      try {
        const content = await file.text();
        const ext = file.name.split('.').pop()?.toLowerCase();
        
        let parsed: ParsedTransaction[] = [];
        
        if (ext === 'csv') {
          // Try Apple Card format first
          const headers = content.split('\n')[0].toLowerCase();
          if (headers.includes('transaction date') && headers.includes('clearing date')) {
            parsed = parseAppleCardCSV(content);
          } else {
            parsed = parseGenericCSV(content);
          }
        } else if (ext === 'pdf') {
          // PDF parsing would need backend support
          errors.push(`PDF parsing requires backend. File: ${file.name}`);
        } else {
          errors.push(`Unsupported file type: ${ext}`);
        }
        
        allTransactions.push(...parsed);
        setImportProgress(((i + 1) / files.length) * 50);
      } catch (error) {
        errors.push(`Error processing ${file.name}: ${error}`);
      }
    }
    
    // Check for duplicates
    const existingIds = new Set(transactions.map(t => t.externalId).filter(Boolean));
    let duplicates = 0;
    
    const newTransactions = allTransactions.filter((t) => {
      const id = generateExternalId(t);
      if (existingIds.has(id)) {
        duplicates++;
        return false;
      }
      return true;
    });
    
    setParseResult({
      transactions: newTransactions,
      duplicates,
      errors,
    });
    
    setImportProgress(100);
    setIsProcessing(false);
  };

  // Import transactions
  const handleImport = () => {
    if (!parseResult) return;
    
    const newTransactions: Transaction[] = parseResult.transactions.map((t, i) => ({
      id: crypto.randomUUID(),
      transactionDate: t.transactionDate,
      clearingDate: t.clearingDate,
      description: t.description,
      merchant: t.merchant,
      category: t.category,
      type: t.type,
      amount: t.amount,
      currency: 'USD',
      source: t.source,
      sourceFile: uploadedFile?.name,
      isRecurring: false,
      externalId: generateExternalId(t),
    }));
    
    addTransactions(newTransactions);
    setParseResult(null);
    setUploadedFile(null);
  };

  // Auto-categorize using AI (placeholder)
  const handleAutoCategorize = async () => {
    // This would call the AI API to categorize transactions
    console.log('Auto-categorize not yet implemented');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-cyan">Import Data</h1>
          <p className="text-muted-foreground mt-1">
            Upload bank statements or Apple Card CSV files
          </p>
        </div>
        <Badge variant="outline" className="text-[var(--axiom-cyan)] border-[var(--axiom-cyan)]/30">
          {transactions.length} existing transactions
        </Badge>
      </div>

      {/* Upload Zone */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging
                ? 'border-[var(--axiom-cyan)] bg-[var(--axiom-cyan)]/5'
                : 'border-border hover:border-[var(--axiom-cyan)]/50'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv,.pdf"
              multiple
              onChange={handleFileSelect}
            />
            
            {isProcessing ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 mx-auto text-[var(--axiom-cyan)] animate-spin" />
                <p className="text-lg font-medium">Processing...</p>
                <Progress value={importProgress} className="w-64 mx-auto" />
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Drop files here</h3>
                <p className="text-muted-foreground mb-4">
                  or click to browse
                </p>
                <Button asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Select Files
                  </label>
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Supported: Apple Card CSV, Generic Bank CSV, PDF (coming soon)
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parse Result Preview */}
      {parseResult && (
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Import Preview</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setParseResult(null)}>
                  Cancel
                </Button>
                <Button onClick={handleImport} className="gap-2">
                  <Check className="h-4 w-4" />
                  Import {parseResult.transactions.length} Transactions
                </Button>
              </div>
            </div>
            <CardDescription>
              Review the parsed transactions before importing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-[var(--axiom-green)]/10 border border-[var(--axiom-green)]/20">
                <div className="text-2xl font-bold text-[var(--axiom-green)]">
                  {parseResult.transactions.length}
                </div>
                <div className="text-sm text-muted-foreground">New transactions</div>
              </div>
              <div className="p-4 rounded-lg bg-[var(--axiom-yellow)]/10 border border-[var(--axiom-yellow)]/20">
                <div className="text-2xl font-bold text-[var(--axiom-yellow)]">
                  {parseResult.duplicates}
                </div>
                <div className="text-sm text-muted-foreground">Duplicates skipped</div>
              </div>
              <div className="p-4 rounded-lg bg-[var(--axiom-red)]/10 border border-[var(--axiom-red)]/20">
                <div className="text-2xl font-bold text-[var(--axiom-red)]">
                  {parseResult.errors.length}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>

            {/* Errors */}
            {parseResult.errors.length > 0 && (
              <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <h4 className="font-medium text-destructive mb-2">Errors</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {parseResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Transaction Preview */}
            <ScrollArea className="h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parseResult.transactions.slice(0, 100).map((t, i) => (
                    <TableRow key={i}>
                      <TableCell className="number-mono text-sm">
                        {t.transactionDate}
                      </TableCell>
                      <TableCell>{t.merchant || t.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{t.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{t.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right number-mono">
                        <span className={t.amount >= 0 ? 'text-[var(--axiom-red)]' : 'text-[var(--axiom-green)]'}>
                          ${Math.abs(t.amount).toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Format Help */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Supported Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-[var(--axiom-cyan)]" />
                <span className="font-medium">Apple Card CSV</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Export from Apple Card app. Includes Transaction Date, Clearing Date, Merchant, Category.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-[var(--axiom-cyan)]" />
                <span className="font-medium">Generic Bank CSV</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Any bank statement with Date, Description, and Amount columns. Auto-detected.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <FileImage className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">PDF Statements</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Coming soon: Bank statement PDF parsing with AI vision.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
