import { createClient } from '@/lib/supabase/server';

/**
 * Get the authenticated Supabase user from a server-side context.
 * Use this in API routes instead of next-auth's getServerSession.
 */
export async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}
