import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Paper,
  Divider
} from '@mui/material';
import { Person, Groups } from '@mui/icons-material';
import { Session, Player, PlayerStatus } from '../types/index';
import PlayerStatusBadge from './PlayerStatusBadge';
import PlayerStatusSelector from './PlayerStatusSelector';

interface SessionPlayerListProps {
  session: Session;
  players: Player[];
  onStatusChange?: (playerId: number, newStatus: PlayerStatus) => void;
  readonly?: boolean;
}

function SessionPlayerList({ 
  session, 
  players, 
  onStatusChange, 
  readonly = false 
}: SessionPlayerListProps): React.JSX.Element {
  // Get players that are in this session
  const sessionPlayers = players.filter(player => 
    session.playerIds.includes(player.id)
  );

  // Get player status from session data
  const getPlayerStatus = (playerId: number): PlayerStatus => {
    if (session.players) {
      const sessionPlayer = session.players.find(sp => sp.player_id === playerId);
      return sessionPlayer?.status || 'Invited';
    }
    return 'Invited';
  };

  const handleStatusChange = (playerId: number, newStatus: PlayerStatus) => {
    if (onStatusChange) {
      onStatusChange(playerId, newStatus);
    }
  };

  if (sessionPlayers.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Groups sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="h6" color="text.secondary">
          No players in this session
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add players when creating or editing the session
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Groups />
          Players ({sessionPlayers.length})
        </Typography>
      </Box>
      
      <List sx={{ p: 0 }}>
        {sessionPlayers.map((player, index) => {
          const playerStatus = getPlayerStatus(player.id);
          
          return (
            <React.Fragment key={player.id}>
              <ListItem
                sx={{
                  py: 2,
                  px: 3,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Person />
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" fontWeight={500}>
                      {player.name}
                    </Typography>
                  }
                  secondary={
                    player.email && (
                      <Typography variant="body2" color="text.secondary">
                        {player.email}
                      </Typography>
                    )
                  }
                />
                
                <Box sx={{ ml: 2 }}>
                  {readonly ? (
                    <PlayerStatusBadge status={playerStatus} />
                  ) : (
                    <PlayerStatusSelector
                      status={playerStatus}
                      onStatusChange={(newStatus) => handleStatusChange(player.id, newStatus)}
                    />
                  )}
                </Box>
              </ListItem>
              
              {index < sessionPlayers.length - 1 && <Divider />}
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
}

export default SessionPlayerList;
