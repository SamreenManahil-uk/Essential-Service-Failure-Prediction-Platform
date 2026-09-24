export type UserRole = "Admin" | "Engineer" | "Viewer";

export interface AuthUser {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
  token: string;
  expiresAt: string;
}
