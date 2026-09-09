import { supabase } from './supabase';

export type UserRole = 'admin' | 'manager' | 'editor' | 'normal' | 'paid';

export async function checkAccess(allowedRoles: UserRole[]) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { user: null, userData: null, hasAccess: false };
  
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  if (!userData) return { user: session.user, userData: null, hasAccess: false };
  
  return {
    user: session.user,
    userData,
    hasAccess: allowedRoles.includes(userData.role as UserRole)
  };
}

export function getPanelLink(role: UserRole): string {
  const links: Record<UserRole, string> = {
    admin: '/admin',
    manager: '/manager',
    editor: '/editor',
    paid: '/paid',
    normal: '/user'
  };
  return links[role] || '/';
}
