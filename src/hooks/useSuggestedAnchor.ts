import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/contexts/AuthContext';
import type { AnchorType } from '@/types/workout';
import { getSuggestedAnchor } from '@/types/workout';
import { useHomeDataContext } from '@/contexts/HomeDataContext';
import { logger } from '@/lib/logger';

interface SuggestedAnchorResult {
  suggestedAnchor: AnchorType;
  reason: string;
  isLoading: boolean;
}

export function useSuggestedAnchor(): SuggestedAnchorResult {
  const { user } = useAuthContext();
  const { workoutHistory } = useHomeDataContext();
  const [suggestedAnchor, setSuggestedAnchor] = useState<AnchorType>('FULL BODY');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current || !user?.id) return;
    fetchedRef.current = true;

    async function fetchSuggestion() {
      try {
        const { data, error } = await supabase.rpc('suggest_anchor', {
          p_user_id: user!.id,
        });

        if (error) throw error;

        const result = typeof data === 'string' ? JSON.parse(data) : data;
        setSuggestedAnchor(result.suggested_anchor as AnchorType);
        setReason(result.reason);
      } catch (err) {
        logger.workout.warn('suggest_anchor RPC failed, falling back to local', { err });
        // Fallback to local heuristic
        const fallback = getSuggestedAnchor(workoutHistory);
        setSuggestedAnchor(fallback);
        setReason('Based on recent workout history');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSuggestion();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps — workoutHistory is only needed for fallback, fetchedRef prevents re-runs

  return { suggestedAnchor, reason, isLoading };
}
