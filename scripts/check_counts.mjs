import { createClient } from '@supabase/supabase-js';

const s = createClient('https://xdhtwwvbzazvqpzewqpw.supabase.co', 'sb_publishable_mqUah9MWtttk_M5FNWoiuQ_umj4EjKK');

async function check() {
  const u = await s.from('app_users').select('id');
  const l = await s.from('app_user_login_logs').select('id');
  const c = await s.from('contacts').select('id');
  const n = await s.from('notification_logs').select('id');

  console.log('--- SUPABASE LIVE TABLE COUNTS ---');
  console.log('1. app_users:', u.data?.length ?? `Error: ${u.error?.message}`);
  console.log('2. app_user_login_logs:', l.data?.length ?? `Error: ${l.error?.message}`);
  console.log('3. contacts:', c.data?.length ?? `Error: ${c.error?.message}`);
  console.log('4. notification_logs:', n.data?.length ?? `Error: ${n.error?.message}`);
}

check();
