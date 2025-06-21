import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText
} from '@mui/material';

import {
  EventNote,
  TrendingDown,
  Edit,
  Save,
  Cancel,
  Add,
  Person,
  ArrowBack
} from '@mui/icons-material';
import { Session, Player, SessionPlayer } from '../types/index';
import { sessionsApi, playersApi } from '../services/api';
import PlayerStatusBadge from './PlayerStatusBadge';

interface SessionPageParams extends Record<string, string | undefined> {
  sessionId: string;
}

interface EditingFinancials {
  playerId: number;
  buy_in: string;
  cash_out: string;
}

function SessionPage(): React.JSX.Element {
  const { sessionId } = useParams<SessionPageParams>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingFinancials, setEditingFinancials] = useState<EditingFinancials | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);
  const [addPlayerModalOpen, setAddPlayerModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!sessionId) {
        setError('Session ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [sessionData, playersData] = await Promise.all([
          sessionsApi.getById(parseInt(sessionId)),
          playersApi.getAll()
        ]);
        
        setSession(sessionData);
        setPlayers(playersData);
      } catch (err) {
        console.error('Failed to fetch session data:', err);
        setError('Failed to load session data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId]);

  const handleEditFinancials = (sessionPlayer: SessionPlayer) => {
    setEditingFinancials({
      playerId: sessionPlayer.player_id,
      buy_in: sessionPlayer.buy_in.toString(),
      cash_out: sessionPlayer.cash_out.toString()
    });
  };

  const handleSaveFinancials = async () => {
    if (!editingFinancials || !session) return;

    try {
      setUpdating(true);
      const buy_in = parseFloat(editingFinancials.buy_in) || 0;
      const cash_out = parseFloat(editingFinancials.cash_out) || 0;

      // Update via API
      await sessionsApi.updatePlayerFinancials(session.id, editingFinancials.playerId, { buy_in, cash_out });

      // Update local state
      if (session.players) {
        const updatedPlayers = session.players.map(sp =>
          sp.player_id === editingFinancials.playerId
            ? { ...sp, buy_in, cash_out }
            : sp
        );
        setSession({ ...session, players: updatedPlayers });
      }

      setEditingFinancials(null);
    } catch (err) {
      console.error('Failed to update financials:', err);
      setError('Failed to update player financials');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingFinancials(null);
  };

  const handleAddPlayer = async (playerId: number): Promise<void> => {
    if (!session) return;

    try {
      setUpdating(true);
      await sessionsApi.addPlayerToSession(session.id, playerId, 'In');

      // Refresh session data
      const updatedSession = await sessionsApi.getById(session.id);
      setSession(updatedSession);
      setAddPlayerModalOpen(false);
    } catch (err) {
      console.error('Failed to add player:', err);
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatScheduledDate = (dateString: string | null): string | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };



  const getSessionPlayers = (): SessionPlayer[] => {
    if (!session?.players) return [];
    // Only show players with "In" status
    return session.players.filter(player => player.status === 'In');
  };

  const getAvailablePlayersToAdd = (): Player[] => {
    if (!session?.players) return players;

    const sessionPlayerIds = session.players.map(sp => sp.player_id);
    return players.filter(player => !sessionPlayerIds.includes(player.id));
  };

  const calculateTotals = () => {
    const sessionPlayers = getSessionPlayers();
    const totalBuyIn = sessionPlayers.reduce((sum, sp) => sum + sp.buy_in, 0);
    const totalCashOut = sessionPlayers.reduce((sum, sp) => sum + sp.cash_out, 0);
    const netResult = totalCashOut - totalBuyIn;
    
    return { totalBuyIn, totalCashOut, netResult };
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error || !session) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Session not found'}
        </Alert>
      </Container>
    );
  }

  const sessionPlayers = getSessionPlayers();
  const { totalBuyIn } = calculateTotals();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 } }}>
      {/* Session Header */}
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, mb: { xs: 0.5, sm: 1 } }}>
          <IconButton
            onClick={() => navigate('/sessions')}
            size="small"
            sx={{
              mr: { xs: 0.5, sm: 1 },
              p: { xs: 0.5, sm: 1 }
            }}
          >
            <ArrowBack sx={{ fontSize: { xs: 18, sm: 24 } }} />
          </IconButton>
          <EventNote sx={{ fontSize: { xs: 20, sm: 28 }, color: 'primary.main' }} />
          <Typography
            variant="h5"
            component="h1"
            fontWeight="bold"
            sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
          >
            {session.name || 'Poker Night'}
          </Typography>
        </Box>

        {session.scheduledDateTime && (
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              mb: { xs: 0.5, sm: 1 },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            {formatScheduledDate(session.scheduledDateTime)}
          </Typography>
        )}

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          Session ID: {session.id} • Created {new Date(session.createdAt).toLocaleDateString()}
        </Typography>
      </Paper>

      {/* Financial Summary */}
      <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, mb: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 } }}>
              <TrendingDown sx={{ fontSize: { xs: 24, sm: 32 }, color: 'error.main', mb: 0.5 }} />
              <Typography variant="h5" fontWeight="bold" color="error.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                {formatCurrency(totalBuyIn)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Total Buy-In
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 } }}>
              <Typography variant="h5" fontWeight="bold" color="primary.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mt: { xs: 2, sm: 2.5 } }}>
                {sessionPlayers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Players
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Player Financial Details */}
      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            Winnings
          </Typography>
        </Box>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ py: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  <strong>Player</strong>
                </TableCell>
                <TableCell sx={{ py: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }}>
                  <strong>Status</strong>
                </TableCell>
                <TableCell align="right" sx={{ py: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  <strong>Buy-In</strong>
                </TableCell>
                <TableCell align="right" sx={{ py: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  <strong>Cash-Out</strong>
                </TableCell>
                <TableCell align="right" sx={{ py: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  <strong>Net</strong>
                </TableCell>
                <TableCell align="center" sx={{ py: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessionPlayers.map((sessionPlayer) => {
                const player = sessionPlayer.player;
                const netResult = sessionPlayer.cash_out - sessionPlayer.buy_in;
                const isEditing = editingFinancials?.playerId === sessionPlayer.player_id;
                
                return (
                  <TableRow key={sessionPlayer.player_id} hover>
                    <TableCell sx={{ py: { xs: 0.5, sm: 1 } }}>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight={500}
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {player?.name || 'Unknown Player'}
                        </Typography>
                        {player?.email && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' }, display: { xs: 'none', sm: 'block' } }}
                          >
                            {player.email}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: { xs: 0.5, sm: 1 }, display: { xs: 'none', sm: 'table-cell' } }}>
                      <PlayerStatusBadge status={sessionPlayer.status} />
                    </TableCell>
                    
                    <TableCell align="right" sx={{ py: { xs: 0.5, sm: 1 } }}>
                      {isEditing ? (
                        <TextField
                          size="small"
                          type="number"
                          value={editingFinancials.buy_in}
                          onChange={(e) => setEditingFinancials({
                            ...editingFinancials,
                            buy_in: e.target.value
                          })}
                          slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                          sx={{ width: { xs: 70, sm: 100 } }}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {formatCurrency(sessionPlayer.buy_in)}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell align="right" sx={{ py: { xs: 0.5, sm: 1 } }}>
                      {isEditing ? (
                        <TextField
                          size="small"
                          type="number"
                          value={editingFinancials.cash_out}
                          onChange={(e) => setEditingFinancials({
                            ...editingFinancials,
                            cash_out: e.target.value
                          })}
                          slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                          sx={{ width: { xs: 70, sm: 100 } }}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {formatCurrency(sessionPlayer.cash_out)}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell align="right" sx={{ py: { xs: 0.5, sm: 1 } }}>
                      <Chip
                        label={formatCurrency(Math.abs(netResult))}
                        color={netResult >= 0 ? 'success' : 'error'}
                        variant={netResult === 0 ? 'outlined' : 'filled'}
                        size="small"
                        sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' }, height: { xs: 20, sm: 24 } }}
                      />
                    </TableCell>
                    
                    <TableCell align="center" sx={{ py: { xs: 0.5, sm: 1 } }}>
                      {isEditing ? (
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={handleSaveFinancials}
                            disabled={updating}
                            sx={{ p: { xs: 0.25, sm: 0.5 } }}
                          >
                            <Save sx={{ fontSize: { xs: 16, sm: 20 } }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={handleCancelEdit}
                            disabled={updating}
                            sx={{ p: { xs: 0.25, sm: 0.5 } }}
                          >
                            <Cancel sx={{ fontSize: { xs: 16, sm: 20 } }} />
                          </IconButton>
                        </Box>
                      ) : (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditFinancials(sessionPlayer)}
                          sx={{ p: { xs: 0.25, sm: 0.5 } }}
                        >
                          <Edit sx={{ fontSize: { xs: 16, sm: 20 } }} />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add Player Button */}
        <Box sx={{ p: { xs: 1, sm: 1.5 }, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            variant="outlined"
            startIcon={<Add sx={{ fontSize: { xs: 16, sm: 20 } }} />}
            onClick={() => setAddPlayerModalOpen(true)}
            disabled={getAvailablePlayersToAdd().length === 0}
            size="small"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Add Player
          </Button>
        </Box>
      </Paper>

      {/* Add Player Modal */}
      <Dialog
        open={addPlayerModalOpen}
        onClose={() => setAddPlayerModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Player to Session</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select a player to add to this session. Their status will be set to "In".
          </Typography>

          <List>
            {getAvailablePlayersToAdd().map((player) => (
              <ListItem key={player.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Person sx={{ mr: 1, color: 'text.secondary' }} />
                  <ListItemText
                    primary={player.name}
                    secondary={player.email}
                  />
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleAddPlayer(player.id)}
                  disabled={updating}
                >
                  Add
                </Button>
              </ListItem>
            ))}
          </List>

          {getAvailablePlayersToAdd().length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              All players are already in this session.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddPlayerModalOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default SessionPage;
