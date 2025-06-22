import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Trash2,
  Edit,
  Calendar,
  Users,
  CalendarDays,
  Clock,
  Mail,
  ExternalLink
} from 'lucide-react';
import { SessionItemProps } from '../types/index';
import PlayerStatusBadge from './PlayerStatusBadge';

function SessionItem({ session, players, onRemove, onEdit, onViewDetails, onViewSession, isOwner = false, isPast = false, isActive = false }: SessionItemProps): React.JSX.Element {
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
                    {sessionPlayer.player.name}
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
          <div className="flex gap-1 justify-end">
            <Button
              onClick={onViewSession}
              variant="ghost"
              size="sm"
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              title="View Session Page"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              onClick={onViewDetails}
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Invite Status"
            >
              <Mail className="h-4 w-4" />
            </Button>
            {/* Only show edit/delete buttons for session owners */}
            {isOwner && (
              <>
                <Button
                  onClick={onEdit}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  title="Edit session"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  onClick={onRemove}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Remove session"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SessionItem;
