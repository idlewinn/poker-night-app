import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  X,
  HelpCircle,
  UserX,
  Mail
} from 'lucide-react';
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
          className: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: <Mail className="h-3 w-3" />
        };
      case 'In':
        return {
          label: 'In',
          className: 'bg-green-100 text-green-800 border-green-300',
          icon: <CheckCircle className="h-3 w-3" />
        };
      case 'Out':
        return {
          label: 'Out',
          className: 'bg-red-100 text-red-800 border-red-300',
          icon: <X className="h-3 w-3" />
        };
      case 'Maybe':
        return {
          label: 'Maybe',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: <HelpCircle className="h-3 w-3" />
        };
      case 'Attending but not playing':
        return {
          label: 'Attending',
          className: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <UserX className="h-3 w-3" />
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: <Mail className="h-3 w-3" />
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant={variant === 'outlined' ? 'outline' : 'default'}
      className={`inline-flex items-center gap-1 font-medium ${config.className}`}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}

export default PlayerStatusBadge;
