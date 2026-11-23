import unittest
import datetime
import re
import os
import zipfile

# 1. Indian Phone Validator logic test
class IndianPhoneValidator:
    INDIAN_MOBILE_REGEX = re.compile(r"^[6-9]\d{9}$")

    @classmethod
    def normalize(cls, mobile: str) -> str:
        s = re.sub(r"\s+", "", mobile)
        s = s.replace("-", "").replace("+91", "").lstrip("0")
        return s

    @classmethod
    def is_valid(cls, mobile: str) -> bool:
        normalized = cls.normalize(mobile)
        return bool(cls.INDIAN_MOBILE_REGEX.match(normalized))

    @classmethod
    def format_display(cls, mobile: str) -> str:
        norm = cls.normalize(mobile)
        if len(norm) == 10:
            return f"+91 {norm[:5]} {norm[5:]}"
        return mobile

# 2. Reminder Calculator logic test
class ReminderCalculator:
    REMINDER_HOUR = 9
    REMINDER_MINUTE = 0

    @classmethod
    def is_leap_year(cls, year: int) -> bool:
        return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)

    @classmethod
    def resolve_annual_event_date(cls, event_month: int, event_day: int, year: int) -> datetime.date:
        if event_month == 2 and event_day == 29:
            if cls.is_leap_year(year):
                return datetime.date(year, 2, 29)
            else:
                # Non-leap year default: celebrate on Feb 28
                return datetime.date(year, 2, 28)
        return datetime.date(year, event_month, event_day)

    @classmethod
    def calculate_next_reminder(cls, event_date: datetime.date, ref_datetime: datetime.datetime):
        current_year = ref_datetime.year
        target_year = current_year

        this_year_event = cls.resolve_annual_event_date(event_date.month, event_date.day, target_year)
        this_year_reminder_date = this_year_event - datetime.timedelta(days=1)
        this_year_reminder_dt = datetime.datetime.combine(
            this_year_reminder_date, datetime.time(cls.REMINDER_HOUR, cls.REMINDER_MINUTE)
        )

        if ref_datetime >= this_year_reminder_dt:
            target_year += 1

        target_event = cls.resolve_annual_event_date(event_date.month, event_date.day, target_year)
        target_reminder_date = target_event - datetime.timedelta(days=1)
        target_reminder_dt = datetime.datetime.combine(
            target_reminder_date, datetime.time(cls.REMINDER_HOUR, cls.REMINDER_MINUTE)
        )

        is_due_today = (target_reminder_date == ref_datetime.date())

        return {
            "reminder_datetime": target_reminder_dt,
            "target_year": target_year,
            "is_due_today": is_due_today,
            "event_date_that_year": target_event
        }

class TestElectionAppLogic(unittest.TestCase):

    def test_indian_phone_validation(self):
        # Valid cases
        self.assertTrue(IndianPhoneValidator.is_valid("9876543210"))
        self.assertTrue(IndianPhoneValidator.is_valid("+91 98765 43210"))
        self.assertTrue(IndianPhoneValidator.is_valid("09876543210"))
        self.assertTrue(IndianPhoneValidator.is_valid("8765432109"))
        self.assertTrue(IndianPhoneValidator.is_valid("7654321098"))
        self.assertTrue(IndianPhoneValidator.is_valid("6543210987"))

        # Invalid cases
        self.assertFalse(IndianPhoneValidator.is_valid("1234567890")) # starts with 1
        self.assertFalse(IndianPhoneValidator.is_valid("5556667778")) # starts with 5
        self.assertFalse(IndianPhoneValidator.is_valid("98765"))      # short
        self.assertFalse(IndianPhoneValidator.is_valid("987654321099")) # long
        self.assertFalse(IndianPhoneValidator.is_valid("abcdefghij")) # alpha

        # Formatting
        self.assertEqual(IndianPhoneValidator.format_display("9876543210"), "+91 98765 43210")

    def test_reminder_exact_d_minus_1(self):
        # Event is on 2026-11-25. Current ref date is 2026-11-24 08:00 AM (D-1 morning).
        event_dob = datetime.date(1990, 11, 25)
        ref_dt = datetime.datetime(2026, 11, 24, 8, 0)
        res = ReminderCalculator.calculate_next_reminder(event_dob, ref_dt)

        self.assertEqual(res["target_year"], 2026)
        self.assertEqual(res["reminder_datetime"], datetime.datetime(2026, 11, 24, 9, 0))
        self.assertTrue(res["is_due_today"])

    def test_reminder_zero_duplicate_on_event_day(self):
        # On the occasion day (2026-11-25 09:00 AM), next reminder must roll to next year (2027-11-24 09:00 AM)
        event_dob = datetime.date(1990, 11, 25)
        ref_dt = datetime.datetime(2026, 11, 25, 9, 0)
        res = ReminderCalculator.calculate_next_reminder(event_dob, ref_dt)

        self.assertEqual(res["target_year"], 2027)
        self.assertEqual(res["reminder_datetime"], datetime.datetime(2027, 11, 24, 9, 0))
        self.assertFalse(res["is_due_today"])

    def test_reminder_leap_year_feb_29(self):
        # Voter born on Feb 29 (Leap year 2000). Check calculation in non-leap year 2025.
        event_dob = datetime.date(2000, 2, 29)
        ref_dt = datetime.datetime(2025, 1, 1, 8, 0)
        res = ReminderCalculator.calculate_next_reminder(event_dob, ref_dt)

        # In 2025 (non-leap), occasion resolved to Feb 28, reminder is Feb 27 at 09:00 AM!
        self.assertEqual(res["target_year"], 2025)
        self.assertEqual(res["reminder_datetime"], datetime.datetime(2025, 2, 27, 9, 0))

    def test_database_sql_files_exist_and_non_empty(self):
        sql_files = [
            "database/supabase/01_schema.sql",
            "database/supabase/02_security_rls.sql",
            "database/supabase/03_seed_data.sql"
        ]
        for f in sql_files:
            self.assertTrue(os.path.exists(f), f"Missing {f}")
            self.assertGreater(os.path.getsize(f), 100, f"Empty {f}")

    def test_excel_specification_validity(self):
        excel_path = "Election_Management_System_Master_Specification.xlsx"
        self.assertTrue(os.path.exists(excel_path))
        with zipfile.ZipFile(excel_path, 'r') as z:
            namelist = z.namelist()
            self.assertIn("xl/workbook.xml", namelist)
            self.assertIn("xl/worksheets/sheet9.xml", namelist) # All 9 sheets

if __name__ == "__main__":
    unittest.main()
