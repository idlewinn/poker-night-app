import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface LoginButtonProps {
  variant?: 'button' | 'card';
  className?: string;
}

function LoginButton({ variant = 'button', className = '' }: LoginButtonProps): React.JSX.Element {
  const handleGoogleLogin = (): void => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  if (variant === 'card') {
    return (
      <Card className={`max-w-md mx-auto ${className}`}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            🃏 Poker Night
          </CardTitle>
          <p className="text-muted-foreground">
            Sign in to manage your poker sessions
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGoogleLogin}
            className="w-full"
            size="lg"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Sign in with Google
          </Button>
          
          <div className="text-center">
            <div className="text-sm text-muted-foreground">
              Create and manage your own poker sessions
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button 
      onClick={handleGoogleLogin}
      variant="default"
      className={className}
    >
      <LogIn className="h-4 w-4 mr-2" />
      Sign in with Google
    </Button>
  );
}

export default LoginButton;
