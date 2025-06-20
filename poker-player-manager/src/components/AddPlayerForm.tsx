import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import { AddPlayerFormProps } from '../types/index';

function AddPlayerForm({ onAddPlayer }: AddPlayerFormProps): React.JSX.Element {
  const [playerName, setPlayerName] = useState<string>('');
  const [playerEmail, setPlayerEmail] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (playerName.trim()) {
      onAddPlayer(playerName, playerEmail.trim() || undefined);
      setPlayerName('');
      setPlayerEmail('');
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 3, sm: 4 },
        mb: { xs: 3, sm: 5 },
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="h4"
        component="h2"
        gutterBottom
        sx={{
          mb: 3,
          color: 'text.primary',
          fontWeight: 600,
        }}
      >
        Add New Player
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            label="Player Name"
            variant="outlined"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter player name..."
            required
            slotProps={{ htmlInput: { maxLength: 50 } }}
            size="large"
          />

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            variant="outlined"
            value={playerEmail}
            onChange={(e) => setPlayerEmail(e.target.value)}
            placeholder="Enter email address (optional)..."
            slotProps={{ htmlInput: { maxLength: 100 } }}
            size="large"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<PersonAdd />}
            disabled={!playerName.trim()}
            sx={{
              height: 56,
              fontSize: '1rem',
            }}
          >
            Add Player
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}

export default AddPlayerForm;
