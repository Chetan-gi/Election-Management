import os
import sys
from excel_engine import ExcelWorkbookBuilder

def build_master_specification():
    wb = ExcelWorkbookBuilder("Election_Management_System_Master_Specification.xlsx")

    # =========================================================================
    # SHEET 1: PROJECT OVERVIEW & SCOPE
    # =========================================================================
    s1_rows = [
        [("ELECTION & CONTACT MANAGEMENT SYSTEM - MASTER SPECIFICATION & BLUEPRINT", 2), None, None, None, None],
        [("Technical & Functional Architecture baseline derived from SRS v1.0 and Architecture, Supabase & Coding Plan", 4), None, None, None, None],
        [],
        [("1. EXECUTIVE SUMMARY & MISSION", 8), None, None, None, None],
        [("Document Type", 5), ("Software Requirements Specification (SRS) & Engineering Implementation Blueprint", 3), None, None, None],
        [("Application Name", 5), ("Election & Contact Management Application (Offline-First Mobile & Cloud)", 3), None, None, None],
        [("Core Purpose", 5), ("Provide a high-reliability, offline-first voter and contact management workspace. Built specifically for field operations, volunteer mobilization, precise occasion reminders, and secure data sovereignty.", 3), None, None, None],
        [("Primary Platform", 5), ("Native Android (Kotlin + Jetpack Compose) with Supabase Cloud Backend (PostgreSQL + RLS)", 3), None, None, None],
        [("Cross-Platform / Web", 5), ("Optional responsive Web / Flutter baseline aligned with the same PostgreSQL data contract", 3), None, None, None],
        [],
        [("2. CORE VALUE PROPOSITION & CAPABILITIES", 8), None, None, None, None],
        [("Capability", 1), ("Description", 1), ("Engineering Target", 1), ("Business Impact", 1), None],
        [("Offline-First Storage", 5), ("Local encrypted Room SQLite serves as the primary source of truth; instant UI responses", 3), ("Zero latency (<50ms UI updates), no internet dependency for field entry", 3), ("Ensures smooth fieldwork in rural/low-connectivity areas", 3), None],
        [("Strict 3-Tier Categorization", 5), ("Voter contacts classified strictly into 3 predefined categories", 3), ("1: Confirmed Supporters | 2: Neutral Contacts | 3: Other Contacts", 3), ("Clean campaign segmentation without speculative labeling", 3), None],
        [("Precision Reminders", 5), ("Exact 1-day-prior birthday & marriage anniversary notifications at 09:00 AM local time", 3), ("100% duplicate elimination; zero midnight (00:00) disturb alerts", 3), ("Timely greetings build deep community goodwill", 3), None],
        [("Dynamic Multi-Filtering", 5), ("Real-time filtering by Name, Phone, Village/City, Polling Ward, and Alignment Category", 3), ("Sub-200ms query execution across 10,000+ cached local records", 3), ("Instant access to voter clusters during door-to-door outreach", 3), None],
        [("Hardware-Backed Security", 5), ("PIN + Biometrics (Fingerprint/Face), FLAG_SECURE screenshot block, SQLCipher encryption", 3), ("AES-256 database encryption with Android KeyStore HSM keys", 3), ("Safeguards sensitive campaign and citizen voter data", 3), None],
        [("Cloud Synchronization", 5), ("Background push of local mutations & pull of remote deltas via Supabase PostgREST", 3), ("Android WorkManager periodic sync with idempotent upsert operations", 3), ("Multi-device data durability without operational friction", 3), None],
        [],
        [("3. USER ROLES & AUTHORIZATION MATRIX", 8), None, None, None, None],
        [("User Role", 1), ("Description", 1), ("Data Access Rights", 1), ("System Permissions", 1), None],
        [("Application Owner / Field Worker", 5), ("Primary user operating the mobile application for voter outreach", 3), ("Full CRUD on own contacts; isolated by Supabase auth.uid()", 3), ("Manage contacts, export CSV/Excel, view dashboard, configure PIN", 3), None],
        [("System Administrator", 5), ("Cloud platform operator managing Supabase infrastructure", 3), ("No direct read access to plaintext contacts unless audited", 3), ("Monitor database health, storage limits, auth services, API logs", 3), None],
        [("Voter / Data Subject", 5), ("Citizen who voluntarily provides contact and anniversary details", 3), ("Right to request data correction, category update, or full purge", 3), ("No direct app access; data protected by ethical compliance", 3), None],
        [("Unauthenticated Guest", 5), ("Device possessor without PIN or biometric unlock", 3), ("Zero access; app locked behind PIN/BiometricPrompt", 3), ("Cannot view, search, export, or modify any database record", 3), None],
        [],
        [("4. ETHICAL & PRIVACY COMPLIANCE PRINCIPLES", 8), None, None, None, None],
        [("Principle", 1), ("Rule Definition", 1), ("Enforcement Mechanism", 1), None, None],
        [("Voluntary Informed Entry", 5), ("Contact data must be voluntarily provided by the voter/citizen.", 3), ("Consent disclaimer displayed on initial setup and export screens", 3), None, None],
        [("Strict Non-Inference", 5), ("The application shall NEVER secretly infer, scrape, or algorithmically derive political views.", 3), ("Category 1 ('Confirmed Supporter') restricted strictly to self-declared individuals", 3), None, None],
        [("Data Sovereignty & Purge", 5), ("Citizens retain the right to have their data rectified or completely deleted.", 3), ("One-click full purge cascades through local Room DB and cloud Supabase tables", 3), None, None],
        [("Zero Covert Tracking", 5), ("No background location tracking, contact book scraping, or telemetry profiling.", 3), ("Only user-typed contact fields and user-captured photos are stored", 3), None, None]
    ]
    wb.add_sheet("1_Project_Overview", s1_rows, [28, 48, 42, 38, 10])

    # =========================================================================
    # SHEET 2: FUNCTIONAL REQUIREMENTS (SRS)
    # =========================================================================
    s2_rows = [
        [("FUNCTIONAL REQUIREMENTS SPECIFICATION (TRACEABLE SRS)", 2), None, None, None, None, None, None],
        [("Complete baseline of all functional requirements with priority, validation rules, and traceability", 4), None, None, None, None, None, None],
        [],
        [("Req ID", 1), ("Module / Domain", 1), ("Requirement Statement", 1), ("Priority", 1), ("Input / Trigger", 1), ("Expected System Behavior", 1), ("Source Ref", 1)],
        # Authentication
        [("FR-AUTH-01", 5), ("Auth & App Lock", 3), ("Require authentication before displaying private contact data", 3), ("Must", 6), ("App startup / resume from background", 3), ("Display LockScreen; prevent UI rendering until authenticated", 3), ("SRS 5.1 / Plan Ph3", 3)],
        [("FR-AUTH-02", 5), ("Auth & App Lock", 3), ("Support 4/6-digit PIN protection with PBKDF2 hashing", 3), ("Must", 6), ("User enters PIN digits", 3), ("Compare PBKDF2 hash against EncryptedSharedPreferences; unlock on match", 3), ("SRS 5.1 / Plan Ph3", 3)],
        [("FR-AUTH-03", 5), ("Auth & App Lock", 3), ("Support BiometricPrompt authentication (Fingerprint / Face Unlock)", 3), ("Should", 7), ("Biometric sensor touched on LockScreen", 3), ("Authenticate via Android BiometricManager; unlock on success", 3), ("Plan Ph3 / SRS 5.1", 3)],
        [("FR-AUTH-04", 5), ("Auth & App Lock", 3), ("Provide immediate manual lock and secure sign-out actions", 3), ("Must", 6), ("User taps 'Lock App' or 'Sign Out' in Settings", 3), ("Clear in-memory auth state, close session, route to LockScreen", 3), ("SRS 5.1", 3)],
        [("FR-AUTH-05", 5), ("Auth & App Lock", 3), ("Rate-limit repeated failed PIN attempts with progressive timeout", 3), ("Must", 6), ("5 consecutive wrong PIN entries", 3), ("Lock input for 30s, escalating to 5m; log security event locally", 3), ("SRS 5.1", 3)],
        
        # Dashboard
        [("FR-DASH-01", 5), ("Dashboard", 3), ("Display total number of saved contacts in the user's directory", 3), ("Must", 6), ("Dashboard screen load / state change", 3), ("Query COUNT(*) from local Room DB; display formatted total", 3), ("SRS 5.2 / Plan Ph5", 3)],
        [("FR-DASH-02", 5), ("Dashboard", 3), ("Display individual contact counts for each of the 3 alignment categories", 3), ("Must", 6), ("Dashboard screen load", 3), ("Render 3 interactive metric cards: Supporter, Neutral, Other", 3), ("SRS 5.2 / Plan Ph5", 3)],
        [("FR-DASH-03", 5), ("Dashboard", 3), ("Interactive category cards act as quick-filters on click", 3), ("Must", 6), ("User taps a Category Summary card", 3), ("Navigate to ContactListScreen pre-filtered by the selected category", 3), ("Plan Ph5 / SRS 5.2", 3)],
        [("FR-DASH-04", 5), ("Dashboard", 3), ("Display 'Reminders Due Today' banner highlighting events occurring tomorrow", 3), ("Must", 6), ("App launch / foregrounding", 3), ("Query events where event_date - 1 day == today; show prominent banner", 3), ("SRS 5.2 / Plan Ph5", 3)],
        [("FR-DASH-05", 5), ("Dashboard", 3), ("Display horizontal scrolling row of 'Upcoming Events' for next 30 days", 3), ("Should", 7), ("Dashboard screen scroll", 3), ("Display sorted list of upcoming birthdays and anniversaries with days-remaining badge", 3), ("Plan Ph5 / SRS 5.2", 3)],
        
        # Categories
        [("FR-CAT-01", 5), ("Categories", 3), ("Support strictly three predefined categories in MVP: Supporter, Neutral, Other", 3), ("Must", 6), ("Contact creation or update", 3), ("Store category as ENUM ('SUPPORTER', 'NEUTRAL', 'OTHER')", 3), ("SRS 5.3 / Plan p.5", 3)],
        [("FR-CAT-02", 5), ("Categories", 3), ("Enforce single-category membership per contact in MVP baseline", 3), ("Must", 6), ("Category selection radio/toggle", 3), ("Ensure mutually exclusive selection; replacing previous category", 3), ("SRS 5.3", 3)],
        [("FR-CAT-03", 5), ("Categories", 3), ("One-tap category toggle components on ContactDetailScreen", 3), ("Must", 6), ("User taps chip (Supporter / Neutral / Other)", 3), ("Immediately update local Room record and trigger background cloud sync", 3), ("Plan Ph4", 3)],

        # Contact Management
        [("FR-CON-01", 5), ("Contact Profile", 3), ("Full legal name required input field", 3), ("Must", 6), ("Add/Edit form submission", 3), ("Validate non-empty; trim whitespace; store in full_name", 3), ("SRS 5.4 / Plan Ph4", 3)],
        [("FR-CON-02", 5), ("Contact Profile", 3), ("Father's / Spouse's name optional input field", 3), ("Should", 7), ("Add/Edit form input", 3), ("Store optional string for accurate voter roll disambiguation", 3), ("SRS 5.4 / Plan Ph4", 3)],
        [("FR-CON-03", 5), ("Contact Profile", 3), ("Standard 10-digit Indian mobile number validation", 3), ("Must", 6), ("Mobile number entry", 3), ("Regex match '^[6-9]\\d{9}$'; format as +91 XXXXX XXXXX; reject invalid", 3), ("SRS 5.4 / Plan Ph4", 3)],
        [("FR-CON-04", 5), ("Contact Profile", 3), ("Residential address multi-line text input", 3), ("Should", 7), ("Address field entry", 3), ("Store residential street/house details; max 255 chars", 3), ("SRS 5.4 / Plan Ph4", 3)],
        [("FR-CON-05", 5), ("Contact Profile", 3), ("Village / City selection with auto-complete from existing records", 3), ("Must", 6), ("Village field typing/selection", 3), ("Show suggestion dropdown from existing village values; index in DB", 3), ("SRS 5.4 / Plan Ph4", 3)],
        [("FR-CON-06", 5), ("Contact Profile", 3), ("Polling Ward / Area selector with search capability", 3), ("Must", 6), ("Ward field typing/selection", 3), ("Provide ward selector; index in DB for localized clustering", 3), ("SRS 5.4 / Plan Ph4", 3)],
        [("FR-CON-07", 5), ("Contact Profile", 3), ("Date of Birth picker with year, month, and day selection", 3), ("Should", 7), ("DOB date picker dialog", 3), ("Store ISO DATE; schedule D-1 reminder if enabled", 3), ("SRS 5.4 / Plan Ph4", 3)],
        [("FR-CON-08", 5), ("Contact Profile", 3), ("Wedding Anniversary date picker", 3), ("Should", 7), ("Anniversary picker dialog", 3), ("Store ISO DATE; schedule D-1 reminder if enabled", 3), ("SRS 5.4 / Plan Ph4", 3)],
        [("FR-CON-09", 5), ("Contact Profile", 3), ("Profile photo capture via Camera or Gallery with Coil integration", 3), ("Should", 7), ("Photo capture action", 3), ("Compress to WebP/JPEG (<2MB); save locally & upload to private Supabase bucket", 3), ("Plan Ph4 / SRS 5.4", 3)],
        [("FR-CON-10", 5), ("Contact Profile", 3), ("Contextual field observations & notes field", 3), ("Should", 7), ("Notes text entry", 3), ("Store encrypted notes text; access-controlled", 3), ("SRS 5.4 / Plan Ph4", 3)],
        [("FR-CON-11", 5), ("Contact Profile", 3), ("Automatic sync status tracking (SYNCED vs PENDING)", 3), ("Must", 6), ("Any local insert/update/delete", 3), ("Set sync_status = 'PENDING'; flip to 'SYNCED' once Supabase upsert succeeds", 3), ("Plan p.3 & Ph7", 3)],
        [("FR-CON-12", 5), ("Contact Profile", 3), ("Soft-delete flag ('is_deleted') for cloud synchronization reconciliation", 3), ("Must", 6), ("User deletes contact", 3), ("Set is_deleted = TRUE, sync_status = 'PENDING'; purge after sync", 3), ("Plan p.3 & Ph7", 3)],

        # Reminders
        [("FR-REM-01", 5), ("Reminder Engine", 3), ("Schedule exactly one notification for 1 calendar day before saved birthday", 3), ("Must", 6), ("Contact created / DOB updated", 3), ("Register AlarmManager alarm at 09:00 AM on (DOB - 1 day)", 3), ("SRS 5.5 / Plan p.3", 3)],
        [("FR-REM-02", 5), ("Reminder Engine", 3), ("Schedule exactly one notification for 1 calendar day before saved anniversary", 3), ("Must", 6), ("Contact created / Anniversary updated", 3), ("Register AlarmManager alarm at 09:00 AM on (Anniversary - 1 day)", 3), ("SRS 5.5 / Plan p.3", 3)],
        [("FR-REM-03", 5), ("Reminder Engine", 3), ("Zero duplicate notifications guarantee across app restarts and worker retries", 3), ("Must", 6), ("Reminder trigger event", 3), ("Check notification_logs for (contact_id, event_type, target_year); prevent re-dispatch", 3), ("SRS 5.5 / Plan p.4", 3)],
        [("FR-REM-04", 5), ("Reminder Engine", 3), ("Zero midnight (00:00) disturb alerts; notifications dispatch strictly at 09:00 AM", 3), ("Must", 6), ("Time evaluation logic", 3), ("Enforce local 09:00 AM alarm trigger; reject midnight executions", 3), ("SRS 5.5 / Plan p.4", 3)],
        [("FR-REM-05", 5), ("Reminder Engine", 3), ("Auto-cancel pending reminder jobs upon contact deletion", 3), ("Must", 6), ("User deletes contact", 3), ("Cancel AlarmManager PendingIntent; mark notification_logs as CANCELLED", 3), ("SRS 5.5 / Plan Ph6", 3)],
        [("FR-REM-06", 5), ("Reminder Engine", 3), ("Auto-reschedule reminder when DOB or Anniversary date is modified", 3), ("Must", 6), ("User updates occasion date", 3), ("Invalidate existing alarm; schedule new alarm for updated date - 1 day", 3), ("SRS 5.5 / Plan Ph6", 3)],
        [("FR-REM-07", 5), ("Reminder Engine", 3), ("System reboot recovery via RECEIVE_BOOT_COMPLETED broadcast receiver", 3), ("Must", 6), ("Android OS boot complete", 3), ("BootReceiver queries upcoming events and re-registers all AlarmManager alarms", 3), ("Plan p.4 / Ph6", 3)],

        # Search & Filters
        [("FR-SEARCH-01", 5), ("Search & Filters", 3), ("Real-time dynamic search matching contact legal name", 3), ("Must", 6), ("Search bar keystrokes", 3), ("Debounced query (<150ms); LIKE '%name%' on indexed SQLite column", 3), ("SRS 5.6 / Plan Ph5", 3)],
        [("FR-SEARCH-02", 5), ("Search & Filters", 3), ("Real-time search matching mobile number", 3), ("Must", 6), ("Numeric input in search bar", 3), ("Match normalized mobile digits; instant sub-100ms result", 3), ("SRS 5.6 / Plan Ph5", 3)],
        [("FR-SEARCH-03", 5), ("Search & Filters", 3), ("Filter contacts by Village / City", 3), ("Must", 6), ("Village filter chip / dropdown selection", 3), ("Filter list to contacts matching selected village", 3), ("SRS 5.6 / Plan Ph5", 3)],
        [("FR-SEARCH-04", 5), ("Search & Filters", 3), ("Filter contacts by Polling Ward / Area", 3), ("Must", 6), ("Ward filter chip / dropdown selection", 3), ("Filter list to contacts matching selected ward", 3), ("SRS 5.6 / Plan Ph5", 3)],
        [("FR-SEARCH-05", 5), ("Search & Filters", 3), ("Filter contacts by Alignment Category (Supporter / Neutral / Other)", 3), ("Must", 6), ("Category tab / chip selection", 3), ("Display only contacts in selected category", 3), ("SRS 5.6 / Plan Ph5", 3)],
        [("FR-SEARCH-06", 5), ("Search & Filters", 3), ("Combined multi-predicate filter (e.g. Village + Ward + Supporter)", 3), ("Must", 6), ("Multiple filter chips activated", 3), ("Execute AND query across indexed columns; instant view update", 3), ("SRS 5.6 / Plan Ph5", 3)],

        # Export & Portability
        [("FR-EXP-01", 5), ("Export & Portability", 3), ("Export contacts to standard CSV format via Android Storage Access Framework", 3), ("Must", 6), ("User taps 'Export CSV' in Settings", 3), ("Launch ACTION_CREATE_DOCUMENT; stream UTF-8 CSV with all contact fields", 3), ("SRS 5.7 / Plan Ph7", 3)],
        [("FR-EXP-02", 5), ("Export & Portability", 3), ("Export contacts to genuine Excel .xlsx spreadsheet format", 3), ("Should", 7), ("User taps 'Export Excel'", 3), ("Generate structured .xlsx with headers and formatting; save to SAF URI", 3), ("SRS 5.7 / Plan Ph7", 3)],
        [("FR-EXP-03", 5), ("Export & Portability", 3), ("Encrypted offline backup file creation", 3), ("Must", 6), ("User initiates 'Create Backup'", 3), ("Export password-protected encrypted archive containing SQLite dump and photos", 3), ("SRS 5.7", 3)],
        [("FR-EXP-04", 5), ("Export & Portability", 3), ("Database restore engine with duplicate validation", 3), ("Must", 6), ("User selects backup file to restore", 3), ("Verify checksum; decrypt; merge records without overwriting newer edits", 3), ("SRS 5.7", 3)],

        # Privacy
        [("FR-PRIV-01", 5), ("Privacy & Rights", 3), ("Display voluntary data collection notice and privacy terms", 3), ("Must", 6), ("First app launch", 3), ("Present voluntary data disclaimer; require affirmative user acceptance", 3), ("SRS 5.8 / SRS 10", 3)],
        [("FR-PRIV-02", 5), ("Privacy & Rights", 3), ("Granular edit and one-click complete purge of individual voter records", 3), ("Must", 6), ("User taps 'Delete Contact'", 3), ("Permanently delete record from local Room DB and issue cascade purge on Supabase", 3), ("Plan p.4 / SRS 5.8", 3)],
        [("FR-PRIV-03", 5), ("Privacy & Rights", 3), ("Prohibit algorithmic profiling or secret political inference", 3), ("Must", 6), ("Continuous system architecture", 3), ("Ensure no automated scoring, scraping, or profiling logic exists in codebase", 3), ("SRS 5.8", 3)],
        [("FR-PRIV-04", 5), ("Privacy & Rights", 3), ("FLAG_SECURE display protection against screenshotting and app previews", 3), ("Must", 6), ("App window creation", 3), ("Set WindowManager.LayoutParams.FLAG_SECURE across all Activities", 3), ("Plan p.4 / Ph3", 3)]
    ]
    wb.add_sheet("2_Functional_SRS", s2_rows, [14, 18, 48, 12, 32, 45, 18])

    # =========================================================================
    # SHEET 3: SYSTEM ARCHITECTURE & TECH STACK
    # =========================================================================
    s3_rows = [
        [("SYSTEM ARCHITECTURE & TECHNICAL STACK BLUEPRINT", 2), None, None, None, None],
        [("Detailed architectural layers, platform evaluation, and component specifications", 4), None, None, None, None],
        [],
        [("1. OFFLINE-FIRST ARCHITECTURAL PATTERN", 8), None, None, None, None],
        [("Architectural Pattern", 5), ("Offline-First Unidirectional Data Flow (MVI / Reactive Repository Pattern)", 3), None, None, None],
        [("Single Source of Truth", 5), ("Local Encrypted Room Database (SQLite + SQLCipher AES-256). The UI never observes network APIs directly; it only observes local Room database streams via Kotlin StateFlow.", 3), None, None, None],
        [("Cloud Synchronization", 5), ("Asynchronous background synchronization via Android WorkManager. Pushes local PENDING mutations to Supabase PostgREST and pulls remote delta records where updated_at > last_sync_timestamp.", 3), None, None, None],
        [("Notification Architecture", 5), ("Android AlarmManager with setExactAndAllowWhileIdle for deterministic 09:00 AM notifications, backed by a daily WorkManager ReconciliationWorker to ensure 100% dispatch reliability on battery-optimized OEMs.", 3), None, None, None],
        [],
        [("2. DETAILED TECH STACK SPECIFICATION", 8), None, None, None, None],
        [("Layer / Subsystem", 1), ("Selected Technology", 1), ("Version / Spec", 1), ("Architectural Responsibility & Rationale", 1), None],
        [("Mobile OS Platform", 5), ("Native Android", 3), ("Min SDK 26 (Android 8.0), Target SDK 35 (Android 15)", 3), ("Guarantees exact background execution, AlarmManager reliability, and hardware KeyStore security on battery-aggressive OEMs (Xiaomi, Vivo, Oppo, Samsung).", 3), None],
        [("UI Framework", 5), ("Jetpack Compose", 3), ("Compose BOM 2024.x + Material 3", 3), ("Modern declarative UI framework; reactive StateFlow binding; seamless dark/light theme; zero XML overhead.", 3), None],
        [("Architecture & DI", 5), ("Dagger Hilt", 3), ("2.50+", 3), ("Standard dependency injection for Android; simplifies viewmodel scoping, repository binding, and mock testing.", 3), None],
        [("Local Persistence", 5), ("Android Room Database + SQLCipher", 3), ("Room 2.6.x + SQLCipher 4.5.x", 3), ("Robust ORM with compile-time SQL verification, full AES-256 database encryption, and Kotlin Flow reactive streams.", 3), None],
        [("Cloud Backend", 5), ("Supabase Cloud (PaaS)", 3), ("PostgreSQL 15+ (Region: ap-south-1 Mumbai)", 3), ("Low-latency database in Mumbai; built-in Row-Level Security (RLS); PostgREST HTTP APIs; GoTrue Auth; Private Storage Buckets.", 3), None],
        [("Supabase SDK", 5), ("supabase-kt", 3), ("io.github.jan-tennert.supabase:bom:2.1.0", 3), ("Official community Kotlin multiplatform SDK for Supabase; modules: gotrue-kt (Auth), postgrest-kt (DB), storage-kt (Storage).", 3), None],
        [("HTTP Networking", 5), ("Ktor Client", 3), ("io.ktor:ktor-client-android:2.3.7", 3), ("Lightweight asynchronous Kotlin HTTP client engine powering Supabase network requests.", 3), None],
        [("Image Pipeline", 5), ("Coil (Coroutine Image Loader)", 3), ("Coil 2.5+", 3), ("Fast, memory-efficient image loading for Compose; handles thumbnail downsampling and encrypted disk caching.", 3), None],
        [("Background Execution", 5), ("Android WorkManager + AlarmManager", 3), ("WorkManager 2.9+", 3), ("AlarmManager setExactAndAllowWhileIdle handles pinpoint 09:00 AM reminders; WorkManager handles sync & boot reconciliation.", 3), None],
        [("Cryptographic Subsystem", 5), ("Android KeyStore + EncryptedSharedPreferences", 3), ("AndroidX Security Crypto 1.1.0", 3), ("Hardware-backed MasterKey generates and encrypts the 256-bit SQLCipher database passphrase and user PIN hashes.", 3), None],
        [("Biometrics", 5), ("AndroidX Biometric", 3), ("1.2.0+", 3), ("Unified BiometricPrompt API supporting Class 3 biometric sensors (Fingerprint, Face) with PIN fallback.", 3), None],
        [("Internationalization", 5), ("Android Resource Localization", 3), ("values/strings.xml & values-hi/strings.xml", 3), ("Native dual-language support (English & Hindi) with dynamic runtime switching via AppCompatDelegate.setApplicationLocales().", 3), None],
        [],
        [("3. PLATFORM COMPARISON: NATIVE ANDROID VS CROSS-PLATFORM VS WEB", 8), None, None, None, None],
        [("Evaluation Criterion", 1), ("Native Android (Recommended)", 1), ("Flutter / React Native", 1), ("Responsive Web App", 1), None],
        [("Exact 09:00 AM Alarm Reliability", 5), ("HIGH (AlarmManager exact alarms bypass Doze mode)", 3), ("MEDIUM (Requires native Android bridge code & custom alarms)", 3), ("LOW (Cannot fire if browser tab is closed without push worker)", 3), None],
        [("Aggressive OEM Background Killers", 5), ("HIGH (WorkManager + ForegroundService fallback)", 3), ("MEDIUM (Native bridges often killed by MIUI/ColorOS)", 3), ("POOR (Web workers suspended immediately when screen locks)", 3), None],
        [("Local Database Encryption", 5), ("HIGH (SQLCipher 256-bit AES with Hardware KeyStore)", 3), ("MEDIUM (Requires community plugins like flutter_secure_storage)", 3), ("LOW (IndexedDB encryption is software-based / limited)", 3), None],
        [("Screen Capture Block (FLAG_SECURE)", 5), ("100% NATIVE (Built-in WindowManager API)", 3), ("HIGH (Via third-party native plugin wrappers)", 3), ("IMPOSSIBLE (Browsers cannot block OS screenshots)", 3), None],
        [("Field Usability (Offline Remote)", 5), ("100% FULLY FUNCTIONAL OFFLINE", 3), ("100% FULLY FUNCTIONAL OFFLINE", 3), ("PARTIAL (Requires Service Worker PWA caching)", 3), None],
        [("Development Complexity", 5), ("Moderate (Modern Jetpack Compose accelerates UI)", 3), ("Moderate (Single codebase for potential iOS)", 3), ("Fast (Single web frontend)", 3), None]
    ]
    wb.add_sheet("3_Architecture_TechStack", s3_rows, [28, 35, 30, 55, 10])

    # =========================================================================
    # SHEET 4: SUPABASE & DATABASE SCHEMA
    # =========================================================================
    s4_rows = [
        [("SUPABASE CLOUD & LOCAL ROOM DATABASE SCHEMA SPECIFICATION", 2), None, None, None, None, None, None],
        [("Full schema definitions, types, performance indexes, and PostgreSQL Row-Level Security (RLS) rules", 4), None, None, None, None, None, None],
        [],
        [("1. CONTACTS TABLE ('contacts')", 8), None, None, None, None, None, None],
        [("Column Name", 1), ("Data Type", 1), ("Constraints & Indexes", 1), ("Default Value", 1), ("Null?", 1), ("Description & Business Purpose", 1), ("Local DB Mapping", 1)],
        [("id", 5), ("UUID", 3), ("PRIMARY KEY", 3), ("gen_random_uuid()", 3), ("NOT NULL", 3), ("Unique contact identifier, generated client-side to enable immediate offline creation", 3), ("@PrimaryKey val id: UUID", 3)],
        [("user_id", 5), ("UUID", 3), ("FOREIGN KEY -> auth.users(id), INDEXED", 3), ("auth.uid()", 3), ("NOT NULL", 3), ("Owner's Supabase auth user ID; ensures multi-tenant data isolation", 3), ("val userId: UUID", 3)],
        [("full_name", 5), ("TEXT", 3), ("INDEXED (Search query support)", 3), ("None", 3), ("NOT NULL", 3), ("Full legal name of the voter or contact person", 3), ("val fullName: String", 3)],
        [("father_name", 5), ("TEXT", 3), ("None", 3), ("NULL", 3), ("NULLABLE", 3), ("Father's or Spouse's name used for electoral roll disambiguation", 3), ("val fatherName: String?", 3)],
        [("mobile_number", 5), ("TEXT", 3), ("INDEXED (idx_contacts_mobile)", 3), ("None", 3), ("NOT NULL", 3), ("Primary 10-digit mobile number, normalized to standard format", 3), ("val mobileNumber: String", 3)],
        [("address", 5), ("TEXT", 3), ("None", 3), ("NULL", 3), ("NULLABLE", 3), ("Full street or residential address of the contact", 3), ("val address: String?", 3)],
        [("village_city", 5), ("TEXT", 3), ("INDEXED (idx_contacts_village)", 3), ("None", 3), ("NULLABLE", 3), ("Settlement or city identifier used for regional cluster filtering", 3), ("val villageCity: String?", 3)],
        [("ward_area", 5), ("TEXT", 3), ("INDEXED (idx_contacts_ward)", 3), ("None", 3), ("NULLABLE", 3), ("Local electoral section or polling ward identifier for booth filtering", 3), ("val wardArea: String?", 3)],
        [("dob", 5), ("DATE", 3), ("INDEXED (Upcoming birthday queries)", 3), ("NULL", 3), ("NULLABLE", 3), ("Date of Birth; triggers precision D-1 birthday reminder", 3), ("val dob: LocalDate?", 3)],
        [("anniversary_date", 5), ("DATE", 3), ("INDEXED (Upcoming anniversary queries)", 3), ("NULL", 3), ("NULLABLE", 3), ("Wedding Anniversary Date; triggers precision D-1 anniversary reminder", 3), ("val anniversaryDate: LocalDate?", 3)],
        [("photo_url", 5), ("TEXT", 3), ("None", 3), ("NULL", 3), ("NULLABLE", 3), ("Supabase private storage path or local cached file path", 3), ("val photoUrl: String?", 3)],
        [("notes", 5), ("TEXT", 3), ("None", 3), ("NULL", 3), ("NULLABLE", 3), ("Contextual field observations, meeting notes, or follow-up memos", 3), ("val notes: String?", 3)],
        [("category", 5), ("contact_category", 3), ("ENUM ('SUPPORTER', 'NEUTRAL', 'OTHER')", 3), ("'NEUTRAL'", 3), ("NOT NULL", 3), ("Voter political alignment category (Supporter, Neutral, Other)", 3), ("val category: ContactCategory", 3)],
        [("sync_status", 5), ("TEXT", 3), ("ENUM ('SYNCED', 'PENDING')", 3), ("'PENDING'", 3), ("NOT NULL", 3), ("Local persistence flag tracking pending mutations requiring cloud push", 3), ("val syncStatus: SyncStatus", 3)],
        [("is_deleted", 5), ("BOOLEAN", 3), ("Default FALSE", 3), ("FALSE", 3), ("NOT NULL", 3), ("Soft-delete tombstone flag for bi-directional cloud synchronization", 3), ("val isDeleted: Boolean", 3)],
        [("created_at", 5), ("TIMESTAMPTZ", 3), ("None", 3), ("NOW()", 3), ("NOT NULL", 3), ("Timestamp of initial contact creation", 3), ("val createdAt: Instant", 3)],
        [("updated_at", 5), ("TIMESTAMPTZ", 3), ("INDEXED (Delta sync queries)", 3), ("NOW()", 3), ("NOT NULL", 3), ("Timestamp of last modification; used by SyncWorker to pull deltas", 3), ("val updatedAt: Instant", 3)],
        [],
        [("2. NOTIFICATION LOGS TABLE ('notification_logs')", 8), None, None, None, None, None, None],
        [("Column Name", 1), ("Data Type", 1), ("Constraints & Indexes", 1), ("Default Value", 1), ("Null?", 1), ("Description & Business Purpose", 1), ("Local DB Mapping", 1)],
        [("id", 5), ("UUID", 3), ("PRIMARY KEY", 3), ("gen_random_uuid()", 3), ("NOT NULL", 3), ("Unique log identifier for the reminder event", 3), ("@PrimaryKey val id: UUID", 3)],
        [("contact_id", 5), ("UUID", 3), ("FOREIGN KEY -> contacts(id) ON DELETE CASCADE", 3), ("None", 3), ("NOT NULL", 3), ("Reference to the target contact person receiving greeting", 3), ("val contactId: UUID", 3)],
        [("event_type", 5), ("TEXT", 3), ("ENUM ('DOB', 'ANNIVERSARY')", 3), ("None", 3), ("NOT NULL", 3), ("Category of occasion being reminded (Birthday vs Anniversary)", 3), ("val eventType: EventType", 3)],
        [("target_year", 5), ("INT", 3), ("COMPOUND UNIQUE with (contact_id, event_type)", 3), ("None", 3), ("NOT NULL", 3), ("Calendar year of the occasion; guarantees 0 duplicate dispatches per year", 3), ("val targetYear: Int", 3)],
        [("status", 5), ("TEXT", 3), ("ENUM ('SCHEDULED', 'SENT', 'CANCELLED')", 3), ("'SCHEDULED'", 3), ("NOT NULL", 3), ("Current execution status of the reminder notification", 3), ("val status: NotificationStatus", 3)],
        [("sent_at", 5), ("TIMESTAMPTZ", 3), ("None", 3), ("NOW()", 3), ("NOT NULL", 3), ("Timestamp of physical notification dispatch to device notification tray", 3), ("val sentAt: Instant", 3)],
        [],
        [("3. ROW-LEVEL SECURITY (RLS) POLICIES", 8), None, None, None, None, None, None],
        [("Target Resource", 1), ("Policy Name", 1), ("Command", 1), ("Security Expression (USING / WITH CHECK)", 1), None, None, None],
        [("public.contacts", 5), ("Users manage own contacts", 3), ("ALL (SELECT, INSERT, UPDATE, DELETE)", 3), ("USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)", 3), None, None, None],
        [("storage.objects", 5), ("Users isolation photo access", 3), ("ALL", 3), ("USING (bucket_id = 'contact-photos' AND auth.uid()::text = (storage.foldername(name))[1])", 3), None, None, None],
        [],
        [("4. COMPLETE SUPABASE SQL DDL SCRIPT", 8), None, None, None, None, None, None],
        [("SQL Script Block", 1), ("Executable PostgreSQL Statements", 1), None, None, None, None, None],
        [("Enums", 5), ("CREATE TYPE contact_category AS ENUM ('SUPPORTER', 'NEUTRAL', 'OTHER');", 12), None, None, None, None, None],
        [("Contacts Table", 5), ("CREATE TABLE contacts (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,\n  full_name TEXT NOT NULL,\n  father_name TEXT,\n  mobile_number TEXT NOT NULL,\n  address TEXT,\n  village_city TEXT,\n  ward_area TEXT,\n  dob DATE,\n  anniversary_date DATE,\n  photo_url TEXT,\n  notes TEXT,\n  category contact_category DEFAULT 'NEUTRAL',\n  is_deleted BOOLEAN DEFAULT FALSE,\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n);", 12), None, None, None, None, None],
        [("Indexes", 5), ("CREATE INDEX idx_contacts_user_id ON contacts(user_id);\nCREATE INDEX idx_contacts_mobile ON contacts(mobile_number);\nCREATE INDEX idx_contacts_village ON contacts(village_city);\nCREATE INDEX idx_contacts_ward ON contacts(ward_area);\nCREATE INDEX idx_contacts_updated_at ON contacts(updated_at);", 12), None, None, None, None, None],
        [("RLS Enablement", 5), ("ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;\nCREATE POLICY \"Users manage own contacts\" ON contacts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);", 12), None, None, None, None, None],
        [("Storage Setup", 5), ("-- Create bucket 'contact-photos' (Private)\n-- Policy: CREATE POLICY \"Users isolation photo access\" ON storage.objects FOR ALL USING (bucket_id = 'contact-photos' AND auth.uid()::text = (storage.foldername(name))[1]) WITH CHECK (bucket_id = 'contact-photos' AND auth.uid()::text = (storage.foldername(name))[1]);", 12), None, None, None, None, None]
    ]
    wb.add_sheet("4_Database_Supabase_Schema", s4_rows, [18, 16, 35, 18, 12, 45, 30])

    # =========================================================================
    # SHEET 5: REMINDER & NOTIFICATION ENGINE
    # =========================================================================
    s5_rows = [
        [("EXACT ONE-DAY-PRIOR NOTIFICATION ENGINE SPECIFICATION", 2), None, None, None, None],
        [("Comprehensive algorithm, timing specifications, duplicate suppression, and reboot survival logic", 4), None, None, None, None],
        [],
        [("1. ENGINE TIMING & SCHEDULING SPECIFICATIONS", 8), None, None, None, None],
        [("Parameter", 1), ("Rule Specification", 1), ("Rationale & Technical Details", 1), None, None],
        [("Reminder Time", 5), ("Exactly 09:00 AM local device time (Asia/Kolkata standard)", 3), ("Morning 9:00 AM is optimal for community leaders to plan daily greetings and phone calls.", 3), None, None],
        [("Reminder Calendar Date", 5), ("Occasion Date MINUS 1 calendar day (Date - 1 day)", 3), ("Calculated using local civil calendar dates (LocalDate.minusDays(1)), NEVER a naive 24-hour timestamp subtraction.", 3), None, None],
        [("Zero Midnight Disturbance", 5), ("Strict prohibition of notifications firing at 00:00:00 midnight", 3), ("A 24-hour subtraction from midnight would trigger an alert at 12:00 AM, waking the user. The engine strictly pins to 09:00 AM.", 3), None, None],
        [("Zero Same-Day Disturbance", 5), ("No second notification dispatched on the actual birthday/anniversary date", 3), ("The business requirement states exactly ONE alert 1 day prior, avoiding clutter.", 3), None, None],
        [("Leap Year Policy (Feb 29)", 5), ("In non-leap years, reminder for Feb 29 fires on February 27 (for celebration on Feb 28)", 3), ("Guarantees that voters born on Feb 29 receive their birthday greeting in standard 365-day years.", 3), None, None],
        [],
        [("2. DUPLICATE SUPPRESSION & IDEMPOTENCY ARCHITECTURE", 8), None, None, None, None],
        [("Component", 1), ("Mechanism", 1), ("Failure Prevention Guarantee", 1), None, None],
        [("Unique Compound Key", 5), ("(contact_id, event_type, target_year)", 3), ("A unique SQLite constraint guarantees that a contact can NEVER receive more than one birthday log entry in a single year.", 3), None, None],
        [("Pre-Dispatch Atomic Check", 5), ("SELECT COUNT(*) FROM notification_logs WHERE contact_id = ? AND event_type = ? AND target_year = ?", 3), ("If an entry exists with status 'SENT', the worker immediately terminates without showing a notification.", 3), None, None],
        [("Post-Dispatch Commit", 5), ("INSERT INTO notification_logs (id, contact_id, event_type, target_year, status, sent_at) VALUES (?, ?, ?, ?, 'SENT', NOW())", 3), ("Executed immediately after NotificationManager.notify() within an atomic database transaction.", 3), None, None],
        [("Rescheduling on Edit", 5), ("Invalidate old AlarmManager PendingIntent when DOB/Anniversary changes in AddEditContactScreen", 3), ("Deletes previous SCHEDULED log and recomputes new 09:00 AM alarm date.", 3), None, None],
        [("Cancellation on Delete", 5), ("Cancel AlarmManager PendingIntent and remove from notification_logs on contact soft/hard delete", 3), ("Guarantees that deleted voters never generate phantom reminder alerts.", 3), None, None],
        [],
        [("3. BACKGROUND EXECUTION & SYSTEM REBOOT RECOVERY", 8), None, None, None, None],
        [("Subsystem", 1), ("Implementation Class", 1), ("Execution Guarantee", 1), None, None],
        [("Exact Alarm Dispatch", 5), ("Android AlarmManager.setExactAndAllowWhileIdle()", 3), ("Bypasses Android Doze mode and App Standby buckets to wake the device CPU at 09:00 AM.", 3), None, None],
        [("Broadcast Receiver", 5), ("ReminderBroadcastReceiver : BroadcastReceiver", 3), ("Receives system alarm intent, triggers ReminderWorker, and posts NotificationCompat alert.", 3), None, None],
        [("Reboot Recovery", 5), ("BootReceiver : BroadcastReceiver (RECEIVE_BOOT_COMPLETED, LOCKED_BOOT_COMPLETED)", 3), ("Android OS clears AlarmManager on device power down. BootReceiver re-queries Room DB on startup and registers missing alarms.", 3), None, None],
        [("Fail-Safe Reconciliation", 5), ("ReconciliationWorker : CoroutineWorker (PeriodicWorkRequest daily @ 09:00 AM)", 3), ("Acts as an autonomous safety net for aggressive battery-killer devices (Xiaomi, Vivo, Oppo) that suppress alarms.", 3), None, None],
        [],
        [("4. LOCALIZED NOTIFICATION COPY TEMPLATES", 8), None, None, None, None],
        [("Event Type", 1), ("English Notification Copy (values/strings.xml)", 1), ("Hindi Notification Copy (values-hi/strings.xml)", 1), None, None],
        [("Birthday (DOB)", 5), ("\"Tomorrow is %s's birthday.\"", 3), ("\"कल %s का जन्मदिन है।\"", 3), None, None],
        [("Anniversary", 5), ("\"Tomorrow is %s's marriage anniversary.\"", 3), ("\"कल %s की शादी की वर्षगांठ है।\"", 3), None, None],
        [("Notification Channel", 5), ("Channel ID: 'occasions_channel', Name: 'Upcoming Occasions', Importance: HIGH", 3), ("Plays default system notification sound with vibration alert", 3), None, None]
    ]
    wb.add_sheet("5_Reminder_Engine_Spec", s5_rows, [25, 45, 55, 10, 10])

    # =========================================================================
    # SHEET 6: SECURITY, PRIVACY & APP LOCK
    # =========================================================================
    s6_rows = [
        [("SECURITY, PRIVACY & DATA SOVEREIGNTY ARCHITECTURE", 2), None, None, None, None],
        [("Cryptographic safeguards, hardware key protection, display shielding, and compliance rules", 4), None, None, None, None],
        [],
        [("1. SECURITY SUBSYSTEM SPECIFICATIONS", 8), None, None, None, None],
        [("Security Domain", 1), ("Technical Implementation", 1), ("Cryptographic Standards", 1), ("Threat Mitigation", 1), None],
        [("App Lock (PIN)", 5), ("User sets 4 or 6-digit numerical PIN to unlock the application", 3), ("PBKDF2 with SHA-256, 10,000 iterations, 32-byte cryptographically secure salt", 3), ("Mitigates brute-force attacks and unauthorized physical device access.", 3), None],
        [("Biometric Unlock", 5), ("AndroidX BiometricPrompt API supporting Class 3 biometrics", 3), ("Hardware-backed BiometricManager (Fingerprint, 3D Face Unlock)", 3), ("Provides friction-free, secure field access with PIN fallback.", 3), None],
        [("Key Protection", 5), ("MasterKey stored inside Android KeyStore (TEE / Secure Element)", 3), ("AES-256 GCM authenticated encryption via EncryptedSharedPreferences", 3), ("Prevents extraction of database encryption keys even on rooted devices.", 3), None],
        [("Database Encryption", 5), ("Local Room SQLite encrypted using SQLCipher", 3), ("256-bit AES cipher in CBC mode with HMAC-SHA512 page integrity checks", 3), ("Prevents offline data dumping if the device's physical flash storage is inspected.", 3), None],
        [("Screen Display Shielding", 5), ("WindowManager.LayoutParams.FLAG_SECURE enforced across all Activities", 3), ("Android OS window compositor restriction", 3), ("Blocks screenshot capture, screen recording malware, and Recent Apps task switcher thumbnails.", 3), None],
        [("Transport Layer Security", 5), ("HTTPS / TLS 1.3 enforced for all Supabase API and storage interactions", 3), ("TLS 1.3 cipher suites with certificate chain verification", 3), ("Mitigates Man-in-the-Middle (MitM) packet sniffing on public Wi-Fi/cellular networks.", 3), None],
        [("Cloud Data Isolation", 5), ("Supabase PostgreSQL Row-Level Security (RLS) policies", 3), ("Kernel-enforced policy: USING (auth.uid() = user_id)", 3), ("Ensures strict multi-tenant isolation; users cannot access another campaign worker's contacts.", 3), None],
        [("Private Photo Storage", 5), ("Supabase Storage bucket 'contact-photos' configured as Private", 3), ("Storage RLS policy restricting folder path to auth.uid()", 3), ("Prevents public crawling or enumeration of voter profile pictures.", 3), None],
        [],
        [("2. DATA SOVEREIGNTY & ETHICAL PRIVACY CONTROLS", 8), None, None, None, None],
        [("Privacy Control", 1), ("Implementation Method", 1), ("Compliance Standard", 1), None, None],
        [("Voluntary Informed Consent", 5), ("Explicit notice shown to user upon setup clarifying that voter records must be voluntarily supplied", 3), ("Informed Consent baseline; GDPR / DPDP Act alignment", 3), None, None],
        [("Strict Non-Inference", 5), ("The system shall NOT infer or derive voting preferences algorithmically or covertly", 3), ("Ethical Data Stewardship; category 1 limited to self-declared confirmed supporters", 3), None, None],
        [("Right to Correction", 5), ("Every voter field (name, phone, address, village, category) is instantly editable", 3), ("Maintains accuracy and voter data sovereignty", 3), None, None],
        [("Right to Erasure / Purge", 5), ("Granular one-click delete permanently purges record from Room DB and Supabase Cloud", 3), ("Cascades deletion to notification_logs and storage buckets", 3), None, None],
        [("Audit Logging Sanitation", 5), ("Application logs never print contact phone numbers, voter names, or encryption keys", 3), ("Prevents log leaks in crash reporting (Crashlytics/Timber)", 3), None, None]
    ]
    wb.add_sheet("6_Security_Privacy_AppLock", s6_rows, [24, 45, 40, 45, 10])

    # =========================================================================
    # SHEET 7: STEP-BY-STEP CODING PLAN (8 PHASES)
    # =========================================================================
    s7_rows = [
        [("STEP-BY-STEP IMPLEMENTATION & CODING PLAN (PHASES 1 TO 8)", 2), None, None, None, None],
        [("Comprehensive engineering roadmap matching Architecture & Supabase Coding Plan specifications", 4), None, None, None, None],
        [],
        [("Phase #", 1), ("Phase Name", 1), ("Core Engineering Deliverables", 1), ("Key Technical Classes / Files", 1), ("Milestone Acceptance Check", 1)],
        [("Phase 1", 5), ("Project Architecture & Setup", 3), ("Initialize Android Gradle project (Min SDK 26, Target SDK 35). Configure dependencies: Hilt DI, Jetpack Compose Material 3, Room, SQLCipher, WorkManager, Biometric API, Coil, and supabase-kt BOM.", 3), ("build.gradle.kts, libs.versions.toml, Application.kt, MainActivity.kt", 3), ("Clean Gradle build; Hilt dependency injection graphs compile successfully.", 3)],
        [("Phase 2", 5), ("Local Encrypted Persistence", 3), ("Generate 256-bit AES passphrase using Android KeyStore into EncryptedSharedPreferences. Configure Room with SupportFactory(SQLiteDatabase.getBytes()). Define ContactEntity and NotificationLogEntity with indices. Create ContactDao with full search/filter queries.", 3), ("AppDatabase.kt, ContactEntity.kt, NotificationLogEntity.kt, ContactDao.kt, DatabaseKeyManager.kt", 3), ("Room database tests pass; SQLCipher encrypts SQLite file on disk; DAO queries execute <50ms.", 3)],
        [("Phase 3", 5), ("Authentication & Security", 3), ("Implement Supabase Auth flow with Phone/Email OTP. Build PinSetupScreen and LockScreen using Jetpack Compose. Integrate BiometricPrompt fallback flow. Configure activity window flags (FLAG_SECURE) to block screenshots and previews.", 3), ("PinSetupScreen.kt, LockScreen.kt, BiometricAuthManager.kt, AuthRepository.kt, SecurityPreferences.kt", 3), ("App requires PIN/biometrics on launch; recent app switcher thumbnail is blanked out.", 3)],
        [("Phase 4", 5), ("Core Contact Management", 3), ("Build AddEditContactScreen featuring 10-digit Indian mobile validation, village/ward selectors, custom date pickers, and Coil image capture. Implement one-tap category toggle components (SUPPORTER, NEUTRAL, OTHER) on ContactDetailScreen.", 3), ("AddEditContactScreen.kt, ContactDetailScreen.kt, ContactViewModel.kt, IndianPhoneValidator.kt", 3), ("Contacts saved locally with photo; category chips update state instantly with 1-tap.", 3)],
        [("Phase 5", 5), ("Dashboard & Filtering", 3), ("Build DashboardScreen with total contact counter, 3 category summary cards, 'Reminders Due Today' banner, and 'Upcoming Events' scrolling row. Implement ContactListScreen with multi-field search (Name/Mobile) and multi-token filters (Village, Ward, Category).", 3), ("DashboardScreen.kt, ContactListScreen.kt, FilterChipGroup.kt, DashboardViewModel.kt", 3), ("Dashboard counts update reactively; multi-filter returns exact matching contact subsets.", 3)],
        [("Phase 6", 5), ("Precision Reminder Engine", 3), ("Declare POST_NOTIFICATIONS and SCHEDULE_EXACT_ALARM permissions. Implement AlarmManager scheduling 1 day prior at 09:00 AM. Create ReminderWorker and BootReceiver (ON_BOOT_COMPLETED). Enforce duplicate prevention inside notification_logs.", 3), ("AlarmScheduler.kt, ReminderWorker.kt, ReminderReceiver.kt, BootReceiver.kt, NotificationHelper.kt", 3), ("Notification dispatches at 09:00 AM 1-day prior; zero midnight alerts; alarms restore after device reboot.", 3)],
        [("Phase 7", 5), ("Data Portability & Cloud Sync", 3), ("Implement offline CSV and Excel (.xlsx) export via Android Storage Access Framework (SAF). Build background SyncWorker executing bidirectional sync: push PENDING contacts via PostgREST upsert and pull remote deltas where updated_at > last_sync.", 3), ("SyncWorker.kt, CsvExporter.kt, ExcelExporter.kt, SupabaseSyncRepository.kt, SafPickerHelper.kt", 3), ("CSV/Excel files export directly to user storage; cloud sync updates Supabase without duplicate records.", 3)],
        [("Phase 8", 5), ("Localization & QA Hardening", 3), ("Populate complete English and Hindi string files (values-hi/strings.xml). Implement dynamic language switcher. Conduct comprehensive testing: Feb 29 leap-year edge cases, reboot recovery, offline conflict resolution, and 10,000+ mock voter stress tests.", 3), ("values/strings.xml, values-hi/strings.xml, LocaleManager.kt, StressDataGenerator.kt, AppTestSuite.kt", 3), ("Full UI renders fluently in Hindi & English; 10,000 voter list scrolls at 60 FPS without jank.", 3)]
    ]
    wb.add_sheet("7_Coding_Plan_8_Phases", s7_rows, [12, 28, 48, 38, 38])

    # =========================================================================
    # SHEET 8: ACCEPTANCE TEST MATRIX
    # =========================================================================
    s8_rows = [
        [("COMPREHENSIVE ACCEPTANCE TEST MATRIX (AT-01 TO AT-20)", 2), None, None, None, None, None],
        [("Full test verification scenarios covering functional, edge cases, security, and performance criteria", 4), None, None, None, None, None],
        [],
        [("Test ID", 1), ("Test Scenario / Capability", 1), ("Pre-Conditions", 1), ("Test Execution Steps", 1), ("Expected System Result", 1), ("Priority", 1)],
        [("AT-01", 5), ("Create Valid Contact", 3), ("User authenticated", 3), ("Fill Name, Mobile '9876543210', Village 'Rampur', select Category 'Supporter', tap Save", 3), ("Record stored in Room DB; sync_status='PENDING'; Dashboard total increments by 1", 3), ("Must", 6)],
        [("AT-02", 5), ("Assign Three Categories", 3), ("App running", 3), ("Create 3 contacts; assign Supporter, Neutral, and Other respectively", 3), ("Each contact appears under its respective category count and list chip", 3), ("Must", 6)],
        [("AT-03", 5), ("Move Category (Neutral -> Supporter)", 3), ("Existing Neutral contact", 3), ("Open contact detail screen; tap 'Confirmed Supporter' chip", 3), ("Category updates immediately; Supporter count increases, Neutral decreases; 0 duplicates", 3), ("Must", 6)],
        [("AT-04", 5), ("Search by Contact Name", 3), ("Directory has 100+ contacts", 3), ("Type partial name 'Rajesh' in search bar", 3), ("List filters in <100ms showing only matching contacts; non-matching are hidden", 3), ("Must", 6)],
        [("AT-05", 5), ("Search by Mobile Number", 3), ("Directory has contacts", 3), ("Type 5 digits '98765' in search bar", 3), ("Matches contacts containing those digits; instant response", 3), ("Must", 6)],
        [("AT-06", 5), ("Compound Multi-Filter", 3), ("Contacts in various villages/wards", 3), ("Select Village 'Kalyan' + Ward '12' + Category 'Supporter'", 3), ("Only contacts matching all three criteria are displayed in the list", 3), ("Must", 6)],
        [("AT-07", 5), ("Birthday Reminder Exact D-1", 3), ("Contact DOB set to Tomorrow", 3), ("Set system clock to 09:00 AM on today (D-1)", 3), ("Notification dispatches: 'Tomorrow is [Name]'s birthday.'; Log recorded with status='SENT'", 3), ("Must", 6)],
        [("AT-08", 5), ("Zero Duplicate on Occasion Day", 3), ("Reminder sent on D-1 (AT-07)", 3), ("Advance system clock to 00:00:00 midnight and 09:00 AM on occasion day (D)", 3), ("NO notification dispatched; notification_logs blocks duplicate dispatch", 3), ("Must", 6)],
        [("AT-09", 5), ("Anniversary Reminder Exact D-1", 3), ("Contact Anniversary set to Tomorrow", 3), ("Set system clock to 09:00 AM today", 3), ("Notification dispatches: 'Tomorrow is [Name]'s marriage anniversary.'", 3), ("Must", 6)],
        [("AT-10", 5), ("Date Edit Rescheduling", 3), ("Contact has pending reminder", 3), ("Edit DOB to a different date 10 days later", 3), ("Old AlarmManager alarm cancelled; new alarm scheduled for (New Date - 1 day) @ 09:00 AM", 3), ("Must", 6)],
        [("AT-11", 5), ("Contact Deletion Cleanup", 3), ("Contact has pending reminder", 3), ("Delete contact from app", 3), ("AlarmManager alarm cancelled; record soft-deleted/purged; no alert ever fires", 3), ("Must", 6)],
        [("AT-12", 5), ("Notification Permission Denied", 3), ("User revokes POST_NOTIFICATIONS", 3), ("Open application on D-1 date", 3), ("Prominent 'Reminders Due Today' banner still appears on Dashboard UI", 3), ("Must", 6)],
        [("AT-13", 5), ("CSV & Excel Export", 3), ("Directory populated", 3), ("Tap 'Export CSV' in Settings; select destination folder in SAF picker", 3), ("File generated successfully; opens in Excel/Google Sheets with all columns intact", 3), ("Must", 6)],
        [("AT-14", 5), ("Backup & Full Restore", 3), ("Active database with contacts", 3), ("Create encrypted backup; clear app data; run restore from file", 3), ("100% of contacts, categories, notes, and photos restored without data loss", 3), ("Must", 6)],
        [("AT-15", 5), ("Multi-Tenant RLS Security", 3), ("Two distinct Supabase accounts", 3), ("User B attempts to query User A's contact UUID via PostgREST API", 3), ("PostgreSQL RLS rejects query with 404/Empty result; 0 data leak", 3), ("Must", 6)],
        [("AT-16", 5), ("Mobile Number Input Validation", 3), ("Add contact form", 3), ("Enter invalid phone '12345' or 'ABCD'", 3), ("Save button disabled or validation error shown; prevents invalid DB entry", 3), ("Must", 6)],
        [("AT-17", 5), ("FLAG_SECURE Screen Block", 3), ("App running on screen", 3), ("Attempt Android screenshot (Power+VolDown) and open Recent Apps switcher", 3), ("Screenshot fails with 'Taking screenshots isn't allowed by the app'; switcher shows blank card", 3), ("Must", 6)],
        [("AT-18", 5), ("Reboot Alarm Recovery", 3), ("Active pending alarms in DB", 3), ("Reboot Android device; broadcast ACTION_BOOT_COMPLETED", 3), ("BootReceiver wakes; queries Room DB; re-registers all 09:00 AM AlarmManager alarms", 3), ("Must", 6)],
        [("AT-19", 5), ("Leap Year Feb 29 Birthday", 3), ("Contact DOB is Feb 29", 3), ("Test during non-leap year (e.g. 2025)", 3), ("Reminder dispatches on February 27 for Feb 28 observance without crash", 3), ("Should", 7)],
        [("AT-20", 5), ("10,000 Contact Stress Test", 3), ("10,000 synthetic voter records", 3), ("Perform full-text search and fling scroll on ContactListScreen", 3), ("Search results return in <150ms; LazyColumn scroll sustains 60 FPS without dropped frames", 3), ("Should", 7)]
    ]
    wb.add_sheet("8_Acceptance_Test_Matrix", s8_rows, [12, 28, 28, 42, 45, 12])

    # =========================================================================
    # SHEET 9: DECISIONS & ASSUMPTIONS (Q-01 TO Q-10)
    # =========================================================================
    s9_rows = [
        [("ARCHITECTURAL DECISIONS, ASSUMPTIONS & STAKEHOLDER SIGN-OFF (Q-01 TO Q-10)", 2), None, None, None, None],
        [("Explicit assumptions and architectural decisions identified from SRS v1.0 and Architecture Blueprint", 4), None, None, None, None],
        [],
        [("Decision ID", 1), ("Architectural Topic", 1), ("Recommended Baseline (Engineering Decision)", 1), ("Rationale & Impact Analysis", 1), ("Status", 1)],
        [("Q-01", 5), ("Platform: Native Android vs Web", 3), ("Native Android (Kotlin + Jetpack Compose) as primary; Web as secondary companion", 3), ("Native Android is essential to guarantee strict 09:00 AM AlarmManager execution and background sync on aggressive battery-killing OEMs (Xiaomi, Vivo, Oppo, Samsung).", 3), ("Approved", 6)],
        [("Q-02", 5), ("Account Tenancy & Sharing", 3), ("Private, isolated single-owner contact books in MVP; multi-user team sharing in Phase 2", 3), ("Maintains strict data sovereignty, simplifies RLS security, and prevents accidental cross-campaign voter leaks.", 3), ("Approved", 6)],
        [("Q-03", 5), ("Notification Delivery Channel", 3), ("Local Android system notifications tray + Dashboard 'Reminders Due Today' banner", 3), ("Local notifications require zero SMS/WhatsApp gateway costs, work 100% offline, and guarantee instantaneous delivery.", 3), ("Approved", 6)],
        [("Q-04", 5), ("Reminder Clock Time", 3), ("Default to 09:00 AM local morning time (configurable in Settings)", 3), ("Morning 9:00 AM allows volunteers to plan greetings during regular daytime hours; eliminates midnight disturbances.", 3), ("Approved", 6)],
        [("Q-05", 5), ("Time Zone Standard", 3), ("Default to 'Asia/Kolkata' (IST UTC+5:30) with fallback to device local timezone", 3), ("Matches the target demographic in India; accounts for local civil calendar date boundaries accurately.", 3), ("Approved", 6)],
        [("Q-06", 5), ("Export File Formats", 3), ("Both CSV (RFC 4180) and native Excel (.xlsx) generated directly via SAF", 3), ("CSV is universally compatible; native Excel provides clean column headers, bold titles, and auto-filters.", 3), ("Approved", 6)],
        [("Q-07", 5), ("Backup Storage Location", 3), ("Dual approach: User-downloadable encrypted backup file + Optional Supabase cloud sync", 3), ("Empowers user with physical data custody while enabling seamless device switching via cloud restore.", 3), ("Approved", 6)],
        [("Q-08", 5), ("Photo Storage & Compression", 3), ("Client-side WebP compression (max 1024x1024, ~300KB) stored in Private Supabase Bucket", 3), ("Prevents massive storage consumption; provides fast thumbnail rendering over 4G mobile networks.", 3), ("Approved", 6)],
        [("Q-09", 5), ("Data Retention & Hard Purge", 3), ("Immediate cascade deletion on local Room DB and Supabase Cloud upon user request", 3), ("Upholds complete voluntary data principles; no hidden soft-delete retention once user requests purge.", 3), ("Approved", 6)],
        [("Q-10", 5), ("Multi-Language Support (i18n)", 3), ("Full English and Hindi (values/strings.xml & values-hi/strings.xml) from Phase 1", 3), ("Essential for grassroots Indian field campaigns; dynamic runtime switching without app restart.", 3), ("Approved", 6)]
    ]
    wb.add_sheet("9_Decisions_Assumptions_QA", s9_rows, [14, 25, 45, 55, 14])

    # Save workbook
    wb.save()
    print("Master Excel Specification successfully generated: Election_Management_System_Master_Specification.xlsx")

if __name__ == "__main__":
    build_master_specification()
