package com.lumonotes.app.reminders

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import com.lumonotes.app.MainActivity
import com.lumonotes.app.R

class ReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val title = intent.getStringExtra(EXTRA_TITLE).orEmpty().ifBlank { "Lumo Notes" }
        val content = intent.getStringExtra(EXTRA_CONTENT).orEmpty().ifBlank { "Tienes un recordatorio pendiente." }
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(
            NotificationChannel(CHANNEL_ID, "Recordatorios", NotificationManager.IMPORTANCE_DEFAULT)
        )
        val openIntent = PendingIntent.getActivity(
            context,
            0,
            Intent(context, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_lumo_leaf)
            .setContentTitle(title)
            .setContentText(content)
            .setContentIntent(openIntent)
            .setAutoCancel(true)
            .build()
        manager.notify(intent.getStringExtra(EXTRA_ID).orEmpty().hashCode(), notification)
    }

    companion object {
        const val CHANNEL_ID = "lumo_notes_reminders"
        const val EXTRA_ID = "note_id"
        const val EXTRA_TITLE = "title"
        const val EXTRA_CONTENT = "content"
    }
}
