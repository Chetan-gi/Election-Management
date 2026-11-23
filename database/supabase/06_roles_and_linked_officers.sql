-- ============================================================================
-- ELECTION & CONTACT MANAGEMENT SYSTEM - MIGRATION 06
-- Description: Adds role-based access control, linked officer contacts,
--              transactional officer creation, and strict contact ownership.
-- ============================================================================

-- 1. Extend app_users table with mobile_number and created_by
ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS mobile_number TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.app_users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_app_users_mobile ON public.app_users(mobile_number);
CREATE INDEX IF NOT EXISTS idx_app_users_created_by ON public.app_users(created_by);

-- 2. Extend contacts table with linked_app_user_id and created_by_user_id
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS linked_app_user_id UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES public.app_users(id) ON DELETE SET NULL;

-- Keep user_id and created_by_user_id in sync for backward compatibility
UPDATE public.contacts
SET created_by_user_id = user_id
WHERE created_by_user_id IS NULL AND user_id IS NOT NULL;

-- 3. Prevent duplicate linked contact profiles for the same application user
CREATE UNIQUE INDEX IF NOT EXISTS uq_contacts_linked_app_user_id 
ON public.contacts(linked_app_user_id) 
WHERE linked_app_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_created_by_user_id ON public.contacts(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_linked_app_user_id ON public.contacts(linked_app_user_id);

-- 4. ACID Transaction Stored Procedure for Officer Creation
-- Guarantees atomic insertion of app_user + linked contact profile.
-- If either fails, the transaction is automatically rolled back.
CREATE OR REPLACE FUNCTION public.create_officer_with_contact(
    p_name TEXT,
    p_username TEXT,
    p_password TEXT,
    p_mobile TEXT,
    p_email TEXT DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_village TEXT DEFAULT 'Kalyanpur',
    p_ward TEXT DEFAULT 'Ward 01',
    p_dob DATE DEFAULT NULL,
    p_photo_url TEXT DEFAULT NULL,
    p_category TEXT DEFAULT 'NEUTRAL',
    p_is_active BOOLEAN DEFAULT TRUE,
    p_admin_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_contact_id UUID;
    v_cat contact_category;
    v_result JSONB;
BEGIN
    -- Validate uniqueness of username
    IF EXISTS (SELECT 1 FROM public.app_users WHERE username = p_username) THEN
        RAISE EXCEPTION 'Username "%" is already taken. Please choose another.', p_username;
    END IF;

    -- Validate category casting (fallback to NEUTRAL if custom string)
    BEGIN
        v_cat := p_category::contact_category;
    EXCEPTION WHEN OTHERS THEN
        v_cat := 'NEUTRAL'::contact_category;
    END;

    -- STEP 1: Insert into app_users table
    INSERT INTO public.app_users (
        name,
        username,
        password,
        mobile_number,
        email,
        role,
        is_active,
        created_by
    )
    VALUES (
        p_name,
        p_username,
        p_password,
        p_mobile,
        p_email,
        'OFFICER',
        p_is_active,
        p_admin_id
    )
    RETURNING id INTO v_user_id;

    -- STEP 2: Insert into contacts table with linked_app_user_id
    INSERT INTO public.contacts (
        user_id,
        created_by_user_id,
        linked_app_user_id,
        full_name,
        mobile_number,
        address,
        village_city,
        ward_area,
        dob,
        photo_url,
        category,
        notes
    )
    VALUES (
        p_admin_id,
        p_admin_id,
        v_user_id,
        p_name,
        p_mobile,
        p_address,
        p_village,
        p_ward,
        p_dob,
        p_photo_url,
        v_cat,
        'Official Field Officer account linked to @' || p_username
    )
    RETURNING id INTO v_contact_id;

    -- Format successful output
    v_result := jsonb_build_object(
        'success', TRUE,
        'user_id', v_user_id,
        'contact_id', v_contact_id,
        'username', p_username,
        'name', p_name,
        'role', 'OFFICER'
    );

    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        -- Automatic rollback on any failure
        RAISE EXCEPTION 'Officer creation transaction failed: %', SQLERRM;
END;
$$;

-- Grant execution to public / anon
GRANT EXECUTE ON FUNCTION public.create_officer_with_contact TO anon, authenticated, service_role;
