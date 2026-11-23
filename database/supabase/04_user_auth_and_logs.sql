-- ============================================================================
-- ELECTION & CONTACT MANAGEMENT SYSTEM - USER AUTH & LOGIN LOGS SETUP
-- Target Database: Supabase PostgreSQL (Region: ap-south-1 Mumbai)
-- Description: Creates app_users table with username/password check,
--              password update/recovery support, and app_user_login_logs table.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. APP USERS TABLE
-- Stores credentials with direct username/password check and recovery support
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    mobile_number TEXT,
    address TEXT,
    village_city TEXT,
    ward_area TEXT,
    dob DATE,
    role TEXT DEFAULT 'OFFICER' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_by UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ensure all officer fields exist if table was already created
ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS mobile_number TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS village_city TEXT,
ADD COLUMN IF NOT EXISTS ward_area TEXT,
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.app_users(id) ON DELETE SET NULL;

-- ============================================================================
-- 2. USER LOGIN LOGS TABLE
-- Records every login event (SUCCESS / FAILED) with timestamp, IP & user agent
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.app_user_login_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
    username TEXT NOT NULL,
    login_timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILED')),
    ip_address TEXT,
    user_agent TEXT,
    failure_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 3. PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_app_users_username ON public.app_users(username);
CREATE INDEX IF NOT EXISTS idx_app_users_email ON public.app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_active ON public.app_users(is_active);
CREATE INDEX IF NOT EXISTS idx_app_users_created_by ON public.app_users(created_by);

CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON public.app_user_login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_username ON public.app_user_login_logs(username);
CREATE INDEX IF NOT EXISTS idx_login_logs_status ON public.app_user_login_logs(status);
CREATE INDEX IF NOT EXISTS idx_login_logs_timestamp ON public.app_user_login_logs(login_timestamp DESC);

-- ============================================================================
-- 4. AUTOMATIC 'updated_at' TIMESTAMP TRIGGER FOR APP_USERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_app_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_app_users_updated_at ON public.app_users;
CREATE TRIGGER trigger_app_users_updated_at
BEFORE UPDATE ON public.app_users
FOR EACH ROW
EXECUTE FUNCTION update_app_users_updated_at();

-- ============================================================================
-- 5. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_user_login_logs ENABLE ROW LEVEL SECURITY;

-- Allow anon & authenticated client apps to verify login, update password & insert logs
DROP POLICY IF EXISTS "Allow user verification and login" ON public.app_users;
CREATE POLICY "Allow user verification and login"
ON public.app_users FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow login logs recording" ON public.app_user_login_logs;
CREATE POLICY "Allow login logs recording"
ON public.app_user_login_logs FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 6. SEED DEFAULT USERS (Username: username | Password: username123)
-- ============================================================================
INSERT INTO public.app_users (name, username, password, email, role, is_active)
VALUES 
    (
        'Campaign Field Officer',
        'username',
        'username123',
        'officer@election.gov.in',
        'OFFICER',
        TRUE
    ),
    (
        'System Administrator',
        'admin',
        'admin123',
        'admin@election.gov.in',
        'ADMIN',
        TRUE
    )
ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- 7. HELPER RPC FUNCTIONS (Stored Procedures for Login & Password Reset)
-- ============================================================================

-- 7.1 Verify User Login Directly in Database and Auto-record Audit Log
CREATE OR REPLACE FUNCTION public.verify_user_login(
    p_username TEXT,
    p_password TEXT,
    p_ip TEXT DEFAULT '127.0.0.1',
    p_user_agent TEXT DEFAULT 'Web Browser'
)
RETURNS JSONB AS $$
DECLARE
    v_user RECORD;
    v_result JSONB;
