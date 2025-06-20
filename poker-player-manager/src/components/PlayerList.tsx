import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Groups } from '@mui/icons-material';
import PlayerItem from './PlayerItem';
import { PlayerListProps } from '../types/index';

function PlayerList({ players, onRemovePlayer, onRenamePlayer }: PlayerListProps): React.JSX.Element {
  if (players.length === 0) {
    return (
      <Paper
        elevation={2}
        sx={{
          p: { xs: 4, sm: 6 },
          textAlign: 'center',
          backgroundColor: 'grey.50',
          border: '2px dashed',
          borderColor: 'grey.300',
        }}
      >
        <Groups
          sx={{
            fontSize: { xs: 40, sm: 56 },
            color: 'text.secondary',
            mb: 2,
            opacity: 0.7,
          }}
        />
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            fontStyle: 'italic',
            fontWeight: 400,
          }}
        >
          No players added yet. Add your first player above!
        </Typography>
      </Paper>
    )
  }

  return (
    <Box>
      <Typography
        variant="h4"
        component="h2"
        gutterBottom
        sx={{
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          color: 'text.primary',
          fontWeight: 600,
        }}
      >
        <Groups sx={{ color: 'primary.main' }} />
        Players ({players.length})
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            xl: 'repeat(4, 1fr)'
          },
          gap: { xs: 2, sm: 2, md: 3 }
        }}
      >
        {players.map(player => (
          <PlayerItem
            key={player.id}
            player={player}
            onRemove={() => onRemovePlayer(player.id)}
            onRename={(newName, newEmail) => onRenamePlayer(player.id, newName, newEmail)}
          />
        ))}
      </Box>
    </Box>
  )
}

export default PlayerList;
