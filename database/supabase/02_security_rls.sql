-- ============================================================================
-- ROW LEVEL SECURITY (RLS) & STORAGE ACCESS POLICIES
-- ============================================================================

-- 1. Enable RLS on Contacts Table
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policy if present, then create data access isolation policy
DROP POLICY IF EXISTS "Users manage own contacts" ON contacts;
CREATE POLICY "Users manage own contacts"
ON contacts FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Enable RLS on Notification Logs Table
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own notification logs" ON notification_logs;
CREATE POLICY "Users manage own notification logs"
ON notification_logs FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM contacts 
        WHERE contacts.id = notification_logs.contact_id 
        AND contacts.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM contacts 
        WHERE contacts.id = notification_logs.contact_id 
        AND contacts.user_id = auth.uid()
    )
);

-- ============================================================================
-- 4. Storage Bucket Setup: 'contact-photos' (Private)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('contact-photos', 'contact-photos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 5. Storage RLS Policy: Users can only upload and read files inside their own user folder
DROP POLICY IF EXISTS "Users isolation photo access" ON storage.objects;
CREATE POLICY "Users isolation photo access"
ON storage.objects FOR ALL
USING (
    bucket_id = 'contact-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
    bucket_id = 'contact-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
);
