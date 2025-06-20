import { useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  TextField,
  Tooltip,
  Avatar
} from '@mui/material'
import {
  Edit,
  Delete,
  Check,
  Close,
  Person
} from '@mui/icons-material'

function PlayerItem({ player, onRemove, onRename }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(player.name)

  const handleSave = () => {
    if (editName.trim() && editName !== player.name) {
      onRename(editName)
    }
    setIsEditing(false)
    setEditName(player.name)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditName(player.name)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        minHeight: '140px', // Fixed minimum height for consistency
        maxWidth: '100%', // Ensure cards don't overflow container
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: 'primary.main',
          elevation: 8,
        },
      }}
    >
      <CardContent
        sx={{
          p: 3,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {isEditing ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleSave}
              autoFocus
              size="medium"
              placeholder="Enter player name..."
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Tooltip title="Save changes" arrow>
                <IconButton
                  onClick={handleSave}
                  color="success"
                  size="medium"
                  sx={{
                    bgcolor: 'success.light',
                    color: 'success.contrastText',
                    '&:hover': {
                      bgcolor: 'success.main',
                    },
                  }}
                >
                  <Check />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel" arrow>
                <IconButton
                  onClick={handleCancel}
                  color="error"
                  size="medium"
                  sx={{
                    bgcolor: 'error.light',
                    color: 'error.contrastText',
                    '&:hover': {
                      bgcolor: 'error.main',
                    },
                  }}
                >
                  <Close />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flex: 1, minHeight: '60px' }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  mr: 2,
                  width: 48,
                  height: 48,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                }}
              >
                <Person sx={{ fontSize: 24 }} />
              </Avatar>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: { xs: '120px', sm: '140px', md: '160px' }, // Responsive fixed width
                  fontSize: { xs: '1rem', sm: '1.25rem' }, // Responsive font size
                }}
                title={player.name} // Show full name on hover
              >
                {player.name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Tooltip title="Rename player" arrow>
                <IconButton
                  onClick={() => setIsEditing(true)}
                  color="primary"
                  size="medium"
                  sx={{
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.main',
                    },
                  }}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Remove player" arrow>
                <IconButton
                  onClick={onRemove}
                  color="error"
                  size="medium"
                  sx={{
                    bgcolor: 'error.light',
                    color: 'error.contrastText',
                    '&:hover': {
                      bgcolor: 'error.main',
                    },
                  }}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default PlayerItem
