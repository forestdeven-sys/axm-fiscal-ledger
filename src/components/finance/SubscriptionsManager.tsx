'use client';

import { useState } from 'react';
import { useAppStore, Subscription, detectSubscriptions } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Repeat,
  Plus,
  Trash2,
  Edit,
  Calendar,
  DollarSign,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SUBSCRIPTION_CATEGORIES = [
  'Streaming', 'Software', 'Gaming', 'Music', 'News', 'Fitness', 'Cloud Storage', 'Other'
];

const POPULAR_SUBSCRIPTIONS = [
  { name: 'Netflix', category: 'Streaming', logo: '🎬' },
  { name: 'Spotify', category: 'Music', logo: '🎵' },
  { name: 'Disney+', category: 'Streaming', logo: '🏰' },
  { name: 'Apple Music', category: 'Music', logo: '🍎' },
  { name: 'YouTube Premium', category: 'Streaming', logo: '📺' },
  { name: 'Adobe Creative Cloud', category: 'Software', logo: '🎨' },
  { name: 'GitHub Pro', category: 'Software', logo: '💻' },
  { name: 'Xbox Game Pass', category: 'Gaming', logo: '🎮' },
];

export function SubscriptionsManager() {
  const { subscriptions, transactions, addSubscription, updateSubscription, deleteSubscription } = useAppStore();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [detectingFromTransactions, setDetectingFromTransactions] = useState(false);
  
  // Form state
  const [newSub, setNewSub] = useState({
    name: '',
    amount: '',
    frequency: 'monthly' as Subscription['frequency'],
    category: 'Other',
  });

  const activeSubscriptions = subscriptions.filter(s => s.isActive);
  const inactiveSubscriptions = subscriptions.filter(s => !s.isActive);
  
  const totalMonthlyCost = activeSubscriptions.reduce((sum, s) => {
    if (s.frequency === 'monthly') return sum + s.amount;
    if (s.frequency === 'weekly') return sum + (s.amount * 4.33);
    if (s.frequency === 'quarterly') return sum + (s.amount / 3);
    if (s.frequency === 'yearly') return sum + (s.amount / 12);
    return sum;
  }, 0);

  const totalYearlyCost = totalMonthlyCost * 12;

  const handleAddSubscription = () => {
    if (!newSub.name || !newSub.amount) return;
    
    addSubscription({
      id: crypto.randomUUID(),
      name: newSub.name,
      amount: parseFloat(newSub.amount),
      frequency: newSub.frequency,
      category: newSub.category,
      isActive: true,
      detectedFromTransactions: false,
    });
    
    setNewSub({ name: '', amount: '', frequency: 'monthly', category: 'Other' });
    setShowAddDialog(false);
  };

  const handleDetectFromTransactions = () => {
    setDetectingFromTransactions(true);
    
    setTimeout(() => {
      const detected = detectSubscriptions(transactions);
      
      detected.forEach(sub => {
        // Check if already exists
        const exists = subscriptions.find(s => 
          s.name.toLowerCase() === sub.name.toLowerCase()
        );
        
        if (!exists) {
          addSubscription({
            id: crypto.randomUUID(),
            ...sub,
            isActive: true,
            detectedFromTransactions: true,
          });
        }
      });
      
      setDetectingFromTransactions(false);
    }, 1500);
  };

  const toggleSubscription = (id: string) => {
    const sub = subscriptions.find(s => s.id === id);
    if (sub) {
      updateSubscription(id, { isActive: !sub.isActive });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Subscriptions</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your recurring payments
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleDetectFromTransactions}
            disabled={detectingFromTransactions || transactions.length === 0}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {detectingFromTransactions ? 'Detecting...' : 'Auto-Detect'}
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[var(--axiom-primary)] hover:bg-[var(--axiom-primary)]/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Subscription
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Subscription</DialogTitle>
                <DialogDescription>
                  Add a recurring payment to track
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    placeholder="Netflix, Spotify, etc."
                    value={newSub.name}
                    onChange={e => setNewSub({ ...newSub, name: e.target.value })}
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {POPULAR_SUBSCRIPTIONS.map(ps => (
                      <Badge
                        key={ps.name}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => setNewSub({ 
                          ...newSub, 
                          name: ps.name, 
                          category: ps.category 
                        })}
                      >
                        {ps.logo} {ps.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount</label>
                    <Input
                      type="number"
                      placeholder="9.99"
                      value={newSub.amount}
                      onChange={e => setNewSub({ ...newSub, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Frequency</label>
                    <Select 
                      value={newSub.frequency} 
                      onValueChange={(v) => setNewSub({ ...newSub, frequency: v as Subscription['frequency'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select 
                    value={newSub.category} 
                    onValueChange={(v) => setNewSub({ ...newSub, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBSCRIPTION_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSubscription} disabled={!newSub.name || !newSub.amount}>
                  Add Subscription
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Cost</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalMonthlyCost)}</p>
              </div>
              <Repeat className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Yearly Cost</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalYearlyCost)}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                <p className="text-2xl font-bold mt-1">{activeSubscriptions.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Subscriptions */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
          <CardDescription>
            These subscriptions are currently being tracked
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeSubscriptions.length > 0 ? (
            <div className="space-y-3">
              {activeSubscriptions.map((sub) => (
                <div 
                  key={sub.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Repeat className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{sub.name}</p>
                        {sub.detectedFromTransactions && (
                          <Badge variant="outline" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Auto-detected
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{sub.category}</Badge>
                        <span className="text-xs text-muted-foreground capitalize">{sub.frequency}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(sub.amount)}</p>
                      <p className="text-xs text-muted-foreground">per {sub.frequency.replace('ly', '')}</p>
                    </div>
                    <Switch
                      checked={sub.isActive}
                      onCheckedChange={() => toggleSubscription(sub.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-400"
                      onClick={() => deleteSubscription(sub.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Repeat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No Subscriptions Tracked</h3>
              <p className="text-muted-foreground mb-4">
                Add subscriptions manually or auto-detect from your transactions
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={handleDetectFromTransactions}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Auto-Detect
                </Button>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Manually
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive Subscriptions */}
      {inactiveSubscriptions.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-500" />
              Cancelled/Paused
            </CardTitle>
            <CardDescription>
              Subscriptions you've cancelled or paused
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inactiveSubscriptions.map((sub) => (
                <div 
                  key={sub.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/20 opacity-60"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Repeat className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{sub.name}</p>
                      <p className="text-xs text-muted-foreground">{sub.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-muted-foreground line-through">
                      {formatCurrency(sub.amount)}
                    </p>
                    <Switch
                      checked={sub.isActive}
                      onCheckedChange={() => toggleSubscription(sub.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-400"
                      onClick={() => deleteSubscription(sub.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Savings Potential */}
      {activeSubscriptions.length > 0 && (
        <Card className="bg-gradient-to-r from-green-500/10 to-transparent border-green-500/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Potential Annual Savings</p>
                  <p className="text-sm text-muted-foreground">
                    Cancel unused subscriptions to save {formatCurrency(totalYearlyCost)}/year
                  </p>
                </div>
              </div>
              <Button variant="outline" className="text-green-500 border-green-500/50 hover:bg-green-500/10">
                Analyze Usage
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
