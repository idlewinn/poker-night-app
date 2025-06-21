import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import SessionItem from './SessionItem';
import { SessionListProps } from '../types/index';

function SessionList({ sessions, players, onRemoveSession, onEditSession, onViewSessionDetails, onViewSession, hideHeader = false }: SessionListProps): React.JSX.Element {
  if (sessions.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            No sessions created yet. Create your first session above!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      {!hideHeader && (
        <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
          <Calendar className="h-7 w-7 text-primary" />
          Sessions ({sessions.length})
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {sessions.map(session => (
          <SessionItem
            key={session.id}
            session={session}
            players={players}
            onRemove={() => onRemoveSession(session.id)}
            onEdit={() => onEditSession(session)}
            onViewDetails={() => onViewSessionDetails(session)}
            onViewSession={() => onViewSession(session)}
          />
        ))}
      </div>
    </div>
  )
}

export default SessionList;
