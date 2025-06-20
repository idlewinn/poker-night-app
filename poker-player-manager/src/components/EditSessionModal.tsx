import React, { useState, useEffect } from 'react';
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
import dayjs, { Dayjs } from 'dayjs';
import {
  Add,
  Remove,
  EventNote,
  Groups,
  Person,
  Schedule,
  Edit,
  GroupAdd
} from '@mui/icons-material';
import { EditSessionModalProps } from '../types/index';

// Helper function to get the nearest Saturday 3 weeks from today at 7pm
const getDefaultSessionDate = (): Dayjs => {
  const today = dayjs();
  const threeWeeksFromToday = today.add(3, 'week');

  // Find the nearest Saturday (6 = Saturday in dayjs)
  let nearestSaturday = threeWeeksFromToday;
  const dayOfWeek = threeWeeksFromToday.day();

  if (dayOfWeek === 6) {
    // Already Saturday
    nearestSaturday = threeWeeksFromToday;
  } else if (dayOfWeek < 6) {
    // Before Saturday this week
    nearestSaturday = threeWeeksFromToday.day(6);
  } else {
    // After Saturday, go to next Saturday
    nearestSaturday = threeWeeksFromToday.add(1, 'week').day(6);
  }

  // Set time to 7:00 PM
  return nearestSaturday.hour(19).minute(0).second(0);
};

function EditSessionModal({ open, onClose, onUpdateSession, players, session }: EditSessionModalProps): React.JSX.Element {
  const [sessionName, setSessionName] = useState<string>('Poker Night');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [scheduledDateTime, setScheduledDateTime] = useState<Dayjs | null>(null);

  // Initialize form with session data when modal opens
  useEffect(() => {
    if (session && open) {
      setSessionName(session.name || 'Poker Night');
      setSelectedPlayerIds(session.playerIds || []);
      setScheduledDateTime(session.scheduledDateTime ? dayjs(session.scheduledDateTime) : getDefaultSessionDate());
    }
  }, [session, open]);

  const handleClose = (): void => {
    setSessionName('Poker Night');
    setSelectedPlayerIds([]);
    setScheduledDateTime(getDefaultSessionDate());
    onClose();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (session && scheduledDateTime) {
      // Use session name if provided, otherwise default to "Poker Night"
      const finalSessionName = sessionName.trim() || 'Poker Night';
      onUpdateSession(session.id, finalSessionName, selectedPlayerIds, scheduledDateTime.toISOString());
      handleClose();
    }
  };



  const handleAddPlayer = (playerId: number): void => {
    if (!selectedPlayerIds.includes(playerId)) {
      setSelectedPlayerIds([...selectedPlayerIds, playerId]);
    }
  };

  const handleRemovePlayer = (playerId: number): void => {
    setSelectedPlayerIds(selectedPlayerIds.filter(id => id !== playerId));
  };

  const handleInviteAll = (): void => {
    setSelectedPlayerIds(players.map(player => player.id));
  };

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
              placeholder="Defaults to 'Poker Night'"
              variant="outlined"
              slotProps={{ htmlInput: { maxLength: 50 } }}
              helperText="Customize the session name or leave as 'Poker Night'"
              sx={{ mb: 3 }}
            />
            
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Scheduled Date & Time *"
                value={scheduledDateTime}
                onChange={setScheduledDateTime}
                views={['year', 'month', 'day', 'hours']}
                format="MMM DD, YYYY [at] h A"
                minDateTime={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    required: true,
                    helperText: 'When will this session occur?',
                    InputProps: {
                      startAdornment: <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                    }
                  }
                }}
                sx={{ mb: 3 }}
              />
            </LocalizationProvider>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography
              variant="h6"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontWeight: 600
              }}
            >
              <Groups sx={{ color: 'primary.main' }} />
              Select Players
            </Typography>

            {availablePlayers.length > 0 && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<GroupAdd />}
                onClick={handleInviteAll}
                sx={{ ml: 2 }}
              >
                Invite All
              </Button>
            )}
          </Box>

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
            disabled={!scheduledDateTime}
            startIcon={<Edit />}
          >
            Update Session
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EditSessionModal;
