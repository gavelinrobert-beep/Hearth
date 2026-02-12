/**
 * Permission Checking Utilities
 * Manages role-based permissions for servers and channels
 */

export enum Permission {
  // Server permissions
  MANAGE_SERVER = 'MANAGE_SERVER',
  KICK_MEMBERS = 'KICK_MEMBERS',
  BAN_MEMBERS = 'BAN_MEMBERS',
  MANAGE_CHANNELS = 'MANAGE_CHANNELS',
  MANAGE_ROLES = 'MANAGE_ROLES',
  VIEW_AUDIT_LOG = 'VIEW_AUDIT_LOG',
  
  // Channel permissions
  VIEW_CHANNEL = 'VIEW_CHANNEL',
  SEND_MESSAGES = 'SEND_MESSAGES',
  EMBED_LINKS = 'EMBED_LINKS',
  ATTACH_FILES = 'ATTACH_FILES',
  MANAGE_MESSAGES = 'MANAGE_MESSAGES',
  READ_MESSAGE_HISTORY = 'READ_MESSAGE_HISTORY',
  MENTION_EVERYONE = 'MENTION_EVERYONE',
  
  // Voice permissions
  CONNECT = 'CONNECT',
  SPEAK = 'SPEAK',
  MUTE_MEMBERS = 'MUTE_MEMBERS',
  DEAFEN_MEMBERS = 'DEAFEN_MEMBERS',
  MOVE_MEMBERS = 'MOVE_MEMBERS',
}

/**
 * Default permissions for @everyone role
 */
export const DEFAULT_PERMISSIONS = [
  Permission.VIEW_CHANNEL,
  Permission.SEND_MESSAGES,
  Permission.EMBED_LINKS,
  Permission.ATTACH_FILES,
  Permission.READ_MESSAGE_HISTORY,
  Permission.CONNECT,
  Permission.SPEAK,
];

/**
 * Administrator has all permissions
 */
export const ADMIN_PERMISSIONS = Object.values(Permission);

/**
 * Moderator permissions
 */
export const MODERATOR_PERMISSIONS = [
  Permission.VIEW_CHANNEL,
  Permission.SEND_MESSAGES,
  Permission.EMBED_LINKS,
  Permission.ATTACH_FILES,
  Permission.MANAGE_MESSAGES,
  Permission.READ_MESSAGE_HISTORY,
  Permission.KICK_MEMBERS,
  Permission.MUTE_MEMBERS,
  Permission.DEAFEN_MEMBERS,
  Permission.CONNECT,
  Permission.SPEAK,
];

/**
 * Check if a user has a specific permission
 * @param userPermissions - Array of permissions the user has
 * @param requiredPermission - Permission to check for
 * @returns True if user has the permission
 */
export function hasPermission(
  userPermissions: string[],
  requiredPermission: Permission
): boolean {
  // Check if user has admin permission (grants all permissions)
  if (userPermissions.includes(Permission.MANAGE_SERVER)) {
    return true;
  }
  
  return userPermissions.includes(requiredPermission);
}

/**
 * Check if a user has any of the specified permissions
 * @param userPermissions - Array of permissions the user has
 * @param requiredPermissions - Permissions to check for
 * @returns True if user has at least one of the permissions
 */
export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: Permission[]
): boolean {
  // Check if user has admin permission (grants all permissions)
  if (userPermissions.includes(Permission.MANAGE_SERVER)) {
    return true;
  }
  
  return requiredPermissions.some((perm) => userPermissions.includes(perm));
}

/**
 * Check if a user has all specified permissions
 * @param userPermissions - Array of permissions the user has
 * @param requiredPermissions - Permissions to check for
 * @returns True if user has all the permissions
 */
export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: Permission[]
): boolean {
  // Check if user has admin permission (grants all permissions)
  if (userPermissions.includes(Permission.MANAGE_SERVER)) {
    return true;
  }
  
  return requiredPermissions.every((perm) => userPermissions.includes(perm));
}

/**
 * Get permissions for a user in a server
 * Combines permissions from all roles the user has
 * @param userRoles - Roles the user has (with their permissions)
 * @param isOwner - Whether the user is the server owner
 * @returns Combined array of permissions
 */
export function getUserPermissions(
  userRoles: Array<{ permissions: string[] }>,
  isOwner: boolean = false
): string[] {
  // Server owner has all permissions
  if (isOwner) {
    return ADMIN_PERMISSIONS;
  }
  
  // Combine permissions from all roles (remove duplicates)
  const permissions = new Set<string>();
  userRoles.forEach((role) => {
    role.permissions.forEach((perm) => permissions.add(perm));
  });
  
  return Array.from(permissions);
}

/**
 * Permission middleware factory
 * Creates Express middleware that checks for required permission
 * @param requiredPermission - Permission required to access the route
 * @returns Express middleware function
 */
export function requirePermission(requiredPermission: Permission) {
  return async (req: any, res: any, next: any): Promise<void> => {
    try {
      // Get user's permissions from request (set by auth middleware)
      const userPermissions = req.userPermissions || [];
      
      if (!hasPermission(userPermissions, requiredPermission)) {
        res.status(403).json({ 
          error: 'Insufficient permissions',
          required: requiredPermission,
        });
        return;
      }
      
      next();
    } catch (error) {
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

/**
 * Check if user can manage a resource
 * Useful for checking if user can edit/delete messages, channels, etc.
 * @param resourceOwnerId - ID of the user who owns the resource
 * @param currentUserId - ID of the current user
 * @param userPermissions - Current user's permissions
 * @returns True if user can manage the resource
 */
export function canManageResource(
  resourceOwnerId: string,
  currentUserId: string,
  userPermissions: string[]
): boolean {
  // User can manage their own resources
  if (resourceOwnerId === currentUserId) {
    return true;
  }
  
  // Check for appropriate management permission
  return hasAnyPermission(userPermissions, [
    Permission.MANAGE_SERVER,
    Permission.MANAGE_MESSAGES,
  ]);
}
