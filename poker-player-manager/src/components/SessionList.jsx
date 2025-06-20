import { Box, Typography, Grid, Paper } from '@mui/material'
import { EventNote } from '@mui/icons-material'
import SessionItem from './SessionItem'

function SessionList({ sessions, players, onRemoveSession, onEditSession }) {
  if (sessions.length === 0) {
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
        <EventNote
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
          No sessions created yet. Create your first session above!
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
        <EventNote sx={{ color: 'primary.main' }} />
        Sessions ({sessions.length})
      </Typography>
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
        {sessions.map(session => (
          <Grid item xs={12} sm={6} md={4} xl={3} key={session.id}>
            <SessionItem
              session={session}
              players={players}
              onRemove={() => onRemoveSession(session.id)}
              onEdit={() => onEditSession(session)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default SessionList
