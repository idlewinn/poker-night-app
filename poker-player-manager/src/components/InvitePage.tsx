import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  HelpCircle,
  Users,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { sessionsApi } from '../services/api';
import { Session, SessionPlayer } from '../types/index';

interface InvitePageParams {
  sessionId: string;
  encodedEmail: string;
}

type PlayerStatus = 'In' | 'Out' | 'Maybe' | 'Attending but not playing';

function InvitePage(): React.JSX.Element {
  const { sessionId, encodedEmail } = useParams<InvitePageParams>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [playerEmail, setPlayerEmail] = useState<string>('');
  const [currentStatus, setCurrentStatus] = useState<PlayerStatus>('In');
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Decode email from base64
  useEffect(() => {
    if (encodedEmail) {
      try {
        const decodedEmail = atob(encodedEmail);
        setPlayerEmail(decodedEmail);
      } catch (err) {
        setError('Invalid invite link');
      }
    }
  }, [encodedEmail]);

  // Load session data
  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId) {
        setError('Invalid session ID');
        setLoading(false);
        return;
      }

      try {
        const sessionData = await sessionsApi.getById(parseInt(sessionId));
        setSession(sessionData);

        // Find current player's status
        const playerSession = sessionData.players?.find(
          sp => sp.player?.email === playerEmail
        );
        if (playerSession) {
          setCurrentStatus(playerSession.status as PlayerStatus);
        }
      } catch (err) {
        console.error('Failed to load session:', err);
        setError('Session not found or invalid invite link');
      } finally {
        setLoading(false);
      }
    };

    if (playerEmail) {
      loadSession();
    }
  }, [sessionId, playerEmail]);

  const formatSessionDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSessionTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusIcon = (status: PlayerStatus) => {
    switch (status) {
      case 'In':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Out':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'Maybe':
        return <HelpCircle className="h-5 w-5 text-yellow-600" />;
      case 'Attending but not playing':
        return <Users className="h-5 w-5 text-blue-600" />;
      default:
        return <HelpCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: PlayerStatus): string => {
    switch (status) {
      case 'In':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Out':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Maybe':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Attending but not playing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleStatusUpdate = async (newStatus: PlayerStatus) => {
    if (!session || !playerEmail) return;

    setUpdating(true);
    setError(null);

    try {
      // Find the player in the session
      const playerSession = session.players?.find(
        sp => sp.player?.email === playerEmail
      );

      if (!playerSession) {
        throw new Error('Player not found in session');
      }

      // Update player status via API
      await sessionsApi.updatePlayerStatus(session.id, playerSession.player_id, newStatus);
      
      setCurrentStatus(newStatus);
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update status:', err);
      setError('Failed to update your status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Loading invite...</h2>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Invalid Invite
            </h2>
            <p className="text-muted-foreground mb-4">
              {error || 'This invite link is not valid or has expired.'}
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Poker Night
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusOptions: PlayerStatus[] = ['In', 'Out', 'Maybe', 'Attending but not playing'];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl p-4 sm:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            🃏 Poker Night Invite
          </h1>
          <p className="text-muted-foreground">
            You're invited to join the game!
          </p>
        </div>

        {/* Session Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-primary" />
              {session.name || 'Poker Night'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {session.scheduledDateTime && (
              <>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">
                    {formatSessionDate(session.scheduledDateTime)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">
                    {formatSessionTime(session.scheduledDateTime)}
                  </span>
                </div>
              </>
            )}
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Invited as: {playerEmail}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Current Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Your Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {getStatusIcon(currentStatus)}
              <Badge className={getStatusColor(currentStatus)}>
                {currentStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Status Update Options */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Update Your Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {statusOptions.map((status) => (
                <Button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={updating || currentStatus === status}
                  variant={currentStatus === status ? 'default' : 'outline'}
                  className={`justify-start h-auto p-4 ${
                    currentStatus === status ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(status)}
                    <span className="font-medium">{status}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Success Message */}
        {success && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Status updated successfully!</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Back Button */}
        <div className="text-center">
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Poker Night
          </Button>
        </div>
      </div>
    </div>
  );
}

export default InvitePage;
