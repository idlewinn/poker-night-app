import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Edit,
  Trash2,
  Check,
  X,
  User
} from 'lucide-react';
import { PlayerItemProps } from '../types/index';

function PlayerItem({ player, onRemove, onRename }: PlayerItemProps): React.JSX.Element {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(player.name);
  const [editEmail, setEditEmail] = useState<string>(player.email || '');

  const handleSave = (): void => {
    if (editName.trim()) {
      // Check if either name or email has changed
      const nameChanged = editName !== player.name;
      const emailChanged = editEmail !== (player.email || '');

      console.log('PlayerItem handleSave debug:', {
        editName,
        editEmail,
        playerName: player.name,
        playerEmail: player.email,
        nameChanged,
        emailChanged
      });

      if (nameChanged || emailChanged) {
        const emailToSend = editEmail.trim() || undefined;
        console.log('Calling onRename with:', { name: editName, email: emailToSend });
        onRename(editName, emailToSend);
      }
    }
    setIsEditing(false);
    setEditName(player.name);
    setEditEmail(player.email || '');
  };

  const handleCancel = (): void => {
    setIsEditing(false);
    setEditName(player.name);
    setEditEmail(player.email || '');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Card className="h-full min-h-[160px] flex flex-col border transition-all duration-300 hover:border-primary hover:shadow-lg">
      <CardContent className="p-6 flex-1 flex flex-col">
        {isEditing ? (
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <label htmlFor="player-name" className="text-sm font-medium">
                Player Name
              </label>
              <Input
                id="player-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyPress}
                autoFocus
                placeholder="Enter player name..."
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="player-email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="player-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter email address (optional)..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={handleSave}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex items-start mb-4 flex-1 min-h-[90px]">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4 mt-1 shadow-lg">
                <User className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold text-lg leading-tight truncate mb-1 text-sm sm:text-lg"
                  title={player.name}
                >
                  {player.name}
                </h3>
                <p
                  className={`text-sm text-muted-foreground truncate ${!player.email ? 'italic' : ''}`}
                  title={player.email || 'No email address'}
                >
                  {player.email || 'No email address'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                title="Rename player"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                onClick={onRemove}
                variant="outline"
                size="sm"
                className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                title="Remove player"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PlayerItem;
