// Task and User models for TaskFlow frontend

export type TaskStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';

export interface Task {
  id: string;
  title: string;
  dueDate: string;       // ISO 8601 string from backend
  status: TaskStatus;
  priority: TaskPriority;
  remainingDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  id: string;
  username: string;
  email: string;
}

export interface TaskCreatePayload {
  title: string;
  dueDate: string;
}

export interface TaskUpdatePayload {
  title: string;
  dueDate: string;
  status: TaskStatus;
}

// Dashboard stats derived from tasks
export interface DashboardStats {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
  upcoming: number;     // Due in next 7 days
  progress: number;     // % completed
}

// API Inspector models
export interface ApiLog {
  id: string;
  method: HttpMethod;
  endpoint: string;
  timestamp: Date;
  responseTimeMs: number;
  statusCode: number;
  success: boolean;
  username?: string;
  resourceId?: string;
  requestSize: number;
  responseSize: number;
  message: string;
  requestHeaders?: Record<string, string>;
  requestBody?: unknown;
  responseBody?: unknown;
  responseHeaders?: Record<string, string>;
}

export interface ApiMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTimeMs: number;
  slowestRequestMs: number;
  fastestRequestMs: number;
  mostCalledEndpoint: string;
  lastRequest?: Date;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}
