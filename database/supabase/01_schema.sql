-- ============================================================================
-- ELECTION & CONTACT MANAGEMENT SYSTEM - SUPABASE DATABASE INITIALIZATION DDL
-- Region Recommendation: ap-south-1 (Mumbai, India)
-- ============================================================================

-- 1. Custom Enum for Contact Categories (Strict 3 Categories)
DO $$ BEGIN
    CREATE TYPE contact_category AS ENUM ('SUPPORTER', 'NEUTRAL', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Custom Enum for Notification Event Types
DO $$ BEGIN
    CREATE TYPE notification_event_type AS ENUM ('DOB', 'ANNIVERSARY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Custom Enum for Notification Status
DO $$ BEGIN
    CREATE TYPE notification_status AS ENUM ('SCHEDULED', 'SENT', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 4. Contacts Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
-- 5. Performance Indexes for Contacts
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_mobile ON contacts(mobile_number);
CREATE INDEX IF NOT EXISTS idx_contacts_village ON contacts(village_city);
CREATE INDEX IF NOT EXISTS idx_contacts_ward ON contacts(ward_area);
CREATE INDEX IF NOT EXISTS idx_contacts_category ON contacts(category);
CREATE INDEX IF NOT EXISTS idx_contacts_updated_at ON contacts(updated_at);
CREATE INDEX IF NOT EXISTS idx_contacts_dob ON contacts(dob) WHERE dob IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_anniversary ON contacts(anniversary_date) WHERE anniversary_date IS NOT NULL;

-- Trigger to auto-update 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_contacts_updated_at ON contacts;
CREATE TRIGGER trigger_contacts_updated_at
BEFORE UPDATE ON contacts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. Notification Logs Table (Precision Duplicate Prevention)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
    event_type notification_event_type NOT NULL,
    target_year INT NOT NULL,
    status notification_status DEFAULT 'SCHEDULED' NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_contact_event_year UNIQUE (contact_id, event_type, target_year)
);

CREATE INDEX IF NOT EXISTS idx_notification_contact_id ON notification_logs(contact_id);
CREATE INDEX IF NOT EXISTS idx_notification_status ON notification_logs(status);
