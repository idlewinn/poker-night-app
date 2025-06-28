import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, Loader2, AlertCircle, X, Plus } from 'lucide-react';
import PlayerList from './PlayerList';
import AddPlayerModal from './AddPlayerModal';
import Sessions from './Sessions';
import PlayerDetailModal from './PlayerDetailModal';
import UserMenu from './UserMenu';
import { useAuth } from '../contexts/AuthContext';
import { playersApi, sessionsApi } from '../services/api';
import { Player, Session, CreateSessionRequest, UpdateSessionRequest, CreatePlayerRequest } from '../types/index';

function MainApp(): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState<string>('players');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [playerDetailModalOpen, setPlayerDetailModalOpen] = useState<boolean>(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [addPlayerModalOpen, setAddPlayerModalOpen] = useState<boolean>(false);
  const [addingPlayer, setAddingPlayer] = useState<boolean>(false);

  // Determine active tab based on current URL
  const getTabFromPath = (pathname: string): string => {
    if (pathname === '/sessions') return 'sessions';
    return 'players'; // Default to players tab for '/' and '/players'
  };

  // Set active tab based on current URL
  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  // Load initial data only when authenticated
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      if (!isAuthenticated || authLoading) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [playersData, sessionsData] = await Promise.all([
          playersApi.getAll(),
          sessionsApi.getAll()
        ]);
        setPlayers(playersData);
        setSessions(sessionsData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, authLoading]);

  const addPlayer = async (playerData: { name: string; email: string }): Promise<void> => {
    try {
      setAddingPlayer(true);
      const requestData: CreatePlayerRequest = {
        name: playerData.name.trim()
      };

      if (playerData.email?.trim()) {
        requestData.email = playerData.email.trim();
      }

      const newPlayer = await playersApi.create(requestData);
      setPlayers([...players, newPlayer]);
    } catch (err) {
      console.error('Failed to add player:', err);
      setError('Failed to add player: ' + (err as Error).message);
      throw err; // Re-throw to let modal handle the error
    } finally {
      setAddingPlayer(false);
    }
  };

  const removePlayer = async (id: number): Promise<void> => {
    try {
      await playersApi.delete(id);
      setPlayers(players.filter(player => player.id !== id));
    } catch (err) {
      console.error('Failed to remove player:', err);
      setError('Failed to remove player: ' + (err as Error).message);
    }
  };

  const renamePlayer = async (id: number, newName: string, newEmail?: string): Promise<void> => {
    try {
      const requestData: any = {
        name: newName.trim()
      };

      if (newEmail !== undefined) {
        const trimmedEmail = newEmail.trim();
        if (trimmedEmail) {
          requestData.email = trimmedEmail;
        }
      }

      const updatedPlayer = await playersApi.update(id, requestData);
      setPlayers(players.map(player =>
        player.id === id ? updatedPlayer : player
      ));
    } catch (err) {
      console.error('Failed to rename player:', err);
      setError('Failed to rename player: ' + (err as Error).message);
    }
  };

  const handleViewPlayerDetails = (player: Player) => {
    setSelectedPlayer(player);
    setPlayerDetailModalOpen(true);
  };

  const handleClosePlayerDetailModal = () => {
    setPlayerDetailModalOpen(false);
    setSelectedPlayer(null);
  };

  const handleToggleDefaultInvite = async (playerId: number, defaultInvite: boolean): Promise<void> => {
    try {
      await playersApi.updateDefaultInvite(playerId, defaultInvite);

      // Update local state
      setPlayers(prevPlayers =>
        prevPlayers.map(player =>
          player.id === playerId
            ? { ...player, default_invite: defaultInvite }
            : player
        )
      );
    } catch (error: any) {
      console.error('Failed to update default invite setting:', error);
      setError('Failed to update invite setting: ' + (error.message || 'Unknown error'));
    }
  };

  const handleTabChange = (value: string): void => {
    setActiveTab(value);
    if (value === 'players') {
      navigate('/players');
    } else if (value === 'sessions') {
      navigate('/sessions');
    }
  };

  const clearError = (): void => {
    setError(null);
  };



  const addSession = async (sessionName: string, selectedPlayerIds: number[], scheduledDateTime: string, gameType?: 'cash' | 'tournament', timezone?: string): Promise<void> => {
    try {
      const requestData: CreateSessionRequest = {
        scheduledDateTime: scheduledDateTime,
        timezone: timezone,
        playerIds: selectedPlayerIds || [],
        game_type: gameType || 'cash'
      };

      if (sessionName.trim()) {
        requestData.name = sessionName.trim();
      }

      const newSession = await sessionsApi.create(requestData);
      setSessions([...sessions, newSession]);
    } catch (err) {
      console.error('Failed to add session:', err);
      setError('Failed to add session: ' + (err as Error).message);
    }
  };

  const removeSession = async (id: number): Promise<void> => {
    try {
      await sessionsApi.delete(id);
      setSessions(sessions.filter(session => session.id !== id));
    } catch (err) {
      console.error('Failed to remove session:', err);
      setError('Failed to remove session: ' + (err as Error).message);
    }
  };

  const updateSession = async (id: number, sessionName: string, selectedPlayerIds: number[], scheduledDateTime: string, timezone?: string): Promise<void> => {
    try {
      const requestData: UpdateSessionRequest = {
        scheduledDateTime: scheduledDateTime,
        timezone: timezone,
        playerIds: selectedPlayerIds || []
      };

      if (sessionName.trim()) {
        requestData.name = sessionName.trim();
      }

      const updatedSession = await sessionsApi.update(id, requestData);
      setSessions(sessions.map(session =>
        session.id === id ? updatedSession : session
      ));
    } catch (err) {
      console.error('Failed to update session:', err);
      setError('Failed to update session: ' + (err as Error).message);
    }
  };

  // Show loading spinner while auth or data is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-foreground">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading Poker Night...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl p-4 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 text-center">
            <h1 className="text-4xl font-bold text-foreground drop-shadow-lg">
              🃏 Poker Night
            </h1>
          </div>
          <div className="flex-shrink-0">
            <UserMenu sessions={sessions} />
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="bg-card/95 backdrop-blur-sm shadow-2xl">
          {/* Error Alert */}
          {error && (
            <div className="p-6 pb-0">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1 h-auto"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="border-b border-gray-200 px-6 pt-6">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="players" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Players
                </TabsTrigger>
                <TabsTrigger value="sessions" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Sessions
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="players" className="mt-0">
                <div className="space-y-6">
                  {/* Add Player Button */}
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-foreground">Players</h2>
                    <Button
                      onClick={() => setAddPlayerModalOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Player
                    </Button>
                  </div>

                  <PlayerList
                    players={players}
                    onRemovePlayer={removePlayer}
                    onRenamePlayer={renamePlayer}
                    onViewPlayerDetails={handleViewPlayerDetails}
                    onToggleDefaultInvite={handleToggleDefaultInvite}
                  />
                </div>
              </TabsContent>

              <TabsContent value="sessions" className="mt-0">
                <Sessions
                  sessions={sessions}
                  players={players}
                  onCreateSession={addSession}
                  onUpdateSession={updateSession}
                  onRemoveSession={removeSession}
                />
              </TabsContent>


            </div>
          </Tabs>
        </Card>

        {/* Add Player Modal */}
        <AddPlayerModal
          open={addPlayerModalOpen}
          onClose={() => setAddPlayerModalOpen(false)}
          onSubmit={addPlayer}
          loading={addingPlayer}
        />

        {/* Player Detail Modal */}
        <PlayerDetailModal
          open={playerDetailModalOpen}
          onClose={handleClosePlayerDetailModal}
          player={selectedPlayer}
          sessions={sessions}
        />
      </div>
    </div>
  );
}

export default MainApp;
