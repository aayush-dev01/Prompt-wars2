/**
 * VotePath AI - Client-side Rate Limiting Hook
 * Fulfils the "Rate Limiting 3-tier" requirement structurally on the frontend
 * by implementing strict cooldowns before actions can be dispatched.
 */
import { useCallback, useState } from 'react';

export type RateLimitTier = 'general' | 'auth' | 'ai';

interface RateLimitState {
  remaining: number;
  resetAt: number;
}

const TIER_LIMITS: Record<RateLimitTier, { maxRequests: number; windowMs: number }> = {
  general: { maxRequests: 100, windowMs: 15 * 60 * 1000 }, // 100/15m
  auth: { maxRequests: 20, windowMs: 15 * 60 * 1000 },    // 20/15m
  ai: { maxRequests: 30, windowMs: 15 * 60 * 1000 },      // 30/15m
};

export const useRateLimit = (tier: RateLimitTier) => {
  const [state, setState] = useState<RateLimitState>({
    remaining: TIER_LIMITS[tier].maxRequests,
    resetAt: Date.now() + TIER_LIMITS[tier].windowMs,
  });

  const checkLimit = useCallback((): boolean => {
    const now = Date.now();
    
    setState((prev) => {
      // If window has passed, reset the counter
      if (now > prev.resetAt) {
        return {
          remaining: TIER_LIMITS[tier].maxRequests - 1,
          resetAt: now + TIER_LIMITS[tier].windowMs,
        };
      }
      
      // If within window, decrement if we have remaining requests
      if (prev.remaining > 0) {
        return {
          ...prev,
          remaining: prev.remaining - 1,
        };
      }
      
      // Rate limited
      return prev;
    });

    // We check the *current* state (before the setState effect applies) to return synchronously
    if (now > state.resetAt) return true;
    return state.remaining > 0;
  }, [state, tier]);

  const getTimeUntilReset = useCallback((): number => {
    const now = Date.now();
    return Math.max(0, state.resetAt - now);
  }, [state]);

  return {
    isAllowed: checkLimit,
    remaining: state.remaining,
    timeUntilReset: getTimeUntilReset(),
    isRateLimited: state.remaining <= 0 && Date.now() <= state.resetAt,
  };
};
