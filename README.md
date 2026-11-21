# Mi rodilla (rehab-lca)

App propia para seguir la rehabilitación del ligamento cruzado anterior, antes y después de operar, sin pagar una suscripción. Creada el 21 nov 2026.

No sustituye al cirujano ni al fisio: si dicen algo distinto, manda lo que digan ellos.

## Qué hace

- **Plan por etapas con criterios**, no por calendario:
  - **Antes de operar**, 3 etapas: calmar la rodilla, fuerza y control. Al final, las medidas de antes de operar quedan guardadas para comparar.
  - **Después de operar**, 6 fases.
  - **Sin operación**, otra ruta propia.
  Cada etapa tiene objetivos, ejercicios, lo que conviene evitar y los criterios para avanzar, que la app comprueba sola con tus medidas.
- **Menisco roto o posible**: límites prudentes (nada de flexión profunda con peso, giros con el pie apoyado ni forzar contra un tope), una regla del dolor más estricta (3/10) y avisos de bloqueo, enganche y fallos.
- **Chequeo diario** de 30 segundos: dolor, hinchazón, marcha, si la rodilla se ha ido, enganchado o bloqueado, confianza, función, sueño, agua y pasos. Avisa si hoy estás peor que ayer o si algo es una señal de alarma. Se pueden corregir los chequeos de otros días.
- **Sesión guiada**: ejercicio a ejercicio, con series, cronómetro con pitido y enlace a vídeos. Puedes quitar ejercicios y añadir los de tu fisio. También hay sesión del resto del cuerpo.
- **Progreso**:
  - Movilidad: puedes anotar quién la ha medido, y la extensión completa antes de operar tiene que confirmarla el fisio.
  - Derrame, perímetros, fuerza, saltos y simetría (LSI), resistencia, equilibrio, carrera, día a día y fotos comparables.
  - Gráficos, logros, racha y resumen semanal.
- **Aprender**: 14 artículos cortos escritos para la app, uno de ellos sobre «Mientras esperas la operación». También las señales de alarma.
- **Informe para el fisio**: se puede imprimir o guardar en PDF.
- **Copia de seguridad** y recordatorio diario en el calendario.

## Cómo se usa

**En el PC**: doble clic en `abrir.bat`. Arranca un pequeño servidor sin ventana y abre la app en el navegador (http://127.0.0.1:8790). Para pararlo, `parar.bat`. Necesita Python 3 (`py`), que ya está instalado.

**En el móvil**: la carpeta `app/` se publica sola en GitHub Pages cada vez que se suben cambios (`.github/workflows/pages.yml`). Desde el iPhone: abrir la dirección en Safari → Compartir → «Añadir a pantalla de inicio». Funciona también sin conexión.

## Dónde están tus datos

- **En el PC**, en `datos/estado.json` (y las fotos en `datos/fotos/`), con una copia por día en `datos/copias/` (las 60 últimas). No se pierden aunque cambies de navegador o borres su caché. La carpeta `datos/` nunca se sube a GitHub.
- **En el móvil**, solo en el propio móvil. Haz «Guardar copia» de vez en cuando; la app te lo recuerda cada 7 días.
- **Para pasar datos del PC al móvil** (o al revés): «Guardar copia» en uno y «Recuperar copia» en el otro.

El servidor del PC solo escucha en tu ordenador y solo acepta escrituras de la propia app.

## De dónde sale el contenido

En `investigacion/`, `protocolo.json` y `fuentes.md` recogen la investigación clínica con sus fuentes: Aspetar 2023, MOON 2015, Melbourne 2.0, JOSPT 2017, Delaware-Oslo y KANON. Incluyen qué se pudo leer y qué no.

Lo que conviene saber:
- **Dosis**: las guías dan criterios, pero casi nunca series y repeticiones. Las dosis son un punto de partida habitual y la app lo dice en pantalla.
- **Señales de alarma y límites del menisco**: son conocimiento clínico general y opinión prudente; no salen de las guías.
- **Umbrales de «potencial coper»** (sin operación): no se han verificado en el artículo original.

La versión del 21 nov 2026 por la tarde salió de un debate entre dos auditores, uno clínico y otro de producto. Coincidieron en:
1. Primero la seguridad del menisco.
2. Después que los datos no se pierdan en el PC.
3. Por último la prehabilitación por etapas.

Y descartaron cuatro cosas:
- Medir el ángulo con la cámara: da ±8-15° y una falsa seguridad.
- Un chat con IA sobre la rodilla.
- Apple Salud: exige app nativa y 99 $ al año.
- Sincronizar con un servidor en la nube.

## Estructura

```
rehab-lca/
├── abrir.bat / parar.bat   arrancar y parar en el PC
├── server.py               servidor local (solo biblioteca estándar): sirve app/ y guarda datos/
├── app/                    lo que se publica tal cual
│   ├── index.html, estilos.css
│   ├── app.js              motor: estado, criterios, vistas, gráficos, copia de seguridad, sincronización con el PC
│   ├── protocolo.js        etapas, criterios, ejercicios, alarmas y cómo medir
│   ├── aprender.js         artículos
│   └── manifest.webmanifest, sw.js, iconos/
├── investigacion/          fuentes clínicas
└── datos/                  tus datos en el PC (no se sube)
```

Para cambiar ejercicios, dosis o criterios: `app/protocolo.js`. Si cambias algo de la app publicada, sube el número de `CACHE` en `app/sw.js` para que el móvil coja la versión nueva.
