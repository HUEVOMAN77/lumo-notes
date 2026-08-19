package com.lumonotes.app

import android.Manifest
import android.app.Activity
import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Archive
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Unarchive
import androidx.compose.material3.BottomAppBar
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.core.app.ActivityCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import com.lumonotes.app.data.Note
import com.lumonotes.app.data.NoteColor
import com.lumonotes.app.data.NoteFilter
import com.lumonotes.app.ui.AppTheme
import com.lumonotes.app.ui.ThemePreferences

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { LumoNotesApp() }
    }
}

@Composable
fun LumoNotesApp(vm: com.lumonotes.app.ui.NotesViewModel = viewModel()) {
    val context = LocalContext.current
    val themePreferences = remember { ThemePreferences(context) }
    val scope = rememberCoroutineScope()
    var currentScreen by remember { mutableIntStateOf(0) }
    var editorNote by remember { mutableStateOf<Note?>(null) }
    var appTheme by remember { mutableStateOf(AppTheme.WHITE) }
    var showIntro by remember { mutableStateOf(true) }
    val notes by vm.notes.collectAsState()
    val query by vm.searchQuery.collectAsState()

    LaunchedEffect(Unit) {
        themePreferences.theme.collect { appTheme = it }
    }
    LaunchedEffect(Unit) {
        delay(1800)
        showIntro = false
    }

    MaterialTheme(colorScheme = themeColors(appTheme)) {
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            if (showIntro) {
                IntroScreen(onContinue = { showIntro = false })
            } else if (editorNote != null) {
                NoteEditor(
                    initial = editorNote!!,
                    onBack = { editorNote = null },
                    onSave = { saved -> vm.save(saved); editorNote = null },
                    onDelete = { vm.delete(it); editorNote = null }
                )
            } else {
                when (currentScreen) {
                    3 -> SettingsScreen(theme = appTheme, onThemeChange = {
                        appTheme = it
                        scope.launch { themePreferences.setTheme(it) }
                    }) { currentScreen = 0 }
                    else -> HomeScreen(
                        notes = notes,
                        query = query,
                        selected = when (currentScreen) {
                            1 -> NoteFilter.FAVORITES
                            2 -> NoteFilter.ARCHIVED
                            else -> NoteFilter.ALL
                        },
                        onQueryChange = vm::setQuery,
                        onFilterChange = { filter ->
                            vm.setFilter(filter)
                            currentScreen = when (filter) {
                                NoteFilter.ALL -> 0
                                NoteFilter.FAVORITES -> 1
                                NoteFilter.ARCHIVED -> 2
                            }
                        },
                        onOpen = { editorNote = it },
                        onNew = { editorNote = vm.newNote() },
                        onToggleFavorite = vm::toggleFavorite,
                        onToggleArchive = vm::toggleArchive,
                        onSettings = { currentScreen = 3 }
                    )
                }
            }
        }
    }
}

private fun themeColors(theme: AppTheme): ColorScheme = when (theme) {
    AppTheme.WHITE -> lightColorScheme(
        primary = Color(0xFF6750A4),
        secondary = Color(0xFF7D5260),
        background = Color(0xFFF7F5FA),
        surface = Color.White
    )
    AppTheme.BLACK -> darkColorScheme(
        primary = Color(0xFFD0BCFF),
        secondary = Color(0xFFEFB8C8),
        background = Color(0xFF000000),
        surface = Color(0xFF111111),
        surfaceVariant = Color(0xFF252525)
    )
    AppTheme.NEON -> darkColorScheme(
        primary = Color(0xFF00F5D4),
        secondary = Color(0xFFFF4ECD),
        tertiary = Color(0xFFFFE500),
        background = Color(0xFF080D1D),
        surface = Color(0xFF111A35),
        surfaceVariant = Color(0xFF202B4D)
    )
}

