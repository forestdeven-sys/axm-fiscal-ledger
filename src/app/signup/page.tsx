'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Loader2, Lock, UserPlus, TrendingUp } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error ?? 'Unable to create account.');
        console.error('Signup error:', data);
        return;
      }

      router.push('/signin?created=1');
    } catch (err) {
      console.error('Signup exception:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isConfigured = email && password;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-background to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <Card className="w-full max-w-md relative z-10 border-border/50 bg-background/80 backdrop-blur-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center">
            <TrendingUp className="h-7 w-7 text-background" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
              Create your account
            </CardTitle>
            <CardDescription className="mt-2">
              Start managing your financial dashboard
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
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
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/signin')}
                disabled={isLoading}
                className="flex-1"
              >
                Back to Sign In
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
