package com.election.contactmanager.data.local.dao

import androidx.room.*
import com.election.contactmanager.data.local.entity.ContactEntity
import com.election.contactmanager.domain.model.ContactCategory
import com.election.contactmanager.domain.model.SyncStatus
import kotlinx.coroutines.flow.Flow
import java.time.Instant
import java.util.UUID

@Dao
interface ContactDao {

    @Query("SELECT * FROM contacts WHERE id = :id AND is_deleted = 0 LIMIT 1")
    suspend fun getContactById(id: UUID): ContactEntity?

    @Query("SELECT COUNT(*) FROM contacts WHERE is_deleted = 0")
    fun getTotalContactCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM contacts WHERE category = :category AND is_deleted = 0")
    fun getCountByCategory(category: ContactCategory): Flow<Int>

    @Query("""
        SELECT * FROM contacts 
        WHERE is_deleted = 0 
          AND (:query IS NULL OR :query = '' OR full_name LIKE '%' || :query || '%' OR mobile_number LIKE '%' || :query || '%')
          AND (:village IS NULL OR village_city = :village)
          AND (:ward IS NULL OR ward_area = :ward)
          AND (:category IS NULL OR category = :category)
        ORDER BY full_name ASC
    """)
    fun filterContacts(
        query: String?,
        village: String?,
        ward: String?,
        category: ContactCategory?
    ): Flow<List<ContactEntity>>

    @Query("SELECT DISTINCT village_city FROM contacts WHERE is_deleted = 0 AND village_city IS NOT NULL ORDER BY village_city ASC")
    fun getAllVillages(): Flow<List<String>>

    @Query("SELECT DISTINCT ward_area FROM contacts WHERE is_deleted = 0 AND ward_area IS NOT NULL ORDER BY ward_area ASC")
    fun getAllWards(): Flow<List<String>>

    @Query("SELECT * FROM contacts WHERE sync_status = :syncStatus")
    suspend fun getPendingSyncContacts(syncStatus: SyncStatus = SyncStatus.PENDING): List<ContactEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertContact(contact: ContactEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(contacts: List<ContactEntity>)

    @Query("UPDATE contacts SET is_deleted = 1, sync_status = 'PENDING', updated_at = :timestamp WHERE id = :id")
    suspend fun softDeleteContact(id: UUID, timestamp: Instant = Instant.now())

    @Query("DELETE FROM contacts WHERE id = :id")
    suspend fun hardDeleteContact(id: UUID)
}
