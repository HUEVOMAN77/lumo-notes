# Diseño de interfaz — Lumo Notes

**Lumo Notes** será una libreta digital privada y ligera para Android. La experiencia se diseñará para uso vertical en una sola mano, priorizando lectura rápida, captura inmediata y organización sin fricción. La interfaz utilizará una estética editorial cálida: superficies suaves, tipografía clara, acentos lavanda y microinteracciones discretas.

## Principios de diseño

La aplicación debe permitir crear una nota desde cualquier momento relevante con una única acción principal visible. La jerarquía se apoyará en títulos grandes, espacios generosos, objetivos táctiles de al menos 44 px y navegación inferior estable. Las acciones de menor frecuencia estarán en menús contextuales para no sobrecargar la pantalla.

## Pantallas

| Pantalla | Contenido principal | Funciones |
|---|---|---|
| **Notas** | Encabezado de bienvenida, buscador, filtros por etiqueta y lista de notas recientes en tarjetas compactas. | Buscar, abrir, fijar, archivar y crear una nota. |
| **Editor** | Campo de título, cuerpo con formato de texto básico, selector de color y controles de guardar, fijar y eliminar. | Crear, editar y guardar automáticamente; marcar como favorita o eliminar. |
| **Favoritas** | Lista vacía útil o notas fijadas, ordenadas por última modificación. | Consultar rápidamente las notas importantes y abrirlas para editar. |
| **Archivo** | Notas archivadas, conservadas localmente. | Restaurar una nota al espacio principal o eliminarla definitivamente. |
| **Ajustes** | Preferencia de tema, resumen de almacenamiento y acceso a información de la aplicación. | Alternar claro/oscuro/sistema y consultar el estado local. |

## Flujos principales

| Objetivo | Recorrido previsto |
|---|---|
| Crear una nota | El usuario toca el botón flotante → se abre el editor vacío → escribe → vuelve atrás o toca guardar → la nota queda disponible en **Notas**. |
| Encontrar una idea | El usuario toca la búsqueda → escribe una palabra → la lista se filtra por título, contenido o etiqueta → abre el resultado. |
| Destacar una nota | El usuario abre una nota → toca el icono de estrella → la nota aparece en **Favoritas** y conserva el cambio localmente. |
| Organizar sin perder contenido | El usuario abre el menú de una tarjeta → selecciona **Archivar** → la nota se oculta de la lista principal y queda disponible en **Archivo**. |
| Personalizar la experiencia | El usuario entra en **Ajustes** → elige claro, oscuro o sistema → los colores se actualizan sin afectar las notas. |

## Diseño visual y color

La marca usará un símbolo de chispa dentro de una hoja doblada, para comunicar claridad y una idea que acaba de aparecer. El color dominante será **Violeta Lumo `#6D5DFB`**, acompañado por **Lavanda Bruma `#F3F1FF`** en áreas suaves, **Carbón Tinta `#1E1B2E`** para texto y **Menta Señal `#2CB67D`** como confirmación de guardado. En modo oscuro, el fondo se convertirá en **Noche Índigo `#12111A`** y las superficies en **Pizarra `#1D1B29`**, manteniendo la misma identidad cromática.

Las notas emplearán colores pastel apagados como acento opcional, nunca como único indicador de estado. Las tarjetas tendrán bordes redondeados de 20 px, sombra muy sutil y una línea de metadatos con fecha de modificación. El botón de crear tendrá forma circular, posición inferior derecha y contraste elevado.

## Modelo de datos local

Cada nota se guardará localmente mediante almacenamiento persistente y tendrá el siguiente vocabulario estable: `id`, `title`, `content`, `tag`, `color`, `isFavorite`, `isArchived`, `createdAt` y `updatedAt`. No se solicitará cuenta ni se enviará información a un servidor: el contenido permanecerá en el dispositivo salvo que el producto evolucione a una sincronización explícitamente solicitada.

## Accesibilidad y respuesta

Los textos secundarios mantendrán contraste legible, las acciones tendrán etiquetas accesibles y los iconos no serán el único medio para explicar acciones relevantes. Las pulsaciones tendrán cambios suaves de opacidad y háptica ligera en acciones primarias compatibles con Android. Las transiciones se mantendrán por debajo de 300 ms para que la aplicación se perciba ágil sin distraer.
