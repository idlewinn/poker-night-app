import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Box, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import { Groups, EventNote } from '@mui/icons-material';
import PlayerList from './PlayerList';
import AddPlayerForm from './AddPlayerForm';
import Sessions from './Sessions';
import { playersApi, sessionsApi } from '../services/api';
import { Player, Session, TabValue, CreateSessionRequest, UpdateSessionRequest, CreatePlayerRequest } from '../types/index';

// Create a custom theme for the poker app
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#9bb5ff',
      dark: '#3f51b5',
    },
    secondary: {
      main: '#764ba2',
      light: '#a478d4',
      dark: '#4a2c73',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
  },
});

function MainApp(): React.JSX.Element {
  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState<TabValue>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        setLoading(true);
        const [playersData, sessionsData] = await Promise.all([
          playersApi.getAll(),
          sessionsApi.getAll()
        ]);
        setPlayers(playersData);
        setSessions(sessionsData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addPlayer = async (name: string, email?: string): Promise<void> => {
    try {
      const requestData: CreatePlayerRequest = {
        name: name.trim()
      };
      
      if (email?.trim()) {
        requestData.email = email.trim();
      }
      
      console.log('Adding player with data:', requestData);
      const newPlayer = await playersApi.create(requestData);
      console.log('Player created successfully:', newPlayer);
      setPlayers([...players, newPlayer]);
    } catch (err) {
      console.error('Failed to add player:', err);
      setError('Failed to add player: ' + (err as Error).message);
    }
  };

  const removePlayer = async (id: number): Promise<void> => {
    try {
      await playersApi.delete(id);
      setPlayers(players.filter(player => player.id !== id));
    } catch (err) {
      console.error('Failed to remove player:', err);
      setError('Failed to remove player: ' + (err as Error).message);
    }
  };

  const renamePlayer = async (id: number, newName: string, newEmail?: string): Promise<void> => {
    try {
      const requestData: any = {
        name: newName.trim()
      };
      
      // Always include email in the request, even if it's empty (to clear existing email)
      if (newEmail !== undefined) {
        const trimmedEmail = newEmail.trim();
        if (trimmedEmail) {
          requestData.email = trimmedEmail;
        }
        // If email is empty, we don't set the property (it remains undefined)
      }
      
      console.log('Updating player with data:', requestData);
      const updatedPlayer = await playersApi.update(id, requestData);
      console.log('Player updated successfully:', updatedPlayer);
      setPlayers(players.map(player => 
        player.id === id ? updatedPlayer : player
      ));
    } catch (err) {
      console.error('Failed to rename player:', err);
      setError('Failed to rename player: ' + (err as Error).message);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: TabValue): void => {
    setActiveTab(newValue);
  };

  const clearError = (): void => {
    setError(null);
  };

  // Show loading spinner while data is loading
  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
            <Typography variant="h6">Loading Poker Night...</Typography>
          </Box>
        </Box>
      </ThemeProvider>
    )
  }

  const addSession = async (sessionName: string, selectedPlayerIds: number[], scheduledDateTime: string): Promise<void> => {
    try {
      const requestData: CreateSessionRequest = {
        scheduledDateTime: scheduledDateTime,
        playerIds: selectedPlayerIds || []
      };

      // Only include name if it's not empty
      if (sessionName.trim()) {
        requestData.name = sessionName.trim();
      }

      const newSession = await sessionsApi.create(requestData);
      setSessions([...sessions, newSession]);
    } catch (err) {
      console.error('Failed to add session:', err);
      setError('Failed to add session: ' + (err as Error).message);
    }
  };

  const removeSession = async (id: number): Promise<void> => {
    try {
      await sessionsApi.delete(id);
      setSessions(sessions.filter(session => session.id !== id));
    } catch (err) {
      console.error('Failed to remove session:', err);
      setError('Failed to remove session: ' + (err as Error).message);
    }
  };

  const updateSession = async (id: number, sessionName: string, selectedPlayerIds: number[], scheduledDateTime: string): Promise<void> => {
    try {
      const requestData: UpdateSessionRequest = {
        scheduledDateTime: scheduledDateTime,
        playerIds: selectedPlayerIds || []
      };

      // Only include name if it's not empty
      if (sessionName.trim()) {
        requestData.name = sessionName.trim();
      }

      const updatedSession = await sessionsApi.update(id, requestData);
      setSessions(sessions.map(session =>
        session.id === id ? updatedSession : session
      ));
    } catch (err) {
      console.error('Failed to update session:', err);
      setError('Failed to update session: ' + (err as Error).message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: { xs: 2, sm: 4 },
          px: { xs: 1, sm: 2 },
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          <Box
            textAlign="center"
            mb={{ xs: 3, sm: 5 }}
            sx={{
              color: 'white',
            }}
          >
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                mb: 2,
              }}
            >
              🃏 Poker Player Manager
            </Typography>
            <Typography
              variant="h6"
              sx={{
                opacity: 0.95,
                fontWeight: 400,
              }}
            >
              Manage your poker night players with style
            </Typography>
          </Box>

          <Box
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(10px)',
              overflow: 'hidden',
            }}
          >
            {/* Navigation Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="poker app navigation tabs"
                sx={{
                  px: { xs: 2, sm: 3 },
                  '& .MuiTab-root': {
                    minHeight: 64,
                    fontSize: '1rem',
                    fontWeight: 600,
                  },
                }}
              >
                <Tab
                  icon={<Groups />}
                  label="Players"
                  iconPosition="start"
                  sx={{ gap: 1 }}
                />
                <Tab
                  icon={<EventNote />}
                  label="Sessions"
                  iconPosition="start"
                  sx={{ gap: 1 }}
                />
              </Tabs>
            </Box>

            {/* Error Alert */}
            {error && (
              <Box sx={{ p: { xs: 2, sm: 3 }, pb: 0 }}>
                <Alert
                  severity="error"
                  onClose={clearError}
                  sx={{ mb: 2 }}
                >
                  {error}
                </Alert>
              </Box>
            )}

            {/* Tab Content */}
            <Box sx={{ p: { xs: 3, sm: 5 } }}>
              {activeTab === 0 && (
                <Box>
                  <AddPlayerForm onAddPlayer={addPlayer} />
                  <PlayerList
                    players={players}
                    onRemovePlayer={removePlayer}
                    onRenamePlayer={renamePlayer}
                  />
                </Box>
              )}
              {activeTab === 1 && (
                <Sessions
                  sessions={sessions}
                  players={players}
                  onCreateSession={addSession}
                  onUpdateSession={updateSession}
                  onRemoveSession={removeSession}
                />
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default MainApp;
