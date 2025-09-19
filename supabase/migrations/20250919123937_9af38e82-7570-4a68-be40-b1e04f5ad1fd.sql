-- Fix security warning: Set search_path for functions
ALTER FUNCTION public.update_scam_vote_counts() SET search_path = public;