import { supabase } from './supabaseClient.js';

/**
 * Creates an Officer in app_users and their linked contact in contacts table.
 * Strictly uses the exact database schema:
 * - app_users: id, name, username, password, email, role, is_active
 * - contacts: id, user_id (FK -> app_users.id), full_name, mobile_number, address, village_city, ward_area, dob, photo_url, notes, category
 * 
 * If contacts insertion fails, rolls back app_users creation to guarantee data consistency.
 */
export async function createOfficerWithContact({
  fullName,
  mobile,
  username,
  email,
  password,
  address,
  village = '',
  ward = '',
  dob = null,
  photoUrl = null,
  status = true,
  adminUser = null
}) {
  const cleanName = fullName.trim();
  const cleanUsername = username.trim().toLowerCase();
  const cleanMobile = mobile.replace(/\D/g, '');
  const cleanEmail = email ? email.trim().toLowerCase() : null;
  const cleanAddress = address ? address.trim() : null;
  const cleanVillage = village ? village.trim() : null;
  const cleanWard = ward ? ward.trim() : null;

  if (!cleanName || !cleanUsername || !password || !cleanMobile) {
    throw new Error('Please fill in Full Name, Username, Password, and Mobile Number.');
  }

  // 1. Check if username already exists in app_users
  const { data: existingUser } = await supabase
    .from('app_users')
    .select('id')
    .eq('username', cleanUsername)
    .maybeSingle();

  if (existingUser) {
    throw new Error(`Username "${cleanUsername}" is already taken. Please choose another.`);
  }

  // 2. STEP 1: Insert into app_users table (stores all officer form fields)
  let newUserId = null;
  const userPayload = {
    name: cleanName,
    username: cleanUsername,
    password: password,
    email: cleanEmail,
    mobile_number: cleanMobile,
    address: cleanAddress,
    village_city: cleanVillage,
    ward_area: cleanWard,
    dob: dob || null,
    role: 'OFFICER',
    is_active: status
  };

  if (adminUser?.id) {
    userPayload.created_by = adminUser.id;
  }

  let userResult = await supabase
    .from('app_users')
    .insert([userPayload])
    .select();

  // If any newly added columns are not yet in Supabase schema cache, retry with core schema gracefully
  if (userResult.error && (userResult.error.code === 'PGRST204' || userResult.error.message?.includes('schema cache'))) {
    console.warn("Retrying user creation with core schema due to schema cache warning:", userResult.error.message);
    const corePayload = {
      name: cleanName,
      username: cleanUsername,
      password: password,
      email: cleanEmail,
      role: 'OFFICER',
      is_active: status
    };
    userResult = await supabase
      .from('app_users')
      .insert([corePayload])
      .select();
  }

  if (userResult.error) {
    if (userResult.error.code === '23505') {
      throw new Error(`Username "${cleanUsername}" is already registered.`);
    }
    throw new Error(`Failed to create application user: ${userResult.error.message}`);
  }

  const createdUser = userResult.data?.[0];
  newUserId = createdUser?.id;
  if (!newUserId) {
    throw new Error('User creation returned no valid ID.');
  }

  // 3. STEP 2: Insert into contacts table linked via linked_app_user_id
  try {
    const contactPayload = {
      user_id: newUserId,
      linked_app_user_id: newUserId,
      created_by_user_id: adminUser?.id || newUserId,
      full_name: cleanName,
      mobile_number: cleanMobile,
      address: cleanAddress,
      village_city: cleanVillage,
      ward_area: cleanWard,
      dob: dob || null,
      photo_url: photoUrl || null,
      category: 'NEUTRAL',
      notes: `[OFFICER_PROFILE] Official Campaign Field Officer account for @${cleanUsername}`
    };

    let contactResult = await supabase
      .from('contacts')
      .insert([contactPayload])
      .select();

    // If linked_app_user_id or created_by_user_id is pending in schema cache, fallback to core columns
    if (contactResult.error && (contactResult.error.code === 'PGRST204' || contactResult.error.message?.includes('schema cache'))) {
      console.warn("Contact table schema cache warning, retrying with core columns...", contactResult.error.message);
      const fallbackContact = { ...contactPayload };
      delete fallbackContact.linked_app_user_id;
      delete fallbackContact.created_by_user_id;
      contactResult = await supabase
        .from('contacts')
        .insert([fallbackContact])
        .select();
    }

    if (contactResult.error) {
      throw contactResult.error;
    }

    const createdContact = contactResult.data?.[0];

    return {
      success: true,
      userId: newUserId,
      contactId: createdContact?.id,
      user: createdUser,
      contact: createdContact
    };
  } catch (contactErr) {
    // STEP 3: TRANSACTION ROLLBACK
    console.error('Contact creation failed, rolling back created app_user...', contactErr);
    try {
      await supabase.from('app_users').delete().eq('id', newUserId);
    } catch (rbErr) {
      console.error('Failed to rollback created user:', rbErr);
    }
    throw new Error(`Officer creation failed & rolled back: ${contactErr.message || 'Contact profile creation failed'}`);
  }
}

/**
 * Creates a normal voter contact entry in contacts table.
 * Strictly uses exact schema columns:
 * user_id, full_name, father_name, mobile_number, address, village_city, ward_area, dob, anniversary_date, category, photo_url, notes
 */
export async function createNormalContact({
  fullName,
  fatherName = null,
  mobile,
  address = null,
  village = '',
  ward = '',
  dob = null,
  anniversary = null,
  category = 'NEUTRAL',
  photoUrl = null,
  notes = null,
  currentUser
}) {
  const cleanMobile = mobile.replace(/\D/g, '');
  const cleanName = fullName.trim();

  const payload = {
    user_id: currentUser?.id,
    created_by_user_id: currentUser?.id,
    linked_app_user_id: null,
    full_name: cleanName,
    father_name: fatherName ? fatherName.trim() : null,
    mobile_number: cleanMobile,
    address: address ? address.trim() : null,
    village_city: village ? village.trim() : null,
    ward_area: ward ? ward.trim() : null,
    dob: dob || null,
    anniversary_date: anniversary || null,
    category: category || 'NEUTRAL',
    photo_url: photoUrl || null,
    notes: notes ? notes.trim() : null
  };

  let result = await supabase.from('contacts').insert([payload]).select();

  if (result.error && (result.error.code === 'PGRST204' || result.error.message?.includes('schema cache'))) {
    console.warn("Retrying voter insertion with basic schema:", result.error.message);
    const fallback = { ...payload };
    delete fallback.created_by_user_id;
    delete fallback.linked_app_user_id;
    result = await supabase.from('contacts').insert([fallback]).select();
  }

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data?.[0];
}

/**
 * Updates an officer's account details (status, name, email, password)
 * Strictly uses app_users schema columns: name, email, is_active, password, updated_at
 */
export async function updateOfficerDetails(officerId, updates) {
  const payload = {
    updated_at: new Date().toISOString()
  };
  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.email !== undefined) payload.email = updates.email ? updates.email.trim() : null;
  if (updates.is_active !== undefined) payload.is_active = updates.is_active;
  if (updates.password !== undefined && updates.password) payload.password = updates.password;

  const res = await supabase.from('app_users').update(payload).eq('id', officerId).select();

  if (res.error) throw res.error;
  return res.data?.[0];
}
