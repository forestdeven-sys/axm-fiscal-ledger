'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Building2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PlaidLinkButtonProps {
  onSuccess?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function PlaidLinkButton({ 
  onSuccess,
  variant = 'default',
  size = 'default',
}: PlaidLinkButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Create a link token
      const tokenResponse = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        if (tokenData.error === 'Plaid not configured') {
          setError('Plaid is not configured. Please add your API keys to .env');
          setIsLoading(false);
          return;
        }
        throw new Error(tokenData.message || 'Failed to create link token');
      }

      // Step 2: Open Plaid Link
      // Note: In production, use the actual Plaid Link SDK
      // For now, we'll use a simple redirect approach or manual token entry
      
      // For demo purposes, show a message about Plaid configuration
      if (typeof window !== 'undefined') {
        // Dynamic import of Plaid Link would go here
        // For now, we'll show instructions
        alert('Plaid Link would open here in production. Make sure your PLAID_CLIENT_ID and PLAID_SECRET are set in .env');
      }

      // In a full implementation:
      // const handler = Plaid.create({
      //   token: tokenData.link_token,
      //   onSuccess: handlePlaidSuccess,
      //   onExit: handlePlaidExit,
      // });
      // handler.open();

    } catch (err: any) {
      console.error('Plaid Link error:', err);
      setError(err.message || 'Failed to connect bank');
    } finally {
      setIsLoading(false);
    }
  }, [router, onSuccess]);

  // Handler for Plaid Link success (would be used with actual Plaid Link SDK)
  const handlePlaidSuccess = useCallback(async (publicToken: string, metadata: any) => {
    try {
      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicToken, metadata }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to link account');
      }

      // Refresh the accounts list
      if (onSuccess) onSuccess();
      router.refresh();
    } catch (err: any) {
      console.error('Error exchanging token:', err);
      setError(err.message);
    }
  }, [router, onSuccess]);

  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };

  return (
    <div className="space-y-2">
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={isLoading}
        className={variant === 'default' ? 'bg-axiom-primary hover:bg-axiom-primary/90' : ''}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Plus className="mr-2 h-4 w-4" />
        )}
        Connect Bank Account
      </Button>
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Simplified version for quick testing without Plaid SDK
 */
export function ManualPlaidLink() {
  const [publicToken, setPublicToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicToken.trim()) return;

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          publicToken: publicToken.trim(),
          metadata: {}
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to link account');
      }

      setMessage(`Successfully connected ${data.institution_name} with ${data.accounts_count} account(s)!`);
      setPublicToken('');
      router.refresh();
    } catch (err: any) {
      setMessage(err.message || 'Failed to connect account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Building2 className="h-4 w-4" />
        <span>Link Bank Account (Manual)</span>
      </div>
      
      <p className="text-xs text-muted-foreground">
        In production, Plaid Link would open automatically. For testing, 
        enter a public token or configure your Plaid API keys in .env.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={publicToken}
          onChange={(e) => setPublicToken(e.target.value)}
          placeholder="Enter public token (or skip for demo)"
          className="w-full h-10 px-3 rounded-md border bg-background"
        />
        
        <Button 
          type="submit" 
          disabled={isLoading || !publicToken.trim()}
          size="sm"
        >
          {isLoading ? 'Connecting...' : 'Link Account'}
        </Button>
      </form>

      {message && (
        <p className={`text-sm ${message.includes('Successfully') ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
