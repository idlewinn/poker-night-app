import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle,
  X,
  HelpCircle,
  UserX,
  Mail
} from 'lucide-react';
import { PlayerStatus } from '../types/index';

interface PlayerStatusSelectorProps {
  status: PlayerStatus;
  onStatusChange: (newStatus: PlayerStatus) => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium';
}

const statusOptions: { value: PlayerStatus; label: string; icon: React.ReactNode; color: string }[] = [
  {
    value: 'Invited',
    label: 'Invited',
    icon: <Mail className="h-4 w-4" />,
    color: '#757575'
  },
  {
    value: 'In',
    label: 'In',
    icon: <CheckCircle className="h-4 w-4" />,
    color: '#4caf50'
  },
  {
    value: 'Out',
    label: 'Out',
    icon: <X className="h-4 w-4" />,
    color: '#f44336'
  },
  {
    value: 'Maybe',
    label: 'Maybe',
    icon: <HelpCircle className="h-4 w-4" />,
    color: '#ff9800'
  },
  {
    value: 'Attending but not playing',
    label: 'Attending (not playing)',
    icon: <UserX className="h-4 w-4" />,
    color: '#2196f3'
  }
];

function PlayerStatusSelector({
  status,
  onStatusChange,
  disabled = false,
  loading = false,
  size = 'small'
}: PlayerStatusSelectorProps): React.JSX.Element {
  const currentOption = statusOptions.find(option => option.value === status);

  return (
    <Select
      value={status}
      onValueChange={onStatusChange}
      disabled={disabled || loading}
    >
      <SelectTrigger
        className={`min-w-[140px] ${size === 'small' ? 'h-8 text-sm' : 'h-10'}`}
        style={{ borderColor: currentOption?.color }}
      >
        <SelectValue>
          <div className="flex items-center gap-2">
            <span style={{ color: currentOption?.color }} className="flex items-center">
              {currentOption?.icon}
            </span>
            <span className={size === 'small' ? 'text-sm' : 'text-base'}>
              {currentOption?.label}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              <span style={{ color: option.color }} className="flex items-center">
                {option.icon}
              </span>
              <span className={size === 'small' ? 'text-sm' : 'text-base'}>
                {option.label}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default PlayerStatusSelector;
