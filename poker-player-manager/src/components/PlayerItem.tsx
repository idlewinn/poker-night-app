import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  TextField,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Edit,
  Delete,
  Check,
  Close,
  Person
} from '@mui/icons-material';
import { PlayerItemProps } from '../types/index';

function PlayerItem({ player, onRemove, onRename }: PlayerItemProps): React.JSX.Element {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(player.name);
  const [editEmail, setEditEmail] = useState<string>(player.email || '');

  const handleSave = (): void => {
    if (editName.trim() && (editName !== player.name || editEmail !== (player.email || ''))) {
      onRename(editName, editEmail.trim() || undefined);
    }
    setIsEditing(false);
    setEditName(player.name);
    setEditEmail(player.email || '');
  };

  const handleCancel = (): void => {
    setIsEditing(false);
    setEditName(player.name);
    setEditEmail(player.email || '');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        minHeight: '160px', // Increased minimum height for email display
        maxWidth: '100%', // Ensure cards don't overflow container
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
        {isEditing ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Player Name"
              variant="outlined"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyPress}
              autoFocus
              size="medium"
              placeholder="Enter player name..."
              required
            />
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              variant="outlined"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              onKeyDown={handleKeyPress}
              size="medium"
              placeholder="Enter email address (optional)..."
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Tooltip title="Save changes" arrow>
                <IconButton
                  onClick={handleSave}
                  color="success"
                  size="medium"
                  sx={{
                    bgcolor: 'success.light',
                    color: 'success.contrastText',
                    '&:hover': {
                      bgcolor: 'success.main',
                    },
                  }}
                >
                  <Check />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel" arrow>
                <IconButton
                  onClick={handleCancel}
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
                  <Close />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, flex: 1, minHeight: '90px' }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  mr: 2,
                  width: 48,
                  height: 48,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  mt: 0.5,
                }}
              >
                <Person sx={{ fontSize: 24 }} />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
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
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    mb: 0.5,
                  }}
                  title={player.name}
                >
                  {player.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '0.875rem',
                    fontStyle: player.email ? 'normal' : 'italic',
                  }}
                  title={player.email || 'No email address'}
                >
                  {player.email || 'No email address'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Tooltip title="Rename player" arrow>
                <IconButton
                  onClick={() => setIsEditing(true)}
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
              <Tooltip title="Remove player" arrow>
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
        )}
      </CardContent>
    </Card>
  )
}

export default PlayerItem;
