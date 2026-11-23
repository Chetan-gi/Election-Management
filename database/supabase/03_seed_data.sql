-- ============================================================================
-- SAMPLE SEED DATA FOR TESTING SEARCH, CATEGORIZATION & REMINDERS
-- Replace '00000000-0000-0000-0000-000000000000' with your authenticated user_id
-- ============================================================================

-- Temporary variable or placeholder for testing:
-- Run this in SQL Editor after authenticating or replacing the user_id below

WITH current_user_record AS (
    SELECT id AS test_user_id FROM auth.users LIMIT 1
)
INSERT INTO contacts (user_id, full_name, father_name, mobile_number, address, village_city, ward_area, dob, anniversary_date, category)
SELECT 
    test_user_id,
    c.full_name,
    c.father_name,
    c.mobile_number,
    c.address,
    c.village_city,
    c.ward_area,
    c.dob::DATE,
    c.anniversary_date::DATE,
    c.category::contact_category
FROM current_user_record,
(VALUES 
    ('Rajesh Kumar Sharma', 'Ramesh Chandra Sharma', '9876543210', 'Plot 45, Gandhi Nagar', 'Kalyanpur', 'Ward 12', '1985-11-24', '2012-05-18', 'SUPPORTER'),
    ('Sunita Devi Verma', 'Mahesh Verma', '9823456781', 'House 12, Main Bazar', 'Kalyanpur', 'Ward 12', '1990-03-15', '2014-11-25', 'SUPPORTER'),
    ('Amit Singh Patel', 'Rajendra Patel', '9712345678', 'Street 3, Near Bus Stand', 'Shivrajpur', 'Ward 04', '1988-11-24', NULL, 'NEUTRAL'),
    ('Pooja Lakshmi Gupta', 'Anand Gupta', '9934567890', 'B-102, Shanti Vihar', 'Shivrajpur', 'Ward 05', '1995-07-20', '2018-02-14', 'NEUTRAL'),
    ('Dharmendra Yadav', 'Ram Lakhan Yadav', '9845678901', 'Kisan Mandi Marg', 'Fatehpur', 'Ward 08', '1982-12-01', '2008-06-22', 'OTHER'),
    ('Vikas Mohan Tiwari', 'Brijesh Tiwari', '9765432109', 'Old Post Office Lane', 'Fatehpur', 'Ward 08', '1979-11-25', '2005-11-24', 'OTHER')
) AS c(full_name, father_name, mobile_number, address, village_city, ward_area, dob, anniversary_date, category);
