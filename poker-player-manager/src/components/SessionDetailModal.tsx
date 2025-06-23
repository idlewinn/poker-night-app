import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from 'lucide-react';
import { Session, Player, PlayerStatus } from '../types/index';
import SessionPlayerList from './SessionPlayerList';
import SessionStatusSummary from './SessionStatusSummary';

interface SessionDetailModalProps {
  open: boolean;
  onClose: () => void;
  session: Session | null;
  players: Player[];
  onStatusChange?: (playerId: number, newStatus: PlayerStatus) => void;
}

function SessionDetailModal({ 
  open, 
  onClose, 
  session, 
  players, 
  onStatusChange 
}: SessionDetailModalProps): React.JSX.Element {
  if (!session) {
    return <></>;
  }

  const formatScheduledDate = (dateString: string | null): string | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Calendar className="h-6 w-6 text-primary" />
            {session.name || 'Session Details'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 overflow-hidden">
          {/* Session Info */}
          <div className="border-b pb-3 sm:pb-4">
            {session.scheduledDateTime && (
              <p className="text-sm sm:text-base mb-2 break-words">
                <strong>Scheduled:</strong> {formatScheduledDate(session.scheduledDateTime)}
              </p>
            )}
          </div>

          {/* Status Summary and Player List */}
          <div className="space-y-3 sm:space-y-4 overflow-hidden">
            <div className="overflow-hidden">
              <SessionStatusSummary session={session} />
            </div>

            <div className="overflow-hidden">
              <SessionPlayerList
                session={session}
                players={players}
                {...(onStatusChange ? { onStatusChange } : {})}
                readonly={!onStatusChange}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SessionDetailModal;
