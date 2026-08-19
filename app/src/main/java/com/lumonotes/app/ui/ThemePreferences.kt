package com.lumonotes.app.ui

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

enum class AppTheme(val label: String) {
    BLACK("Negro"),
    WHITE("Blanco"),
    NEON("Neón")
}

private val Context.lumoSettings by preferencesDataStore(name = "lumo_settings")

class ThemePreferences(private val context: Context) {
    private val themeKey = stringPreferencesKey("app_theme")

    val theme: Flow<AppTheme> = context.lumoSettings.data.map { preferences ->
        runCatching { AppTheme.valueOf(preferences[themeKey].orEmpty()) }.getOrDefault(AppTheme.WHITE)
    }

    suspend fun setTheme(theme: AppTheme) {
        context.lumoSettings.edit { preferences -> preferences[themeKey] = theme.name }
    }
}
