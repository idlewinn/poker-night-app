import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Search } from 'lucide-react';
import PlayerItem from './PlayerItem';
import { PlayerListProps } from '../types/index';

function PlayerList({ players, onRemovePlayer, onRenamePlayer, onViewPlayerDetails, onToggleDefaultInvite }: PlayerListProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter players based on search query
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) {
      return players;
    }

    const query = searchQuery.toLowerCase().trim();
    return players.filter(player =>
      player.name.toLowerCase().includes(query) ||
      (player.email && player.email.toLowerCase().includes(query))
    );
  }, [players, searchQuery]);

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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-3">
          <Users className="h-7 w-7 text-primary" />
          Your Players ({filteredPlayers.length}{filteredPlayers.length !== players.length ? ` of ${players.length}` : ''})
        </h2>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search players by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Players Grid */}
      {filteredPlayers.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-8 text-center">
            <Search className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">
              No players found matching "{searchQuery}"
            </p>
            <p className="text-sm text-gray-400">
              Try adjusting your search terms.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredPlayers.map(player => (
            <PlayerItem
              key={player.id}
              player={player}
              onRemove={() => onRemovePlayer(player.id)}
              onRename={(newName, newEmail) => onRenamePlayer(player.id, newName, newEmail)}
              {...(onViewPlayerDetails && { onViewDetails: () => onViewPlayerDetails(player) })}
              {...(onToggleDefaultInvite && { onToggleDefaultInvite })}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PlayerList;
