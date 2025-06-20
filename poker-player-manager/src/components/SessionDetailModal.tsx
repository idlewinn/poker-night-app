import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { Close, EventNote } from '@mui/icons-material';
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '60vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventNote />
          <Typography variant="h6" component="div">
            {session.name}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ color: 'primary.contrastText' }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Session Info */}
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          {session.scheduledDateTime && (
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Scheduled:</strong> {formatScheduledDate(session.scheduledDateTime)}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            Created {new Date(session.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
        </Box>

        {/* Status Summary and Player List */}
        <Box sx={{ p: 3 }}>
          <SessionStatusSummary session={session} />

          <SessionPlayerList
            session={session}
            players={players}
            onStatusChange={onStatusChange}
            readonly={!onStatusChange}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SessionDetailModal;
