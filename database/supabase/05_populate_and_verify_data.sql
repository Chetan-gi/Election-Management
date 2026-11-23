-- ============================================================================
-- ELECTION & CONTACT MANAGEMENT SYSTEM - MASTER DATA POPULATION & ARRANGEMENT
-- Target Database: Supabase PostgreSQL (Region: ap-south-1 Mumbai)
-- Description: Arranges and populates structured, production-grade data
--              across all 4 tables shown in the ERD diagram:
--              1. app_users
--              2. app_user_login_logs (FK: user_id -> app_users.id)
--              3. contacts (FK: user_id -> app_users.id)
--              4. notification_logs (FK: contact_id -> contacts.id)
-- ============================================================================

-- ============================================================================
-- TABLE 1: app_users (System Administrators & Campaign Field Officers)
-- Requirements: Unique username, hashed or direct password, role (ADMIN/OFFICER)
-- ============================================================================
INSERT INTO public.app_users (name, username, password, email, role, is_active)
VALUES 
    (
        'System Administrator',
        'admin',
        'admin123',
        'admin@election.gov.in',
        'ADMIN',
        TRUE
    ),
    (
        'Campaign Field Officer',
        'username',
        'username123',
        'officer@election.gov.in',
        'OFFICER',
        TRUE
    ),
    (
        'Ramesh Chandra Sharma',
        'officer_ramesh',
        'ramesh123',
        'ramesh@election.gov.in',
        'OFFICER',
        TRUE
    ),
    (
        'Priya Kumari Verma',
        'officer_priya',
        'priya123',
        'priya@election.gov.in',
        'OFFICER',
        TRUE
    )
ON CONFLICT (username) DO UPDATE 
SET name = EXCLUDED.name, 
    email = EXCLUDED.email, 
    role = EXCLUDED.role, 
    is_active = EXCLUDED.is_active;


-- ============================================================================
-- TABLE 2: app_user_login_logs (Audit Trails of Every Login Event)
-- Requirements: FK user_id, username, login_timestamp, status (SUCCESS/FAILED)
-- ============================================================================
INSERT INTO public.app_user_login_logs (user_id, username, login_timestamp, status, ip_address, user_agent, failure_reason)
SELECT 
    u.id,
    u.username,
    NOW() - INTERVAL '2 hours',
    'SUCCESS',
    '103.212.145.22',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0',
    NULL
FROM public.app_users u WHERE u.username = 'admin'
LIMIT 1;

INSERT INTO public.app_user_login_logs (user_id, username, login_timestamp, status, ip_address, user_agent, failure_reason)
SELECT 
    u.id,
    u.username,
    NOW() - INTERVAL '45 minutes',
    'SUCCESS',
    '103.212.145.22',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0',
    NULL
FROM public.app_users u WHERE u.username = 'username'
LIMIT 1;

INSERT INTO public.app_user_login_logs (user_id, username, login_timestamp, status, ip_address, user_agent, failure_reason)
SELECT 
    u.id,
    u.username,
    NOW() - INTERVAL '3 hours',
    'SUCCESS',
    '157.34.120.89',
    'Mozilla/5.0 (Linux; Android 14; Pixel 8)',
    NULL
FROM public.app_users u WHERE u.username = 'officer_ramesh'
LIMIT 1;

INSERT INTO public.app_user_login_logs (user_id, username, login_timestamp, status, ip_address, user_agent, failure_reason)
VALUES 
    (
        NULL,
        'unregistered_guest',
        NOW() - INTERVAL '5 hours',
        'FAILED',
        '192.168.1.105',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        'User not found in database'
    ),
    (
        (SELECT id FROM public.app_users WHERE username = 'username' LIMIT 1),
        'username',
        NOW() - INTERVAL '1 day',
        'FAILED',
        '103.212.145.22',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Incorrect password'
    );


