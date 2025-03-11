/**
 * User entity representing a user in the system
 * Contains user profile information
 */
export class User {
  id: string;
  username: string;
  email: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Additional profile fields
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  preferences?: Record<string, any>;
}
