import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Trash2,
  Edit,
  Calendar,
  Users,
  CalendarDays,
  Clock,
  Mail,
  ExternalLink,
  MoreVertical,
  BarChart3
} from 'lucide-react';
import { SessionItemProps } from '../types/index';
import PlayerStatusBadge from './PlayerStatusBadge';

function SessionItem({ session, onRemove, onEdit, onViewDetails, onViewSession, onViewMetrics, isOwner = false, isPast = false, isActive = false }: SessionItemProps): React.JSX.Element {
  // Session players are now directly available in session.players
  const sessionPlayers = session.players;

  // Calculate status counts from session data
  const getStatusCounts = () => {
    const counts = {
      'Invited': 0,
      'In': 0,
      'Out': 0,
      'Maybe': 0,
      'Attending but not playing': 0
    };

    sessionPlayers.forEach(sessionPlayer => {
      counts[sessionPlayer.status]++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();



  // Format the creation date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format the scheduled date
  const formatScheduledDate = (dateString: string | null): string | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      hour12: true
    });
  };

  return (
    <Card className={`h-full transition-all duration-200 hover:shadow-md ${
      isActive ? 'bg-green-50 border-green-300 ring-2 ring-green-200' :
      isPast ? 'bg-gray-50 border-gray-200' : ''
    }`}>
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex flex-col h-full">
          {/* Session Header */}
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className="font-semibold text-gray-900 leading-tight truncate"
                  title={session.name || 'Poker Night'}
                >
                  {session.name || 'Poker Night'}
                </h3>
                {/* Game Type Badge */}
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    session.game_type === 'tournament'
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                      : 'bg-green-50 text-green-700 border-green-300'
                  }`}
                >
                  {session.game_type === 'tournament' ? '🏆 Tournament' : '💵 Cash'}
                </Badge>
                {isOwner && (
                  <Badge variant="secondary" className="text-xs">
                    Owner
                  </Badge>
                )}
                {isActive && (
                  <Badge className="text-xs bg-green-600 text-white animate-pulse">
                    Active
                  </Badge>
                )}
                {isPast && !isActive && (
                  <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                    Past
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="flex-1 mb-3">
            {/* Scheduled Date */}
            {session.scheduledDateTime && (
              <div className="flex items-center mb-2">
                <Clock className={`h-4 w-4 mr-2 ${
                  isActive ? 'text-green-600' :
                  isPast ? 'text-gray-500' : 'text-primary'
                }`} />
                <span className={`text-sm font-medium ${
                  isActive ? 'text-green-700' :
                  isPast ? 'text-gray-600' : 'text-primary'
                }`}>
                  {formatScheduledDate(session.scheduledDateTime)}
                </span>
              </div>
            )}

            <div className="flex items-center mb-2">
              <CalendarDays className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">
                Created {formatDate(session.createdAt)}
              </span>
            </div>

            <div className="flex items-center mb-3">
              <Users className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">
                {sessionPlayers.length} player{sessionPlayers.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Player chips */}
            {sessionPlayers.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {sessionPlayers.slice(0, 3).map(sessionPlayer => (
                  <Badge
                    key={sessionPlayer.player_id}
                    variant="outline"
                    className="text-xs"
                  >
                    {sessionPlayer.player?.name || 'Unknown Player'}
                  </Badge>
                ))}
                {sessionPlayers.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs text-gray-500"
                  >
                    +{sessionPlayers.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Status summary */}
            {sessionPlayers.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {Object.entries(statusCounts).map(([status, count]) => {
                  if (count === 0) return null;
                  return (
                    <PlayerStatusBadge
                      key={status}
                      status={status as any}
                      size="small"
                      variant="outlined"
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Session actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onViewSession}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Session Page
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onViewDetails}>
                  <Mail className="h-4 w-4 mr-2" />
                  Invite Status
                </DropdownMenuItem>
                {/* Only show owner-only options for session owners */}
                {isOwner && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      console.log('View Metrics clicked');
                      onViewMetrics();
                    }}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Metrics
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Session
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={onRemove}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Session
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SessionItem;
