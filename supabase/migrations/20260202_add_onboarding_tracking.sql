-- Add onboarding tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Create index for performance optimization
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding 
ON public.profiles(user_id, onboarding_completed);

-- Set existing users as onboarding completed (for backward compatibility)
-- This ensures existing users don't get redirected to onboarding
UPDATE public.profiles 
SET onboarding_completed = TRUE, 
    onboarding_completed_at = created_at
WHERE onboarding_completed IS NULL OR onboarding_completed = FALSE;
