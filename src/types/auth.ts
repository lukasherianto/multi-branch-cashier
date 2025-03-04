
export type UserRole = 'pelaku_usaha' | 'admin' | 'kasir' | 'pelayan';

export interface UserWithRole {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface PelakuUsaha {
  pelaku_usaha_id: string;
  business_name?: string;
  user_id?: string;
}
