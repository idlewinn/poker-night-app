import { useState } from 'react'
import { Box, TextField, Button, Typography, Paper } from '@mui/material'
import { PersonAdd } from '@mui/icons-material'

function AddPlayerForm({ onAddPlayer }) {
  const [playerName, setPlayerName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (playerName.trim()) {
      onAddPlayer(playerName)
      setPlayerName('')
    }
  }

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
            gap: 2,
            alignItems: 'flex-start',
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter player name..."
            inputProps={{ maxLength: 50 }}
            size="large"
            sx={{
              flex: 1,
            }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<PersonAdd />}
            disabled={!playerName.trim()}
            sx={{
              minWidth: { xs: '100%', sm: 160 },
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

export default AddPlayerForm
