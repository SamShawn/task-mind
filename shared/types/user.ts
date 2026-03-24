export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member'
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  department?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
