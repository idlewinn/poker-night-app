import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Grid,
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
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  EventNote,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Edit,
  Save,
  Cancel,
  Add,
  Person
} from '@mui/icons-material';
import { Session, Player, SessionPlayer } from '../types/index';
import { sessionsApi, playersApi } from '../services/api';
import PlayerStatusBadge from './PlayerStatusBadge';

interface SessionPageParams {
  sessionId: string;
}

interface EditingFinancials {
  playerId: number;
  buy_in: string;
  cash_out: string;
}

function SessionPage(): React.JSX.Element {
  const { sessionId } = useParams<SessionPageParams>();
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
      await sessionsApi.updatePlayerStatus(session.id, playerId, 'In');

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

  const getAvailablePlayersToAdd = () => {
    if (!session?.players) return players;

    // Get player IDs that are already in the session
    const sessionPlayerIds = session.players.map(sp => sp.player_id);

    // Return players not in the session, or players in session but not with "In" status
    return players.filter(player => {
      const sessionPlayer = session.players?.find(sp => sp.player_id === player.id);
      return !sessionPlayer || sessionPlayer.status !== 'In';
    });
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
  const { totalBuyIn, totalCashOut, netResult } = calculateTotals();

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Session Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <EventNote sx={{ fontSize: 28, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            {session.name || 'Poker Night'}
          </Typography>
        </Box>

        {session.scheduledDateTime && (
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            {formatScheduledDate(session.scheduledDateTime)}
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary">
          Session ID: {session.id} • Created {new Date(session.createdAt).toLocaleDateString()}
        </Typography>
      </Paper>

      {/* Financial Summary */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingDown sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {formatCurrency(totalBuyIn)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Buy-In
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccountBalance sx={{
                fontSize: 40,
                color: netResult >= 0 ? 'success.main' : 'error.main',
                mb: 1
              }} />
              <Typography
                variant="h4"
                fontWeight="bold"
                color={netResult >= 0 ? 'success.main' : 'error.main'}
              >
                {formatCurrency(Math.abs(netResult))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Net {netResult >= 0 ? 'Gain' : 'Loss'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {sessionPlayers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Players
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Player Financial Details */}
      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Typography variant="h5" fontWeight="bold">
            Winnings
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Player</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Buy-In</strong></TableCell>
                <TableCell align="right"><strong>Cash-Out</strong></TableCell>
                <TableCell align="right"><strong>Net Result</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessionPlayers.map((sessionPlayer) => {
                const player = players.find(p => p.id === sessionPlayer.player_id);
                const netResult = sessionPlayer.cash_out - sessionPlayer.buy_in;
                const isEditing = editingFinancials?.playerId === sessionPlayer.player_id;
                
                return (
                  <TableRow key={sessionPlayer.player_id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {player?.name || 'Unknown Player'}
                        </Typography>
                        {player?.email && (
                          <Typography variant="body2" color="text.secondary">
                            {player.email}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <PlayerStatusBadge status={sessionPlayer.status} />
                    </TableCell>
                    
                    <TableCell align="right">
                      {isEditing ? (
                        <TextField
                          size="small"
                          type="number"
                          value={editingFinancials.buy_in}
                          onChange={(e) => setEditingFinancials({
                            ...editingFinancials,
                            buy_in: e.target.value
                          })}
                          inputProps={{ min: 0, step: 0.01 }}
                          sx={{ width: 100 }}
                        />
                      ) : (
                        <Typography variant="body1" fontWeight={500}>
                          {formatCurrency(sessionPlayer.buy_in)}
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell align="right">
                      {isEditing ? (
                        <TextField
                          size="small"
                          type="number"
                          value={editingFinancials.cash_out}
                          onChange={(e) => setEditingFinancials({
                            ...editingFinancials,
                            cash_out: e.target.value
                          })}
                          inputProps={{ min: 0, step: 0.01 }}
                          sx={{ width: 100 }}
                        />
                      ) : (
                        <Typography variant="body1" fontWeight={500}>
                          {formatCurrency(sessionPlayer.cash_out)}
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell align="right">
                      <Chip
                        label={formatCurrency(Math.abs(netResult))}
                        color={netResult >= 0 ? 'success' : 'error'}
                        variant={netResult === 0 ? 'outlined' : 'filled'}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell align="center">
                      {isEditing ? (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={handleSaveFinancials}
                            disabled={updating}
                          >
                            <Save />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={handleCancelEdit}
                            disabled={updating}
                          >
                            <Cancel />
                          </IconButton>
                        </Box>
                      ) : (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditFinancials(sessionPlayer)}
                        >
                          <Edit />
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
        <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setAddPlayerModalOpen(true)}
            disabled={getAvailablePlayersToAdd().length === 0}
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
              <ListItem key={player.id}>
                <Person sx={{ mr: 1, color: 'text.secondary' }} />
                <ListItemText
                  primary={player.name}
                  secondary={player.email}
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleAddPlayer(player.id)}
                    disabled={updating}
                  >
                    Add
                  </Button>
                </ListItemSecondaryAction>
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
