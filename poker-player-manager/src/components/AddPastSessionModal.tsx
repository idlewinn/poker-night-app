import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Calendar, DollarSign } from 'lucide-react';
import { Player } from '../types/index';

interface AddPastSessionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (sessionData: PastSessionData) => Promise<void>;
  players: Player[];
  loading?: boolean;
}

interface SessionPlayer {
  playerId: number;
  playerName: string;
  buyIn: number;
  cashOut: number;
}

export interface PastSessionData {
  name: string;
  scheduledDateTime: string;
  gameType: 'cash' | 'tournament';
  players: SessionPlayer[];
}

function AddPastSessionModal({ open, onClose, onSubmit, players, loading = false }: AddPastSessionModalProps): React.JSX.Element {
  const [sessionName, setSessionName] = useState<string>('');
  const [sessionDate, setSessionDate] = useState<string>('');
  const [sessionTime, setSessionTime] = useState<string>('19:00');
  const [gameType, setGameType] = useState<'cash' | 'tournament'>('cash');
  const [sessionPlayers, setSessionPlayers] = useState<SessionPlayer[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setSessionName('');
      setSessionDate('');
      setSessionTime('19:00');
      setGameType('cash');
      setSessionPlayers([]);
      setSelectedPlayerId('');
    }
  }, [open]);

  const handleAddPlayer = () => {
    if (!selectedPlayerId) return;
    
    const player = players.find(p => p.id === parseInt(selectedPlayerId));
    if (!player) return;

    // Check if player is already added
    if (sessionPlayers.some(sp => sp.playerId === player.id)) return;

    const newSessionPlayer: SessionPlayer = {
      playerId: player.id,
      playerName: player.name,
      buyIn: 0,
      cashOut: 0
    };

    setSessionPlayers([...sessionPlayers, newSessionPlayer]);
    setSelectedPlayerId('');
  };

  const handleRemovePlayer = (playerId: number) => {
    setSessionPlayers(sessionPlayers.filter(sp => sp.playerId !== playerId));
  };

  const handleUpdatePlayerFinancials = (playerId: number, field: 'buyIn' | 'cashOut', value: number) => {
    setSessionPlayers(sessionPlayers.map(sp => 
      sp.playerId === playerId 
        ? { ...sp, [field]: value }
        : sp
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionDate || sessionPlayers.length === 0) {
      return;
    }

    // Combine date and time
    const dateTime = new Date(`${sessionDate}T${sessionTime}`);
    
    const sessionData: PastSessionData = {
      name: sessionName.trim() || 'Poker Night',
      scheduledDateTime: dateTime.toISOString(),
      gameType,
      players: sessionPlayers
    };

    try {
      await onSubmit(sessionData);
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateTotals = () => {
    const totalBuyIn = sessionPlayers.reduce((sum, sp) => sum + sp.buyIn, 0);
    const totalCashOut = sessionPlayers.reduce((sum, sp) => sum + sp.cashOut, 0);
    const netResult = totalCashOut - totalBuyIn;
    return { totalBuyIn, totalCashOut, netResult };
  };

  const { totalBuyIn, totalCashOut, netResult } = calculateTotals();
  const availablePlayers = players.filter(p => !sessionPlayers.some(sp => sp.playerId === p.id));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Add Past Session
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionName">Session Name (Optional)</Label>
              <Input
                id="sessionName"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Poker Night"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gameType">Game Type</Label>
              <Select value={gameType} onValueChange={(value: 'cash' | 'tournament') => setGameType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">💵 Cash Game</SelectItem>
                  <SelectItem value="tournament">🏆 Tournament</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionDate">Date *</Label>
              <Input
                id="sessionDate"
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTime">Time</Label>
              <Input
                id="sessionTime"
                type="time"
                value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
              />
            </div>
          </div>

          {/* Add Players Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Players</h3>
              <div className="flex items-center gap-2">
                <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select player to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlayers.map(player => (
                      <SelectItem key={player.id} value={player.id.toString()}>
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  onClick={handleAddPlayer}
                  disabled={!selectedPlayerId}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Players List */}
            {sessionPlayers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Session Players</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sessionPlayers.map((sessionPlayer) => (
                    <div key={sessionPlayer.playerId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{sessionPlayer.playerName}</div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Buy-in</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={sessionPlayer.buyIn || ''}
                            onChange={(e) => handleUpdatePlayerFinancials(
                              sessionPlayer.playerId, 
                              'buyIn', 
                              parseFloat(e.target.value) || 0
                            )}
                            className="w-24 text-sm"
                            placeholder="0"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs">Cash-out</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={sessionPlayer.cashOut || ''}
                            onChange={(e) => handleUpdatePlayerFinancials(
                              sessionPlayer.playerId, 
                              'cashOut', 
                              parseFloat(e.target.value) || 0
                            )}
                            className="w-24 text-sm"
                            placeholder="0"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs">Net</Label>
                          <Badge
                            variant={sessionPlayer.cashOut - sessionPlayer.buyIn === 0 ? 'outline' : 'default'}
                            className={`text-xs ${
                              sessionPlayer.cashOut - sessionPlayer.buyIn >= 0
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : 'bg-red-100 text-red-800 border-red-300'
                            }`}
                          >
                            {sessionPlayer.cashOut - sessionPlayer.buyIn >= 0 ? '+' : ''}
                            {formatCurrency(sessionPlayer.cashOut - sessionPlayer.buyIn)}
                          </Badge>
                        </div>
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePlayer(sessionPlayer.playerId)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Session Totals */}
            {sessionPlayers.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-gray-600">Total Buy-in</div>
                      <div className="text-lg font-semibold text-green-600">{formatCurrency(totalBuyIn)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Total Cash-out</div>
                      <div className="text-lg font-semibold text-blue-600">{formatCurrency(totalCashOut)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Net Result</div>
                      <div className={`text-lg font-semibold ${
                        netResult === 0 ? 'text-gray-600' : netResult > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {netResult >= 0 ? '+' : ''}{formatCurrency(netResult)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !sessionDate || sessionPlayers.length === 0}
              className="flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              {loading ? 'Adding Session...' : 'Add Past Session'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddPastSessionModal;
