import React, { useState } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import SessionList from './SessionList';
import CreateSessionModal from './CreateSessionModal';
import EditSessionModal from './EditSessionModal';
import { SessionsProps, Session } from '../types/index';

function Sessions({ sessions, players, onCreateSession, onUpdateSession, onRemoveSession }: SessionsProps): React.JSX.Element {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);

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

  const handleCreateSession = (sessionName: string, selectedPlayerIds: number[], scheduledDateTime: string): void => {
    onCreateSession(sessionName, selectedPlayerIds, scheduledDateTime);
  };

  const handleUpdateSession = (sessionId: number, sessionName: string, selectedPlayerIds: number[], scheduledDateTime: string): void => {
    onUpdateSession(sessionId, sessionName, selectedPlayerIds, scheduledDateTime);
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
    </Box>
  )
}

export default Sessions;
