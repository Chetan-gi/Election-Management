# Election & Contact Management Application (Offline-First Mobile & Cloud)

Production-grade, offline-first voter and contact management application engineered for high field reliability, localized usability (English & Hindi), hardware-backed security, and real-time cloud synchronization with Supabase.

---

## 📁 Project Directory Structure

```text
A:\Election_management_check_kr\
│
├── Election_Management_System_Master_Specification.xlsx   <-- Comprehensive 9-Sheet Master Spec
│
├── docs/                                                 <-- Specifications & Documentation
│   ├── Election & Contact Management App - Architecture, Supabase & Coding Plan.pdf
│   ├── Election_Contact_Management_Web_App_SRS.docx
│   ├── Election_Management_System_Master_Specification.xlsx
│   └── extracted_srs_text.txt
│
├── database/                                             <-- Supabase Cloud Backend (PostgreSQL)
│   └── supabase/
│       ├── 01_schema.sql                                 <-- Tables, Enums, Performance Indexes
│       ├── 02_security_rls.sql                           <-- Row-Level Security & Storage Bucket Policies
│       └── 03_seed_data.sql                              <-- Realistic Sample Voter Data
│
├── android/                                              <-- Native Android App (Kotlin + Compose)
│   └── app/
│       ├── build.gradle.kts                              <-- Gradle Dependencies (Hilt, Room, Ktor, Supabase)
│       └── src/main/
│           ├── AndroidManifest.xml                       <-- Exact Alarms, Boot & Notification Permissions
│           ├── res/
│           │   ├── values/strings.xml                    <-- English UI Localization
│           │   └── values-hi/strings.xml                 <-- Hindi (हिंदी) UI Localization
│           └── java/com/election/contactmanager/
│               ├── data/
│               │   ├── local/
│               │   │   ├── dao/ContactDao.kt             <-- Indexed Search & Dynamic Filtering Queries
│               │   │   └── entity/                       <-- Room SQLite Entities (Contacts & Logs)
│               │   │       ├── ContactEntity.kt
│               │   │       └── NotificationLogEntity.kt
│               │   └── remote/                           <-- Supabase Kotlin Multiplatform Client
│               └── domain/
│                   ├── model/ContactCategory.kt          <-- 3 Alignment Categories & Enums
│                   └── util/
│                       ├── IndianPhoneValidator.kt       <-- 10-Digit Mobile Validator & Formatter
│                       └── ReminderCalculator.kt         <-- Exact 09:00 AM D-1 Reminder Algorithm
│
└── scripts/                                              <-- Build & Utility Scripts
    ├── excel_engine.py                                   <-- OpenXML Multi-Sheet Excel Engine
    └── generate_master_excel.py                          <-- Generator for Master Specification Excel
```

---

## 📊 Master Specification Excel Sheet Overview

The generated file **`Election_Management_System_Master_Specification.xlsx`** (located at root and in `docs/`) contains 9 dedicated sheets:

1. **`1_Project_Overview`**: Executive summary, mission, user roles, permission matrix, ethical principles (voluntary data entry, strict non-inference of political preferences).
2. **`2_Functional_SRS`**: Traceable requirement baseline covering Auth, Dashboard, Categories, Contact Profiles, Reminders, Search & Multi-Filters, Export, and Privacy.
3. **`3_Architecture_TechStack`**: Offline-First Repository Pattern, Jetpack Compose, Room + SQLCipher (AES-256), WorkManager, AlarmManager, and Supabase Cloud. Includes platform comparison matrix (Android vs Cross-Platform vs Web).
4. **`4_Database_Supabase_Schema`**: Complete schema definitions for `contacts`, `notification_logs`, indexes, Row-Level Security (RLS) policies, and private storage bucket rules.
5. **`5_Reminder_Engine_Spec`**: Deep-dive into the exact 1-day-prior reminder engine, 09:00 AM dispatch, duplicate elimination algorithm, boot survival receiver, and leap-year edge case handling.
6. **`6_Security_Privacy_AppLock`**: PBKDF2 SHA-256 PIN hashing, BiometricPrompt fallback, Android KeyStore hardware backing, and WindowManager `FLAG_SECURE` screen shielding.
7. **`7_Coding_Plan_8_Phases`**: Step-by-step 8-phase engineering roadmap from project setup to QA testing.
8. **`8_Acceptance_Test_Matrix`**: 20 comprehensive test scenarios (AT-01 to AT-20) covering functional flows, edge cases, and 10,000+ record performance benchmarks.
9. **`9_Decisions_Assumptions_QA`**: Complete breakdown of architectural decisions Q-01 through Q-10 from the SRS baseline.

---

## 🚀 Supabase Cloud Setup (Quick Guide)

1. **Create Project**: Go to [supabase.com](https://supabase.com) and create a project in region `ap-south-1` (Mumbai, India).
2. **Execute Database DDL**:
   - Open **SQL Editor** in Supabase.
   - Run `database/supabase/01_schema.sql` to create custom enums, tables, and performance indexes.
   - Run `database/supabase/02_security_rls.sql` to activate Row-Level Security (RLS) and storage isolation.
   - *(Optional)* Run `database/supabase/03_seed_data.sql` to insert sample test contacts.
3. **Configure Android Client**:
   - Add your Supabase URL and Anon Key into `local.properties`:
     ```properties
     SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_ANON_KEY=your-anon-public-key
     ```
