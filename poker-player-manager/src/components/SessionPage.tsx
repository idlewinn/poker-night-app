import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  TrendingDown,
  Save,
  X,
  Plus,
  User,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
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
    // If we're already editing a different player, don't switch
    if (editingFinancials && editingFinancials.playerId !== sessionPlayer.player_id) {
      return;
    }

    setEditingFinancials({
      playerId: sessionPlayer.player_id,
      buy_in: sessionPlayer.buy_in.toString(),
      cash_out: sessionPlayer.cash_out > 0 ? sessionPlayer.cash_out.toString() : ''
    });
  };

  const handleSaveFinancials = async () => {
    if (!editingFinancials || !session) return;

    try {
      setUpdating(true);
      const buy_in = parseFloat(editingFinancials.buy_in) || 0;
      const cash_out = editingFinancials.cash_out === '' ? 0 : parseFloat(editingFinancials.cash_out) || 0;

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

  // Generate buy-in options in increments of $25
  const getBuyInOptions = (): number[] => {
    const options = [];
    for (let i = 0; i <= 1000; i += 25) {
      options.push(i);
    }
    return options;
  };

  // Get color class for buy-in amount
  const getBuyInColorClass = (amount: number): string => {
    if (amount === 0) return 'text-gray-600'; // Free/No buy-in
    if (amount >= 25 && amount <= 100) return 'text-green-600 font-medium';
    if (amount >= 125 && amount <= 200) return 'text-yellow-600 font-medium';
    if (amount >= 225 && amount <= 300) return 'text-orange-600 font-medium';
    if (amount >= 325 && amount <= 400) return 'text-red-600 font-medium';
    if (amount >= 425 && amount <= 1000) return 'text-purple-600 font-medium';
    return 'text-gray-600';
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

    // Return players who are either:
    // 1. Not in the session at all, OR
    // 2. In the session but not with "In" status
    return players.filter(player => {
      const sessionPlayer = session.players?.find(sp => sp.player_id === player.id);
      return !sessionPlayer || sessionPlayer.status !== 'In';
    });
  };

  const calculateTotals = () => {
    const sessionPlayers = getSessionPlayers();
    const totalBuyIn = sessionPlayers.reduce((sum, sp) => sum + sp.buy_in, 0);
    // Only include cash-out amounts that are actually set (> 0)
    const totalCashOut = sessionPlayers.reduce((sum, sp) => sum + (sp.cash_out > 0 ? sp.cash_out : 0), 0);
    const netResult = totalCashOut - totalBuyIn;

    return { totalBuyIn, totalCashOut, netResult };
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error || 'Session not found'}</p>
        </div>
      </div>
    );
  }

  const sessionPlayers = getSessionPlayers();
  const { totalBuyIn } = calculateTotals();

  return (
    <div className="container mx-auto max-w-4xl py-4 px-4">
      {/* Session Header */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/sessions')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">
              {session.name || 'Poker Night'}
            </h1>
          </div>

          {session.scheduledDateTime && (
            <h2 className="text-gray-600 mb-2 ml-14">
              {formatScheduledDate(session.scheduledDateTime)}
            </h2>
          )}

          <p className="text-sm text-gray-500 ml-14">
            Session ID: {session.id} • Created {new Date(session.createdAt).toLocaleDateString()}
          </p>
        </div>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="text-center py-6">
            <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalBuyIn)}
            </div>
            <div className="text-sm text-gray-600">
              Total Buy-In
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-6">
            <User className="h-8 w-8 text-primary mx-auto mb-3" />
            <div className="text-2xl font-bold text-primary">
              {sessionPlayers.length}
            </div>
            <div className="text-sm text-gray-600">
              Players
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Player Financial Details */}
      <Card className="overflow-hidden">
        <div className="p-4 bg-primary text-primary-foreground">
          <h3 className="text-lg font-bold">
            Winnings
          </h3>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="py-3 text-sm font-semibold">
                  Player
                </TableHead>
                <TableHead className="py-3 text-sm font-semibold hidden sm:table-cell">
                  Status
                </TableHead>
                <TableHead className="py-3 text-sm font-semibold text-right">
                  Buy-In
                </TableHead>
                <TableHead className="py-3 text-sm font-semibold text-right">
                  Cash-Out
                </TableHead>
                <TableHead className="py-3 text-sm font-semibold text-right">
                  Net
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessionPlayers.map((sessionPlayer) => {
                const player = sessionPlayer.player;
                const netResult = sessionPlayer.cash_out - sessionPlayer.buy_in;
                const isEditing = editingFinancials?.playerId === sessionPlayer.player_id;

                return (
                  <TableRow
                    key={sessionPlayer.player_id}
                    className={`
                      ${!editingFinancials ? 'cursor-pointer hover:bg-gray-50' : ''}
                      ${editingFinancials?.playerId === sessionPlayer.player_id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                      ${editingFinancials && editingFinancials.playerId !== sessionPlayer.player_id ? 'opacity-50' : ''}
                    `}
                    onClick={() => !editingFinancials && handleEditFinancials(sessionPlayer)}
                  >
                    <TableCell className="py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {player?.name || 'Unknown Player'}
                        </div>
                        {player?.email && (
                          <div className="text-xs text-gray-600 hidden sm:block">
                            {player.email}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-3 hidden sm:table-cell">
                      <PlayerStatusBadge status={sessionPlayer.status} />
                    </TableCell>

                    <TableCell className="py-3 text-right">
                      {isEditing ? (
                        <div onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={editingFinancials.buy_in.toString()}
                            onValueChange={(value) => setEditingFinancials({
                              ...editingFinancials,
                              buy_in: value
                            })}
                          >
                            <SelectTrigger className="w-24 h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getBuyInOptions().map((amount) => (
                                <SelectItem
                                  key={amount}
                                  value={amount.toString()}
                                  className={getBuyInColorClass(amount)}
                                >
                                  {formatCurrency(amount)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className={`text-sm font-medium ${getBuyInColorClass(sessionPlayer.buy_in)}`}>
                          {formatCurrency(sessionPlayer.buy_in)}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="py-3 text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editingFinancials.cash_out}
                          onChange={(e) => setEditingFinancials({
                            ...editingFinancials,
                            cash_out: e.target.value
                          })}
                          min={0}
                          step={0.01}
                          placeholder="0.00"
                          className="w-20 h-8 text-sm text-right"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="text-sm font-medium">
                          {sessionPlayer.cash_out > 0 ? formatCurrency(sessionPlayer.cash_out) : '—'}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="py-3 text-right">
                      {sessionPlayer.cash_out > 0 ? (
                        <Badge
                          variant={netResult === 0 ? 'outline' : 'default'}
                          className={`text-xs ${
                            netResult >= 0
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                          }`}
                        >
                          {netResult >= 0 ? '+' : '-'}{formatCurrency(Math.abs(netResult))}
                        </Badge>
                      ) : (
                        <div className="text-sm text-gray-400">—</div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Edit Mode Controls */}
        {editingFinancials && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleSaveFinancials}
                disabled={updating}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={updating}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Add Player Button */}
        <div className="p-4 text-center border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => setAddPlayerModalOpen(true)}
            disabled={getAvailablePlayersToAdd().length === 0}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Player
          </Button>
        </div>
      </Card>

      {/* Add Player Modal */}
      <Dialog open={addPlayerModalOpen} onOpenChange={setAddPlayerModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Player to Session</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select a player to add or change their status to "In".
            </p>

            <div className="space-y-2">
              {getAvailablePlayersToAdd().map((player) => (
                <div key={player.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center flex-1">
                    <User className="h-4 w-4 text-gray-500 mr-2" />
                    <div>
                      <div className="font-medium text-gray-900">{player.name}</div>
                      {player.email && (
                        <div className="text-sm text-gray-600">{player.email}</div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleAddPlayer(player.id)}
                    disabled={updating}
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>

            {getAvailablePlayersToAdd().length === 0 && (
              <p className="text-sm text-gray-600 text-center py-4">
                All players are already marked as "In" for this session.
              </p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setAddPlayerModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SessionPage;
