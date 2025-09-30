/**
 * User Role Management
 * Centralized role checking and permission logic
 */

import type { User } from '../types';

export type UserRole = 'admin' | 'user' | 'guest';

export interface RolePermissions {
  canViewAdminConsole: boolean;
  canManageUsers: boolean;
  canManageAllRequests: boolean;
  canManageProjects: boolean;
  canUpdateBacklogStatus: boolean;
  canViewAllActivities: boolean;
  canDeleteRequests: boolean;
  canSubmitRequests: boolean;
  canViewOwnRequests: boolean;
  canEditOwnRequests: boolean;
}

/**
 * Admin email domains and specific admin emails
 */
const ADMIN_EMAILS = [
  'shyam@ascendcohealth.com',
  'shyam.pathak@ascendcohealth.com',
  'admin@ascendcohealth.com'
];

const ADMIN_DOMAIN = '@ascendcohealth.com';

/**
 * Check if an email belongs to an admin
 */
export function isAdminEmail(email: string): boolean {
  if (!email) return false;

  // Check explicit admin emails
  if (ADMIN_EMAILS.includes(email.toLowerCase())) {
    return true;
  }

  // For development: Allow any ascendcohealth.com email to be admin
  // In production, you'd want more granular control
  return email.toLowerCase().includes('shyam') && email.endsWith(ADMIN_DOMAIN);
}

/**
 * Get user role from user object
 */
export function getUserRole(user: User | null): UserRole {
  if (!user) return 'guest';
  if (user.isAdmin) return 'admin';
  return 'user';
}

/**
 * Get permissions for a user role
 */
export function getRolePermissions(role: UserRole): RolePermissions {
  switch (role) {
    case 'admin':
      return {
        canViewAdminConsole: true,
        canManageUsers: true,
        canManageAllRequests: true,
        canManageProjects: true,
        canUpdateBacklogStatus: true,
        canViewAllActivities: true,
        canDeleteRequests: true,
        canSubmitRequests: true,
        canViewOwnRequests: true,
        canEditOwnRequests: true
      };

    case 'user':
      return {
        canViewAdminConsole: false,
        canManageUsers: false,
        canManageAllRequests: false,
        canManageProjects: false,
        canUpdateBacklogStatus: false,
        canViewAllActivities: false,
        canDeleteRequests: false,
        canSubmitRequests: true,
        canViewOwnRequests: true,
        canEditOwnRequests: true
      };

    case 'guest':
    default:
      return {
        canViewAdminConsole: false,
        canManageUsers: false,
        canManageAllRequests: false,
        canManageProjects: false,
        canUpdateBacklogStatus: false,
        canViewAllActivities: false,
        canDeleteRequests: false,
        canSubmitRequests: false,
        canViewOwnRequests: false,
        canEditOwnRequests: false
      };
  }
}

/**
 * Get permissions for a user
 */
export function getUserPermissions(user: User | null): RolePermissions {
  const role = getUserRole(user);
  return getRolePermissions(role);
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  user: User | null,
  permission: keyof RolePermissions
): boolean {
  const permissions = getUserPermissions(user);
  return permissions[permission];
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return getUserRole(user) === 'admin';
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(user: User | null): boolean {
  return user !== null && getUserRole(user) !== 'guest';
}

/**
 * Get user display name
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest';
  return user.name || user.email || 'User';
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(user: User | null): string {
  if (!user || !user.name) return 'U';

  const parts = user.name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Format user role for display
 */
export function formatRole(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'user':
      return 'User';
    case 'guest':
      return 'Guest';
    default:
      return 'Unknown';
  }
}
