package com.election.contactmanager.domain.util

import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneId

/**
 * Precision 1-Day-Prior Reminder Calculation Engine.
 * 
 * Rules:
 * 1. Target time is strictly 09:00 AM local device time.
 * 2. Scheduled date is exactly 1 calendar day before the occasion date (Date - 1 day).
 * 3. Never calculates a naive 24-hour subtraction from midnight.
 * 4. Leap year handling: For Feb 29 birthdays in non-leap years, calculates Feb 27 for Feb 28 observance.
 */
object ReminderCalculator {

    val REMINDER_TARGET_TIME: LocalTime = LocalTime.of(9, 0) // 09:00 AM

    data class ScheduledReminder(
        val reminderDateTime: LocalDateTime,
        val targetYear: Int,
        val isDueToday: Boolean
    )

    fun calculateNextReminder(
        eventDate: LocalDate,
        referenceDate: LocalDate = LocalDate.now(),
        referenceTime: LocalTime = LocalTime.now()
    ): ScheduledReminder {
        val currentYear = referenceDate.year
        var targetYear = currentYear

        // Handle leap day
        val thisYearEventDate = resolveAnnualEventDate(eventDate, targetYear)
        val thisYearReminderDate = thisYearEventDate.minusDays(1)

        val isPastToday = if (thisYearReminderDate.isBefore(referenceDate)) {
            true
        } else if (thisYearReminderDate.isEqual(referenceDate)) {
            referenceTime.isAfter(REMINDER_TARGET_TIME)
        } else {
            false
        }

        if (isPastToday) {
            targetYear += 1
        }

        val resolvedEventDate = resolveAnnualEventDate(eventDate, targetYear)
        val finalReminderDate = resolvedEventDate.minusDays(1)
        val finalReminderDateTime = LocalDateTime.of(finalReminderDate, REMINDER_TARGET_TIME)

        val isDueToday = finalReminderDate.isEqual(referenceDate)

        return ScheduledReminder(
            reminderDateTime = finalReminderDateTime,
            targetYear = targetYear,
            isDueToday = isDueToday
        )
    }

    private fun resolveAnnualEventDate(eventDate: LocalDate, year: Int): LocalDate {
        return if (eventDate.monthValue == 2 && eventDate.dayOfMonth == 29) {
            val isLeapYear = java.time.Year.isLeap(year.toLong())
            if (isLeapYear) {
                LocalDate.of(year, 2, 29)
            } else {
                // Non-leap year celebration default: Feb 28
                LocalDate.of(year, 2, 28)
            }
        } else {
            LocalDate.of(year, eventDate.monthValue, eventDate.dayOfMonth)
        }
    }
}
