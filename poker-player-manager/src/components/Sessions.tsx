import React, { useState } from 'react';
import { Box, Button, Paper, Typography, Snackbar, Alert } from '@mui/material';
import { Add } from '@mui/icons-material';
import SessionList from './SessionList';
import CreateSessionModal from './CreateSessionModal';
import EditSessionModal from './EditSessionModal';
import SessionDetailModal from './SessionDetailModal';
import { SessionsProps, Session, PlayerStatus } from '../types/index';
import { sessionsApi } from '../services/api';

function Sessions({ sessions, players, onCreateSession, onUpdateSession, onRemoveSession }: SessionsProps): React.JSX.Element {
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

  return (
    <Box>
      {/* Create Session Section */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 4 },
          mb: { xs: 3, sm: 5 },
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            mb: 3,
            color: 'text.primary',
            fontWeight: 600,
          }}
        >
          Create New Session
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}
          >
            Start a new poker session and add players to join the game.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={handleOpenCreateModal}
            sx={{
              minWidth: { xs: '100%', sm: 180 },
              height: 56,
              fontSize: '1rem',
            }}
          >
            Create Session
          </Button>
        </Box>
      </Paper>

      {/* Sessions List */}
      <SessionList
        sessions={sessions}
        players={players}
        onRemoveSession={onRemoveSession}
        onEditSession={handleOpenEditModal}
        onViewSessionDetails={handleOpenDetailModal}
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
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification?.severity}
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Sessions;
