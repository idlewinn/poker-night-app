import {
  Player,
  Session,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  CreateSessionRequest,
  UpdateSessionRequest,
  UpdatePlayerStatusRequest,
  UpdatePlayerFinancialsRequest,
  PlayerStatus,
  HealthCheckResponse
} from '../types/index';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Generic API request function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

// Players API
export const playersApi = {
  // Get all players
  getAll: (): Promise<Player[]> => apiRequest<Player[]>('/players'),

  // Get player by ID
  getById: (id: number): Promise<Player> => apiRequest<Player>(`/players/${id}`),

  // Create new player
  create: (playerData: CreatePlayerRequest): Promise<Player> => apiRequest<Player>('/players', {
    method: 'POST',
    body: JSON.stringify(playerData),
  }),

  // Update player
  update: (id: number, playerData: UpdatePlayerRequest): Promise<Player> => apiRequest<Player>(`/players/${id}`, {
    method: 'PUT',
    body: JSON.stringify(playerData),
  }),

  // Delete player
  delete: (id: number): Promise<{ message: string }> => apiRequest<{ message: string }>(`/players/${id}`, {
    method: 'DELETE',
  }),
};

// Sessions API
export const sessionsApi = {
  // Get all sessions
  getAll: (): Promise<Session[]> => apiRequest<Session[]>('/sessions'),

  // Get session by ID
  getById: (id: number): Promise<Session> => apiRequest<Session>(`/sessions/${id}`),

  // Create new session
  create: (sessionData: CreateSessionRequest): Promise<Session> => apiRequest<Session>('/sessions', {
    method: 'POST',
    body: JSON.stringify(sessionData),
  }),

  // Update session
  update: (id: number, sessionData: UpdateSessionRequest): Promise<Session> => apiRequest<Session>(`/sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(sessionData),
  }),

  // Delete session
  delete: (id: number): Promise<{ message: string }> => apiRequest<{ message: string }>(`/sessions/${id}`, {
    method: 'DELETE',
  }),

  // Update player status in session
  updatePlayerStatus: (sessionId: number, playerId: number, status: PlayerStatus): Promise<{ message: string; status: PlayerStatus }> =>
    apiRequest<{ message: string; status: PlayerStatus }>(`/sessions/${sessionId}/players/${playerId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Update player financials in session
  updatePlayerFinancials: (sessionId: number, playerId: number, financials: UpdatePlayerFinancialsRequest): Promise<{ message: string; buy_in?: number; cash_out?: number }> =>
    apiRequest<{ message: string; buy_in?: number; cash_out?: number }>(`/sessions/${sessionId}/players/${playerId}/financials`, {
      method: 'PUT',
      body: JSON.stringify(financials),
    }),
};

// Health check
export const healthCheck = (): Promise<HealthCheckResponse> => apiRequest<HealthCheckResponse>('/health');
