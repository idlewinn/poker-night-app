import React, { useState } from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  ListItemIcon,
  ListItemText,
  SelectChangeEvent
} from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  Help, 
  PersonOff, 
  Mail 
} from '@mui/icons-material';
import { PlayerStatus } from '../types/index';

interface PlayerStatusSelectorProps {
  status: PlayerStatus;
  onStatusChange: (newStatus: PlayerStatus) => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
}

const statusOptions: { value: PlayerStatus; label: string; icon: React.ReactNode; color: string }[] = [
  {
    value: 'Invited',
    label: 'Invited',
    icon: <Mail />,
    color: '#757575'
  },
  {
    value: 'In',
    label: 'In',
    icon: <CheckCircle />,
    color: '#4caf50'
  },
  {
    value: 'Out',
    label: 'Out',
    icon: <Cancel />,
    color: '#f44336'
  },
  {
    value: 'Maybe',
    label: 'Maybe',
    icon: <Help />,
    color: '#ff9800'
  },
  {
    value: 'Attending but not playing',
    label: 'Attending (not playing)',
    icon: <PersonOff />,
    color: '#2196f3'
  }
];

function PlayerStatusSelector({ 
  status, 
  onStatusChange, 
  disabled = false, 
  size = 'small' 
}: PlayerStatusSelectorProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (event: SelectChangeEvent<PlayerStatus>) => {
    const newStatus = event.target.value as PlayerStatus;
    onStatusChange(newStatus);
  };

  const currentOption = statusOptions.find(option => option.value === status);

  return (
    <FormControl size={size} disabled={disabled}>
      <Select
        value={status}
        onChange={handleChange}
        open={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        displayEmpty
        sx={{
          minWidth: 140,
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 0.5,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: currentOption?.color,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: currentOption?.color,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: currentOption?.color,
          },
        }}
        renderValue={(selected) => {
          const option = statusOptions.find(opt => opt.value === selected);
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: option?.color, display: 'flex', alignItems: 'center' }}>
                {option?.icon}
              </span>
              <span style={{ fontSize: size === 'small' ? '0.875rem' : '1rem' }}>
                {option?.label}
              </span>
            </div>
          );
        }}
      >
        {statusOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <ListItemIcon sx={{ color: option.color, minWidth: '32px' }}>
              {option.icon}
            </ListItemIcon>
            <ListItemText 
              primary={option.label}
              sx={{
                '& .MuiListItemText-primary': {
                  fontSize: size === 'small' ? '0.875rem' : '1rem'
                }
              }}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default PlayerStatusSelector;
