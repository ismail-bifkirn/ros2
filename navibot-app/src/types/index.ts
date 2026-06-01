export interface Room {
  id:    string;
  name:  string;
  x:     number;
  y:     number;
  yaw:   number;
  icon?: string;
}

export type NavStatusType =
  | { type: 'idle' }
  | { type: 'navigating'; roomName: string; distance?: number }
  | { type: 'succeeded'; roomName: string }
  | { type: 'failed';    roomName: string; reason?: string }
  | { type: 'cancelled' };

export interface SpeedLimits {
  linear:  number;
  angular: number;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type UserRole = 'user' | 'admin';
