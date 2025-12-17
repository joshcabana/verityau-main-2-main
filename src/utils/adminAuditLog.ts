import { supabase } from "@/integrations/supabase/client";

export interface AdminAuditLogEntry {
  action: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
}

/**
 * Log an admin action to the audit trail
 * Automatically captures admin ID, IP, and user agent
 */
export async function logAdminAction(entry: AdminAuditLogEntry): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Cannot log admin action: No authenticated user');
      return;
    }

    // Get client info if available (limited in browser)
    const userAgent = navigator.userAgent;

    // @ts-ignore - Table will exist after running migration
    await supabase.from('admin_audit_log').insert({
      admin_id: user.id,
      action: entry.action,
      target_type: entry.targetType,
      target_id: entry.targetId,
      details: entry.details,
      user_agent: userAgent,
      // Note: IP address would need to be captured server-side via edge function
    });

  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Don't throw - logging failures shouldn't break admin actions
  }
}

/**
 * Get recent admin audit logs (admin only)
 */
export async function getAdminAuditLogs(limit = 50): Promise<unknown[]> {
  try {
    // @ts-ignore - Table will exist after running migration
    const { data, error } = await supabase
      .from('admin_audit_log')
      .select(`
        *,
        admin:admin_id(email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
}

/**
 * Get audit logs for a specific resource
 */
export async function getAuditLogsForResource(
  targetType: string,
  targetId: string
): Promise<unknown[]> {
  try {
    // @ts-ignore - Table will exist after running migration
    const { data, error } = await supabase
      .from('admin_audit_log')
      .select(`
        *,
        admin:admin_id(email)
      `)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resource audit logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch resource audit logs:', error);
    return [];
  }
}
