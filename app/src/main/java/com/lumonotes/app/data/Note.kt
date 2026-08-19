package com.lumonotes.app.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "notes")
data class Note(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val title: String = "",
    val content: String = "",
    val tag: String = "",
    val color: NoteColor = NoteColor.LAVENDER,
    val isFavorite: Boolean = false,
    val isArchived: Boolean = false,
    val isLockedUntil: Long? = null,
    val reminderAt: Long? = null,
    val attachmentUris: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

enum class NoteColor(val hex: Long) {
    LAVENDER(0xFFEDE7F6),
    PEACH(0xFFFFE5D9),
    MINT(0xFFDFF5E1),
    SKY(0xFFDCEEFF),
    SUN(0xFFFFF1B6),
    ROSE(0xFFFFE0E9)
}

enum class NoteFilter(val label: String) {
    ALL("Todas"),
    FAVORITES("Favoritas"),
    ARCHIVED("Archivadas")
}
