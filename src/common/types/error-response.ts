// Add an interface for error responses
export interface ErrorResponse {
  message?: string;
  error?: string;
  [key: string]: any;
}