@Composable
private fun IntroScreen(onContinue: () -> Unit) {
    Box(
        modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.primary),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(32.dp)
        ) {
            Box(
                modifier = Modifier.size(118.dp).clip(RoundedCornerShape(38.dp)).background(MaterialTheme.colorScheme.surface),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(64.dp))
            }
            Spacer(Modifier.height(28.dp))
            Text("Lumo Notes", style = MaterialTheme.typography.displaySmall, color = MaterialTheme.colorScheme.onPrimary, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            Text("Guarda tus ideas.\nDales un momento para brillar.", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.88f), textAlign = androidx.compose.ui.text.style.TextAlign.Center)
            Spacer(Modifier.height(34.dp))
            Button(onClick = onContinue, colors = androidx.compose.material3.ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surface, contentColor = MaterialTheme.colorScheme.primary)) {
                Text("Entrar a mis notas")
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun HomeScreen(
    notes: List<Note>,
    query: String,
    selected: NoteFilter,
    onQueryChange: (String) -> Unit,
    onFilterChange: (NoteFilter) -> Unit,
    onOpen: (Note) -> Unit,
    onNew: () -> Unit,
    onToggleFavorite: (Note) -> Unit,
    onToggleArchive: (Note) -> Unit,
    onSettings: () -> Unit
) {
    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Lumo Notes", fontWeight = FontWeight.Bold)
                        Text("Ideas con pulso", style = MaterialTheme.typography.labelSmall)
                    }
                },
                actions = {
                    IconButton(onClick = onSettings) { Icon(Icons.Default.Settings, "Ajustes") }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        },
        bottomBar = {
            NavigationBar(modifier = Modifier.navigationBarsPadding()) {
                NavigationBarItem(selected = selected == NoteFilter.ALL, onClick = { onFilterChange(NoteFilter.ALL) }, icon = { Icon(Icons.Default.Search, null) }, label = { Text("Notas") })
                NavigationBarItem(selected = selected == NoteFilter.FAVORITES, onClick = { onFilterChange(NoteFilter.FAVORITES) }, icon = { Icon(Icons.Default.Favorite, null) }, label = { Text("Favoritas") })
                NavigationBarItem(selected = selected == NoteFilter.ARCHIVED, onClick = { onFilterChange(NoteFilter.ARCHIVED) }, icon = { Icon(Icons.Default.Archive, null) }, label = { Text("Archivo") })
                NavigationBarItem(selected = false, onClick = onSettings, icon = { Icon(Icons.Default.Settings, null) }, label = { Text("Ajustes") })
            }
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onNew, containerColor = MaterialTheme.colorScheme.primary) {
                Icon(Icons.Default.Add, contentDescription = "Nueva nota")
            }
        }
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding).padding(horizontal = 18.dp)) {
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = query,
                onValueChange = onQueryChange,
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                leadingIcon = { Icon(Icons.Default.Search, null) },
                placeholder = { Text("Buscar en tus notas") },
                shape = RoundedCornerShape(18.dp)
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(vertical = 12.dp)) {
                NoteFilter.values().forEach { filter ->
                    FilterChip(selected = selected == filter, onClick = { onFilterChange(filter) }, label = { Text(filter.label) })
                }
            }
            if (notes.isEmpty()) {
                EmptyState(selected, onNew)
            } else {
                Text("${notes.size} ${if (notes.size == 1) "nota" else "notas"}", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
                LazyColumn(contentPadding = PaddingValues(top = 10.dp, bottom = 88.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(notes, key = { it.id }) { note ->
                        NoteCard(note, onOpen, onToggleFavorite, onToggleArchive)
                    }
                }
            }
        }
    }
}

