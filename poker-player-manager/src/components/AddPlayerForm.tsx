import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UserPlus } from 'lucide-react';
import { AddPlayerFormProps } from '../types/index';

function AddPlayerForm({ onAddPlayer }: AddPlayerFormProps): React.JSX.Element {
  const [playerName, setPlayerName] = useState<string>('');
  const [playerEmail, setPlayerEmail] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (playerName.trim()) {
      onAddPlayer(playerName, playerEmail.trim() || undefined);
      setPlayerName('');
      setPlayerEmail('');
    }
  };

  return (
    <Card className="bg-gradient-to-br from-muted/50 to-card border shadow-lg mb-6">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">
          Add New Player
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="player-name" className="text-sm font-medium text-foreground">
              Player Name
            </label>
            <Input
              id="player-name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter player name..."
              required
              maxLength={50}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="player-email" className="text-sm font-medium text-foreground">
              Email Address
            </label>
            <Input
              id="player-email"
              type="email"
              value={playerEmail}
              onChange={(e) => setPlayerEmail(e.target.value)}
              placeholder="Enter email address (optional)..."
              maxLength={100}
              className="h-12"
            />
          </div>

          <Button
            type="submit"
            disabled={!playerName.trim()}
            className="w-full h-14 text-base font-medium"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add Player
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default AddPlayerForm;
