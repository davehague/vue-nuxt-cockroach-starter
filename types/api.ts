export interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

export interface DatabaseHealthResponse {
  status: "healthy" | "unhealthy";
  timestamp?: string;
  error?: string;
}

export interface DatabaseStatus {
  status: "connected" | "error";
  message?: string;
  time?: string;
}