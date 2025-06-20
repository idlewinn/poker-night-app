import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  Help, 
  PersonOff, 
  Mail,
  TrendingUp
} from '@mui/icons-material';
import { Session, PlayerStatus } from '../types/index';

interface SessionStatusSummaryProps {
  session: Session;
}

interface StatusSummary {
  status: PlayerStatus;
  count: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
  label: string;
}

function SessionStatusSummary({ session }: SessionStatusSummaryProps): React.JSX.Element {
  const getStatusSummary = (): StatusSummary[] => {
    const totalPlayers = session.playerIds.length;
    
    const counts = {
      'Invited': 0,
      'In': 0,
      'Out': 0,
      'Maybe': 0,
      'Attending but not playing': 0
    };

    // Count statuses from session players data
    if (session.players) {
      session.players.forEach(sessionPlayer => {
        counts[sessionPlayer.status]++;
      });
    } else {
      // Fallback: if no status data, assume all are invited
      counts['Invited'] = totalPlayers;
    }

    const statusConfigs = [
      {
        status: 'In' as PlayerStatus,
        color: '#4caf50',
        icon: <CheckCircle />,
        label: 'Confirmed In'
      },
      {
        status: 'Maybe' as PlayerStatus,
        color: '#ff9800',
        icon: <Help />,
        label: 'Maybe'
      },
      {
        status: 'Attending but not playing' as PlayerStatus,
        color: '#2196f3',
        icon: <PersonOff />,
        label: 'Attending (Not Playing)'
      },
      {
        status: 'Invited' as PlayerStatus,
        color: '#757575',
        icon: <Mail />,
        label: 'Pending Response'
      },
      {
        status: 'Out' as PlayerStatus,
        color: '#f44336',
        icon: <Cancel />,
        label: 'Can\'t Attend'
      }
    ];

    return statusConfigs.map(config => ({
      ...config,
      count: counts[config.status],
      percentage: totalPlayers > 0 ? (counts[config.status] / totalPlayers) * 100 : 0
    })).filter(item => item.count > 0); // Only show statuses with players
  };

  const statusSummary = getStatusSummary();
  const totalPlayers = session.playerIds.length;
  const confirmedPlayers = statusSummary.find(s => s.status === 'In')?.count || 0;
  const attendingPlayers = confirmedPlayers + (statusSummary.find(s => s.status === 'Attending but not playing')?.count || 0);

  if (totalPlayers === 0) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp />
            Session Status
          </Typography>
          <Typography color="text.secondary">
            No players in this session yet.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp />
          Session Status Summary
        </Typography>
        
        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary" fontWeight="bold">
                {totalPlayers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Invited
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {confirmedPlayers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Playing
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {attendingPlayers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Attending
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Status Breakdown */}
        <Box>
          {statusSummary.map((item) => (
            <Box key={item.status} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ color: item.color, display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </span>
                  <Typography variant="body2" fontWeight={500}>
                    {item.label}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {item.count} ({Math.round(item.percentage)}%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={item.percentage}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: item.color,
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

export default SessionStatusSummary;
