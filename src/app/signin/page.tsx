'use client';

import { signIn, useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Loader2, 
  Lock,
  TrendingUp
} from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if already signed in
  if (session) {
    router.push('/');
    return null;
  }

  const handleDemoSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('demo');
    
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push('/');
    } else {
      setIsLoading(null);
    }
  };

  const isDemoConfigured = email && password;

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
              Sign in to access your financial dashboard
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Demo/Email Sign In - Always Available */}
          <form onSubmit={handleDemoSignIn} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="demo@axiom.finance"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Any password works"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!!isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-400 hover:to-green-400"
              disabled={!isDemoConfigured || !!isLoading}
            >
              {isLoading === 'demo' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Demo mode: Enter any email/password to sign in
            </p>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Quick Demo
              </span>
            </div>
          </div>

          {/* Quick demo buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-10"
              onClick={() => {
                setEmail('demo@axiom.finance');
                setPassword('demo123');
              }}
              disabled={!!isLoading}
            >
              Load Demo User
            </Button>
            <Button
              variant="outline"
              className="h-10"
              onClick={() => {
                setEmail('admin@axiom.finance');
                setPassword('admin123');
              }}
              disabled={!!isLoading}
            >
              Load Admin
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
