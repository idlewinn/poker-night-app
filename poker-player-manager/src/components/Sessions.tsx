import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar } from 'lucide-react';
import SessionList from './SessionList';
import CreateSessionModal from './CreateSessionModal';
import EditSessionModal from './EditSessionModal';
import SessionDetailModal from './SessionDetailModal';
import { SessionsProps, Session, PlayerStatus } from '../types/index';
import { sessionsApi } from '../services/api';

function Sessions({ sessions, players, onCreateSession, onUpdateSession, onRemoveSession }: SessionsProps): React.JSX.Element {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);
  const [sessionToView, setSessionToView] = useState<Session | null>(null);
  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  const handleOpenCreateModal = (): void => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = (): void => {
    setIsCreateModalOpen(false);
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

  const handleCreateSession = (sessionName: string, selectedPlayerIds: number[], scheduledDateTime: string): void => {
    onCreateSession(sessionName, selectedPlayerIds, scheduledDateTime);
  };

  const handleUpdateSession = (sessionId: number, sessionName: string, selectedPlayerIds: number[], scheduledDateTime: string): void => {
    onUpdateSession(sessionId, sessionName, selectedPlayerIds, scheduledDateTime);
  };

  const handleStatusChange = async (playerId: number, newStatus: PlayerStatus): Promise<void> => {
    if (!sessionToView) return;

    setIsUpdatingStatus(true);
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
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCloseNotification = (): void => {
    setNotification(null);
  };

  const handleViewSession = (session: Session): void => {
    navigate(`/session/${session.id}`);
  };

  return (
    <div>
      {/* Sessions Header with Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-3">
          <Calendar className="h-7 w-7 text-primary" />
          Sessions ({sessions.length})
        </h2>
        <Button
          onClick={handleOpenCreateModal}
          className="h-10 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Session
        </Button>
      </div>

      {/* Sessions List */}
      <SessionList
        sessions={sessions}
        players={players}
        onRemoveSession={onRemoveSession}
        onEditSession={handleOpenEditModal}
        onViewSessionDetails={handleOpenDetailModal}
        onViewSession={handleViewSession}
        hideHeader={true}
      />

      {/* Create Session Modal */}
      <CreateSessionModal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onCreateSession={handleCreateSession}
        players={players}
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
