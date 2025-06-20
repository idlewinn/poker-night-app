import { Box, Typography, Grid, Paper } from '@mui/material'
import { Groups } from '@mui/icons-material'
import PlayerItem from './PlayerItem'

function PlayerList({ players, onRemovePlayer, onRenamePlayer }) {
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
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
        {players.map(player => (
          <Grid item xs={12} sm={6} md={4} xl={3} key={player.id}>
            <PlayerItem
              player={player}
              onRemove={() => onRemovePlayer(player.id)}
              onRename={(newName) => onRenamePlayer(player.id, newName)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default PlayerList
