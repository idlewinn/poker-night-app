import { useState } from 'react'
import { Box, Button, Paper, Typography } from '@mui/material'
import { Add, EventNote } from '@mui/icons-material'
import SessionList from './SessionList'
import CreateSessionModal from './CreateSessionModal'
import EditSessionModal from './EditSessionModal'

function Sessions({ sessions, players, onCreateSession, onUpdateSession, onRemoveSession }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [sessionToEdit, setSessionToEdit] = useState(null)

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true)
  }

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
  }

  const handleOpenEditModal = (session) => {
    setSessionToEdit(session)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setSessionToEdit(null)
  }

  const handleCreateSession = (sessionName, selectedPlayerIds, scheduledDateTime) => {
    onCreateSession(sessionName, selectedPlayerIds, scheduledDateTime)
  }

  const handleUpdateSession = (sessionId, sessionName, selectedPlayerIds, scheduledDateTime) => {
    onUpdateSession(sessionId, sessionName, selectedPlayerIds, scheduledDateTime)
  }

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

export default Sessions
