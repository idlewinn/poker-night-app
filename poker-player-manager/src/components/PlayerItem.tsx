import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  Trash2,
  Check,
  X,
  User,
  Eye,
  Mail
} from 'lucide-react';
import { PlayerItemProps } from '../types/index';

function PlayerItem({ player, onRemove, onRename, onViewDetails, onToggleDefaultInvite }: PlayerItemProps): React.JSX.Element {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(player.name);
  const [editEmail, setEditEmail] = useState<string>(player.email || '');

  // Determine if this player can be edited (has email = user has full access)
  const canEdit = player.email !== null;

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
    <Card className="h-full transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4 flex flex-col h-full">
        {isEditing ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="player-name" className="text-xs font-medium text-gray-700">
                Name *
              </label>
              <Input
                id="player-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyPress}
                autoFocus
                placeholder="Enter player name..."
                required
                className="text-sm"
              />
            </div>
            {canEdit && (
              <div className="space-y-1">
                <label htmlFor="player-email" className="text-xs font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="player-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter email (optional)..."
                  className="text-sm"
                />
              </div>
            )}
            <div className="flex gap-2 justify-end pt-2">
              <Button
                onClick={handleSave}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex items-start mb-3 flex-1">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold text-gray-900 leading-tight truncate mb-1"
                  title={player.name}
                >
                  {player.name}
                </h3>
                <p
                  className={`text-sm text-gray-600 truncate ${!player.email ? 'italic' : ''}`}
                  title={player.email || 'Known from shared sessions'}
                >
                  {player.email || 'Known from shared sessions'}
                </p>
                {/* Default Invite Toggle - only show for players you can edit */}
                {canEdit && onToggleDefaultInvite && (
                  <div className="mt-2">
                    <Badge
                      variant={player.default_invite !== false ? "default" : "outline"}
                      className={`text-xs cursor-pointer transition-colors ${
                        player.default_invite !== false
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => onToggleDefaultInvite(player.id, player.default_invite === false)}
                      title={player.default_invite !== false ? 'Included in "Invite All" - click to exclude' : 'Excluded from "Invite All" - click to include'}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      {player.default_invite !== false ? 'Auto-invite' : 'Manual invite'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              {onViewDetails && (
                <Button
                  onClick={onViewDetails}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  title="View player details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {/* Only show edit/delete for players you have full access to */}
              {canEdit && (
                <>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    title="Edit player"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={onRemove}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Remove player"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PlayerItem;
