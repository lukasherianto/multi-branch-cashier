
// Map business_role to the appropriate user_status ID
export function mapRoleToStatusId(businessRole: string): number {
  switch (businessRole) {
    case 'pelaku_usaha':
      return 1;
    case 'admin':
      return 2;
    case 'kasir':
      return 3;
    case 'gudang':
      return 4;
    case 'pelayan':
      return 5;
    default:
      return 3; // Default to 'kasir' if unknown role
  }
}

// Get the display name for the role
export function getRoleDisplayName(role: string): string {
  switch (role) {
    case 'pelaku_usaha':
      return 'Pelaku Usaha';
    case 'admin':
      return 'Admin';
    case 'kasir':
      return 'Kasir';
    case 'gudang':
      return 'Staf Gudang';
    case 'pelayan':
      return 'Pelayan';
    default:
      return role;
  }
}
