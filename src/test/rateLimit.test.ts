import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { clientSideRateLimit, getRemainingActions } from '@/utils/rateLimit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Mock Date.now to have consistent timing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('clientSideRateLimit', () => {
    it('allows requests under the limit', () => {
      // First 5 requests should be allowed (default limit is 5)
      expect(clientSideRateLimit('like')).toBe(true);
      expect(clientSideRateLimit('like')).toBe(true);
      expect(clientSideRateLimit('like')).toBe(true);
      expect(clientSideRateLimit('like')).toBe(true);
      expect(clientSideRateLimit('like')).toBe(true);
    });

    it('blocks requests over the limit', () => {
      // First 5 should pass
      for (let i = 0; i < 5; i++) {
        expect(clientSideRateLimit('like')).toBe(true);
      }
      
      // 6th should be blocked
      expect(clientSideRateLimit('like')).toBe(false);
    });

    it('respects custom limit parameter', () => {
      const customLimit = 3;
      
      // First 3 should pass
      for (let i = 0; i < customLimit; i++) {
        expect(clientSideRateLimit('like', customLimit)).toBe(true);
      }
      
      // 4th should be blocked
      expect(clientSideRateLimit('like', customLimit)).toBe(false);
    });

    it('tracks different actions separately', () => {
      // Use all likes
      for (let i = 0; i < 5; i++) {
        clientSideRateLimit('like');
      }
      expect(clientSideRateLimit('like')).toBe(false);
      
      // Messages should still be allowed
      expect(clientSideRateLimit('message')).toBe(true);
    });

    it('resets after one minute window expires', () => {
      // Use all likes
      for (let i = 0; i < 5; i++) {
        clientSideRateLimit('like');
      }
      expect(clientSideRateLimit('like')).toBe(false);
      
      // Advance time by 61 seconds (past the 1-minute window)
      vi.advanceTimersByTime(61 * 1000);
      
      // Should be allowed again
      expect(clientSideRateLimit('like')).toBe(true);
    });

    it('partially resets as time passes', () => {
      // Add actions at different times
      clientSideRateLimit('like'); // t=0s
      
      vi.advanceTimersByTime(20 * 1000); // t=20s
      clientSideRateLimit('like');
      
      vi.advanceTimersByTime(20 * 1000); // t=40s
      clientSideRateLimit('like');
      
      vi.advanceTimersByTime(20 * 1000); // t=60s - first action expired
      
      // Should have 2 remaining (original expired, 2 still in window)
      expect(getRemainingActions('like')).toBe(3);
    });
  });

  describe('getRemainingActions', () => {
    it('returns full limit when no actions taken', () => {
      expect(getRemainingActions('like')).toBe(5);
      expect(getRemainingActions('message')).toBe(5);
    });

    it('returns correct remaining count after actions', () => {
      clientSideRateLimit('like');
      clientSideRateLimit('like');
      
      expect(getRemainingActions('like')).toBe(3);
    });

    it('returns 0 when limit reached', () => {
      for (let i = 0; i < 5; i++) {
        clientSideRateLimit('like');
      }
      
      expect(getRemainingActions('like')).toBe(0);
    });

    it('respects custom limit parameter', () => {
      expect(getRemainingActions('like', 10)).toBe(10);
      
      clientSideRateLimit('like', 10);
      expect(getRemainingActions('like', 10)).toBe(9);
    });

    it('returns correct count after window expires', () => {
      // Use all likes
      for (let i = 0; i < 5; i++) {
        clientSideRateLimit('like');
      }
      expect(getRemainingActions('like')).toBe(0);
      
      // Advance past window
      vi.advanceTimersByTime(61 * 1000);
      
      // Should have full limit again
      expect(getRemainingActions('like')).toBe(5);
    });

    it('handles different action types independently', () => {
      clientSideRateLimit('like');
      clientSideRateLimit('like');
      clientSideRateLimit('message');
      
      expect(getRemainingActions('like')).toBe(3);
      expect(getRemainingActions('message')).toBe(4);
    });
  });

  describe('Edge cases', () => {
    it('handles localStorage errors gracefully', () => {
      // Mock localStorage.getItem to throw
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });
      
      // Should fail open (allow the action)
      expect(clientSideRateLimit('like')).toBe(true);
      
      // Restore
      localStorage.getItem = originalGetItem;
    });

    it('handles corrupted localStorage data', () => {
      localStorage.setItem('rate_limit_like', 'not-valid-json');
      
      // Should fail open
      expect(clientSideRateLimit('like')).toBe(true);
    });

    it('handles empty localStorage gracefully', () => {
      localStorage.setItem('rate_limit_like', '');
      
      // Should work with empty string
      expect(clientSideRateLimit('like')).toBe(true);
    });
  });
});

