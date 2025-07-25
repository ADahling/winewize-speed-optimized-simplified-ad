
import { User } from '@supabase/supabase-js';

/**
 * Centralized admin detection utility
 * Checks both hardcoded admin users and role-based admin status
 */
export const isAdminUser = (user: User | null, profileRole?: string): boolean => {
  if (!user) return false;

  // Hardcoded admin fallbacks for bootstrapping
  const hardcodedAdmins = [
    'kristimayfield@wine-wize.com',
    '7daa99e0-a34e-4130-8dee-139ac28fdc4c'
  ];

  const isHardcodedAdmin = 
    hardcodedAdmins.includes(user.email || '') || 
    hardcodedAdmins.includes(user.id);

  // Role-based admin check (preferred method)
  const isRoleAdmin = profileRole === 'site_admin' || profileRole === 'admin';

  return isHardcodedAdmin || isRoleAdmin;
};

/**
 * Check if user should have unlimited subscription access
 */
export const hasUnlimitedAccess = (user: User | null, profileRole?: string): boolean => {
  return isAdminUser(user, profileRole);
};
