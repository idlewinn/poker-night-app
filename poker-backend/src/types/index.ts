// Database Models
export interface Player {
  id: number;
  name: string;
  email?: string;
  created_at: string;
}

export interface User {
  id: number;
  google_id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  last_login: string | null;
}

export interface Session {
  id: number;
  name: string;
  scheduled_datetime: string | null;
  created_by: number;
  created_at: string;
}

export type PlayerStatus = 'Invited' | 'In' | 'Out' | 'Maybe' | 'Attending but not playing';

export interface SessionPlayer {
  id: number;
  session_id: number;
  player_id: number;
  status: PlayerStatus;
  buy_in: number;
  cash_out: number;
  created_at: string;
  player?: Player; // Optional populated player data
}

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

// API Request/Response Types
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

// Frontend-compatible Session type (with full player data)
export interface SessionWithPlayers {
  id: number;
  name: string;
  scheduledDateTime: string | null;
  createdBy: number;
  createdAt: string;
  players: SessionPlayer[]; // Always populated player data with status
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

// Authentication Types
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  avatar_url: string | null;
}

export interface JWTPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

// Error Types
export interface ApiError extends Error {
  statusCode?: number;
}

// Express Request Extensions
import { Request, Response } from 'express';

export interface TypedRequest<T = any> extends Request {
  body: T;
  user?: AuthUser | undefined;
}

export interface TypedResponse<T = any> extends Response {
  json: (body: T) => this;
}
