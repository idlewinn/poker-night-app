import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Paper,
  Divider
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import {
  Add,
  Remove,
  EventNote,
  Groups,
  Person,
  Schedule,
  Edit
} from '@mui/icons-material'

function EditSessionModal({ open, onClose, onUpdateSession, players, session }) {
  const [sessionName, setSessionName] = useState('')
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([])
  const [scheduledDateTime, setScheduledDateTime] = useState(null)

  // Initialize form with session data when modal opens
  useEffect(() => {
    if (session && open) {
      setSessionName(session.name)
      setSelectedPlayerIds(session.playerIds || [])
      setScheduledDateTime(session.scheduledDateTime ? dayjs(session.scheduledDateTime) : null)
    }
  }, [session, open])

  const handleClose = () => {
    setSessionName('')
    setSelectedPlayerIds([])
    setScheduledDateTime(null)
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (sessionName.trim() && session) {
      onUpdateSession(session.id, sessionName, selectedPlayerIds, scheduledDateTime?.toISOString())
      handleClose()
    }
  }

  const handleAddPlayer = (playerId) => {
    if (!selectedPlayerIds.includes(playerId)) {
      setSelectedPlayerIds([...selectedPlayerIds, playerId])
    }
  }

  const handleRemovePlayer = (playerId) => {
    setSelectedPlayerIds(selectedPlayerIds.filter(id => id !== playerId))
  }

  const availablePlayers = players.filter(player => 
    !selectedPlayerIds.includes(player.id)
  )
  
  const selectedPlayers = players.filter(player => 
    selectedPlayerIds.includes(player.id)
  )

  if (!session) return null

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          pb: 1,
          fontSize: '1.5rem',
          fontWeight: 600
        }}
      >
        <Edit sx={{ color: 'primary.main' }} />
        Edit Session
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Session Name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Enter session name..."
              variant="outlined"
              required
              inputProps={{ maxLength: 50 }}
              sx={{ mb: 3 }}
            />
            
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Scheduled Date & Time"
                value={scheduledDateTime}
                onChange={setScheduledDateTime}
                views={['year', 'month', 'day', 'hours']}
                format="MMM DD, YYYY [at] h A"
                minDateTime={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    helperText: 'Optional - when will this session occur?',
                    InputProps: {
                      startAdornment: <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                    }
                  }
                }}
                sx={{ mb: 3 }}
              />
            </LocalizationProvider>
          </Box>

          <Typography
            variant="h6"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2,
              fontWeight: 600
            }}
          >
            <Groups sx={{ color: 'primary.main' }} />
            Select Players
          </Typography>

          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Available Players */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                Available Players ({availablePlayers.length})
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  maxHeight: 200,
                  overflow: 'auto',
                  bgcolor: 'grey.50'
                }}
              >
                {availablePlayers.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {players.length === 0 
                        ? 'No players available. Add players first.'
                        : 'All players have been added to this session.'
                      }
                    </Typography>
                  </Box>
                ) : (
                  <List dense>
                    {availablePlayers.map(player => (
                      <ListItem key={player.id}>
                        <Person sx={{ mr: 1, color: 'text.secondary' }} />
                        <ListItemText primary={player.name} />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleAddPlayer(player.id)}
                            color="primary"
                            size="small"
                          >
                            <Add />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </Box>

            {/* Selected Players */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                Selected Players ({selectedPlayers.length})
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  maxHeight: 200,
                  overflow: 'auto',
                  bgcolor: 'rgba(102, 126, 234, 0.05)'
                }}
              >
                {selectedPlayers.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No players selected yet.
                    </Typography>
                  </Box>
                ) : (
                  <List dense>
                    {selectedPlayers.map(player => (
                      <ListItem key={player.id}>
                        <Person sx={{ mr: 1, color: 'primary.main' }} />
                        <ListItemText primary={player.name} />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleRemovePlayer(player.id)}
                            color="error"
                            size="small"
                          >
                            <Remove />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!sessionName.trim()}
            startIcon={<Edit />}
          >
            Update Session
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EditSessionModal
