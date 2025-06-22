import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import PlayerItem from './PlayerItem';
import { PlayerListProps } from '../types/index';

function PlayerList({ players, onRemovePlayer, onRenamePlayer, onViewPlayerDetails }: PlayerListProps): React.JSX.Element {
  if (players.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">
            No players in your network yet.
          </p>
          <p className="text-sm text-gray-400">
            Add players above or join sessions to see players you know!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
        <Users className="h-7 w-7 text-primary" />
        Your Players ({players.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {players.map(player => (
          <PlayerItem
            key={player.id}
            player={player}
            onRemove={() => onRemovePlayer(player.id)}
            onRename={(newName, newEmail) => onRenamePlayer(player.id, newName, newEmail)}
            {...(onViewPlayerDetails && { onViewDetails: () => onViewPlayerDetails(player) })}
          />
        ))}
      </div>
    </div>
  )
}

export default PlayerList;
