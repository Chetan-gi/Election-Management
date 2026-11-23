-- ============================================================================
-- ELECTION & CONTACT MANAGEMENT SYSTEM - RELATIONAL CONNECTION MIGRATION
-- Description: Establishes complete foreign key connection between 'app_users'
--              and 'contacts' with linked_app_user_id and created_by_user_id.
-- ============================================================================

-- 1. Extend 'app_users' table
ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS mobile_number TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS village_city TEXT,
ADD COLUMN IF NOT EXISTS ward_area TEXT,
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.app_users(id) ON DELETE SET NULL;

-- 2. Extend 'contacts' table to link with 'app_users'
-- - 'linked_app_user_id': Links officer's contact profile with their login account
-- - 'created_by_user_id': Tracks which admin/officer recorded this contact
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS linked_app_user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES public.app_users(id) ON DELETE SET NULL;

-- 3. Prevent duplicate linked contact profiles for the same application user
CREATE UNIQUE INDEX IF NOT EXISTS uq_contacts_linked_app_user_id 
ON public.contacts(linked_app_user_id) 
WHERE linked_app_user_id IS NOT NULL;

-- 4. Create performance indexes for relational queries
CREATE INDEX IF NOT EXISTS idx_app_users_mobile ON public.app_users(mobile_number);
CREATE INDEX IF NOT EXISTS idx_app_users_created_by ON public.app_users(created_by);
CREATE INDEX IF NOT EXISTS idx_contacts_linked_app_user_id ON public.contacts(linked_app_user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_created_by_user_id ON public.contacts(created_by_user_id);

-- 5. Sync existing data: link existing officers to their contact profiles if matched
UPDATE public.contacts c
SET 
  linked_app_user_id = u.id,
  created_by_user_id = COALESCE(c.created_by_user_id, c.user_id)
FROM public.app_users u
WHERE (c.user_id = u.id OR c.mobile_number = u.mobile_number)
  AND u.role = 'OFFICER'
  AND c.linked_app_user_id IS NULL;

-- 6. Ensure created_by_user_id is populated for existing normal contacts
UPDATE public.contacts
SET created_by_user_id = user_id
WHERE created_by_user_id IS NULL AND user_id IS NOT NULL;

-- 7. REFRESH SUPABASE SCHEMA CACHE IMMEDIATELY
-- This eliminates 'Could not find column in schema cache' instantly!
NOTIFY pgrst, 'reload schema';

-- 8. Verification query
SELECT c.id AS contact_id, c.full_name, c.mobile_number, c.linked_app_user_id, c.created_by_user_id, u.username, u.role
FROM public.contacts c
LEFT JOIN public.app_users u ON c.linked_app_user_id = u.id
LIMIT 10;
