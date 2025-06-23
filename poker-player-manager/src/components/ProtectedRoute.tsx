import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoginButton from './LoginButton';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

function ProtectedRoute({
  children,
  fallback
}: ProtectedRouteProps): React.JSX.Element {
  const { user, isAuthenticated, isLoading, error } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Loading...</h2>
          <p className="text-muted-foreground">Checking authentication</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Authentication Error
            </h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <LoginButton variant="button" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated || !user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <LoginButton variant="card" />
      </div>
    );
  }

  // User is authenticated
  return <>{children}</>;
}

export default ProtectedRoute;
