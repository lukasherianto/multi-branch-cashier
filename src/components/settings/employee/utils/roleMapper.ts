
// Map business_role to the appropriate user_status ID
export function mapRoleToStatusId(businessRole: string): number {
  switch (businessRole) {
    case 'pelaku_usaha':
      return 1;
    case 'admin':
      return 2;
    case 'kasir':
      return 3;
    case 'pelayan':
      return 4;
    default:
      return 3; // Default to 'kasir' if unknown role
  }
}
