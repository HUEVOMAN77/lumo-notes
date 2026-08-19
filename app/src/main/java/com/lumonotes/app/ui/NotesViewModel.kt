package com.lumonotes.app.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.lumonotes.app.data.Note
import com.lumonotes.app.data.NoteColor
import com.lumonotes.app.data.NoteDao
import com.lumonotes.app.data.NotesDatabase
import com.lumonotes.app.reminders.ReminderScheduler
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class NotesViewModel(application: Application) : AndroidViewModel(application) {
    private val dao: NoteDao = NotesDatabase.get(application).noteDao()
    private val query = MutableStateFlow("")
    private val filter = MutableStateFlow(com.lumonotes.app.data.NoteFilter.ALL)

    val searchQuery: StateFlow<String> = query
    val selectedFilter: StateFlow<com.lumonotes.app.data.NoteFilter> = filter
    val notes: StateFlow<List<Note>> = combine(dao.observeAll(), query, filter) { all, text, selected ->
        all.filter { note ->
            val matchesText = text.isBlank() || listOf(note.title, note.content, note.tag)
                .any { it.contains(text, ignoreCase = true) }
            val matchesFilter = when (selected) {
                com.lumonotes.app.data.NoteFilter.ALL -> !note.isArchived
                com.lumonotes.app.data.NoteFilter.FAVORITES -> note.isFavorite && !note.isArchived
                com.lumonotes.app.data.NoteFilter.ARCHIVED -> note.isArchived
            }
            matchesText && matchesFilter
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    fun setQuery(value: String) { query.value = value }
    fun setFilter(value: com.lumonotes.app.data.NoteFilter) { filter.value = value }

    fun save(note: Note) = viewModelScope.launch {
        val saved = note.copy(updatedAt = System.currentTimeMillis())
        dao.insert(saved)
        ReminderScheduler.schedule(getApplication(), saved)
    }

    fun toggleFavorite(note: Note) = save(note.copy(isFavorite = !note.isFavorite))
    fun toggleArchive(note: Note) = save(note.copy(isArchived = !note.isArchived))
    fun delete(note: Note) = viewModelScope.launch {
        dao.delete(note)
        ReminderScheduler.cancel(getApplication(), note.id)
    }

    fun newNote(): Note = Note()

    suspend fun getNote(id: String): Note? = dao.findById(id)

    fun update(
        note: Note,
        title: String,
        content: String,
        tag: String,
        color: NoteColor
    ) = save(note.copy(title = title, content = content, tag = tag, color = color))
}
