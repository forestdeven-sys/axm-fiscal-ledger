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
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Check if OAuth is configured
  const isOAuthConfigured = process.env.NEXT_PUBLIC_OAUTH_GOOGLE === 'true' || 
                            process.env.NEXT_PUBLIC_OAUTH_APPLE === 'true';

  const handleDemoSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('demo');
    setError(null);
    
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push('/');
    } else {
      setError('Invalid credentials. Please try again.');
      setIsLoading(null);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(provider);
    setError(null);
    try {
      await signIn(provider, { callbackUrl: '/' });
    } catch (error) {
      console.error('Sign in error:', error);
      setError('OAuth sign-in is not configured. Please use email/password.');
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
          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

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
                'Sign In with Email'
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
                Or continue with
              </span>
            </div>
          </div>

          {/* OAuth Providers - Show as disabled/educational */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 opacity-50 cursor-not-allowed"
              disabled
            >
              <Chrome className="h-5 w-5 mr-2" />
              Google OAuth (Coming Soon)
            </Button>
            
            <Button
              variant="outline"
              className="w-full h-12 opacity-50 cursor-not-allowed"
              disabled
            >
              <Apple className="h-5 w-5 mr-2" />
              Apple OAuth (Coming Soon)
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-4">
              OAuth requires Google Cloud / Apple Developer setup.
              <br />
              Add credentials to enable.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
