import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Loader2, AlertCircle, X } from 'lucide-react';
import Analytics from './Analytics';
import UserMenu from './UserMenu';
import { useAuth } from '../contexts/AuthContext';
import { playersApi, sessionsApi } from '../services/api';
import { Player, Session } from '../types/index';

function AnalyticsPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const [playersResponse, sessionsResponse] = await Promise.all([
        playersApi.getAll(),
        sessionsApi.getAll()
      ]);

      setPlayers(playersResponse);
      setSessions(sessionsResponse);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  const handleBackToMain = (): void => {
    navigate('/');
  };

  // Show loading spinner while auth or data is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-foreground">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading Analytics...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl p-4 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToMain}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Main
            </Button>
            <h1 className="text-4xl font-bold text-foreground drop-shadow-lg">
              🃏 Analytics
            </h1>
          </div>
          <div className="flex-shrink-0">
            <UserMenu sessions={sessions} />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Analytics Content */}
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            <Analytics
              sessions={sessions}
              players={players}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AnalyticsPage;
