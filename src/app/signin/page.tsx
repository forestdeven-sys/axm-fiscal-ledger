'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Chrome, 
  Apple, 
  Mail, 
  Loader2, 
  Lock,
  TrendingUp
} from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(provider);
    try {
      await signIn(provider, { callbackUrl: '/' });
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(null);
    }
  };

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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-axiom-primary/10 via-background to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <Card className="w-full max-w-md relative z-10 border-border/50 bg-background/80 backdrop-blur-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-xl bg-gradient-to-br from-axiom-primary to-axiom-secondary flex items-center justify-center">
            <TrendingUp className="h-7 w-7 text-background" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gradient">
              Axiom Finance
            </CardTitle>
            <CardDescription className="mt-2">
              Sign in to access your financial dashboard
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* OAuth Providers */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 relative"
              onClick={() => handleOAuthSignIn('google')}
              disabled={!!isLoading}
            >
              {isLoading === 'google' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Chrome className="h-5 w-5 mr-2" />
                  Continue with Google
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => handleOAuthSignIn('apple')}
              disabled={!!isLoading}
            >
              {isLoading === 'apple' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Apple className="h-5 w-5 mr-2" />
                  Continue with Apple
                </>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Demo/Email Sign In */}
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
              className="w-full h-11"
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
        </CardContent>
      </Card>
    </div>
  );
}