BEGIN
    -- Look up active user by username or email
    SELECT * INTO v_user
    FROM public.app_users
    WHERE (LOWER(username) = LOWER(p_username) OR LOWER(email) = LOWER(p_username))
      AND is_active = TRUE
    LIMIT 1;

    -- Case 1: User does not exist
    IF v_user IS NULL THEN
        INSERT INTO public.app_user_login_logs (user_id, username, status, ip_address, user_agent, failure_reason)
        VALUES (NULL, p_username, 'FAILED', p_ip, p_user_agent, 'User not found or inactive');

        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'Invalid username or password.'
        );
    END IF;

    -- Case 2: Password mismatch
    IF v_user.password <> p_password THEN
        INSERT INTO public.app_user_login_logs (user_id, username, status, ip_address, user_agent, failure_reason)
        VALUES (v_user.id, v_user.username, 'FAILED', p_ip, p_user_agent, 'Incorrect password');

        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'Invalid username or password.'
        );
    END IF;

    -- Case 3: Successful Login
    UPDATE public.app_users
    SET last_login_at = NOW(),
        updated_at = NOW()
    WHERE id = v_user.id;

    INSERT INTO public.app_user_login_logs (user_id, username, status, ip_address, user_agent, failure_reason)
    VALUES (v_user.id, v_user.username, 'SUCCESS', p_ip, p_user_agent, NULL);

    RETURN jsonb_build_object(
        'success', TRUE,
        'message', 'Login successful.',
        'user', jsonb_build_object(
            'id', v_user.id,
            'name', v_user.name,
            'username', v_user.username,
            'email', v_user.email,
            'role', v_user.role,
            'last_login_at', NOW()
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7.2 Forgot / Reset Password Function (Direct Database Update)
CREATE OR REPLACE FUNCTION public.reset_user_password(
    p_username TEXT,
    p_new_password TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
BEGIN
    IF LENGTH(p_new_password) < 4 THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'Password must be at least 4 characters long.'
        );
    END IF;

    -- Find user
    SELECT id INTO v_user_id
    FROM public.app_users
    WHERE LOWER(username) = LOWER(p_username) OR LOWER(email) = LOWER(p_username);

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'User with given username/email was not found.'
        );
    END IF;

    -- Update password
    UPDATE public.app_users
    SET password = p_new_password,
        updated_at = NOW()
    WHERE id = v_user_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'message', 'Password updated successfully in database.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7.3 Admin-Only Function to Create Campaign Field Officers or Users
-- Rule: ONLY users with role = 'ADMIN' can invoke this function and create officers.
CREATE OR REPLACE FUNCTION public.admin_create_officer(
    p_admin_username TEXT,
    p_name TEXT,
    p_username TEXT,
    p_password TEXT,
    p_email TEXT DEFAULT NULL,
    p_role TEXT DEFAULT 'OFFICER'
)
RETURNS JSONB AS $$
DECLARE
    v_admin RECORD;
    v_new_id UUID;
BEGIN
    -- 1. Strictly verify the creator is an active ADMIN
    SELECT * INTO v_admin
    FROM public.app_users
    WHERE LOWER(username) = LOWER(p_admin_username)
      AND role = 'ADMIN'
      AND is_active = TRUE;

    IF v_admin IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'PERMISSION DENIED: Only Admin users are authorized to create Campaign Field Officers.'
        );
    END IF;

    -- 2. Validate parameters
    IF p_name IS NULL OR TRIM(p_name) = '' THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Officer full name is required.');
    END IF;

    IF p_username IS NULL OR TRIM(p_username) = '' THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Username is required.');
    END IF;

    IF p_password IS NULL OR LENGTH(p_password) < 4 THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Password must be at least 4 characters long.');
    END IF;

    -- 3. Check for existing duplicate username
    IF EXISTS (SELECT 1 FROM public.app_users WHERE LOWER(username) = LOWER(TRIM(p_username))) THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'Username "' || p_username || '" is already taken. Please choose another username.'
        );
    END IF;

    -- 4. Insert new Campaign Field Officer
    INSERT INTO public.app_users (
        name,
        username,
        password,
        email,
        role,
        is_active
    )
    VALUES (
        TRIM(p_name),
        TRIM(p_username),
        p_password,
        NULLIF(TRIM(p_email), ''),
        COALESCE(p_role, 'OFFICER'),
        TRUE
    )
    RETURNING id INTO v_new_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'message', 'Campaign Field Officer created successfully.',
        'user_id', v_new_id,
        'username', TRIM(p_username),
        'role', COALESCE(p_role, 'OFFICER')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

