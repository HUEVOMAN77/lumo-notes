package com.lumonotes.app.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverter
import androidx.room.TypeConverters

class NoteConverters {
    @TypeConverter
    fun fromColor(color: NoteColor): String = color.name

    @TypeConverter
    fun toColor(value: String): NoteColor = runCatching { NoteColor.valueOf(value) }.getOrDefault(NoteColor.LAVENDER)
}

@Database(entities = [Note::class], version = 1, exportSchema = false)
@TypeConverters(NoteConverters::class)
abstract class NotesDatabase : RoomDatabase() {
    abstract fun noteDao(): NoteDao

    companion object {
        @Volatile private var instance: NotesDatabase? = null

        fun get(context: Context): NotesDatabase = instance ?: synchronized(this) {
            instance ?: Room.databaseBuilder(
                context.applicationContext,
                NotesDatabase::class.java,
                "lumo_notes.db"
            ).fallbackToDestructiveMigration().build().also { instance = it }
        }
    }
}
