import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Calendar, Clock, History, Play, ChevronDown, ChevronRight } from 'lucide-react';
import SessionList from './SessionList';
import CreateSessionModal from './CreateSessionModal';
import AddPastSessionModal, { PastSessionData } from './AddPastSessionModal';
import EditSessionModal from './EditSessionModal';
import SessionDetailModal from './SessionDetailModal';
import SessionMetricsModal from './SessionMetricsModal';
import { SessionsProps, Session, PlayerStatus } from '../types/index';
import { sessionsApi, CreatePastSessionRequest } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Sessions({ sessions, players, onCreateSession, onUpdateSession, onRemoveSession }: SessionsProps): React.JSX.Element {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isAddPastModalOpen, setIsAddPastModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState<boolean>(false);
  const [addingPastSession, setAddingPastSession] = useState<boolean>(false);
  const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);
  const [sessionToView, setSessionToView] = useState<Session | null>(null);
  const [sessionForMetrics, setSessionForMetrics] = useState<Session | null>(null);
  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const [showPastSessions, setShowPastSessions] = useState<boolean>(false);


  const handleOpenCreateModal = (): void => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = (): void => {
    setIsCreateModalOpen(false);
  };

  const handleOpenAddPastModal = (): void => {
    setIsAddPastModalOpen(true);
  };

  const handleCloseAddPastModal = (): void => {
    setIsAddPastModalOpen(false);
  };

  const handleOpenEditModal = (session: Session): void => {
    setSessionToEdit(session);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = (): void => {
    setIsEditModalOpen(false);
    setSessionToEdit(null);
  };

  const handleOpenDetailModal = (session: Session): void => {
    setSessionToView(session);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = (): void => {
    setIsDetailModalOpen(false);
    setSessionToView(null);
  };

  const handleOpenMetricsModal = (session: Session): void => {
    console.log('Opening metrics modal for session:', session.id);
    setSessionForMetrics(session);
    setIsMetricsModalOpen(true);
  };

  const handleCloseMetricsModal = (): void => {
    setIsMetricsModalOpen(false);
    setSessionForMetrics(null);
  };

  const handleCreateSession = (sessionName: string, selectedPlayerIds: number[], scheduledDateTime: string): void => {
    onCreateSession(sessionName, selectedPlayerIds, scheduledDateTime);
  };

  const handleCreatePastSession = async (pastSessionData: PastSessionData): Promise<void> => {
    try {
      setAddingPastSession(true);

      // Convert PastSessionData to CreatePastSessionRequest format
      const requestData: CreatePastSessionRequest = {
        name: pastSessionData.name,
        scheduledDateTime: pastSessionData.scheduledDateTime,
        game_type: pastSessionData.gameType,
        players: pastSessionData.players.map(p => ({
          playerId: p.playerId,
          buyIn: p.buyIn,
          cashOut: p.cashOut
        }))
      };

      await sessionsApi.createPast(requestData);

      setNotification({
        message: 'Past session added successfully!',
        severity: 'success'
      });

      // Refresh the page to show the new session
      window.location.reload();

    } catch (error) {
      console.error('Failed to create past session:', error);
      setNotification({
        message: 'Failed to create past session',
        severity: 'error'
      });
      throw error; // Re-throw to let modal handle it
    } finally {
      setAddingPastSession(false);
    }
  };

  const handleUpdateSession = (sessionId: number, sessionName: string, selectedPlayerIds: number[], scheduledDateTime: string): void => {
    onUpdateSession(sessionId, sessionName, selectedPlayerIds, scheduledDateTime);
  };

  const handleStatusChange = async (playerId: number, newStatus: PlayerStatus): Promise<void> => {
    if (!sessionToView) return;


    try {
      await sessionsApi.updatePlayerStatus(sessionToView.id, playerId, newStatus);

      // Update the local session data
      const updatedSession = { ...sessionToView };
      if (updatedSession.players) {
        updatedSession.players = updatedSession.players.map(sp =>
          sp.player_id === playerId ? { ...sp, status: newStatus } : sp
        );
      }
      setSessionToView(updatedSession);

      // Show success notification
      setNotification({
        message: `Player status updated to "${newStatus}"`,
        severity: 'success'
      });

      // Refresh sessions data (this will trigger a re-fetch from parent)
      // Note: In a real app, you might want to update the sessions state directly
      // or use a state management solution like Redux

    } catch (error) {
      console.error('Failed to update player status:', error);
      setNotification({
        message: 'Failed to update player status',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = (): void => {
    setNotification(null);
  };

  const handleViewSession = (session: Session): void => {
    navigate(`/session/${session.id}`);
  };

  // Helper function to check if user owns a session
  const isSessionOwner = (session: Session): boolean => {
    return user?.id === session.createdBy;
  };

  // Helper function to check if a session is currently active (within last 8 hours)
  const isSessionActive = (session: Session): boolean => {
    if (!session.scheduledDateTime) return false;
    const sessionDate = new Date(session.scheduledDateTime);
    const now = new Date();
    const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);
    return sessionDate >= eightHoursAgo && sessionDate <= now;
  };

  // Helper function to check if a session is in the past (but not active)
  const isSessionPast = (session: Session): boolean => {
    if (!session.scheduledDateTime) return false;
    const sessionDate = new Date(session.scheduledDateTime);
    const now = new Date();
    const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);
    return sessionDate < eightHoursAgo;
  };

  // Helper function to sort sessions by event time (latest first)
  const sortByEventTime = (a: Session, b: Session): number => {
    const dateA = new Date(a.scheduledDateTime || a.createdAt);
    const dateB = new Date(b.scheduledDateTime || b.createdAt);
    return dateB.getTime() - dateA.getTime(); // Latest first
  };

  // Group sessions into active, upcoming, and past, sorted by event time
  const groupedSessions = {
    active: sessions
      .filter(session => isSessionActive(session))
      .sort(sortByEventTime),
    upcoming: sessions
      .filter(session => !isSessionPast(session) && !isSessionActive(session))
      .sort(sortByEventTime),
    past: sessions
      .filter(session => isSessionPast(session))
      .sort(sortByEventTime)
  };

  return (
    <div>
      {/* Sessions Header with Create Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-3">
          <Calendar className="h-7 w-7 text-primary" />
          Sessions ({sessions.length})
        </h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleOpenCreateModal}
            className="h-10 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Session
          </Button>
          <Button
            onClick={handleOpenAddPastModal}
            variant="outline"
            className="h-10 w-full sm:w-auto"
          >
            <History className="h-4 w-4 mr-2" />
            Add Past Session
          </Button>
        </div>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No sessions yet. Create your first session or get invited to one!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Active Sessions */}
          {groupedSessions.active.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Play className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-green-700">
                  Active Sessions ({groupedSessions.active.length})
                </h3>
              </div>
              <SessionList
                sessions={groupedSessions.active}
                players={players}
                onRemoveSession={onRemoveSession}
                onEditSession={handleOpenEditModal}
                onViewSessionDetails={handleOpenDetailModal}
                onViewSession={handleViewSession}
                onViewMetrics={handleOpenMetricsModal}
                hideHeader={true}
                isSessionOwner={isSessionOwner}
                isPastSessions={false}
                isActiveSessions={true}
              />
            </div>
          )}

          {/* Upcoming Sessions */}
          {groupedSessions.upcoming.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-foreground">
                  Upcoming Sessions ({groupedSessions.upcoming.length})
                </h3>
              </div>
              <SessionList
                sessions={groupedSessions.upcoming}
                players={players}
                onRemoveSession={onRemoveSession}
                onEditSession={handleOpenEditModal}
                onViewSessionDetails={handleOpenDetailModal}
                onViewSession={handleViewSession}
                onViewMetrics={handleOpenMetricsModal}
                hideHeader={true}
                isSessionOwner={isSessionOwner}
                isPastSessions={false}
                isActiveSessions={false}
              />
            </div>
          )}

          {/* Past Sessions - Collapsible */}
          {groupedSessions.past.length > 0 && (
            <div>
              <div
                className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={() => setShowPastSessions(!showPastSessions)}
              >
                <History className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-600 flex-1">
                  Past Sessions ({groupedSessions.past.length})
                </h3>
                {showPastSessions ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </div>
              {showPastSessions && (
                <div className="opacity-75">
                  <SessionList
                    sessions={groupedSessions.past}
                    players={players}
                    onRemoveSession={onRemoveSession}
                    onEditSession={handleOpenEditModal}
                    onViewSessionDetails={handleOpenDetailModal}
                    onViewSession={handleViewSession}
                    onViewMetrics={handleOpenMetricsModal}
                    hideHeader={true}
                    isSessionOwner={isSessionOwner}
                    isPastSessions={true}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Session Modal */}
      <CreateSessionModal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onCreateSession={handleCreateSession}
        players={players}
      />

      {/* Add Past Session Modal */}
      <AddPastSessionModal
        open={isAddPastModalOpen}
        onClose={handleCloseAddPastModal}
        onSubmit={handleCreatePastSession}
        players={players}
        loading={addingPastSession}
      />

      {/* Edit Session Modal */}
      <EditSessionModal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        onUpdateSession={handleUpdateSession}
        players={players}
        session={sessionToEdit}
      />

      <SessionDetailModal
        open={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        session={sessionToView}
        players={players}
        onStatusChange={handleStatusChange}
      />

      {/* Session Metrics Modal */}
      <SessionMetricsModal
        open={isMetricsModalOpen}
        onClose={handleCloseMetricsModal}
        session={sessionForMetrics}
      />

      {/* Status Update Notifications */}
      {notification && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
            notification.severity === 'success'
              ? 'bg-green-100 border border-green-200 text-green-800'
              : 'bg-red-100 border border-red-200 text-red-800'
          }`}>
            <span>{notification.message}</span>
            <button
              onClick={handleCloseNotification}
              className="text-current hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sessions;
