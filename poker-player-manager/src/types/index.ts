// Player Types
export interface Player {
  id: number;
  name: string;
  email?: string;
  created_at: string;
}

// Authentication Types
export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Session Types
export type PlayerStatus = 'Invited' | 'In' | 'Out' | 'Maybe' | 'Attending but not playing';

export interface SessionPlayer {
  id: string | number; // Can be string (session-player combo) or number for backwards compatibility
  session_id: number;
  player_id: number;
  status: PlayerStatus;
  buy_in: number;
  cash_out: number;
  created_at: string;
  player?: Player; // Optional populated player data
}

export interface Session {
  id: number;
  name: string;
  scheduledDateTime: string | null;
  createdBy: number;
  createdAt: string;
  players: SessionPlayer[]; // Always populated player data with status
}

// Seating Chart Types
export interface SeatingChart {
  id: number;
  session_id: number;
  name: string;
  number_of_tables: number;
  created_at: string;
  assignments?: SeatingAssignment[]; // Optional populated assignments
}

export interface SeatingAssignment {
  id: number;
  seating_chart_id: number;
  player_id: number;
  table_number: number;
  seat_position: number;
  created_at: string;
  player?: Player; // Optional populated player data
}

export interface SeatingTable {
  tableNumber: number;
  players: SeatingAssignment[];
}

// Component Props Types
export interface PlayerItemProps {
  player: Player;
  onRemove: () => void;
  onRename: (newName: string, newEmail?: string) => void;
  onViewDetails?: () => void;
}

export interface PlayerListProps {
  players: Player[];
  onRemovePlayer: (id: number) => void;
  onRenamePlayer: (id: number, newName: string, newEmail?: string) => void;
  onViewPlayerDetails?: (player: Player) => void;
}



export interface SessionItemProps {
  session: Session;
  players: Player[];
  onRemove: () => void;
  onEdit: () => void;
  onViewDetails: () => void;
  onViewSession: () => void;
  onViewMetrics: () => void;
  isOwner?: boolean;
  isPast?: boolean;
  isActive?: boolean;
}

export interface SessionListProps {
  sessions: Session[];
  players: Player[];
  onRemoveSession: (id: number) => void;
  onEditSession: (session: Session) => void;
  onViewSessionDetails: (session: Session) => void;
  onViewSession: (session: Session) => void;
  onViewMetrics: (session: Session) => void;
  hideHeader?: boolean;
  isSessionOwner?: (session: Session) => boolean;
  isPastSessions?: boolean;
  isActiveSessions?: boolean;
}

export interface CreateSessionModalProps {
  open: boolean;
  onClose: () => void;
  onCreateSession: (sessionName: string, selectedPlayerIds: number[], scheduledDateTime: string) => void;
  players: Player[];
}

export interface EditSessionModalProps {
  open: boolean;
  onClose: () => void;
  onUpdateSession: (sessionId: number, sessionName: string, selectedPlayerIds: number[], scheduledDateTime: string) => void;
  players: Player[];
  session: Session | null;
}

export interface SessionsProps {
  sessions: Session[];
  players: Player[];
  onCreateSession: (sessionName: string, selectedPlayerIds: number[], scheduledDateTime: string) => void;
  onUpdateSession: (sessionId: number, sessionName: string, selectedPlayerIds: number[], scheduledDateTime: string) => void;
  onRemoveSession: (id: number) => void;
}

// API Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface CreatePlayerRequest {
  name: string;
  email?: string;
}

export interface UpdatePlayerRequest {
  name: string;
  email?: string;
}

export interface CreateSessionRequest {
  name?: string;
  scheduledDateTime: string;
  playerIds?: number[];
}

export interface UpdateSessionRequest {
  name?: string;
  scheduledDateTime: string;
  playerIds?: number[];
}

export interface UpdatePlayerStatusRequest {
  status: PlayerStatus;
}

export interface UpdatePlayerFinancialsRequest {
  buy_in?: number;
  cash_out?: number;
}

export interface CreateSeatingChartRequest {
  sessionId: number;
  name: string;
  numberOfTables: number;
  playerIds: number[];
}

export interface UpdateSeatingChartRequest {
  name: string;
}

export interface HealthCheckResponse {
  status: string;
  message: string;
}

// Utility Types
export type TabValue = 0 | 1;

export interface AppState {
  players: Player[];
  sessions: Session[];
  activeTab: TabValue;
  loading: boolean;
  error: string | null;
}

// Event Handler Types
export type PlayerHandler = (name: string) => Promise<void>;
export type PlayerUpdateHandler = (id: number, newName: string) => Promise<void>;
export type PlayerRemoveHandler = (id: number) => Promise<void>;

export type SessionCreateHandler = (
  sessionName: string,
  selectedPlayerIds: number[],
  scheduledDateTime: string
) => Promise<void>;

export type SessionUpdateHandler = (
  sessionId: number,
  sessionName: string,
  selectedPlayerIds: number[],
  scheduledDateTime: string
) => Promise<void>;

export type SessionRemoveHandler = (id: number) => Promise<void>;

// Dayjs types for date picker
export type DateTimeValue = import('dayjs').Dayjs | null;
