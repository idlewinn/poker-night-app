import {
  Player,
  Session,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  CreateSessionRequest,
  UpdateSessionRequest,
  UpdatePlayerFinancialsRequest,
  PlayerStatus,
  HealthCheckResponse,
  SeatingChart,
  CreateSeatingChartRequest,
  UpdateSeatingChartRequest
} from '../types/index';
import { getAuthHeaders } from '../contexts/AuthContext';


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Generic API request function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get auth headers at request time (not at function definition time)
  const authHeaders = getAuthHeaders();

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
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

  // Add player to session (or update existing player status)
  addPlayerToSession: (sessionId: number, playerId: number, status: PlayerStatus): Promise<{ message: string; status: PlayerStatus; action: string }> =>
    apiRequest<{ message: string; status: PlayerStatus; action: string }>(`/sessions/${sessionId}/players/${playerId}`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  // Update player financials in session
  updatePlayerFinancials: (sessionId: number, playerId: number, financials: UpdatePlayerFinancialsRequest): Promise<{ message: string; buy_in?: number; cash_out?: number }> =>
    apiRequest<{ message: string; buy_in?: number; cash_out?: number }>(`/sessions/${sessionId}/players/${playerId}/financials`, {
      method: 'PUT',
      body: JSON.stringify(financials),
    }),
};

// Seating Charts API
export const seatingChartsApi = {
  // Get all seating charts for a session
  getBySessionId: (sessionId: number): Promise<SeatingChart[]> =>
    apiRequest<SeatingChart[]>(`/seating-charts/session/${sessionId}`),

  // Get seating chart by ID
  getById: (id: number): Promise<SeatingChart> =>
    apiRequest<SeatingChart>(`/seating-charts/${id}`),

  // Create new seating chart
  create: (chartData: CreateSeatingChartRequest): Promise<SeatingChart> =>
    apiRequest<SeatingChart>('/seating-charts', {
      method: 'POST',
      body: JSON.stringify(chartData),
    }),

  // Update seating chart
  update: (id: number, chartData: UpdateSeatingChartRequest): Promise<SeatingChart> =>
    apiRequest<SeatingChart>(`/seating-charts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(chartData),
    }),

  // Delete seating chart
  delete: (id: number): Promise<{ message: string }> =>
    apiRequest<{ message: string }>(`/seating-charts/${id}`, {
      method: 'DELETE',
    }),
};

// General API for custom requests
export const api = {
  get: <T>(endpoint: string): Promise<T> => apiRequest<T>(endpoint),
  post: <T>(endpoint: string, data?: any): Promise<T> => {
    const options: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };
    if (data) {
      options.body = JSON.stringify(data);
    }
    return apiRequest<T>(endpoint, options);
  },
  put: <T>(endpoint: string, data?: any): Promise<T> => {
    const options: RequestInit = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    };
    if (data) {
      options.body = JSON.stringify(data);
    }
    return apiRequest<T>(endpoint, options);
  },
  delete: <T>(endpoint: string): Promise<T> => apiRequest<T>(endpoint, {
    method: 'DELETE',
  }),
};

// Health check
export const healthCheck = (): Promise<HealthCheckResponse> => apiRequest<HealthCheckResponse>('/health');
