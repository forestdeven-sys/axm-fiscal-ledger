'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Loader2, 
  Lock,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
      } else {
        setIsChecking(false);
      }
    };
    checkSession();
  }, [router, supabase]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: '✓ Check your email to confirm your account, then sign in!' });
    }
    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
      setIsLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleDemoSignIn = async () => {
    setIsLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: 'demo@axiom.finance',
      password: 'demodemo123',
    });

    if (error) {
      // Create demo account if doesn't exist
      const { error: signUpError } = await supabase.auth.signUp({
        email: 'demo@axiom.finance',
        password: 'demodemo123',
      });
      
      if (signUpError) {
        setMessage({ type: 'error', text: signUpError.message });
      } else {
        // Sign in after creating
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: 'demo@axiom.finance',
          password: 'demodemo123',
        });
        
        if (signInError) {
          setMessage({ type: 'error', text: signInError.message });
        } else {
          router.push('/');
          router.refresh();
        }
      }
    } else {
      router.push('/');
      router.refresh();
    }
    setIsLoading(false);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  const isConfigured = email && password;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-background to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <Card className="w-full max-w-md relative z-10 border-border/50 bg-background/80 backdrop-blur-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center">
            <TrendingUp className="h-7 w-7 text-background" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
              Axiom Finance
            </CardTitle>
            <CardDescription className="mt-2">
              Your AI-Powered Financial Dashboard
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Message */}
          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
              {message.text}
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1 h-11 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-400 hover:to-green-400"
                disabled={!isConfigured || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleSignUp}
                disabled={!isConfigured || isLoading}
                className="flex-1"
              >
                Sign Up
              </Button>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          {/* Demo Button */}
          <Button
            variant="outline"
            className="w-full h-12"
            onClick={handleDemoSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Try Free Demo
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Demo includes sample transactions, budgets, investments & more
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
