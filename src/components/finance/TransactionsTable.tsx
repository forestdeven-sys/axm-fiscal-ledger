'use client';

import { useState, useMemo } from 'react';
import { useAppStore, Transaction } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';

const ITEMS_PER_PAGE = 50;

const TRANSACTION_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'debit', label: 'Debit' },
  { value: 'credit', label: 'Credit' },
  { value: 'payment', label: 'Payment' },
  { value: 'refund', label: 'Refund' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'interest', label: 'Interest' },
  { value: 'fee', label: 'Fee' },
];

const CATEGORIES = [
  'Transportation',
  'Grocery',
  'Gas',
  'Insurance',
  'Utilities',
  'Restaurants',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'AI Tools',
  'Developer Tools',
  'Subscription',
  'Other',
];

export function TransactionsTable() {
  const { transactions, updateTransaction, deleteTransaction } = useAppStore();
  
  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({
    category: '',
    tags: '',
    notes: '',
  });

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          t.description.toLowerCase().includes(searchLower) ||
          (t.merchant?.toLowerCase().includes(searchLower)) ||
          (t.category?.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;

      // Category filter
      if (categoryFilter !== 'all') {
        const cat = t.userCategory || t.aiCategory || t.category || 'Other';
        if (cat !== categoryFilter) return false;
      }

      // Date range filter
      if (dateRange !== 'all') {
        const now = new Date();
        const txDate = new Date(t.transactionDate);
        const daysAgo = {
          '7d': 7,
          '30d': 30,
          '90d': 90,
        }[dateRange] || 0;
        const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        if (txDate < cutoff) return false;
      }

      return true;
    }).sort((a, b) => 
      new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
    );
  }, [transactions, search, typeFilter, categoryFilter, dateRange]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Merchant', 'Category', 'Type', 'Amount', 'Tags', 'Notes'];
    const rows = filteredTransactions.map((t) => [
      format(new Date(t.transactionDate), 'yyyy-MM-dd'),
      t.description,
      t.merchant || '',
      t.userCategory || t.aiCategory || t.category || 'Other',
      t.type,
      t.amount.toString(),
      typeof t.tags === 'string' ? t.tags : (t.tags || ''),
      t.notes || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell)}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `axiom-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Open edit dialog
  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditForm({
      category: transaction.userCategory || transaction.aiCategory || transaction.category || '',
      tags: typeof transaction.tags === 'string' ? transaction.tags : (transaction.tags || ''),
      notes: transaction.notes || '',
    });
    setEditDialogOpen(true);
  };

  // Save edit
  const saveEdit = () => {
    if (!editingTransaction) return;
    updateTransaction(editingTransaction.id, {
      userCategory: editForm.category,
      tags: editForm.tags,
      notes: editForm.notes,
    });
    setEditDialogOpen(false);
    setEditingTransaction(null);
  };

  // Get unique categories from transactions
  const usedCategories = useMemo(() => {
    const cats = new Set<string>();
    transactions.forEach((t) => {
      const cat = t.userCategory || t.aiCategory || t.category || 'Other';
      cats.add(cat);
    });
    return Array.from(cats).sort();
  }, [transactions]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-cyan">Transactions</h1>
          <p className="text-muted-foreground mt-1">
            {filteredTransactions.length} of {transactions.length} transactions
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {usedCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-400px)]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="sticky top-0 bg-background">Date</TableHead>
                  <TableHead className="sticky top-0 bg-background">Description</TableHead>
                  <TableHead className="sticky top-0 bg-background">Category</TableHead>
                  <TableHead className="sticky top-0 bg-background">Type</TableHead>
                  <TableHead className="sticky top-0 bg-background text-right">Amount</TableHead>
                  <TableHead className="sticky top-0 bg-background text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="group">
                      <TableCell className="number-mono text-sm">
                        {format(new Date(transaction.transactionDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{transaction.merchant || transaction.description}</span>
                          {transaction.merchant && (
                            <span className="text-xs text-muted-foreground">{transaction.description}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {transaction.userCategory || transaction.aiCategory || transaction.category || 'Other'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            transaction.type === 'payment' ? 'text-green-500 border-green-500/30' :
                            transaction.type === 'credit' ? 'text-green-500 border-green-500/30' :
                            transaction.type === 'interest' ? 'text-red-500 border-red-500/30' :
                            transaction.type === 'refund' ? 'text-cyan-500 border-cyan-500/30' :
                            ''
                          }
                        >
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right number-mono font-medium">
                        <span className={transaction.amount >= 0 ? 'text-[var(--axiom-red)]' : 'text-[var(--axiom-green)]'}>
                          {transaction.amount >= 0 ? '-' : '+'}${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(transaction)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[var(--axiom-red)]"
                            onClick={() => deleteTransaction(transaction.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={editForm.category}
                onValueChange={(v) => setEditForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input
                placeholder="Comma-separated tags"
                value={editForm.tags}
                onChange={(e) => setEditForm((f) => ({ ...f, tags: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Add notes..."
                value={editForm.notes}
                onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
