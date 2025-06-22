import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  X,
  HelpCircle,
  UserX,
  Mail,
  TrendingUp
} from 'lucide-react';
import { Session, PlayerStatus } from '../types/index';

interface SessionStatusSummaryProps {
  session: Session;
}

interface StatusSummary {
  status: PlayerStatus;
  count: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
  label: string;
}

function SessionStatusSummary({ session }: SessionStatusSummaryProps): React.JSX.Element {
  const getStatusSummary = (): StatusSummary[] => {
    const totalPlayers = session.players?.length || 0;
    
    const counts = {
      'Invited': 0,
      'In': 0,
      'Out': 0,
      'Maybe': 0,
      'Attending but not playing': 0
    };

    // Count statuses from session players data
    if (session.players) {
      session.players.forEach(sessionPlayer => {
        counts[sessionPlayer.status]++;
      });
    } else {
      // Fallback: if no status data, assume all are invited
      counts['Invited'] = totalPlayers;
    }

    const statusConfigs = [
      {
        status: 'In' as PlayerStatus,
        color: '#4caf50',
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Confirmed In'
      },
      {
        status: 'Maybe' as PlayerStatus,
        color: '#ff9800',
        icon: <HelpCircle className="h-4 w-4" />,
        label: 'Maybe'
      },
      {
        status: 'Attending but not playing' as PlayerStatus,
        color: '#2196f3',
        icon: <UserX className="h-4 w-4" />,
        label: 'Attending (Not Playing)'
      },
      {
        status: 'Invited' as PlayerStatus,
        color: '#757575',
        icon: <Mail className="h-4 w-4" />,
        label: 'Pending Response'
      },
      {
        status: 'Out' as PlayerStatus,
        color: '#f44336',
        icon: <X className="h-4 w-4" />,
        label: 'Can\'t Attend'
      }
    ];

    return statusConfigs.map(config => ({
      ...config,
      count: counts[config.status],
      percentage: totalPlayers > 0 ? (counts[config.status] / totalPlayers) * 100 : 0
    })).filter(item => item.count > 0); // Only show statuses with players
  };

  const statusSummary = getStatusSummary();
  const totalPlayers = session.players?.length || 0;
  const confirmedPlayers = statusSummary.find(s => s.status === 'In')?.count || 0;
  const attendingPlayers = confirmedPlayers + (statusSummary.find(s => s.status === 'Attending but not playing')?.count || 0);

  if (totalPlayers === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Session Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No players in this session yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 sm:mb-6 overflow-hidden">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="truncate">Session Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="text-center">
            <div className="text-xl sm:text-3xl font-bold text-primary">
              {totalPlayers}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Total
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-3xl font-bold text-green-600">
              {confirmedPlayers}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Playing
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-3xl font-bold text-blue-600">
              {attendingPlayers}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Attending
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="space-y-3 sm:space-y-4">
          {statusSummary.map((item) => (
            <div key={item.status} className="space-y-1 sm:space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                  <span style={{ color: item.color }} className="flex items-center flex-shrink-0">
                    <span className="h-3 w-3 sm:h-4 sm:w-4">{item.icon}</span>
                  </span>
                  <span className="text-xs sm:text-sm font-medium truncate">
                    {item.label}
                  </span>
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0 ml-2">
                  {item.count} ({Math.round(item.percentage)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                <div
                  className="h-1.5 sm:h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default SessionStatusSummary;
