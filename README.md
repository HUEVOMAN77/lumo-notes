# Lumo Notes — Android nativo en Kotlin

Lumo Notes es una aplicación Android nativa escrita en **Kotlin** y construida con **Jetpack Compose**, Room y Material 3. Esta versión reemplaza la implementación anterior basada en Expo/React Native/TypeScript y está preparada para compilarse localmente con **Java SDK 17**, Gradle Wrapper y Android `cmdline-tools`.

> Las notas se almacenan localmente en el dispositivo. La aplicación no necesita cuenta ni transmite el contenido a un servidor.

## Requisitos

| Herramienta | Requisito |
|---|---|
| Sistema | Windows, macOS o Linux |
| JDK | Java SDK 17 |
| Android SDK | `platform-tools`, `platforms;android-35` y `build-tools;35.0.0` |
| Android cmdline-tools | Versión reciente con `sdkmanager` y `avdmanager` |
| Gradle | No es necesario instalarlo globalmente; se usa `gradlew`/`gradlew.bat` |
| Dispositivo | Android API 24 o superior; para avisos se recomienda Android 13+ físico |

## Configuración de variables

En Windows PowerShell:

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:Path"
```

En Linux o macOS:

```bash
export JAVA_HOME=/ruta/al/jdk-17
export ANDROID_HOME=$HOME/Android/Sdk
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

Instala el SDK desde la línea de comandos, aceptando las licencias cuando se solicite:

```bash
sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"
```

## Compilar localmente

Desde la raíz del repositorio:

En Windows:

```cmd
gradlew.bat clean assembleDebug
```

En Linux o macOS:

```bash
chmod +x gradlew
./gradlew clean assembleDebug
```

El APK de depuración se genera en:

```text
app/build/outputs/apk/debug/app-debug.apk
```

Para instalarlo en un dispositivo conectado con `adb`:

```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

También se puede compilar e instalar directamente con:

```bash
./gradlew installDebug
```

En Windows se usa el equivalente `gradlew.bat installDebug`.

## Funcionalidades implementadas

La aplicación incluye una introducción visual de bienvenida antes de entrar a las notas, creación y edición de notas, guardado local con Room, búsqueda por título/contenido/etiqueta, favoritos, archivado, eliminación con confirmación, selección de color, adjuntos de imagen mediante el selector del sistema y pantalla de privacidad.

También incorpora tres temas persistentes —**Negro**, **Blanco** y **Neón**— desde Ajustes. El tema elegido se conserva en el dispositivo mediante DataStore. Cada nota puede recibir un recordatorio seleccionando un **día y una hora**; Android programa una alarma local y muestra una notificación. Las alarmas se restauran después de reiniciar el teléfono mediante `BootReceiver`. En Android 13 o superior se debe conceder el permiso de notificaciones cuando la aplicación lo solicite.

## Estructura

| Ruta | Responsabilidad |
|---|---|
| `app/src/main/java/com/lumonotes/app/MainActivity.kt` | Actividad principal e interfaz Jetpack Compose |
| `app/src/main/java/com/lumonotes/app/ui/NotesViewModel.kt` | Estado, filtros, búsqueda y operaciones de notas |
| `app/src/main/java/com/lumonotes/app/data/Note.kt` | Modelo de dominio y colores |
| `app/src/main/java/com/lumonotes/app/data/NoteDao.kt` | Consultas Room |
| `app/src/main/java/com/lumonotes/app/data/NotesDatabase.kt` | Base de datos local |
| `app/src/main/java/com/lumonotes/app/reminders/ReminderReceiver.kt` | Canal y recepción de notificaciones locales |
| `app/src/main/java/com/lumonotes/app/reminders/ReminderScheduler.kt` | Programación y cancelación de alarmas |
| `app/src/main/java/com/lumonotes/app/reminders/BootReceiver.kt` | Restauración de alarmas después de reiniciar |
| `app/src/main/java/com/lumonotes/app/ui/ThemePreferences.kt` | Temas Negro, Blanco y Neón persistentes |
| `app/build.gradle.kts` | Configuración Android, Kotlin, Compose y JDK 17 |

## Descargar APK

Puedes descargar la versión de depuración compilada para Android desde [`releases/Lumo-Notes.apk`](releases/Lumo-Notes.apk). El paquete usa el nombre oficial **Lumo Notes**, el identificador `com.lumonotes.app`, `minSdk 24` y `targetSdk 35`.

## Vista previa de la interfaz

La pantalla de bienvenida presenta la identidad visual de Lumo Notes antes de abrir el bloc de notas.

![Pantalla de bienvenida de Lumo Notes](docs/screenshots/intro.png)

La interfaz principal en tema Blanco muestra la búsqueda, los filtros, las tarjetas de notas y la navegación inferior.

![Interfaz principal de Lumo Notes en tema Blanco](docs/screenshots/notas-blanco.png)

El tema Neón utiliza contraste oscuro, turquesa, magenta y amarillo para una experiencia más expresiva.

![Interfaz de Lumo Notes en tema Neón](docs/screenshots/tema-neon.png)

Los recordatorios se configuran desde el editor de una nota seleccionando el día y la hora exactos.

![Configuración de recordatorio en Lumo Notes](docs/screenshots/recordatorio.png)

## Versiones principales

- Kotlin `2.0.21`.
- Android Gradle Plugin `8.6.1`.
- Gradle Wrapper `8.7`.
- Compile SDK y target SDK `35`.
- Minimum SDK `24`.
- Java source/target compatibility `17`.

## Nota sobre el entorno

El proyecto contiene el Gradle Wrapper, de modo que no requiere una instalación global de Gradle. Sí requiere que `JAVA_HOME` apunte a un JDK 17 y que `ANDROID_HOME` apunte a un Android SDK que contenga las plataformas y herramientas indicadas arriba.
