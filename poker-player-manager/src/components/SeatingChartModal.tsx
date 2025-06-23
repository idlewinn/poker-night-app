import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shuffle, User } from 'lucide-react';
import { SessionPlayer, CreateSeatingChartRequest } from '../types/index';

interface SeatingChartModalProps {
  open: boolean;
  onClose: () => void;
  sessionId: number;
  sessionPlayers: SessionPlayer[];
  onGenerate: (request: CreateSeatingChartRequest) => Promise<void>;
  generating?: boolean;
}

function SeatingChartModal({
  open,
  onClose,
  sessionId,
  sessionPlayers,
  onGenerate,
  generating = false
}: SeatingChartModalProps): React.JSX.Element {
  const [chartName, setChartName] = useState<string>('');
  const [numberOfTables, setNumberOfTables] = useState<string>('1');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);

  // Get players with "In" status
  const availablePlayers = sessionPlayers.filter(sp => sp.status === 'In');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      const now = new Date();
      const defaultName = `Seating Chart ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      setChartName(defaultName);
      setSelectedPlayerIds(availablePlayers.map(sp => sp.player_id));
      setNumberOfTables('1');
    }
  }, [open, availablePlayers.length]); // Only depend on length to avoid infinite re-renders

  const handlePlayerToggle = (playerId: number, checked: boolean) => {
    if (checked) {
      setSelectedPlayerIds(prev => [...prev, playerId]);
    } else {
      setSelectedPlayerIds(prev => prev.filter(id => id !== playerId));
    }
  };

  const handleSelectAll = () => {
    setSelectedPlayerIds(availablePlayers.map(sp => sp.player_id));
  };

  const handleSelectNone = () => {
    setSelectedPlayerIds([]);
  };

  const handleGenerate = async () => {
    if (!chartName.trim() || selectedPlayerIds.length === 0 || !numberOfTables) {
      return;
    }

    const request: CreateSeatingChartRequest = {
      sessionId,
      name: chartName.trim(),
      numberOfTables: parseInt(numberOfTables),
      playerIds: selectedPlayerIds
    };

    try {
      await onGenerate(request);
      onClose();
    } catch (error) {
      console.error('Failed to generate seating chart:', error);
    }
  };

  const isValidForm = () => {
    const numTables = parseInt(numberOfTables);
    return (
      chartName.trim().length > 0 &&
      selectedPlayerIds.length > 0 &&
      numTables >= 1 &&
      numTables <= selectedPlayerIds.length
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md z-[60]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shuffle className="h-5 w-5" />
            Generate Seating Chart
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Chart Name */}
          <div className="space-y-2">
            <Label htmlFor="chart-name">Chart Name</Label>
            <Input
              id="chart-name"
              value={chartName}
              onChange={(e) => setChartName(e.target.value)}
              placeholder="Enter seating chart name"
            />
          </div>

          {/* Number of Tables */}
          <div className="space-y-2">
            <Label htmlFor="num-tables">Number of Tables</Label>
            <Select value={numberOfTables} onValueChange={setNumberOfTables}>
              <SelectTrigger>
                <SelectValue placeholder="Select number of tables" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: Math.min(selectedPlayerIds.length || 1, 10) }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} Table{num > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Player Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Select Players ({selectedPlayerIds.length} selected)</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={selectedPlayerIds.length === availablePlayers.length}
                >
                  All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectNone}
                  disabled={selectedPlayerIds.length === 0}
                >
                  None
                </Button>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-3">
              {availablePlayers.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-4">
                  No players with "In" status found
                </p>
              ) : (
                availablePlayers.map((sessionPlayer) => {
                  const player = sessionPlayer.player;
                  const isSelected = selectedPlayerIds.includes(sessionPlayer.player_id);

                  return (
                    <div key={sessionPlayer.player_id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`player-${sessionPlayer.player_id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handlePlayerToggle(sessionPlayer.player_id, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`player-${sessionPlayer.player_id}`}
                        className="flex items-center flex-1 cursor-pointer"
                      >
                        <User className="h-4 w-4 text-gray-500 mr-2" />
                        <div>
                          <div className="text-sm font-medium">
                            {player?.name || 'Unknown Player'}
                          </div>
                          {player?.email && (
                            <div className="text-xs text-gray-600">{player.email}</div>
                          )}
                        </div>
                      </label>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={generating}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!isValidForm() || generating}
            className="flex items-center gap-2"
          >
            {generating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <Shuffle className="h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SeatingChartModal;
