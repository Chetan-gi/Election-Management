package com.election.contactmanager.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import com.election.contactmanager.domain.model.NotificationEventType
import com.election.contactmanager.domain.model.NotificationStatus
import java.time.Instant
import java.util.UUID

@Entity(
    tableName = "notification_logs",
    foreignKeys = [
        ForeignKey(
            entity = ContactEntity::class,
            parentColumns = ["id"],
            childColumns = ["contact_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["contact_id"]),
        Index(value = ["contact_id", "event_type", "target_year"], unique = true)
    ]
)
data class NotificationLogEntity(
    @PrimaryKey
    val id: UUID = UUID.randomUUID(),

    @ColumnInfo(name = "contact_id")
    val contactId: UUID,

    @ColumnInfo(name = "event_type")
    val eventType: NotificationEventType,

    @ColumnInfo(name = "target_year")
    val targetYear: Int,

    @ColumnInfo(name = "status")
    val status: NotificationStatus = NotificationStatus.SCHEDULED,

    @ColumnInfo(name = "sent_at")
    val sentAt: Instant = Instant.now()
)
