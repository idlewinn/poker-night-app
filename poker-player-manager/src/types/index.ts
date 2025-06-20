// Player Types
export interface Player {
  id: number;
  name: string;
  created_at: string;
}

// Session Types
export interface Session {
  id: number;
  name: string;
  scheduledDateTime: string | null;
  createdAt: string;
  playerIds: number[];
}

// Component Props Types
export interface PlayerItemProps {
  player: Player;
  onRemove: () => void;
  onRename: (newName: string) => void;
}

export interface PlayerListProps {
  players: Player[];
  onRemovePlayer: (id: number) => void;
  onRenamePlayer: (id: number, newName: string) => void;
}

export interface AddPlayerFormProps {
  onAddPlayer: (name: string) => void;
}

export interface SessionItemProps {
  session: Session;
  players: Player[];
  onRemove: () => void;
  onEdit: () => void;
}

export interface SessionListProps {
  sessions: Session[];
  players: Player[];
  onRemoveSession: (id: number) => void;
  onEditSession: (session: Session) => void;
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
}

export interface UpdatePlayerRequest {
  name: string;
}

export interface CreateSessionRequest {
  name: string;
  scheduledDateTime: string;
  playerIds?: number[];
}

export interface UpdateSessionRequest {
  name: string;
  scheduledDateTime: string;
  playerIds?: number[];
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