-- ============================================================================
-- TABLE 3: contacts (Constituent Voters Directory with Strict Categories)
-- Requirements: 10-digit mobile, village, ward, category (SUPPORTER/NEUTRAL/OTHER)
--               DOB & Anniversary for D-1 alerts, user_id of collecting officer
-- ============================================================================
INSERT INTO public.contacts (
    user_id, full_name, father_name, mobile_number, address, village_city, ward_area, dob, anniversary_date, category, notes
)
VALUES 
    (
        (SELECT id FROM public.app_users WHERE username = 'username' LIMIT 1),
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
        (SELECT id FROM public.app_users WHERE username = 'username' LIMIT 1),
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
        (SELECT id FROM public.app_users WHERE username = 'officer_ramesh' LIMIT 1),
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
        (SELECT id FROM public.app_users WHERE username = 'officer_ramesh' LIMIT 1),
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
        (SELECT id FROM public.app_users WHERE username = 'officer_priya' LIMIT 1),
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
        (SELECT id FROM public.app_users WHERE username = 'officer_priya' LIMIT 1),
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
    ),
    (
        (SELECT id FROM public.app_users WHERE username = 'officer_ramesh' LIMIT 1),
        'Anil Kumar Prajapati',
        'Madan Lal Prajapati',
        '9812345601',
        'Near Old Water Tank, Ward 04',
        'Shivrajpur',
        'Ward 04',
        '1987-11-24',
        '2015-04-10',
        'SUPPORTER',
        'Active polling agent volunteer for Ward 04.'
    ),
    (
        (SELECT id FROM public.app_users WHERE username = 'officer_priya' LIMIT 1),
        'Meena Devi Soni',
        'Rameshwar Soni',
        '9822334455',
        'Sarafa Bazar, House 54',
        'Kalyanpur',
        'Ward 12',
        '1992-08-14',
        '2016-11-24',
        'SUPPORTER',
        'Coordinates women voting awareness circle.'
    ),
    (
        (SELECT id FROM public.app_users WHERE username = 'username' LIMIT 1),
        'Subhash Chandra Bose Gurjar',
        'Harakh Ram Gurjar',
        '9876001122',
        'Dairy Colony, Plot 10',
        'Fatehpur',
        'Ward 08',
        '1981-04-18',
        '2007-12-05',
        'NEUTRAL',
        'Requested youth community center & sports ground.'
    )
ON CONFLICT (id) DO NOTHING;

-- Also update existing contacts that had null user_id
UPDATE public.contacts 
SET user_id = (SELECT id FROM public.app_users WHERE username = 'username' LIMIT 1)
WHERE user_id IS NULL;


-- ============================================================================
-- TABLE 4: notification_logs (Zero Duplicate Greeting Reminders)
-- Requirements: Compound Unique Constraint (contact_id, event_type, target_year)
-- ============================================================================
INSERT INTO public.notification_logs (contact_id, event_type, target_year, status, sent_at)
SELECT 
    c.id,
    'DOB'::notification_event_type,
    2026,
    'SENT'::notification_status,
    NOW() - INTERVAL '6 hours'
FROM public.contacts c 
WHERE c.dob IS NOT NULL
LIMIT 3
ON CONFLICT (contact_id, event_type, target_year) DO NOTHING;

INSERT INTO public.notification_logs (contact_id, event_type, target_year, status, sent_at)
SELECT 
    c.id,
    'ANNIVERSARY'::notification_event_type,
    2026,
    'SCHEDULED'::notification_status,
    NOW()
FROM public.contacts c 
WHERE c.anniversary_date IS NOT NULL
LIMIT 3
ON CONFLICT (contact_id, event_type, target_year) DO NOTHING;


-- ============================================================================
-- 5. VERIFICATION QUERY (Inspect All 4 Arranged Tables)
-- ============================================================================
SELECT 'app_users' AS table_name, count(*) AS record_count FROM public.app_users
UNION ALL
SELECT 'app_user_login_logs', count(*) FROM public.app_user_login_logs
UNION ALL
SELECT 'contacts', count(*) FROM public.contacts
UNION ALL
SELECT 'notification_logs', count(*) FROM public.notification_logs;
