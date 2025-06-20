import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Box, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import { Groups, EventNote } from '@mui/icons-material';
import PlayerList from './components/PlayerList';
import AddPlayerForm from './components/AddPlayerForm';
import Sessions from './components/Sessions';
import { playersApi, sessionsApi } from './services/api';
import { Player, Session, TabValue, CreateSessionRequest, UpdateSessionRequest } from './types/index';
import './App.css';

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
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#f44336',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
      fontSize: '2.5rem',
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.1rem',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(102, 126, 234, 0.2)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': {
              borderColor: '#667eea',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#667eea',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
})

function App(): JSX.Element {
  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState<TabValue>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from API on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const [playersData, sessionsData] = await Promise.all([
        playersApi.getAll(),
        sessionsApi.getAll()
      ]);

      setPlayers(playersData);
      setSessions(sessionsData);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('Failed to load data. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const addPlayer = async (name: string): Promise<void> => {
    try {
      const newPlayer = await playersApi.create({ name: name.trim() });
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

  const renamePlayer = async (id: number, newName: string): Promise<void> => {
    try {
      const updatedPlayer = await playersApi.update(id, { name: newName.trim() });
      setPlayers(players.map(player =>
        player.id === id ? updatedPlayer : player
      ));
    } catch (err) {
      console.error('Failed to rename player:', err);
      setError('Failed to rename player: ' + (err as Error).message);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: TabValue): void => {
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

export default App
