'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PlaidLinkButton, ManualPlaidLink } from './PlaidLink';
import { 
  Building2, 
  CreditCard, 
  TrendingUp, 
  Wallet,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Unlink,
} from 'lucide-react';

interface LinkedAccount {
  account_id: string;
  plaid_account_id: string;
  name: string;
  official_name?: string;
  mask?: string;
  type?: string;
  subtype?: string;
  current_balance?: number;
  available_balance?: number;
  currency: string;
  status: string;
}

interface PlaidItem {
  id: string;
  institution_name: string;
  institution_id?: string;
  status: string;
  created_at: string;
  accounts: LinkedAccount[];
}

export function ConnectedAccounts() {
  const router = useRouter();
  const [items, setItems] = useState<PlaidItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/plaid/accounts');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch accounts');
      }
      
      setItems(data.accounts || []);
    } catch (err: any) {
      console.error('Error fetching accounts:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/plaid/sync-transactions', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to sync transactions');
      }
      
      alert(`Synced ${data.transactions_imported} new transactions!`);
      router.refresh();
    } catch (err: any) {
      console.error('Error syncing:', err);
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async (itemId: string) => {
    if (!confirm('Are you sure you want to disconnect this bank? All linked accounts will be removed.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/plaid/accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to disconnect');
      }
      
      // Refresh accounts list
      fetchAccounts();
    } catch (err: any) {
      console.error('Error disconnecting:', err);
      setError(err.message);
    }
  };

  const formatCurrency = (amount?: number, currency = 'USD') => {
    if (amount === undefined || amount === null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30"><CheckCircle2 className="h-3 w-3 mr-1" /> Connected</Badge>;
      case 'error':
        return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30"><AlertCircle className="h-3 w-3 mr-1" /> Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAccountIcon = (type?: string) => {
    switch (type) {
      case 'depository':
        return <Wallet className="h-4 w-4" />;
      case 'credit':
        return <CreditCard className="h-4 w-4" />;
      case 'investment':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  // Calculate totals
  const totalBalance = items.reduce((sum, item) => 
    sum + item.accounts.reduce((acc, account) => 
      acc + (account.current_balance || 0), 0
    ), 0
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Connected Accounts</h1>
          <p className="text-muted-foreground mt-1">
            Link your bank accounts to automatically import transactions
          </p>
        </div>
        
        <div className="flex gap-2">
          {items.length > 0 && (
            <Button 
              variant="outline" 
              onClick={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Transactions
            </Button>
          )}
          <PlaidLinkButton onSuccess={fetchAccounts} />
        </div>
      </div>

      {error && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {items.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {items.reduce((sum, item) => sum + item.accounts.length, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                across {items.length} institution{items.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
              <p className="text-xs text-muted-foreground">
                combined account value
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Synced</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—</div>
              <p className="text-xs text-muted-foreground">
                click sync to update
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Connected Institutions */}
      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-axiom-primary to-axiom-secondary flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-background" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{item.institution_name}</CardTitle>
                    <CardDescription>
                      Connected {new Date(item.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(item.status)}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDisconnect(item.id)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <Separator />
              
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {item.accounts.map((account) => (
                    <div 
                      key={account.account_id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                          {getAccountIcon(account.type)}
                        </div>
                        <div>
                          <p className="font-medium">{account.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {account.subtype || account.type} •••• {account.mask}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(account.current_balance, account.currency)}
                        </p>
                        {account.available_balance !== undefined && account.available_balance !== account.current_balance && (
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(account.available_balance, account.currency)} available
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No accounts connected</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Connect your bank accounts to automatically import transactions and keep your finances in sync.
            </p>
            
            <div className="space-y-4 w-full max-w-md">
              <PlaidLinkButton size="lg" />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    or
                  </span>
                </div>
              </div>
              
              <ManualPlaidLink />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">Need help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Supported banks:</strong> Plaid supports over 12,000 banks including Chase, Bank of America, Wells Fargo, and more.
          </p>
          <p>
            <strong>Security:</strong> Your credentials are never stored on our servers. Plaid uses bank-level encryption.
          </p>
          <p>
            <strong>Troubleshooting:</strong> If your bank doesn't appear, try the manual link option or contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