@Composable
private fun EmptyState(filter: NoteFilter, onNew: () -> Unit) {
    Column(modifier = Modifier.fillMaxWidth().padding(top = 80.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Text(if (filter == NoteFilter.ARCHIVED) "El archivo está vacío" else "Aún no hay notas", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(8.dp))
        Text(if (filter == NoteFilter.ARCHIVED) "Las notas archivadas aparecerán aquí." else "Captura esa idea antes de que se escape.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(20.dp))
        Button(onClick = onNew) { Icon(Icons.Default.Add, null); Spacer(Modifier.width(6.dp)); Text("Crear nota") }
    }
}

@Composable
private fun NoteCard(note: Note, onOpen: (Note) -> Unit, onToggleFavorite: (Note) -> Unit, onToggleArchive: (Note) -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable { onOpen(note) },
        colors = CardDefaults.cardColors(containerColor = Color(note.color.hex)),
        shape = RoundedCornerShape(22.dp)
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(note.title.ifBlank { "Sin título" }, modifier = Modifier.weight(1f), fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleLarge, maxLines = 1, overflow = TextOverflow.Ellipsis)
                IconButton(onClick = { onToggleFavorite(note) }) { Icon(if (note.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder, "Favorita", tint = if (note.isFavorite) Color(0xFFE85D75) else MaterialTheme.colorScheme.onSurfaceVariant) }
            }
            if (note.content.isNotBlank()) Text(note.content, maxLines = 3, overflow = TextOverflow.Ellipsis, style = MaterialTheme.typography.bodyLarge)
            Spacer(Modifier.height(12.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (note.tag.isNotBlank()) Text("#${note.tag}", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                Spacer(Modifier.weight(1f))
                IconButton(onClick = { onToggleArchive(note) }) { Icon(if (note.isArchived) Icons.Default.Unarchive else Icons.Default.Archive, "Archivar") }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun NoteEditor(initial: Note, onBack: () -> Unit, onSave: (Note) -> Unit, onDelete: (Note) -> Unit) {
    var title by remember(initial.id) { mutableStateOf(initial.title) }
    var content by remember(initial.id) { mutableStateOf(initial.content) }
    var tag by remember(initial.id) { mutableStateOf(initial.tag) }
    var color by remember(initial.id) { mutableStateOf(initial.color) }
    var showDelete by remember { mutableStateOf(false) }
    val context = LocalContext.current
    var attachment by remember(initial.id) { mutableStateOf(initial.attachmentUris) }
    var reminderAt by remember(initial.id) { mutableStateOf(initial.reminderAt) }
    val imagePicker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) attachment = uri.toString()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (initial.title.isBlank() && initial.content.isBlank()) "Nueva nota" else "Editar nota") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Volver") } },
                actions = {
                    IconButton(onClick = {
                        requestNotifications(context as? Activity)
                        onSave(initial.copy(title = title, content = content, tag = tag, color = color, attachmentUris = attachment, reminderAt = reminderAt))
                    }) { Icon(Icons.Default.Check, "Guardar") }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding).padding(18.dp).verticalScroll(rememberScrollState())) {
            OutlinedTextField(value = title, onValueChange = { title = it }, modifier = Modifier.fillMaxWidth(), textStyle = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold), placeholder = { Text("Título") }, singleLine = true)
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(value = content, onValueChange = { content = it }, modifier = Modifier.fillMaxWidth().height(260.dp), placeholder = { Text("Escribe lo que tengas en mente...") })
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(value = tag, onValueChange = { tag = it }, modifier = Modifier.fillMaxWidth(), leadingIcon = { Text("#") }, label = { Text("Etiqueta") }, singleLine = true)
            Spacer(Modifier.height(18.dp))
            Text("Color de la nota", fontWeight = FontWeight.SemiBold)
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.padding(vertical = 12.dp)) {
                NoteColor.values().forEach { option ->
                    Box(modifier = Modifier.size(42.dp).clip(CircleShape).background(Color(option.hex)).clickable { color = option }, contentAlignment = Alignment.Center) {
                        if (color == option) Icon(Icons.Default.Check, null, tint = MaterialTheme.colorScheme.primary)
                    }
                }
            }
            OutlinedButton(onClick = { imagePicker.launch("image/*") }, modifier = Modifier.fillMaxWidth()) {
                Icon(Icons.Default.Image, null); Spacer(Modifier.width(8.dp)); Text(if (attachment.isBlank()) "Adjuntar imagen" else "Imagen adjunta")
            }
            Spacer(Modifier.height(12.dp))
            OutlinedButton(onClick = {
                requestNotifications(context as? Activity)
                val calendar = Calendar.getInstance().apply { reminderAt?.let { timeInMillis = it } }
                DatePickerDialog(context, { _, year, month, day ->
                    TimePickerDialog(context, { _, hour, minute ->
                        calendar.set(year, month, day, hour, minute, 0)
                        calendar.set(Calendar.MILLISECOND, 0)
                        if (calendar.timeInMillis > System.currentTimeMillis()) reminderAt = calendar.timeInMillis
                    }, calendar.get(Calendar.HOUR_OF_DAY), calendar.get(Calendar.MINUTE), true).show()
                }, calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DAY_OF_MONTH)).show()
            }, modifier = Modifier.fillMaxWidth()) {
                Icon(Icons.Default.CalendarMonth, null)
                Spacer(Modifier.width(8.dp))
                Text(if (reminderAt == null) "Elegir fecha y hora del recordatorio" else "Recordatorio: ${SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()).format(java.util.Date(reminderAt!!))}")
            }
            if (reminderAt != null) {
                TextButton(onClick = { reminderAt = null }, modifier = Modifier.align(Alignment.End)) { Text("Quitar recordatorio") }
            }
            if (initial.id.isNotBlank() && (initial.title.isNotBlank() || initial.content.isNotBlank())) {
                Spacer(Modifier.height(18.dp))
                TextButton(onClick = { showDelete = true }, modifier = Modifier.align(Alignment.End)) { Icon(Icons.Default.Delete, null); Spacer(Modifier.width(4.dp)); Text("Eliminar nota") }
            }
        }
    }
    if (showDelete) {
        androidx.compose.material3.AlertDialog(
            onDismissRequest = { showDelete = false },
            title = { Text("¿Eliminar esta nota?") },
            text = { Text("Esta acción no se puede deshacer.") },
            confirmButton = { TextButton(onClick = { onDelete(initial) }) { Text("Eliminar") } },
            dismissButton = { TextButton(onClick = { showDelete = false }) { Text("Cancelar") } }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SettingsScreen(theme: AppTheme, onThemeChange: (AppTheme) -> Unit, onBack: () -> Unit) {
    Scaffold(topBar = {
        TopAppBar(title = { Text("Ajustes") }, navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Volver") } })
    }) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding).padding(18.dp).verticalScroll(rememberScrollState())) {
            Text("Temas", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(6.dp))
            Text("Personaliza el ambiente de tus notas.", color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(12.dp))
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    AppTheme.values().forEach { option ->
                        FilterChip(
                            selected = theme == option,
                            onClick = { onThemeChange(option) },
                            label = { Text(option.label) },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
            Spacer(Modifier.height(28.dp))
            Text("Privacidad", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Default.Lock, null); Spacer(Modifier.width(12.dp)); Text("Tus notas son privadas", fontWeight = FontWeight.SemiBold) }
                    Spacer(Modifier.height(8.dp)); Text("El contenido se guarda únicamente en este dispositivo. Lumo Notes no necesita cuenta ni envía tus notas a un servidor.", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            Spacer(Modifier.height(28.dp))
            Text("Lumo Notes", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Text("Versión nativa Kotlin · JDK 17", color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

private fun requestNotifications(activity: Activity?) {
    if (activity != null && Build.VERSION.SDK_INT >= 33 && ActivityCompat.checkSelfPermission(activity, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
        ActivityCompat.requestPermissions(activity, arrayOf(Manifest.permission.POST_NOTIFICATIONS), 1001)
    }
}
