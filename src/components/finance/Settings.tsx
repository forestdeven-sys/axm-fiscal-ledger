'use client';

import { useState } from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings as SettingsIcon,
  Key,
  Bot,
  Database,
  Globe,
  Palette,
  Layout,
  Shield,
  Trash2,
  Download,
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const AI_MODELS = [
  { value: 'xiaomi/mimo-v2-flash', label: 'MiMo V2 Flash (Recommended)' },
  { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'google/gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'deepseek/deepseek-r1', label: 'DeepSeek R1 (Reasoning)' },
];

const COLOR_SCHEMES = [
  { value: 'cyber', label: 'Cyber Cyan', primary: '#00e5ff' },
  { value: 'mint', label: 'Mint Green', primary: '#00ff88' },
  { value: 'ocean', label: 'Ocean Blue', primary: '#3b82f6' },
  { value: 'sunset', label: 'Sunset Orange', primary: '#f97316' },
  { value: 'purple', label: 'Purple Haze', primary: '#a855f7' },
  { value: 'rose', label: 'Rose Gold', primary: '#f43f5e' },
];

export function Settings() {
  const {
    settings,
    updateSettings,
    aiSettings,
    updateAISettings,
    themeSettings,
    updateThemeSettings,
    layoutSettings,
    updateLayoutSettings,
    transactions,
    documents,
    clearTransactions,
    clearChatSessions,
  } = useAppStore();

  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // Test API connection
  const testConnection = async () => {
    setTestStatus('testing');
    try {
      // Simple test - just check if we can reach the API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello',
          financialContext: '',
        }),
      });

      if (response.ok) {
        setTestStatus('success');
        toast.success('Connection successful');
      } else {
        throw new Error('Connection failed');
      }
    } catch {
      setTestStatus('error');
      toast.error('Connection failed - check your API key');
    }
  };

  // Export all data
  const exportData = () => {
    const data = {
      settings,
      aiSettings: {
        ...aiSettings,
        apiKey: aiSettings.apiKey ? '***' : '',
        webSearchApiKey: aiSettings.webSearchApiKey ? '***' : '',
      },
      transactions,
      documents: documents.map(d => ({ ...d, content: undefined, embedding: undefined })),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `axiom-finance-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  // Clear all data
  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      clearTransactions();
      clearChatSessions();
      toast.success('All data cleared');
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[var(--axiom-primary)] to-[var(--axiom-secondary)] flex items-center justify-center">
          <SettingsIcon className="h-5 w-5 text-background" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gradient">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure Axiom Finance</p>
        </div>
      </div>

      <Tabs defaultValue="ai" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="ai" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI & Search
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="layout" className="gap-2">
            <Layout className="h-4 w-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
        </TabsList>

        {/* AI & Search Tab */}
        <TabsContent value="ai">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-[var(--axiom-primary)]" />
                AI Configuration
              </CardTitle>
              <CardDescription>
                Configure the AI model for financial advice and analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Model Selection */}
              <div className="space-y-2">
                <Label>AI Model</Label>
                <Select
                  value={aiSettings.model}
                  onValueChange={(v) => updateAISettings({ model: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_MODELS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>API Key (Optional)</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="API key (optional - built-in AI works without key)"
                    value={aiSettings.apiKey}
                    onChange={(e) => updateAISettings({ apiKey: e.target.value })}
                  />
                  <Button
                    variant="outline"
                    onClick={testConnection}
                    disabled={testStatus === 'testing'}
                  >
                    {testStatus === 'testing' ? 'Testing...' :
                     testStatus === 'success' ? <Check className="h-4 w-4 text-green-500" /> :
                     'Test'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Axiom has built-in AI capabilities. Add your own API key for extended features.
                </p>
              </div>

              <Separator />

              {/* Web Search */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Enable Web Search
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow AI to search the web for financial advice
                    </p>
                  </div>
                  <Switch
                    checked={aiSettings.webSearchEnabled}
                    onCheckedChange={(v) => updateAISettings({ webSearchEnabled: v })}
                  />
                </div>

                {aiSettings.webSearchEnabled && (
                  <div className="space-y-2">
                    <Label>Web Search API Key</Label>
                    <Input
                      type="password"
                      placeholder="Search API key"
                      value={aiSettings.webSearchApiKey || ''}
                      onChange={(e) => updateAISettings({ webSearchApiKey: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Web search requires a search API key (e.g., Tavily, Serper)
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-[var(--axiom-primary)]" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use dark theme (recommended for finance apps)
                  </p>
                </div>
                <Switch
                  checked={themeSettings.mode === 'dark'}
                  onCheckedChange={(v) => updateThemeSettings({ mode: v ? 'dark' : 'light' })}
                />
              </div>

              <Separator />

              {/* Color Scheme */}
              <div className="space-y-3">
                <Label>Color Scheme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {COLOR_SCHEMES.map((scheme) => (
                    <button
                      key={scheme.value}
                      onClick={() => {
                        updateThemeSettings({ 
                          colorScheme: scheme.value as any,
                          accentColor: scheme.primary 
                        });
                      }}
                      className={cn(
                        "p-4 rounded-lg border transition-all text-left",
                        themeSettings.colorScheme === scheme.value
                          ? "border-2 bg-muted/50"
                          : "border-border/50 hover:border-border"
                      )}
                      style={{
                        borderColor: themeSettings.colorScheme === scheme.value ? scheme.primary : undefined
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: scheme.primary }}
                        />
                        <span className="text-sm font-medium">{scheme.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-[var(--axiom-primary)]" />
                Layout
              </CardTitle>
              <CardDescription>
                Customize panel positions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sidebar Position */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sidebar Position</Label>
                  <p className="text-sm text-muted-foreground">
                    Position of the main navigation sidebar
                  </p>
                </div>
                <Select
                  value={layoutSettings.sidebarPosition}
                  onValueChange={(v) => updateLayoutSettings({ sidebarPosition: v as 'left' | 'right' })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Chat Panel Position */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>AI Chat Panel Position</Label>
                  <p className="text-sm text-muted-foreground">
                    Position of the AI assistant panel
                  </p>
                </div>
                <Select
                  value={layoutSettings.chatPanelPosition}
                  onValueChange={(v) => updateLayoutSettings({ chatPanelPosition: v as 'left' | 'right' })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Chat Panel Width */}
              <div className="space-y-2">
                <Label>Chat Panel Width: {layoutSettings.chatPanelWidth}px</Label>
                <input
                  type="range"
                  min={300}
                  max={500}
                  step={20}
                  value={layoutSettings.chatPanelWidth}
                  onChange={(e) => updateLayoutSettings({ chatPanelWidth: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-[var(--axiom-primary)]" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{transactions.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Documents</p>
                  <p className="text-2xl font-bold">{documents.length}</p>
                </div>
              </div>

              {/* Preferences */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Cents</Label>
                  <p className="text-sm text-muted-foreground">
                    Display decimal amounts in currency
                  </p>
                </div>
                <Switch
                  checked={settings.showCents}
                  onCheckedChange={(v) => updateSettings({ showCents: v })}
                />
              </div>

              <Separator />

              {/* Privacy Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Privacy Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Disable AI features, use local calculations only
                  </p>
                </div>
                <Switch
                  checked={settings.privacyMode}
                  onCheckedChange={(v) => updateSettings({ privacyMode: v })}
                />
              </div>

              <Separator />

              {/* Export/Clear */}
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 gap-2" onClick={exportData}>
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 text-red-500 hover:text-red-400"
                  onClick={handleClearData}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All Data
                </Button>
              </div>

              {/* Privacy Note */}
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-500">Privacy Note</p>
                    <p className="text-muted-foreground">
                      All data is stored locally in your browser. AI features send minimal 
                      context to the AI model for analysis. Your API keys are stored securely 
                      in browser localStorage.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
