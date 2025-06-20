// Database Models
export interface Player {
  id: number;
  name: string;
  created_at: string;
}

export interface Session {
  id: number;
  name: string;
  scheduled_datetime: string | null;
  created_at: string;
}

export interface SessionPlayer {
  id: number;
  session_id: number;
  player_id: number;
  created_at: string;
}

// API Request/Response Types
export interface CreatePlayerRequest {
  name: string;
}

export interface UpdatePlayerRequest {
  name: string;
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

// Frontend-compatible Session type (with playerIds array)
export interface SessionWithPlayers {
  id: number;
  name: string;
  scheduledDateTime: string | null;
  createdAt: string;
  playerIds: number[];
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface HealthCheckResponse {
  status: string;
  message: string;
}

// Database Query Result Types
export interface SessionQueryResult {
  id: number;
  name: string;
  scheduled_datetime: string | null;
  created_at: string;
  player_ids: string | null;
  player_names: string | null;
}

// Error Types
export interface ApiError extends Error {
  statusCode?: number;
}

// Express Request Extensions
import { Request, Response } from 'express';

export interface TypedRequest<T = any> extends Request {
  body: T;
}

export interface TypedResponse<T = any> extends Response {
  json: (body: T) => this;
}
