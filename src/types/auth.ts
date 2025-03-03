
export type UserRole = 'pelaku_usaha' | 'admin' | 'kasir' | 'pelayan';

export interface UserWithRole {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}
