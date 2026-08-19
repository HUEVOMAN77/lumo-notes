# Lumo Notes

**Lumo Notes** es una aplicación de notas para Android diseñada para capturar ideas con rapidez y mantenerlas organizadas en el propio dispositivo. Su interfaz combina una estética editorial cálida con navegación simple, búsqueda local y controles de organización accesibles.

> Las notas se almacenan localmente en el dispositivo. Esta primera versión no solicita cuentas ni transmite el contenido a un servidor.

## Funcionalidades

| Área | Incluye |
|---|---|
| Captura | Creación de notas, título, contenido, etiqueta y selección de color. |
| Organización | Favoritos, archivado, restauración y eliminación con confirmación. |
| Consulta | Búsqueda por título, contenido o etiqueta, además de filtros por etiqueta. |
| Recordatorios | Avisos locales con opciones de completar o posponer 15 minutos. |
| Memoria visual | Hasta cuatro imágenes adjuntas y conservadas localmente por nota. |
| Experiencia | Guardado automático, respuesta háptica selectiva, transiciones breves y modo enfoque. |
| Ideas con pulso | Estado emocional de la nota y cápsulas de tiempo que protegen contenido hasta la fecha elegida. |
| Temas | Lumo, Blanco, Ónix, Neón, Atardecer, Aurora o adaptación al sistema. |
| Identidad | Nombre comercial **Lumo Notes**, icono de hoja con chispa y paleta violeta propia. |

## Arquitectura

La aplicación está construida con **Expo**, **React Native**, **TypeScript** y Expo Router. Las notas se gestionan mediante un contexto local y se guardan con AsyncStorage. El módulo `lib/notes.ts` concentra el modelo de dominio y las funciones puras para crear, actualizar, buscar y ordenar notas; el proveedor `lib/notes-provider.tsx` sincroniza ese modelo con el almacenamiento persistente. Los adjuntos se copian al espacio privado de la aplicación y los recordatorios se programan directamente en Android, sin servidor ni cuenta.

| Ruta o módulo | Responsabilidad |
|---|---|
| `app/(tabs)/index.tsx` | Inicio, buscador, filtros por etiquetas y acceso al editor. |
| `app/(tabs)/favorites.tsx` | Consulta de notas destacadas. |
| `app/(tabs)/archive.tsx` | Consulta de notas archivadas. |
| `app/(tabs)/settings.tsx` | Preferencias de apariencia e información de privacidad. |
| `app/note/[id].tsx` | Editor con guardado automático y acciones de organización. |
| `lib/notes-provider.tsx` | Persistencia local y estado global de las notas. |
| `lib/reminders.ts` | Permisos, canal Android, acciones y programación de avisos locales. |
| `lib/attachments.ts` | Selector de imágenes y conservación de adjuntos dentro de la aplicación. |
| `lib/theme-provider.tsx` | Temas persistentes, paletas expresivas y transición visual. |

## Ejecución local

Instala las dependencias y ejecuta el entorno de Expo desde la raíz del proyecto.

```bash
pnpm install
pnpm dev
```

Para comprobar la calidad del código antes de una entrega, ejecuta las siguientes validaciones.

```bash
pnpm test
pnpm check
pnpm lint
```

## Recordatorios y permisos

Los recordatorios son **locales**: se programan en el dispositivo y no se envían a ningún servicio externo. La primera vez que se programe uno, Android solicitará permiso para mostrar notificaciones. La prueba completa de los avisos debe realizarse en un dispositivo Android físico; el selector de imágenes también se abre mediante la interfaz del sistema.

## Generar Android

Abre el proyecto en Expo Go mediante el código QR del entorno de desarrollo para probarlo en un dispositivo Android. Para producir un APK distribuible, crea primero una versión del proyecto y utiliza el botón **Publish** de la interfaz del proyecto; el proceso administrado generará el paquete Android.

## Próximas extensiones posibles

La base está preparada para incorporar listas con casillas, exportación de una cápsula como carta, widgets de Android o sincronización opcional. Estas funciones deberían añadirse solo con una decisión explícita sobre privacidad y respaldo de los datos.
