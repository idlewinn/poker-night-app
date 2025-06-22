import { PlayerStatus } from '../types/index';

/**
 * Get the priority order for player status sorting
 * Lower numbers = higher priority (appear first)
 * Order: In > Attending but not playing > Maybe > Invited > Out
 */
export const getStatusPriority = (status: PlayerStatus | string): number => {
  switch (status) {
    case 'In': return 1;
    case 'Attending but not playing': return 2;
    case 'Maybe': return 3;
    case 'Invited': return 4;
    case 'Out': return 5;
    default: return 6;
  }
};

/**
 * Sort players by status priority
 * Players with higher priority status (like "In") will appear first
 */
export const sortPlayersByStatus = <T extends { status: PlayerStatus | string }>(players: T[]): T[] => {
  return [...players].sort((a, b) => getStatusPriority(a.status) - getStatusPriority(b.status));
};
