import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xdhtwwvbzazvqpzewqpw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_mqUah9MWtttk_M5FNWoiuQ_umj4EjKK';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function arrangeAndPopulateData() {
  console.log('🚀 Starting Data Arrangement & Population in Supabase...');

  // ==========================================================================
  // 1. ARRANGE & POPULATE APP_USERS
  // ==========================================================================
  console.log('\n1. Checking & Arranging app_users table...');
  const usersToUpsert = [
    {
      name: 'System Administrator',
      username: 'admin',
      password: 'admin123',
      email: 'admin@election.gov.in',
      role: 'ADMIN',
      is_active: true
    },
    {
      name: 'Campaign Field Officer',
      username: 'username',
      password: 'username123',
      email: 'officer@election.gov.in',
      role: 'OFFICER',
      is_active: true
    },
    {
      name: 'Ramesh Chandra Sharma',
      username: 'officer_ramesh',
      password: 'ramesh123',
      email: 'ramesh@election.gov.in',
      role: 'OFFICER',
      is_active: true
    },
    {
      name: 'Priya Kumari Verma',
      username: 'officer_priya',
      password: 'priya123',
      email: 'priya@election.gov.in',
      role: 'OFFICER',
      is_active: true
    }
  ];

  for (const u of usersToUpsert) {
    const { data: existing } = await supabase
      .from('app_users')
      .select('id')
      .eq('username', u.username)
      .maybeSingle();

    if (!existing) {
      const { data, error } = await supabase.from('app_users').insert([u]).select();
      if (!error && data) {
        console.log(`   + Created user: @${u.username} (${u.role})`);
      } else {
        console.warn(`   ! Error inserting @${u.username}:`, error?.message);
      }
    } else {
      console.log(`   ✓ User @${u.username} already exists (ID: ${existing.id})`);
    }
  }

  // Get current users for referencing
  const { data: allUsers } = await supabase.from('app_users').select('*');
  const userMap = {};
  allUsers.forEach(u => { userMap[u.username] = u.id; });
  const defaultOfficerId = userMap['username'] || allUsers[0]?.id;

  // ==========================================================================
  // 2. ARRANGE & POPULATE APP_USER_LOGIN_LOGS
  // ==========================================================================
  console.log('\n2. Checking & Arranging app_user_login_logs table...');
  const { count: logCount } = await supabase.from('app_user_login_logs').select('*', { count: 'exact', head: true });
  
  if (!logCount || logCount === 0) {
    const loginLogs = [
      {
        user_id: userMap['admin'],
        username: 'admin',
        login_timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: 'SUCCESS',
        ip_address: '103.212.145.22',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0',
        failure_reason: null
      },
      {
        user_id: userMap['username'],
        username: 'username',
        login_timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        status: 'SUCCESS',
        ip_address: '103.212.145.22',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0',
        failure_reason: null
      },
      {
        user_id: userMap['officer_ramesh'] || defaultOfficerId,
        username: 'officer_ramesh',
        login_timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        status: 'SUCCESS',
        ip_address: '157.34.120.89',
        user_agent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8)',
        failure_reason: null
      },
      {
        user_id: null,
        username: 'unregistered_guest',
        login_timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        status: 'FAILED',
        ip_address: '192.168.1.105',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        failure_reason: 'User not found in database'
      },
      {
        user_id: userMap['username'],
        username: 'username',
        login_timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        status: 'FAILED',
        ip_address: '103.212.145.22',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        failure_reason: 'Incorrect password'
      }
    ];

    const { error: logErr } = await supabase.from('app_user_login_logs').insert(loginLogs);
    if (!logErr) {
      console.log(`   + Populated 5 realistic audit records into app_user_login_logs.`);
    } else {
      console.warn('   ! Error inserting logs:', logErr.message);
    }
  } else {
    console.log(`   ✓ Table app_user_login_logs already has ${logCount} records.`);
  }

  // ==========================================================================
  // 3. ARRANGE & POPULATE CONTACTS (LINK USER_ID & ENSURE QUALITY DATA)
  // ==========================================================================
  console.log('\n3. Checking & Arranging contacts table...');
  // Link null user_id to active officer
  const { error: updateOfficerErr } = await supabase
    .from('contacts')
    .update({ user_id: defaultOfficerId })
    .is('user_id', null);
  
  if (!updateOfficerErr) {
    console.log(`   ✓ Linked existing voter contacts to Officer (user_id: ${defaultOfficerId})`);
  }

  // Additional realistic contacts if fewer than 10
  const { data: contactsData } = await supabase.from('contacts').select('*');
  console.log(`   ✓ Current total voter contacts: ${contactsData.length}`);

  const extraContacts = [
    {
      user_id: userMap['officer_ramesh'] || defaultOfficerId,
      full_name: 'Anil Kumar Prajapati',
      father_name: 'Madan Lal Prajapati',
      mobile_number: '9812345601',
      address: 'Near Old Water Tank, Ward 04',
      village_city: 'Shivrajpur',
      ward_area: 'Ward 04',
      dob: '1987-11-24', // Tomorrow Birthday (D-1 Trigger)
      anniversary_date: '2015-04-10',
      category: 'SUPPORTER',
      notes: 'Active polling agent volunteer for Ward 04.'
    },
    {
      user_id: userMap['officer_priya'] || defaultOfficerId,
      full_name: 'Meena Devi Soni',
      father_name: 'Rameshwar Soni',
      mobile_number: '9822334455',
      address: 'Sarafa Bazar, House 54',
      village_city: 'Kalyanpur',
      ward_area: 'Ward 12',
      dob: '1992-08-14',
      anniversary_date: '2016-11-24', // Tomorrow Anniversary (D-1 Trigger)
      category: 'SUPPORTER',
      notes: 'Coordinates women voting awareness circle.'
    },
    {
      user_id: defaultOfficerId,
      full_name: 'Subhash Chandra Bose Gurjar',
      father_name: 'Harakh Ram Gurjar',
      mobile_number: '9876001122',
      address: 'Dairy Colony, Plot 10',
      village_city: 'Fatehpur',
      ward_area: 'Ward 08',
      dob: '1981-04-18',
      anniversary_date: '2007-12-05',
      category: 'NEUTRAL',
      notes: 'Requested youth community center & sports ground.'
    }
  ];

  for (const c of extraContacts) {
    const { data: match } = await supabase
      .from('contacts')
      .select('id')
      .eq('mobile_number', c.mobile_number)
      .maybeSingle();

    if (!match) {
      await supabase.from('contacts').insert([c]);
      console.log(`   + Added voter: ${c.full_name} (${c.category}, ${c.village_city})`);
    }
  }

  // Refetch all contacts to arrange notification_logs
  const { data: refreshedContacts } = await supabase.from('contacts').select('*');

  // ==========================================================================
  // 4. ARRANGE & POPULATE NOTIFICATION_LOGS (LINKED TO CONTACTS)
  // ==========================================================================
  console.log('\n4. Checking & Arranging notification_logs table...');
  const { count: notifCount } = await supabase.from('notification_logs').select('*', { count: 'exact', head: true });

  if (!notifCount || notifCount === 0) {
    const notifEntries = [];
    
    // Pick contacts with DOB or Anniversary
    for (const c of refreshedContacts) {
      if (c.dob) {
        notifEntries.push({
          contact_id: c.id,
          event_type: 'DOB',
          target_year: 2026,
          status: 'SENT',
          sent_at: new Date(Date.now() - 3600000 * 5).toISOString()
        });
      }
      if (c.anniversary_date && notifEntries.length < 6) {
        notifEntries.push({
          contact_id: c.id,
          event_type: 'ANNIVERSARY',
          target_year: 2026,
          status: 'SCHEDULED',
          sent_at: new Date().toISOString()
        });
      }
      if (notifEntries.length >= 6) break;
    }

    if (notifEntries.length > 0) {
      const { error: notifErr } = await supabase.from('notification_logs').insert(notifEntries);
      if (!notifErr) {
        console.log(`   + Populated ${notifEntries.length} notification logs linked to contacts (guaranteed 0 duplicates).`);
      } else {
        console.warn('   ! Error inserting notification logs:', notifErr.message);
      }
    }
  } else {
    console.log(`   ✓ Table notification_logs already has ${notifCount} records.`);
  }

  console.log('\n✨ All 4 tables arranged and populated successfully in Supabase PostgreSQL!');
}

arrangeAndPopulateData().catch(console.error);
