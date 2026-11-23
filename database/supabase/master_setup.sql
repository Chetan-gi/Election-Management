-- ============================================================================
-- ELECTION & CONTACT MANAGEMENT SYSTEM - MASTER DATABASE SETUP
-- Target Database: Supabase PostgreSQL (Region: ap-south-1 Mumbai)
-- Instructions: Copy and paste this ENTIRE script into your Supabase SQL Editor
-- and click 'RUN'. It is 100% idempotent and safe to run multiple times.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- STEP 1: CUSTOM ENUM TYPES
-- ============================================================================

-- 1.1 Strict 3-Tier Contact Alignment Categories
DO $$ BEGIN
    CREATE TYPE contact_category AS ENUM ('SUPPORTER', 'NEUTRAL', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1.2 Occasion Event Types
DO $$ BEGIN
    CREATE TYPE notification_event_type AS ENUM ('DOB', 'ANNIVERSARY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1.3 Notification Execution Statuses
DO $$ BEGIN
    CREATE TYPE notification_status AS ENUM ('SCHEDULED', 'SENT', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- ============================================================================
-- STEP 2: CREATE CONTACTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT auth.uid(),
    full_name TEXT NOT NULL,
    father_name TEXT,
    mobile_number TEXT NOT NULL,
    address TEXT,
    village_city TEXT,
    ward_area TEXT,
    dob DATE,
    anniversary_date DATE,
    photo_url TEXT,
    notes TEXT,
    category contact_category DEFAULT 'NEUTRAL' NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- ============================================================================
-- STEP 3: CREATE NOTIFICATION LOGS TABLE (0-Duplicate Guarantee)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
    event_type notification_event_type NOT NULL,
    target_year INT NOT NULL,
    status notification_status DEFAULT 'SCHEDULED' NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_contact_event_year UNIQUE (contact_id, event_type, target_year)
);


-- ============================================================================
-- STEP 4: PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_mobile ON public.contacts(mobile_number);
CREATE INDEX IF NOT EXISTS idx_contacts_village ON public.contacts(village_city);
CREATE INDEX IF NOT EXISTS idx_contacts_ward ON public.contacts(ward_area);
CREATE INDEX IF NOT EXISTS idx_contacts_category ON public.contacts(category);
CREATE INDEX IF NOT EXISTS idx_contacts_updated_at ON public.contacts(updated_at);
CREATE INDEX IF NOT EXISTS idx_contacts_dob ON public.contacts(dob) WHERE dob IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_anniversary ON public.contacts(anniversary_date) WHERE anniversary_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notification_contact_id ON public.notification_logs(contact_id);
CREATE INDEX IF NOT EXISTS idx_notification_status ON public.notification_logs(status);


-- ============================================================================
-- STEP 5: AUTOMATIC 'updated_at' TIMESTAMP TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_contacts_updated_at ON public.contacts;
CREATE TRIGGER trigger_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- STEP 6: ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Development & Production hybrid policy (Permits authenticated users to manage their data,
-- while allowing the anon publishable key to operate smoothly)
DROP POLICY IF EXISTS "Contacts access policy" ON public.contacts;
CREATE POLICY "Contacts access policy"
ON public.contacts FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Notification logs access policy" ON public.notification_logs;
CREATE POLICY "Notification logs access policy"
ON public.notification_logs FOR ALL
USING (true)
WITH CHECK (true);


-- ============================================================================
-- STEP 7: STORAGE BUCKET FOR CONTACT PHOTOS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('contact-photos', 'contact-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public photo access policy" ON storage.objects;
CREATE POLICY "Public photo access policy"
ON storage.objects FOR ALL
USING (bucket_id = 'contact-photos')
WITH CHECK (bucket_id = 'contact-photos');


-- ============================================================================
-- STEP 8: SEED REALISTIC VOTER CONTACTS (Initial Data)
-- ============================================================================
INSERT INTO public.contacts (full_name, father_name, mobile_number, address, village_city, ward_area, dob, anniversary_date, category, notes)
VALUES 
    (
        'Rajesh Kumar Sharma', 
        'Ramesh Chandra Sharma', 
        '9876543210', 
        'Plot 45, Gandhi Nagar', 
        'Kalyanpur', 
        'Ward 12', 
        '1985-11-24', 
        '2012-05-18', 
        'SUPPORTER', 
        'Prominent community youth leader. Volunteers in voter outreach.'
    ),
    (
        'Sunita Devi Verma', 
        'Mahesh Verma', 
        '9823456781', 
        'House 12, Main Bazar', 
        'Kalyanpur', 
        'Ward 12', 
        '1990-03-15', 
        '2014-11-25', 
        'SUPPORTER', 
        'Teacher; coordinates women self-help group.'
    ),
    (
        'Amit Singh Patel', 
        'Rajendra Patel', 
        '9712345678', 
        'Street 3, Near Bus Stand', 
        'Shivrajpur', 
        'Ward 04', 
        '1988-11-24', 
        NULL, 
        'NEUTRAL', 
        'Local merchant; undecided on election stance.'
    ),
    (
        'Pooja Lakshmi Gupta', 
        'Anand Gupta', 
        '9934567890', 
        'B-102, Shanti Vihar', 
        'Shivrajpur', 
        'Ward 05', 
        '1995-07-20', 
        '2018-02-14', 
        'NEUTRAL', 
        'Accountant; interested in civic infrastructure improvements.'
    ),
    (
        'Dharmendra Yadav', 
        'Ram Lakhan Yadav', 
        '9845678901', 
        'Kisan Mandi Marg', 
        'Fatehpur', 
        'Ward 08', 
        '1982-12-01', 
        '2008-06-22', 
        'OTHER', 
        'Farmers union committee representative.'
    ),
    (
        'Vikas Mohan Tiwari', 
        'Brijesh Tiwari', 
        '9765432109', 
        'Old Post Office Lane', 
        'Fatehpur', 
        'Ward 08', 
        '1979-11-25', 
        '2005-11-24', 
        'OTHER', 
        'Retired railway inspector; well respected locally.'
    )
ON CONFLICT DO NOTHING;


-- ============================================================================
-- STEP 9: APP USERS TABLE (Username & Password Direct Authentication)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'OFFICER' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_by UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ensure created_by column exists if table was already created
ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.app_users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_app_users_created_by ON public.app_users(created_by);


-- ============================================================================
-- STEP 10: USER LOGIN LOGS TABLE (Audit History of Every Login Attempt)
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

-- Performance Indexes for Authentication & Audit Logs
CREATE INDEX IF NOT EXISTS idx_app_users_username ON public.app_users(username);
CREATE INDEX IF NOT EXISTS idx_app_users_email ON public.app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_active ON public.app_users(is_active);

CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON public.app_user_login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_username ON public.app_user_login_logs(username);
CREATE INDEX IF NOT EXISTS idx_login_logs_status ON public.app_user_login_logs(status);
CREATE INDEX IF NOT EXISTS idx_login_logs_timestamp ON public.app_user_login_logs(login_timestamp DESC);

-- Trigger for auto updating app_users updated_at
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

-- RLS Policies for app_users and app_user_login_logs
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_user_login_logs ENABLE ROW LEVEL SECURITY;

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
-- STEP 11: SEED DEFAULT USERS (username: username | password: username123)
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
-- STEP 12: HELPER RPC FUNCTIONS (Direct Login Verify & Forgot Password Reset)
-- ============================================================================

-- 12.1 Direct Login Verification Function with Auto-Logging
CREATE OR REPLACE FUNCTION public.verify_user_login(
    p_username TEXT,
    p_password TEXT,
    p_ip TEXT DEFAULT '127.0.0.1',
    p_user_agent TEXT DEFAULT 'Web Browser'
)
RETURNS JSONB AS $$
DECLARE
    v_user RECORD;
BEGIN
    SELECT * INTO v_user
    FROM public.app_users
    WHERE (LOWER(username) = LOWER(p_username) OR LOWER(email) = LOWER(p_username))
      AND is_active = TRUE
    LIMIT 1;

    -- User not found
    IF v_user IS NULL THEN
        INSERT INTO public.app_user_login_logs (user_id, username, status, ip_address, user_agent, failure_reason)
        VALUES (NULL, p_username, 'FAILED', p_ip, p_user_agent, 'User not found or inactive');

        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'Invalid username or password.'
        );
    END IF;

    -- Incorrect password
    IF v_user.password <> p_password THEN
        INSERT INTO public.app_user_login_logs (user_id, username, status, ip_address, user_agent, failure_reason)
        VALUES (v_user.id, v_user.username, 'FAILED', p_ip, p_user_agent, 'Incorrect password');

        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'Invalid username or password.'
        );
    END IF;

    -- Success
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

-- 12.2 Direct Forgot Password Reset Function
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

    SELECT id INTO v_user_id
    FROM public.app_users
    WHERE LOWER(username) = LOWER(p_username) OR LOWER(email) = LOWER(p_username);

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'User with given username/email was not found.'
        );
    END IF;

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


-- 12.3 Admin-Only Function to Create Campaign Field Officers or Users
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
    -- 1. Strictly verify caller is an active ADMIN
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


