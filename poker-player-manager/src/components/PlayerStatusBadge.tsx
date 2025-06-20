import React from 'react';
import { Chip } from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  Help, 
  PersonOff, 
  Mail 
} from '@mui/icons-material';
import { PlayerStatus } from '../types/index';

interface PlayerStatusBadgeProps {
  status: PlayerStatus;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
}

function PlayerStatusBadge({ status, size = 'small', variant = 'filled' }: PlayerStatusBadgeProps): React.JSX.Element {
  const getStatusConfig = (status: PlayerStatus) => {
    switch (status) {
      case 'Invited':
        return {
          label: 'Invited',
          color: 'default' as const,
          icon: <Mail sx={{ fontSize: '16px' }} />
        };
      case 'In':
        return {
          label: 'In',
          color: 'success' as const,
          icon: <CheckCircle sx={{ fontSize: '16px' }} />
        };
      case 'Out':
        return {
          label: 'Out',
          color: 'error' as const,
          icon: <Cancel sx={{ fontSize: '16px' }} />
        };
      case 'Maybe':
        return {
          label: 'Maybe',
          color: 'warning' as const,
          icon: <Help sx={{ fontSize: '16px' }} />
        };
      case 'Attending but not playing':
        return {
          label: 'Attending',
          color: 'info' as const,
          icon: <PersonOff sx={{ fontSize: '16px' }} />
        };
      default:
        return {
          label: status,
          color: 'default' as const,
          icon: <Mail sx={{ fontSize: '16px' }} />
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      variant={variant}
      icon={config.icon}
      sx={{
        fontWeight: 500,
        '& .MuiChip-icon': {
          marginLeft: '4px',
        },
      }}
    />
  );
}

export default PlayerStatusBadge;
