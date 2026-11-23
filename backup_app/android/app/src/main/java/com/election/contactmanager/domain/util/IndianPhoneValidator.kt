package com.election.contactmanager.domain.util

/**
 * Standard Indian 10-Digit Mobile Number Validator & Normalizer.
 * Validates prefixes starting with 6, 7, 8, or 9.
 */
object IndianPhoneValidator {

    private val INDIAN_MOBILE_REGEX = Regex("^[6-9]\\d{9}$")

    fun isValid(mobile: String): Boolean {
        val normalized = normalize(mobile)
        return normalized.matches(INDIAN_MOBILE_REGEX)
    }

    fun normalize(mobile: String): String {
        return mobile
            .replace("\\s+".toRegex(), "")
            .replace("-", "")
            .replace("+91", "")
            .trimStart('0')
    }

    fun formatDisplay(mobile: String): String {
        val normalized = normalize(mobile)
        return if (normalized.length == 10) {
            "+91 ${normalized.substring(0, 5)} ${normalized.substring(5)}"
        } else {
            mobile
        }
    }
}
