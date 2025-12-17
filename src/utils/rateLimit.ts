import { supabase } from "@/integrations/supabase/client";

interface RateLimitResponse {
  allowed: boolean;
  remaining?: number;
  error?: string;
  retryAfter?: number;
}

/**
 * Check if user is within rate limit for an action
 * @param action - Type of action ('like' or 'message')
 * @returns Promise with rate limit status
 */
export async function checkRateLimit(
  action: 'like' | 'message'
): Promise<RateLimitResponse> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { allowed: false, error: 'Not authenticated' };
    }

    // Call the edge function
    const { data, error } = await supabase.functions.invoke('check-rate-limit', {
      body: {
        userId: user.id,
        action,
      },
    });

    if (error) {
      console.error('Rate limit check error:', error);
      // If edge function fails, allow the action (fail open)
      return { allowed: true };
    }

    return data as RateLimitResponse;
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open to not block users if rate limiting is down
    return { allowed: true };
  }
}

/**
 * Client-side rate limiting (backup if edge function is unavailable)
 * Stores timestamps in localStorage
 */
export function clientSideRateLimit(
  action: 'like' | 'message',
  limit: number = 5
): boolean {
  try {
    const key = `rate_limit_${action}`;
    const now = Date.now();
    const oneMinute = 60 * 1000;

    // Get recent actions from localStorage
    const stored = localStorage.getItem(key);
    const timestamps: number[] = stored ? JSON.parse(stored) : [];

    // Filter to only actions in the last minute
    const recentActions = timestamps.filter(ts => now - ts < oneMinute);

    // Check if limit exceeded
    if (recentActions.length >= limit) {
      return false;
    }

    // Add current timestamp
    recentActions.push(now);
    localStorage.setItem(key, JSON.stringify(recentActions));

    return true;
  } catch (error) {
    console.error('Client-side rate limit error:', error);
    return true; // Fail open
  }
}

/**
 * Get remaining actions for user
 */
export function getRemainingActions(action: 'like' | 'message', limit: number = 5): number {
  try {
    const key = `rate_limit_${action}`;
    const now = Date.now();
    const oneMinute = 60 * 1000;

    const stored = localStorage.getItem(key);
    const timestamps: number[] = stored ? JSON.parse(stored) : [];

    const recentActions = timestamps.filter(ts => now - ts < oneMinute);
    return Math.max(0, limit - recentActions.length);
  } catch {
    return limit;
  }
}
