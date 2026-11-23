package com.election.contactmanager.domain.model

enum class ContactCategory {
    SUPPORTER,
    NEUTRAL,
    OTHER
}

enum class SyncStatus {
    SYNCED,
    PENDING
}

enum class NotificationEventType {
    DOB,
    ANNIVERSARY
}

enum class NotificationStatus {
    SCHEDULED,
    SENT,
    CANCELLED
}
