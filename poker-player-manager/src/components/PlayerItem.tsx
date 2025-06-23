import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [editDefaultInvite, setEditDefaultInvite] = useState<boolean>(player.default_invite !== false);

  // Determine if this player can be edited (has email = user has full access)
  const canEdit = player.email !== null;

  // Sync state when player prop changes (e.g., when auto-invite is toggled)
  useEffect(() => {
    setEditName(player.name);
    setEditEmail(player.email || '');
    setEditDefaultInvite(player.default_invite !== false);
  }, [player.name, player.email, player.default_invite]);

  const handleSave = (): void => {
    if (editName.trim()) {
      // Check if name, email, or auto-invite has changed
      const nameChanged = editName !== player.name;
      const emailChanged = editEmail !== (player.email || '');
      const autoInviteChanged = editDefaultInvite !== (player.default_invite !== false);

      console.log('PlayerItem handleSave debug:', {
        editName,
        editEmail,
        editDefaultInvite,
        playerName: player.name,
        playerEmail: player.email,
        playerDefaultInvite: player.default_invite,
        nameChanged,
        emailChanged,
        autoInviteChanged
      });

      if (nameChanged || emailChanged) {
        const emailToSend = editEmail.trim() || undefined;
        console.log('Calling onRename with:', { name: editName, email: emailToSend });
        onRename(editName, emailToSend);
      }

      // Handle auto-invite setting change separately
      if (autoInviteChanged && onToggleDefaultInvite) {
        console.log('Updating auto-invite setting to:', editDefaultInvite);
        onToggleDefaultInvite(player.id, editDefaultInvite);
      }
    }
    setIsEditing(false);
    setEditName(player.name);
    setEditEmail(player.email || '');
    setEditDefaultInvite(player.default_invite !== false);
  };

  const handleCancel = (): void => {
    setIsEditing(false);
    setEditName(player.name);
    setEditEmail(player.email || '');
    setEditDefaultInvite(player.default_invite !== false);
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
              <>
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
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="auto-invite"
                    checked={editDefaultInvite}
                    onCheckedChange={(checked) => setEditDefaultInvite(checked === true)}
                  />
                  <label
                    htmlFor="auto-invite"
                    className="text-xs font-medium text-gray-700 cursor-pointer"
                  >
                    Include in "Invite All" by default
                  </label>
                </div>
              </>
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
                {/* Default Invite Toggle - only show for excluded players */}
                {canEdit && onToggleDefaultInvite && player.default_invite === false && (
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className="text-xs cursor-pointer transition-colors text-orange-600 border-orange-300 hover:bg-orange-50"
                      onClick={() => onToggleDefaultInvite(player.id, true)}
                      title="Excluded from 'Invite All' - click to include"
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Excluded from invite all
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
