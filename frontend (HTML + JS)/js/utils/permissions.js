// Check if user has one of the specified roles
export function hasPermission(user, allowedRoles) {
  if (!user) return false;

  // Check if the user's role is in the allowed roles array
  return allowedRoles.includes(user.role);
}

// Check if user can edit/delete entries (ADMIN only)
export function canManageEntries(user) {
  return hasPermission(user, ["ADMIN"]);
}

// Check if user can create entries (OPERATOR or ADMIN)
export function canCreateEntries(user) {
  return hasPermission(user, ["OPERATOR", "ADMIN"]);
}

// Check if user can create other users (ADMIN only)
export function canCreateUsers(user) {
  return hasPermission(user, ["ADMIN"]);
}
