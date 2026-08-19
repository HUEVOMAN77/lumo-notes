# Lumo Notes

**Lumo Notes** es una aplicación de notas para Android diseñada para capturar ideas con rapidez y mantenerlas organizadas en el propio dispositivo. Su interfaz combina una estética editorial cálida con navegación simple, búsqueda local y controles de organización accesibles.

> Las notas se almacenan localmente en el dispositivo. Esta primera versión no solicita cuentas ni transmite el contenido a un servidor.

## Funcionalidades

| Área | Incluye |
|---|---|
| Captura | Creación de notas, título, contenido, etiqueta y selección de color. |
| Organización | Favoritos, archivado, restauración y eliminación con confirmación. |
| Consulta | Búsqueda por título, contenido o etiqueta, además de filtros por etiqueta. |
| Experiencia | Guardado automático, respuesta háptica selectiva y modo claro, oscuro o del sistema. |
| Identidad | Nombre comercial **Lumo Notes**, icono de hoja con chispa y paleta violeta propia. |

## Arquitectura

La aplicación está construida con **Expo**, **React Native**, **TypeScript** y Expo Router. Las notas se gestionan mediante un contexto local y se guardan con AsyncStorage. El módulo `lib/notes.ts` concentra el modelo de dominio y las funciones puras para crear, actualizar, buscar y ordenar notas; el proveedor `lib/notes-provider.tsx` sincroniza ese modelo con el almacenamiento persistente.

| Ruta o módulo | Responsabilidad |
|---|---|
| `app/(tabs)/index.tsx` | Inicio, buscador, filtros por etiquetas y acceso al editor. |
| `app/(tabs)/favorites.tsx` | Consulta de notas destacadas. |
| `app/(tabs)/archive.tsx` | Consulta de notas archivadas. |
| `app/(tabs)/settings.tsx` | Preferencias de apariencia e información de privacidad. |
| `app/note/[id].tsx` | Editor con guardado automático y acciones de organización. |
| `lib/notes-provider.tsx` | Persistencia local y estado global de las notas. |

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

## Generar Android

Abre el proyecto en Expo Go mediante el código QR del entorno de desarrollo para probarlo en un dispositivo Android. Para producir un APK distribuible, crea primero una versión del proyecto y utiliza el botón **Publish** de la interfaz del proyecto; el proceso administrado generará el paquete Android.

## Próximas extensiones posibles

La base está preparada para incorporar adjuntos, listas de tareas, exportación de notas, recordatorios o sincronización opcional. Estas funciones deberían añadirse solo con una decisión explícita sobre privacidad y respaldo de los datos.
