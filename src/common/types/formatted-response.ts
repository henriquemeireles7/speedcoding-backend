// Add an interface for formatted responses
export interface FormattedResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  error: unknown;
}
