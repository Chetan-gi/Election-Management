package com.election.contactmanager.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.election.contactmanager.domain.model.ContactCategory
import com.election.contactmanager.domain.model.SyncStatus
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

@Entity(
    tableName = "contacts",
    indices = [
        Index(value = ["user_id"]),
        Index(value = ["mobile_number"]),
        Index(value = ["village_city"]),
        Index(value = ["ward_area"]),
        Index(value = ["category"]),
        Index(value = ["updated_at"])
    ]
)
data class ContactEntity(
    @PrimaryKey
    val id: UUID = UUID.randomUUID(),

    @ColumnInfo(name = "user_id")
    val userId: UUID,

    @ColumnInfo(name = "full_name")
    val fullName: String,

    @ColumnInfo(name = "father_name")
    val fatherName: String? = null,

    @ColumnInfo(name = "mobile_number")
    val mobileNumber: String,

    @ColumnInfo(name = "address")
    val address: String? = null,

    @ColumnInfo(name = "village_city")
    val villageCity: String? = null,

    @ColumnInfo(name = "ward_area")
    val wardArea: String? = null,

    @ColumnInfo(name = "dob")
    val dob: LocalDate? = null,

    @ColumnInfo(name = "anniversary_date")
    val anniversaryDate: LocalDate? = null,

    @ColumnInfo(name = "photo_url")
    val photoUrl: String? = null,

    @ColumnInfo(name = "notes")
    val notes: String? = null,

    @ColumnInfo(name = "category")
    val category: ContactCategory = ContactCategory.NEUTRAL,

    @ColumnInfo(name = "sync_status")
    val syncStatus: SyncStatus = SyncStatus.PENDING,

    @ColumnInfo(name = "is_deleted")
    val isDeleted: Boolean = false,

    @ColumnInfo(name = "created_at")
    val createdAt: Instant = Instant.now(),

    @ColumnInfo(name = "updated_at")
    val updatedAt: Instant = Instant.now()
)
