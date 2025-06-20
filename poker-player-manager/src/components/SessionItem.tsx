import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Tooltip,
  Avatar,
  Chip
} from '@mui/material';
import {
  Delete,
  Edit,
  EventNote,
  Groups,
  CalendarToday,
  Schedule,
  Visibility
} from '@mui/icons-material';
import { SessionItemProps } from '../types/index';
import PlayerStatusBadge from './PlayerStatusBadge';

function SessionItem({ session, players, onRemove, onEdit, onViewDetails }: SessionItemProps): React.JSX.Element {
  // Get players that are in this session
  const sessionPlayers = players.filter(player =>
    session.playerIds.includes(player.id)
  );

  // For now, we'll show all players as "Invited" since we haven't implemented
  // the backend integration yet. This will be updated when we connect to the API.
  const getStatusCounts = () => {
    const counts = {
      'Invited': sessionPlayers.length,
      'In': 0,
      'Out': 0,
      'Maybe': 0,
      'Attending but not playing': 0
    };
    // TODO: Calculate actual status counts from session.players when backend is connected
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
    <Card
      elevation={2}
      sx={{
        height: '100%',
        minHeight: '200px',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: 'primary.main',
          elevation: 8,
        },
      }}
    >
      <CardContent
        sx={{
          p: 3,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Session Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'secondary.main',
                mr: 2,
                width: 48,
                height: 48,
                boxShadow: '0 4px 12px rgba(118, 75, 162, 0.3)',
              }}
            >
              <EventNote sx={{ fontSize: 24 }} />
            </Avatar>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: { xs: '120px', sm: '140px', md: '160px' },
                fontSize: { xs: '1rem', sm: '1.25rem' },
              }}
              title={session.name}
            >
              {session.name}
            </Typography>
          </Box>

          {/* Session Details */}
          <Box sx={{ flex: 1, mb: 2 }}>
            {/* Scheduled Date */}
            {session.scheduledDateTime && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule sx={{ fontSize: 16, color: 'primary.main', mr: 1 }} />
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                  {formatScheduledDate(session.scheduledDateTime)}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarToday sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Created {formatDate(session.createdAt)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Groups sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {sessionPlayers.length} player{sessionPlayers.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            {/* Player chips */}
            {sessionPlayers.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {sessionPlayers.slice(0, 3).map(player => (
                  <Chip
                    key={player.id}
                    label={player.name}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
                {sessionPlayers.length > 3 && (
                  <Chip
                    label={`+${sessionPlayers.length - 3} more`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
                  />
                )}
              </Box>
            )}

            {/* Status summary */}
            {sessionPlayers.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
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
              </Box>
            )}
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Tooltip title="View details" arrow>
              <IconButton
                onClick={onViewDetails}
                color="info"
                size="medium"
                sx={{
                  bgcolor: 'info.light',
                  color: 'info.contrastText',
                  '&:hover': {
                    bgcolor: 'info.main',
                  },
                }}
              >
                <Visibility />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit session" arrow>
              <IconButton
                onClick={onEdit}
                color="primary"
                size="medium"
                sx={{
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.main',
                  },
                }}
              >
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove session" arrow>
              <IconButton
                onClick={onRemove}
                color="error"
                size="medium"
                sx={{
                  bgcolor: 'error.light',
                  color: 'error.contrastText',
                  '&:hover': {
                    bgcolor: 'error.main',
                  },
                }}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default SessionItem;
