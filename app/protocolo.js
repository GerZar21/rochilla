'use strict';
/* Contenido clínico de Mi rodilla.
   Fases y criterios: guías públicas (ver fuentes). Las guías casi nunca fijan series y repeticiones:
   las dosis que aparecen son una dosis de partida habitual para ajustar con el fisio.
   Investigación completa con citas en ../investigacion/protocolo.json y fuentes.md (21 nov 2026). */

(function () {
  const ej = (id, nombre, dosis, series, desc, extra = {}) => ({ id, nombre, dosis, series, desc, ...extra });

  const FUENTES = {
    ASP2023: { nombre: 'Guía clínica de Aspetar sobre la rehabilitación tras la reconstrucción del LCA (Kotsifaki et al., BJSM 2023)', corto: 'Aspetar 2023', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11785408' },
    MOON2015: { nombre: 'Guía de rehabilitación del LCA del grupo MOON (Wright et al., Sports Health 2015)', corto: 'MOON 2015', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4482298' },
    MEL2: { nombre: 'Melbourne ACL Rehabilitation Guide 2.0 (Cooper y Hughes)', corto: 'Melbourne 2.0', url: 'https://omniafisioterapia.com/wp-content/uploads/2023/08/ACL-Guide-Melbourne-Oficial.pdf' },
    NHS_MEL: { nombre: 'Pasaporte del paciente de LCA del St George\'s (NHS), basado en Melbourne 2.0', corto: 'NHS St George\'s', url: 'https://www.stgeorges.nhs.uk/wp-content/uploads/2025/10/THE_ACL_01.pdf' },
    JOSPT2017: { nombre: 'Guía de práctica clínica JOSPT sobre lesiones de ligamentos de la rodilla (Logerstedt et al., 2017)', corto: 'JOSPT 2017', url: 'https://doi.org/10.2519/jospt.2017.0303' },
    DO_5A: { nombre: 'Cohorte Delaware-Oslo: resultados a 5 años y algoritmo de tratamiento (JBJS 2021)', corto: 'Delaware-Oslo 2021', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8376754' },
    DO_2016: { nombre: 'Reglas sencillas para decidir la vuelta al deporte reducen la nueva lesión (Grindem et al., BJSM 2016)', corto: 'Grindem 2016', url: 'https://bjsm.bmj.com/content/50/13/804' },
    KANON2010: { nombre: 'Ensayo KANON: cirugía temprana frente a rehabilitación con cirugía opcional (Frobell et al., NEJM 2010)', corto: 'KANON 2010', url: 'https://pubmed.ncbi.nlm.nih.gov/20660401/' },
    KANON2023: { nombre: 'Ensayo KANON a los 11 años (2023)', corto: 'KANON 11 años', url: 'https://pubmed.ncbi.nlm.nih.gov/38320141/' },
    COPER: { nombre: 'Criterios de «potencial coper» (Fitzgerald et al., 2000), citados en revisiones; umbrales sin verificar en el original', corto: 'Fitzgerald 2000 (sin verificar)', url: null },
    GENERAL: { nombre: 'Conocimiento clínico general (no viene de las guías anteriores): confírmalo con tu cirujano', corto: 'Conocimiento clínico general', url: null },
  };

  /* ---------- Ejercicios ---------- */
  const extPasiva = ej('ext_pasiva', 'Extensión pasiva con el talón en alto', '2 series de 5 min', 2, 'Tumbado, con el talón apoyado en un cojín o una toalla enrollada y nada debajo de la rodilla. Deja que la gravedad la estire, con el muslo relajado. Otra opción: boca abajo con la pierna colgando fuera de la cama.', { seg: 300, video: 'heel prop knee extension ACL', fuente: 'MOON2015' });
  const deslizTalon = ej('desliz_talon', 'Deslizamiento del talón', '2 × 10', 2, 'Tumbado boca arriba, desliza el talón hacia el glúteo doblando la rodilla hasta donde puedas, aguanta un par de segundos y vuelve. Puedes ayudarte con una toalla.', { video: 'heel slides ACL rehab' });
  const cuadEstatico = ej('cuad_estatico', 'Contracción de cuádriceps', '2 × 10, aguanta 5 s', 2, 'Con la pierna estirada, aprieta el muslo empujando la parte de atrás de la rodilla contra la cama. Debes ver cómo sube la rótula.', { seg: 5, video: 'quad sets ACL rehab', fuente: 'ASP2023' });
  const slr = ej('slr', 'Elevación de pierna recta', '2 × 10', 2, 'Tumbado, aprieta primero el cuádriceps y levanta la pierna estirada hasta la altura de la otra rodilla. Si la rodilla se dobla al subir, vuelve a la contracción de cuádriceps hasta que no pase.', { video: 'straight leg raise ACL no lag', fuente: 'MOON2015' });
  const rotula = ej('rotula', 'Movilización de la rótula', '2 min', 1, 'Pierna estirada y relajada. Desliza suavemente la rótula de lado a lado y de arriba abajo con los dedos. Para si aumenta la hinchazón.', { video: 'patella mobilization after ACL surgery', fuente: 'MOON2015', injerto: { rotuliano: 'Con injerto rotuliano es especialmente útil para que no se pegue la cicatriz (inferencia: las guías no lo separan por injerto).' } });
  const cadera = ej('cadera', 'Cadera: pierna de lado y boca abajo', '2 × 10 de cada', 2, 'Tumbado de lado, sube la pierna de arriba estirada. Luego boca abajo, sube la pierna estirada apretando el glúteo. Sin dolor en la rodilla.', { video: 'side lying hip abduction prone hip extension', fuente: 'MOON2015' });
  const talonesSentado = ej('talones_sentado', 'Elevación de talones', '2 × 15', 2, 'Sentado o de pie con apoyo en las dos piernas, sube y baja los talones despacio.', { video: 'calf raises after ACL surgery', fuente: 'MOON2015' });
  const frio = ej('frio', 'Frío con compresión y pierna en alto', '15 min', 1, 'Frío envuelto en un paño (nunca hielo directo sobre la piel) con algo de compresión y la pierna por encima del corazón. Las primeras 24 h, 15 min cada hora; después, unas 3 veces al día.', { seg: 900, video: 'ice compression elevation knee after surgery', fuente: 'MOON2015', injerto: { rotuliano: 'Pon frío también en la zona de donde sacaron el injerto.', isquios: 'Pon frío también en la zona de donde sacaron el injerto.', cuadriceps: 'Pon frío también en la zona de donde sacaron el injerto.' } });
  const bici = ej('bici', 'Bicicleta estática', '10-20 min suave', 1, 'Resistencia baja. Si aún no das la vuelta completa, empieza con medio pedaleo adelante y atrás y baja el sillín poco a poco para ganar flexión.', { video: 'stationary bike after ACL surgery', fuente: 'MOON2015' });
  const puenteDos = ej('puente_dos', 'Puente de glúteo con dos piernas', '3 × 12', 3, 'Tumbado boca arriba con las rodillas dobladas, sube la cadera apretando el glúteo y baja despacio.', { video: 'glute bridge ACL rehab', injerto: { isquios: 'Con injerto de isquiotibiales, si tira detrás del muslo, apoya los pies más cerca del glúteo o pregunta a tu fisio.' } });
  const miniSent = ej('mini_sent', 'Mini sentadilla o sentadilla en pared', '3 × 12', 3, 'Espalda contra la pared o agarrado a algo, baja poco (hasta unos 45°) con las rodillas alineadas sobre los pies y el peso repartido entre las dos piernas.', { video: 'wall squat mini squat ACL rehab', fuente: 'MOON2015' });
  const talonesPie = ej('talones_pie', 'Elevación de talones de pie', '3 × 15', 3, 'De pie, sube y baja los talones despacio. Cuando sea fácil, hazlo con una pierna.', { video: 'standing calf raise single leg', fuente: 'MOON2015' });
  const equilibrio = ej('equilibrio', 'Equilibrio a una pierna', '3 × 30 s', 3, 'De pie sobre la pierna operada, rodilla ligeramente doblada, cerca de algo para agarrarte. Para hacerlo más difícil: ojos cerrados o superficie blanda.', { seg: 30, video: 'single leg balance ACL rehab', fuente: 'MOON2015' });
  const stepUp = ej('step_up', 'Subir a un escalón', '3 × 10', 3, 'Sube a un escalón bajo con la pierna operada, controlando que la rodilla no se vaya hacia dentro. Baja despacio.', { video: 'step up ACL rehab', fuente: 'MOON2015' });
  const prensa = ej('prensa', 'Prensa de piernas (0-45°)', '3 × 12', 3, 'En máquina, con las dos piernas y poco recorrido (como media sentadilla). Sube el peso poco a poco.', { video: 'leg press ACL rehab', fuente: 'ASP2023', injerto: { isquios: 'Aspetar la permite desde la semana 3 con injerto de isquiotibiales.', rotuliano: 'Con injerto rotuliano, cuándo empezar lo decide tu fisio. Vigila el dolor en la parte delantera de la rodilla.' } });
  const extCorta = ej('ext_corta', 'Extensión de rodilla en máquina (90-45°)', '3 × 12, peso ligero', 3, 'Solo el tramo de rodilla doblada a medio estirar (de 90° a unos 45°). Desde la semana 4 y con el visto bueno de tu fisio.', { video: 'knee extension 90-45 degrees ACL', fuente: 'ASP2023', injerto: { rotuliano: 'Vigila el dolor en la parte delantera de la rodilla y baja la carga si aparece.' } });
  const curl = ej('curl_isquios', 'Curl de isquiotibiales', '3 × 12', 3, 'En máquina o con banda elástica, dobla la rodilla contra resistencia, despacio.', { video: 'hamstring curl ACL rehab', fuente: 'MOON2015', injerto: { isquios: 'Con injerto de isquiotibiales, cuándo empezar con resistencia lo decide tu cirujano o fisio: no lo adelantes.' } });
  const abdBanda = ej('abd_banda', 'Abducción de cadera con banda', '3 × 12', 3, 'Banda elástica alrededor de las rodillas o los tobillos. De lado o de pie, separa la pierna sin girar el tronco.', { video: 'banded hip abduction', fuente: 'MOON2015' });
  const bici2 = ej('bici2', 'Bicicleta o elíptica', '15-20 min', 1, 'Aeróbico sin impacto. Sube la resistencia poco a poco.', { video: 'stationary bike ACL rehab', fuente: 'MOON2015' });
  const sentadilla = ej('sentadilla', 'Sentadilla con peso', '3 × 10', 3, 'Con mancuerna delante del pecho o barra, baja controlado con las rodillas alineadas sobre los pies.', { video: 'goblet squat ACL rehab', fuente: 'JOSPT2017' });
  const prensa1 = ej('prensa_1', 'Prensa a una pierna', '3 × 10', 3, 'Una pierna cada vez. Empieza por la sana para tener referencia y busca hacer lo mismo con la operada.', { video: 'single leg press ACL', fuente: 'MEL2' });
  const stepDown = ej('step_down', 'Bajar de un escalón', '3 × 10', 3, 'De pie sobre un escalón con la pierna operada, baja el otro talón al suelo despacio, sin que la rodilla se vaya hacia dentro.', { video: 'lateral step down ACL', fuente: 'MOON2015' });
  const zancada = ej('zancada', 'Zancada atrás o sentadilla búlgara', '3 × 8 por pierna', 3, 'Paso largo hacia atrás y baja en vertical. Cuando lo controles, con el pie de atrás en un banco.', { video: 'reverse lunge bulgarian split squat ACL', fuente: 'JOSPT2017' });
  const extCompleta = ej('ext_completa', 'Extensión de rodilla en máquina (90-0°)', '3 × 10', 3, 'Ya con el recorrido completo. Sube la carga de forma gradual.', { video: 'knee extension machine ACL rehab', fuente: 'MOON2015', injerto: { rotuliano: 'Vigila el dolor en la parte delantera de la rodilla.' } });
  const pesoMuerto = ej('peso_muerto', 'Peso muerto rumano', '3 × 10', 3, 'Con mancuernas, baja el tronco con la espalda recta y las rodillas algo dobladas, notando estirar detrás del muslo.', { video: 'romanian deadlift ACL rehab', injerto: { isquios: 'Con injerto de isquiotibiales, empieza ligero y solo con el visto bueno de tu fisio.' } });
  const puenteUno = ej('puente_uno', 'Puente a una pierna', '3 × 12', 3, 'Como el puente normal pero con una sola pierna apoyada. Más difícil: talón sobre un banco.', { video: 'single leg glute bridge', fuente: 'MEL2', injerto: { isquios: 'Carga mucho los isquiotibiales: con ese injerto puede costar más al principio.' } });
  const talonesUno = ej('talones_uno', 'Elevación de talón a una pierna', '3 × 15', 3, 'En el borde de un escalón, sube y baja el talón despacio (unos 2 s cada repetición).', { video: 'single leg calf raise step', fuente: 'MEL2' });
  const planchaLat = ej('plancha_lat', 'Plancha lateral', '3 × 30 s por lado', 3, 'Apoyado en el antebrazo y los pies, cuerpo recto. Si cuesta, con las rodillas apoyadas.', { seg: 30, video: 'side plank', fuente: 'MEL2' });
  const perturb = ej('perturbaciones', 'Equilibrio con perturbaciones', '3 × 30 s', 3, 'A una pierna sobre una superficie blanda, lanzando y recibiendo una pelota o con alguien que te dé pequeños empujones.', { seg: 30, video: 'single leg balance perturbation ACL', fuente: 'MOON2015' });
  const core = ej('core', 'Tronco: bicho muerto', '3 × 10', 3, 'Boca arriba con brazos y piernas en alto, baja a la vez el brazo y la pierna contrarios sin arquear la espalda.', { video: 'dead bug exercise', fuente: 'ASP2023' });
  const pogos = ej('pogos', 'Rebotes (pogos)', '3 × 20 rebotes', 3, 'Saltitos cortos y rápidos en el sitio, primero con las dos piernas y después con una. Sin dolor: es la prueba de que la rodilla tolera el impacto.', { video: 'pogo hops ACL return to running', fuente: 'ASP2023' });
  const aterrizaje = ej('aterrizaje', 'Saltar y aterrizar con las dos piernas', '3 × 6', 3, 'Salta poco y cae suave, con las rodillas alineadas sobre los pies, cadera atrás, y aguanta 2 s quieto.', { video: 'landing technique ACL drop squat', fuente: 'MEL2' });
  const tijera = ej('tijera', 'Saltos de tijera', '3 × 6 por pierna', 3, 'Desde zancada, salta y cambia de pierna en el aire. Cae controlado.', { video: 'split squat jumps ACL rehab', fuente: 'MEL2' });
  const aterrizaje1 = ej('aterrizaje_1', 'Aterrizaje a una pierna desde un escalón', '3 × 6', 3, 'Déjate caer desde un escalón bajo sobre la pierna operada y aguanta 3 s quieto, rodilla alineada.', { video: 'single leg landing ACL', fuente: 'MEL2' });
  const trote = ej('trote', 'Andar y trotar', '1 min trotando + 1 min andando, × 10', 10, 'Terreno llano o cinta, días alternos. Si al día siguiente la rodilla no está más hinchada ni dolorida, alarga el trote poco a poco. Ninguna guía fija el programa exacto: ajústalo con tu fisio.', { video: 'return to running program after ACL', fuente: 'ASP2023' });
  const fuerzaMant = ej('fuerza_mant', 'Fuerza: sentadilla, prensa a una pierna, extensión y curl', '3 × 8 de cada', 3, 'Mantén el trabajo de gimnasio mientras empiezas a correr y saltar.', { video: 'ACL strength training late stage', fuente: 'JOSPT2017' });
  const agilidad = ej('agilidad', 'Escalera de agilidad y skipping', '3 rondas', 3, 'Pies rápidos, cortos y ligeros. Empieza al 50-75 % de tu velocidad.', { video: 'agility ladder drills ACL rehab', fuente: 'MOON2015' });
  const lateral = ej('lateral', 'Desplazamientos laterales y carioca', '3 × 20 m', 3, 'De lado sin cruzar los pies y luego cruzando (carioca). Al 50-75 % de velocidad.', { video: 'lateral shuffle carioca drill', fuente: 'MOON2015' });
  const ocho = ej('ocho', 'Carrera en ocho', '4 vueltas', 4, 'Corre haciendo un ocho alrededor de dos conos. Al 50-75 % de velocidad, sin dolor ni sensación de inestabilidad.', { video: 'figure 8 running drill ACL', fuente: 'MOON2015' });
  const saltos1 = ej('saltos_1', 'Saltos a una pierna: adelante, atrás y de lado', '3 × 8', 3, 'Saltos cortos sobre la pierna operada, aterrizando estable antes del siguiente.', { video: 'single leg hops multidirectional ACL', fuente: 'ASP2023' });
  const cajon = ej('cajon', 'Saltos al cajón', '3 × 6', 3, 'Salta a un cajón bajo con las dos piernas y baja andando, no saltando.', { video: 'box jumps ACL rehab', fuente: 'ASP2023' });
  const fuerzaAlta = ej('fuerza_alta', 'Fuerza intensa: sentadilla, peso muerto y zancadas', '4 × 6 de cada', 4, 'Cargas altas y técnica limpia para acercar la pierna operada al 90 % de la sana.', { video: 'heavy strength training ACL late stage', fuente: 'MOON2015' });
  const prevencion = ej('prevencion', 'Programa de prevención (tipo FIFA 11+)', '15 min', 1, 'Calentamiento con carrera, fuerza, saltos y equilibrio antes de cada entrenamiento. Hazlo siempre, también cuando te den el alta.', { video: 'FIFA 11+ warm up', fuente: 'MEL2' });
  const deporte = ej('deporte', 'Entrenamiento de tu deporte, de menos a más', 'Según tu equipo', 1, 'Gestos de tu deporte sin oposición, luego con oposición controlada y después entrenamiento completo, antes de competir.', { video: 'return to sport progression ACL', fuente: 'ASP2023' });
  const esprint = ej('esprint', 'Esprints y cambios de dirección', '6-8 repeticiones', 6, 'Aceleraciones, frenadas y cambios de dirección, subiendo hasta el 100 % cuando no haya dolor ni inestabilidad.', { video: 'change of direction drills ACL', fuente: 'MOON2015' });

  /* Notas para una rodilla con el menisco roto o posiblemente roto (antes de operar).
     Límites conservadores: opinión clínica del auditor, no vienen de una guía concreta. */
  const MR = {
    flex: 'Menisco tocado: no la fuerces. Si notas un tope, un enganche o dolor en la parte interna, para ahí.',
    carga: 'Menisco tocado: con peso, no bajes de 60-70° de flexión y no gires la rodilla con el pie apoyado.',
    impacto: 'Menisco tocado: solo si no hay derrame ni fallos de la rodilla y tu fisio lo aprueba.',
  };
  extPasiva.meniscoRoto = 'Menisco tocado: deja que estire sola. No empujes contra un tope duro: un bloqueo no se vence con peso.';
  deslizTalon.meniscoRoto = MR.flex;
  bici.meniscoRoto = 'Buena opción con el menisco tocado: gana flexión poco a poco, sin forzar.';
  [miniSent, prensa, stepUp, stepDown, puenteUno].forEach(e => { e.meniscoRoto = MR.carga; });
  curl.meniscoRoto = 'Menisco tocado: sin dolor en la parte interna de la rodilla; si duele, menos recorrido.';
  perturb.meniscoRoto = 'Menisco tocado: sin giros bruscos sobre la pierna apoyada.';
  aterrizaje.meniscoRoto = MR.impacto;

  /* ---------- Técnica, esfuerzo, registro y variantes en casa ----------
     Pautas generales de ejecución, escritas para la app: no son criterios clínicos ni salen de las guías.
     Son orientativas y, si tu fisio dice otra cosa, manda lo suyo. */
  const TECNICA = {
    ext_pasiva: ['Nada debajo de la rodilla: solo el talón en alto', 'Muslo relajado: deja que la gravedad trabaje', 'Tirantez detrás de la rodilla vale; dolor fuerte, no'],
    desliz_talon: ['Talón pegado a la cama o al suelo', 'Dobla hasta notar tensión, sin rebotes', 'Vuelve despacio hasta estirar del todo'],
    cuad_estatico: ['Empuja la parte de atrás de la rodilla hacia abajo', 'Mira que la rótula suba', 'Aguanta sin contener la respiración'],
    slr: ['Aprieta el muslo antes de levantar', 'Rodilla recta durante toda la subida', 'Sube hasta la altura de la otra rodilla y baja despacio'],
    rotula: ['Pierna estirada y muslo relajado', 'Movimientos suaves en las cuatro direcciones', 'Para si la rodilla se hincha más'],
    cadera: ['Tronco quieto, sin girar la cadera', 'Pierna estirada y punta del pie al frente', 'Sube despacio y baja controlando'],
    talones_sentado: ['Peso repartido en los dos pies', 'Sube del todo y baja despacio'],
    frio: ['Siempre con un paño entre el frío y la piel', 'Pierna por encima del corazón', 'Quítalo si notas quemazón o la piel muy blanca'],
    bici: ['Sillín alto al principio: abajo la rodilla casi se estira', 'Resistencia baja y pedaleo redondo', 'Si no da la vuelta, medio pedaleo adelante y atrás'],
    puente_dos: ['Pies a la anchura de la cadera', 'Sube apretando el glúteo, sin arquear la espalda', 'Baja despacio'],
    mini_sent: ['Rodillas en la línea de los pies, sin irse hacia dentro', 'Peso en los talones y repartido en las dos piernas', 'Baja poco y controlado'],
    talones_pie: ['Sube recto, sin echar el peso a los dedos pequeños', 'Arriba un segundo y baja despacio'],
    equilibrio: ['Rodilla un poco doblada, no bloqueada', 'Cadera nivelada, sin dejarla caer', 'Mira un punto fijo al frente'],
    step_up: ['Todo el pie en el escalón', 'Rodilla hacia el segundo dedo del pie', 'Sube con la pierna de arriba, sin impulsarte con la de abajo'],
    prensa: ['Espalda y cadera pegadas al respaldo', 'Rodillas en la línea de los pies', 'Recorrido corto y sin bloquear la rodilla arriba'],
    ext_corta: ['Solo el tramo de 90° a unos 45°', 'Sube y baja despacio, sin tirones', 'Peso que puedas mover sin dolor delante de la rodilla'],
    curl_isquios: ['Cadera quieta, sin levantarla', 'Dobla despacio y baja aún más despacio', 'Para si tira de la zona del injerto'],
    abd_banda: ['Tronco recto, sin inclinarte', 'Pies al frente, sin girar la pierna', 'Banda tensa todo el rato'],
    bici2: ['Empieza suave los primeros minutos', 'Sube la resistencia poco a poco', 'Rodilla alineada con el pie al pedalear'],
    sentadilla: ['Rodillas en la línea de los pies', 'Cadera atrás y pecho alto', 'Baja hasta donde controles sin dolor'],
    prensa_1: ['Empieza por la sana para tener referencia', 'Rodilla alineada con el pie', 'La misma profundidad con las dos piernas'],
    step_down: ['Pelvis nivelada, sin dejarla caer', 'Rodilla hacia el segundo dedo, no hacia dentro', 'Baja en unos 3 s y toca el suelo con el talón'],
    zancada: ['Baja en vertical, con el tronco recto', 'Rodilla de delante sobre el pie', 'Empuja con el talón de la pierna de delante'],
    ext_completa: ['Estira del todo sin dar un golpe', 'Baja en 2-3 s', 'Si duele delante de la rodilla, menos peso'],
    peso_muerto: ['Espalda recta y mancuernas pegadas a las piernas', 'Rodillas algo dobladas y quietas', 'Lleva la cadera atrás hasta notar el estiramiento'],
    puente_uno: ['Cadera nivelada al subir', 'Empuja con el talón', 'Baja despacio sin dejar caer la cadera'],
    talones_uno: ['Sube del todo, unos 2 s cada repetición', 'Rodilla estirada, sin bloquearla', 'La mano en la pared, para el equilibrio y no para empujar'],
    plancha_lat: ['Cuerpo en línea de la cabeza a los pies', 'Cadera alta, sin dejarla caer', 'Respira con normalidad'],
    perturbaciones: ['Rodilla un poco doblada y alineada', 'Recupera el equilibrio sin girar la rodilla', 'Empieza con empujones suaves'],
    core: ['Zona lumbar pegada al suelo', 'Baja brazo y pierna contrarios despacio', 'Suelta el aire al bajar'],
    pogos: ['Rebotes cortos sobre la parte delantera del pie', 'Rodillas casi estiradas y alineadas', 'Cae suave y en silencio'],
    aterrizaje: ['Cae sobre la parte delantera del pie y amortigua', 'Rodillas en la línea de los pies', 'Aguanta quieto 2 s'],
    tijera: ['Tronco recto', 'Cae suave, con las rodillas alineadas', 'Para si pierdes el control'],
    aterrizaje_1: ['Cae con la rodilla algo doblada', 'Rodilla alineada con el pie', 'Aguanta 3 s sin moverte'],
    trote: ['Pasos cortos y ligeros', 'Terreno llano', 'Si al día siguiente está peor, repite la sesión'],
    fuerza_mant: ['Técnica limpia antes que más peso', 'Sube la carga poco a poco', 'Rodillas alineadas en todos los ejercicios'],
    agilidad: ['Pies rápidos y ligeros', 'Mirada al frente', 'Empieza al 50-75 % de tu velocidad'],
    lateral: ['Rodillas un poco dobladas y cadera baja', 'De lado, sin cruzar los pies', 'Frena sin que la rodilla se vaya hacia dentro'],
    ocho: ['Baja el centro de gravedad en las curvas', 'Pasos cortos al girar', 'Sin dolor ni sensación de inestabilidad'],
    saltos_1: ['Aterriza estable antes del siguiente salto', 'Rodilla alineada con el pie', 'Saltos cortos al principio'],
    cajon: ['Cajón bajo al principio', 'Cae suave arriba, con las rodillas alineadas', 'Baja andando, no saltando'],
    fuerza_alta: ['Calienta con series ligeras antes', 'Técnica limpia en cada repetición', 'Descansa 2-3 min entre series'],
    prevencion: ['Antes de cada entrenamiento', 'Cuida la técnica de los aterrizajes', 'No te lo saltes aunque vayas con prisa'],
    deporte: ['De menos a más: sin oposición, con oposición controlada y entrenamiento completo', 'Sube un escalón cada vez', 'Para si la rodilla se hincha o falla'],
    esprint: ['Calienta bien antes', 'Frena en varios pasos, sin bloquear la rodilla', 'Sube la velocidad poco a poco'],
  };
  /* Esfuerzo orientativo en los ejercicios de fuerza (RPE de 0 a 10; 10 = no podrías hacer ni una repetición más) */
  const RPE = {
    puente_dos: '5-6', mini_sent: '5-6', talones_pie: '6', step_up: '6', prensa: '6-7', ext_corta: '5-6', curl_isquios: '6', abd_banda: '6',
    sentadilla: '7', prensa_1: '7', step_down: '6-7', zancada: '7', ext_completa: '7', peso_muerto: '7', puente_uno: '7', talones_uno: '7',
    plancha_lat: '7', core: '6', fuerza_mant: '7-8', fuerza_alta: '8',
  };
  /* Sin peso ni repeticiones que apuntar: solo una nota */
  const SIN_REGISTRO = ['ext_pasiva', 'rotula', 'frio', 'trote', 'prevencion', 'deporte'];
  /* Variante sin máquinas para entrenar en casa (desde la fase de fuerza y control) */
  const CASA = {
    sentadilla: { nombre: 'Sentadilla con mochila o garrafas', desc: 'Con una mochila cargada o dos garrafas de agua. Baja controlado con las rodillas alineadas sobre los pies.' },
    prensa_1: { nombre: 'Levantarse de una silla a una pierna', desc: 'Siéntate y levántate de una silla firme solo con la pierna operada, bajando despacio. Si cuesta, usa una silla más alta.', tecnica: ['Brazos cruzados o al frente', 'Rodilla alineada con el pie', 'Baja en 2-3 s, sin dejarte caer'] },
    ext_completa: { nombre: 'Extensión de rodilla sentado con banda o tobillera', desc: 'Sentado en una silla alta, con una banda o un peso en el tobillo, estira la rodilla del todo y baja despacio. Con el recorrido que te haya autorizado tu fisio.' },
    curl_isquios: { nombre: 'Curl de isquios con banda', desc: 'Boca abajo o de pie, con una banda atada a un mueble firme y al tobillo, dobla la rodilla despacio contra la banda.' },
    bici2: { nombre: 'Andar a paso ligero o subir escaleras', dosis: '15-20 min', desc: 'Aeróbico sin impacto, a un ritmo que te deje hablar.', tecnica: ['Pasos firmes, sin cojear', 'Sube el ritmo poco a poco', 'En las escaleras, rodilla alineada con el pie'] },
    fuerza_mant: { nombre: 'Fuerza en casa: sentadilla con mochila, silla a una pierna, extensión y curl con banda', desc: 'Mantén la fuerza mientras empiezas a correr y saltar. Si puedes, una sesión por semana en el gimnasio.' },
    fuerza_alta: { nombre: 'Fuerza en casa: búlgara con peso, peso muerto a una pierna y zancadas', dosis: '4 × 8-10 de cada', desc: 'En casa cuesta llegar a cargas altas: usa mochila o garrafas, baja despacio y acaba cada serie cerca del fallo con buena técnica. Si puedes, una sesión por semana en el gimnasio.' },
    cajon: { nombre: 'Saltos a un escalón firme', desc: 'Salta con las dos piernas a un escalón bajo y estable, y baja andando.' },
    agilidad: { nombre: 'Pies rápidos con marcas en el suelo', desc: 'Marca una escalera en el suelo con cinta o calcetines. Pies rápidos, cortos y ligeros, al 50-75 % de tu velocidad.' },
  };

  /* Calentamiento corto propio, al principio de la sesión desde la fase de fuerza y control */
  const CALENTAMIENTO = [
    ej('cal_bici', 'Bici o elíptica suave', '5 min', 1, 'Para que la rodilla entre en calor, con resistencia baja.', { seg: 300, video: 'stationary bike warm up knee', tecnica: ['Resistencia baja', 'Pedaleo redondo y constante'], casa: { nombre: 'Marcha en el sitio o subir y bajar un escalón', dosis: '3-5 min', desc: 'A ritmo suave, con la rodilla alineada con el pie.', tecnica: ['Ritmo suave', 'Rodilla alineada con el pie'] } }),
    ej('cal_puente', 'Puente de glúteo', '1 × 10', 1, 'Sin peso, para despertar el glúteo antes de cargar.', { video: 'glute bridge', tecnica: ['Sube apretando el glúteo', 'Sin arquear la espalda'] }),
    ej('cal_lateral', 'Pasos laterales con banda', '2 × 10 pasos por lado', 2, 'Banda alrededor de las rodillas o los tobillos, rodillas algo dobladas. Sin banda también vale.', { video: 'banded lateral walk', tecnica: ['Rodillas un poco dobladas', 'Pies al frente, sin juntarlos del todo'] }),
    ej('cal_sentadilla', 'Sentadilla sin peso', '1 × 10', 1, 'Hasta donde controles y despacio. Es para preparar, no para cansarte.', { video: 'bodyweight squat technique', tecnica: ['Rodillas en la línea de los pies', 'Baja despacio y sube sin prisa'] }),
  ];
  CALENTAMIENTO.forEach(e => { e.rpe = '3-4'; e.cal = true; e.sinRegistro = true; });
  CALENTAMIENTO[3].meniscoRoto = MR.carga;

  const evitarEspera = [
    'Forzar la extensión o la flexión contra un tope duro: un bloqueo del menisco no se vence insistiendo',
    'Agacharte profundo con peso (más de 60-70°) y girar la rodilla con el pie apoyado',
    'Pivotes, cambios de dirección y deportes de contacto: cada vez que la rodilla se va puede dañar el menisco y el cartílago',
    'Correr o saltar sin el visto bueno de tu cirujano',
    'Seguir con un ejercicio que hace que la rodilla falle, enganche o se bloquee: déjalo y avisa',
  ];

  /* ---------- Fases ---------- */
  const fases = {
    p1: {
      id: 'p1', nombre: 'Calmar la rodilla', semanas: '',
      sesiones: { porDia: 1 }, frecuencia: 'Movilidad todos los días. Frío y pierna en alto si se hincha.',
      objetivos: ['Bajar la hinchazón', 'Recuperar la extensión completa y casi toda la flexión, sin forzar', 'Caminar sin cojear', 'Despertar el cuádriceps'],
      foco: ['Rodilla recta del todo', 'Bajar la hinchazón', 'Caminar sin cojear'],
      criterios: [
        { id: 'der', texto: 'Sin derrame o solo una traza', medida: 'derrame_max', umbral: 'traza', fuente: 'DO_5A' },
        { id: 'ext', texto: 'Extensión completa (0°)', medida: 'ext_max', umbral: 0, fuente: 'MEL2' },
        { id: 'flex', texto: 'Flexión de 120° o más (si engancha o hay tope, no la fuerces y díselo al fisio)', medida: 'flex_min', umbral: 120, fuente: 'MOON2015' },
        { id: 'slr', texto: 'Levantas la pierna recta sin que se doble la rodilla', medida: 'slr_sin_lag', fuente: 'MOON2015' },
        { id: 'marcha', texto: 'Caminas sin cojear', medida: 'sin_cojera', fuente: 'MOON2015' },
        { id: 'dolor', texto: 'Poco o ningún dolor al moverte (2/10 o menos)', medida: 'dolor_max', umbral: 2, fuente: 'DO_5A' },
      ],
      ejercicios: [extPasiva, deslizTalon, cuadEstatico, slr, cadera, talonesPie, bici, frio],
      evitar: evitarEspera,
      fuentes: ['DO_5A', 'MEL2', 'MOON2015'],
    },
    p2: {
      id: 'p2', nombre: 'Fuerza antes de operar', semanas: '',
      sesiones: { porSemana: 3 }, frecuencia: 'Fuerza 2-3 días por semana (JOSPT). Los demás días, solo movilidad y bici.',
      objetivos: ['Ganar fuerza de cuádriceps, isquiotibiales, cadera y gemelo con carga progresiva', 'Mantener la rodilla tranquila (sin derrame) mientras subes la carga', 'Que la rodilla no falle'],
      foco: ['Fuerza de cuádriceps', 'Rodilla sin hinchazón', 'Que no falle'],
      criterios: [
        { id: 'der', texto: 'Sin derrame (o solo traza) en las medidas de las últimas 2 semanas', medida: 'derrame_estable', umbral: 'traza', dias: 14, fuente: 'DO_5A' },
        { id: 'fallos', texto: 'La rodilla no ha fallado en las últimas 4 semanas', medida: 'sin_fallos', dias: 28, fuente: 'DO_5A' },
        { id: 'cuad', texto: 'Fuerza del cuádriceps al 80 % de la sana (Melbourne pide 90 % antes de operar)', medida: 'lsi_cuad', umbral: 80, fuente: 'MEL2' },
        { id: 'ext', texto: 'Mantienes la extensión completa (0°)', medida: 'ext_max', umbral: 0, fuente: 'MEL2' },
      ],
      ejercicios: [bici2, miniSent, prensa, stepUp, extCorta, curl, puenteDos, puenteUno, talonesUno, abdBanda, equilibrio, extPasiva],
      evitar: evitarEspera,
      fuentes: ['JOSPT2017', 'MEL2', 'ASP2023', 'DO_5A'],
    },
    p3: {
      id: 'p3', nombre: 'Control y llegar fuerte a la operación', semanas: '',
      sesiones: { porSemana: 3 }, frecuencia: 'Fuerza y control 2-3 días por semana hasta el día de la operación.',
      objetivos: ['Equilibrio y control de la rodilla con perturbaciones', 'Fuerza cerca del 90 % de la pierna sana', 'Guardar tus medidas de antes de operar para comparar después', 'Llegar a la operación con la rodilla tranquila, recta y fuerte'],
      foco: ['Equilibrio y control', 'Fuerza al 90 %', 'Medidas de antes de operar'],
      criterios: [
        { id: 'ext', texto: 'Extensión completa (0°), confirmada por tu fisio', medida: 'ext_max', umbral: 0, profesional: true, fuente: 'MEL2' },
        { id: 'flex', texto: 'Flexión de 120° o más', medida: 'flex_min', umbral: 120, fuente: 'MOON2015' },
        { id: 'der', texto: 'Sin derrame (Melbourne pide cero antes de operar)', medida: 'derrame_estable', umbral: 'traza', dias: 14, fuente: 'MEL2' },
        { id: 'cuad', texto: 'Fuerza del cuádriceps al 90 % de la sana', medida: 'lsi_cuad', umbral: 90, fuente: 'MEL2' },
        { id: 'resist', texto: 'Puente, gemelo, plancha lateral y silla a una pierna al 85 % de la sana', medida: 'resistencia', umbral: 85, fuente: 'MEL2' },
        { id: 'fallos', texto: 'La rodilla no ha fallado en las últimas 4 semanas', medida: 'sin_fallos', dias: 28, fuente: 'DO_5A' },
        { id: 'base', texto: 'Medidas de antes de operar guardadas: movilidad de las dos rodillas, derrame, perímetros, fuerza, resistencia y equilibrio', medida: 'linea_base', fuente: 'MEL2' },
      ],
      ejercicios: [perturb, equilibrio, miniSent, prensa, stepDown, curl, puenteUno, talonesUno, planchaLat, core, abdBanda, aterrizaje, bici2],
      evitar: evitarEspera,
      fuentes: ['MEL2', 'DO_5A', 'MOON2015'],
    },
    /* Fase antigua de un solo bloque: se conserva para perfiles guardados antes de partirla en p1-p3 (se migran a p1). */
    prehab: {
      id: 'prehab', nombre: 'Antes de operar', semanas: '',
      sesiones: { porSemana: 3 }, frecuencia: 'Unas 3 veces por semana. Delaware-Oslo hacía 10 sesiones en 5 semanas.',
      objetivos: ['Bajar la hinchazón todo lo posible', 'Recuperar la extensión completa y casi toda la flexión', 'Fuerza de cuádriceps e isquiotibiales cerca del 90 % de la pierna sana', 'Caminar sin cojear y levantar la pierna recta sin que se doble', 'Aprender los ejercicios que harás después de operarte'],
      foco: ['Rodilla recta del todo (0°)', 'Bajar la hinchazón', 'Despertar el cuádriceps'],
      criterios: [
        { id: 'ext', texto: 'Extensión completa (0°)', medida: 'ext_max', umbral: 0, fuente: 'MEL2' },
        { id: 'flex', texto: 'Flexión de 120° o más', medida: 'flex_min', umbral: 120, fuente: 'MOON2015' },
        { id: 'der', texto: 'Sin derrame o solo una traza (Melbourne pide cero)', medida: 'derrame_max', umbral: 'traza', fuente: 'MEL2' },
        { id: 'slr', texto: 'Levantas la pierna recta sin que se doble la rodilla', medida: 'slr_sin_lag', fuente: 'MOON2015' },
        { id: 'marcha', texto: 'Caminas sin cojear', medida: 'sin_cojera', fuente: 'MOON2015' },
        { id: 'cuad', texto: 'Fuerza del cuádriceps al 90 % de la sana (si tienes cómo medirla)', medida: 'lsi_cuad', umbral: 90, fuente: 'MEL2' },
        { id: 'ref', texto: 'Has guardado tus medidas de antes de operar (saltos, fuerza) para comparar después', medida: 'manual', fuente: 'MEL2' },
      ],
      ejercicios: [extPasiva, deslizTalon, cuadEstatico, slr, puenteDos, miniSent, talonesPie, equilibrio, bici],
      evitar: ['Pivotes y cambios de dirección bruscos', 'Llegar a la operación con la rodilla hinchada, sin extensión o muy débil: se asocia a peores resultados (Melbourne)'],
      fuentes: ['MEL2', 'MOON2015', 'DO_5A'],
    },
    f1: {
      id: 'f1', nombre: 'Proteger y estirar', semanas: '0-2',
      sesiones: { porDia: 3 }, frecuencia: 'Ejercicios suaves 3 veces al día. Frío y pierna en alto entre medias.',
      objetivos: ['Extensión completa en las primeras 2-3 semanas', 'Controlar el dolor y la hinchazón', 'Despertar el cuádriceps hasta levantar la pierna recta sin que se doble', 'Caminar sin cojear y dejar las muletas'],
      foco: ['Rodilla recta del todo', 'Despertar el cuádriceps', 'Bajar la hinchazón'],
      criterios: [
        { id: 'ext', texto: 'Extensión: que no falten más de 5° (lo ideal, 0°)', medida: 'ext_max', umbral: 5, fuente: 'MOON2015' },
        { id: 'flex', texto: 'Flexión de 110° o más', medida: 'flex_min', umbral: 110, fuente: 'MOON2015' },
        { id: 'slr', texto: 'Levantas la pierna recta sin que se doble la rodilla', medida: 'slr_sin_lag', fuente: 'MOON2015' },
        { id: 'der', texto: 'Derrame mínimo (como mucho 1+)', medida: 'derrame_max', umbral: '1+', fuente: 'MOON2015' },
        { id: 'marcha', texto: 'Caminas sin cojear y sin muletas', medida: 'sin_cojera', fuente: 'MOON2015' },
        { id: 'escaleras', texto: 'Subes y bajas escaleras alternando los pies, sin dolor ni inestabilidad', medida: 'manual', fuente: 'MOON2015' },
      ],
      ejercicios: [frio, extPasiva, cuadEstatico, deslizTalon, slr, rotula, cadera, talonesSentado],
      evitar: ['Poner una almohada debajo de la rodilla para dormir: estropea la extensión', 'La máquina de movimiento pasivo continuo: no aporta más que moverte tú (Aspetar, MOON)', 'Inmovilizar la rodilla por rutina: no quita dolor y debilita el músculo (Aspetar)', 'Ejercicios de cuádriceps en máquina antes de lo que diga tu fisio'],
      fuentes: ['MOON2015', 'ASP2023', 'MEL2', 'JOSPT2017'],
    },
    f2: {
      id: 'f2', nombre: 'Fuerza temprana', semanas: '2-6',
      sesiones: { porDia: 1 }, frecuencia: 'Una sesión al día. El trabajo de fuerza, 2-3 días por semana (JOSPT).',
      objetivos: ['Movilidad completa', 'Ganar fuerza, sobre todo de cuádriceps, con carga progresiva', 'Empezar a trabajar el equilibrio', 'Mantener la hinchazón y el dolor al mínimo'],
      foco: ['Llegar a 125° de flexión', 'Fuerza de cuádriceps', 'Equilibrio a una pierna'],
      criterios: [
        { id: 'ext', texto: 'Extensión completa (0°)', medida: 'ext_max', umbral: 0, fuente: 'MEL2' },
        { id: 'flex', texto: 'Flexión de 125° o más', medida: 'flex_min', umbral: 125, fuente: 'MEL2' },
        { id: 'der', texto: 'Sin derrame o solo una traza', medida: 'derrame_max', umbral: 'traza', fuente: 'MEL2' },
        { id: 'slr', texto: 'Levantas la pierna recta sin que se doble la rodilla', medida: 'slr_sin_lag', fuente: 'MEL2' },
        { id: 'funcion', texto: 'Tu rodilla funciona en el día a día por encima de 7 sobre 10', medida: 'funcion_min', umbral: 7, fuente: 'MOON2015' },
      ],
      ejercicios: [bici, miniSent, stepUp, prensa, extCorta, curl, talonesPie, equilibrio, abdBanda, extPasiva],
      evitar: ['Correr, saltar o pivotar', 'Subir la carga si al día siguiente aumentan el dolor o la hinchazón (Melbourne)', 'Extensión de rodilla en máquina fuera del tramo 90-45° antes de la semana 4-6'],
      fuentes: ['MOON2015', 'ASP2023', 'MEL2', 'JOSPT2017'],
    },
    f3: {
      id: 'f3', nombre: 'Fuerza y control', semanas: '6-12',
      sesiones: { porSemana: 3 }, frecuencia: 'Gimnasio 2-3 días por semana (JOSPT).',
      objetivos: ['Mantener la movilidad completa', 'Recuperar casi toda la fuerza y el equilibrio a una pierna', 'Sentadilla a una pierna limpia, sin que la rodilla se vaya hacia dentro', 'Preparar la vuelta a correr'],
      foco: ['Fuerza a una pierna', 'Sentadilla a una pierna limpia', 'Equilibrio'],
      criterios: [
        { id: 'ext', texto: 'Extensión completa (0°)', medida: 'ext_max', umbral: 0, fuente: 'ASP2023' },
        { id: 'flex', texto: 'Flexión al 95 % de la rodilla sana', medida: 'flex_pct', umbral: 95, fuente: 'ASP2023' },
        { id: 'der', texto: 'Sin derrame o solo una traza', medida: 'derrame_max', umbral: 'traza', fuente: 'ASP2023' },
        { id: 'dolor', texto: 'Prácticamente sin dolor en el día a día (2/10 o menos)', medida: 'dolor_max', umbral: 2, fuente: 'ASP2023' },
        { id: 'resist', texto: 'Puente, gemelo, plancha lateral y silla a una pierna al 85 % de la sana (mínimos: 20, 20, 30 s y 10)', medida: 'resistencia', umbral: 85, fuente: 'MEL2' },
        { id: 'equil', texto: 'Equilibrio a una pierna: 43 s con ojos abiertos y 9 s con ojos cerrados', medida: 'equilibrio', fuente: 'MEL2' },
        { id: 'cuad', texto: 'Fuerza del cuádriceps por encima del 80 % de la sana', medida: 'lsi_cuad', umbral: 80, fuente: 'ASP2023' },
        { id: 'sentadilla', texto: 'Sentadilla a una pierna desde un cajón de 20 cm, 5 repeticiones limpias (sin que la rodilla se vaya hacia dentro ni se mueva la pelvis)', medida: 'manual', fuente: 'MEL2' },
        { id: 'pogos', texto: 'Rebotes a una pierna (pogos) sin dolor', medida: 'manual', fuente: 'ASP2023' },
        { id: 'tiempo', texto: 'Al menos 12 semanas desde la operación (los estudios usan entre 8 y 16)', medida: 'semanas_min', umbral: 12, solo: 'operado', fuente: 'ASP2023' },
      ],
      ejercicios: [sentadilla, prensa1, stepDown, zancada, extCompleta, curl, puenteUno, talonesUno, planchaLat, perturb, core, bici2],
      evitar: ['Cortes, pivotes y deporte', 'Subir de golpe el trabajo excéntrico (bajar despacio con carga): Melbourne pide descanso y vigilar la rótula'],
      fuentes: ['MEL2', 'ASP2023', 'MOON2015', 'JOSPT2017'],
    },
    f4: {
      id: 'f4', nombre: 'Vuelta a correr', semanas: '12-16', semanasSC: '20-24', carrera: true,
      sesiones: { porSemana: 3 }, frecuencia: 'Carrera en días alternos y gimnasio 2-3 días por semana.',
      objetivos: ['Volver a correr de forma progresiva, sin dolor ni hinchazón', 'Empezar a saltar: primero con las dos piernas, luego con una', 'Aterrizar y frenar con buena técnica', 'Mantener la fuerza'],
      foco: ['Correr sin dolor', 'Aterrizajes limpios', 'Mantener el gimnasio'],
      criterios: [
        { id: 'correr', texto: 'Corres seguido sin dolor y sin más hinchazón al día siguiente', medida: 'manual', fuente: 'MOON2015' },
        { id: 'saltar', texto: 'Saltas con las dos piernas y con una sin dolor, derrame ni fallos', medida: 'manual', fuente: 'MOON2015' },
        { id: 'der', texto: 'Sin derrame (0)', medida: 'derrame_max', umbral: '0', fuente: 'MEL2' },
        { id: 'resist', texto: 'Sin diferencias entre piernas en puente, gemelo, plancha lateral y silla (95 %)', medida: 'resistencia', umbral: 95, fuente: 'MEL2' },
        { id: 'saltos', texto: 'Saltos a una pierna al 75 % de la sana', medida: 'lsi_saltos', umbral: 75, fuente: 'MOON2015' },
      ],
      ejercicios: [trote, pogos, aterrizaje, tijera, aterrizaje1, fuerzaMant],
      evitar: ['Subir a la vez la distancia y la velocidad', 'Correr sin cumplir los criterios aunque haya pasado el tiempo: el tiempo es necesario pero no suficiente (Aspetar)', 'Cortes, pivotes y deporte de contacto'],
      fuentes: ['ASP2023', 'MOON2015', 'MEL2'],
    },
    f5: {
      id: 'f5', nombre: 'Saltos y agilidad', semanas: '16-24', semanasSC: '24-28',
      sesiones: { porSemana: 3 }, frecuencia: '2-3 días por semana, con descanso entre sesiones.',
      objetivos: ['Cambios de dirección y carrera en ocho a velocidad creciente', 'Pliometría sin dolor ni inestabilidad', 'Saltos a una pierna por encima del 90 % de la sana', 'Empezar ya el programa de prevención'],
      foco: ['Cambios de dirección', 'Saltos a una pierna', 'Programa de prevención'],
      criterios: [
        { id: 'saltos', texto: 'Las cuatro pruebas de salto al 90 % de la sana (Melbourne pide más del 95 %)', medida: 'lsi_saltos', umbral: 90, todos: true, fuente: 'DO_2016' },
        { id: 'cuad', texto: 'Fuerza del cuádriceps al 90 % de la sana', medida: 'lsi_cuad', umbral: 90, fuente: 'DO_5A' },
        { id: 'funcion', texto: 'Tu rodilla funciona por encima de 8 sobre 10', medida: 'funcion_min', umbral: 8, fuente: 'MOON2015' },
        { id: 'ocho', texto: 'Corres en ocho y cambias de dirección al 75 % sin dolor ni inestabilidad', medida: 'manual', fuente: 'MOON2015' },
        { id: 'prev', texto: 'Haces el programa de prevención antes de cada entrenamiento', medida: 'manual', fuente: 'MEL2' },
      ],
      ejercicios: [prevencion, agilidad, lateral, ocho, saltos1, cajon, fuerzaAlta],
      evitar: ['Deporte con oposición o contacto todavía', 'Velocidad máxima y cambios bruscos sin cumplir los criterios', 'Darte el alta porque te sientes bien: el último tramo es el que más protege (Melbourne)'],
      fuentes: ['MOON2015', 'MEL2', 'ASP2023'],
    },
    f6: {
      id: 'f6', nombre: 'Vuelta al deporte', semanas: '24+', semanasSC: '28+',
      sesiones: { porSemana: 3 }, frecuencia: 'Entrenamiento de tu deporte más fuerza 2-3 días por semana.',
      objetivos: ['Pasar de entrenar con limitaciones a entrenar sin ellas', 'Competir solo cuando la cabeza también esté lista', 'Mantener el programa de prevención siempre'],
      foco: ['Entrenar sin limitaciones', 'Confianza', 'Prevención siempre'],
      criterios: [
        { id: 'tiempo', texto: 'Al menos 9 meses desde la operación', medida: 'semanas_min', umbral: 39, solo: 'operado', fuente: 'DO_2016' },
        { id: 'saltos', texto: 'Las cuatro pruebas de salto al 90 % o más', medida: 'lsi_saltos', umbral: 90, todos: true, fuente: 'DO_2016' },
        { id: 'cuad', texto: 'Cuádriceps al 90 % o más', medida: 'lsi_cuad', umbral: 90, fuente: 'DO_2016' },
        { id: 'isq', texto: 'Isquiotibiales al 90 % o más', medida: 'lsi_isquios', umbral: 90, fuente: 'DO_5A' },
        { id: 'der', texto: 'Sin derrame', medida: 'derrame_max', umbral: '0', fuente: 'ASP2023' },
        { id: 'funcion', texto: 'Tu rodilla funciona por encima de 9 sobre 10', medida: 'funcion_min', umbral: 9, fuente: 'MOON2015' },
        { id: 'cabeza', texto: 'Te sientes preparado para volver, sin miedo a la rodilla (tu fisio puede pasarte el cuestionario ACL-RSI)', medida: 'manual', fuente: 'MEL2' },
        { id: 'cirujano', texto: 'Tu cirujano ha revisado la rodilla y está estable', medida: 'manual', fuente: 'ASP2023' },
      ],
      ejercicios: [prevencion, deporte, esprint, fuerzaAlta],
      evitar: ['Volver a competir solo porque ha pasado el tiempo', 'Dejar el programa de prevención al recibir el alta'],
      fuentes: ['DO_2016', 'MEL2', 'ASP2023', 'MOON2015'],
    },
    /* Sin operación */
    c1: {
      id: 'c1', nombre: 'Calmar la rodilla', semanas: '0-8',
      sesiones: { porDia: 1 }, frecuencia: 'Una sesión al día. En Delaware-Oslo se tardó de media unos 2 meses en llegar aquí.',
      objetivos: ['Controlar el dolor y la hinchazón', 'Recuperar la movilidad completa', 'Caminar sin cojear', 'Despertar el cuádriceps'],
      foco: ['Bajar la hinchazón', 'Rodilla recta del todo', 'Caminar sin cojear'],
      criterios: [
        { id: 'ext', texto: 'Extensión completa (0°)', medida: 'ext_max', umbral: 0, fuente: 'MEL2' },
        { id: 'der', texto: 'Sin derrame o solo una traza', medida: 'derrame_max', umbral: 'traza', fuente: 'DO_5A' },
        { id: 'dolor', texto: 'Poco o ningún dolor (2/10 o menos)', medida: 'dolor_max', umbral: 2, fuente: 'DO_5A' },
        { id: 'slr', texto: 'Levantas la pierna recta sin que se doble la rodilla', medida: 'slr_sin_lag', fuente: 'MOON2015' },
        { id: 'marcha', texto: 'Caminas sin cojear', medida: 'sin_cojera', fuente: 'MOON2015' },
      ],
      ejercicios: [extPasiva, deslizTalon, cuadEstatico, slr, puenteDos, miniSent, talonesPie, equilibrio, bici],
      evitar: ['Deportes con pivotes y cambios de dirección hasta terminar el programa'],
      fuentes: ['DO_5A', 'MEL2', 'MOON2015'],
    },
    c2: {
      id: 'c2', nombre: 'Fuerza y control neuromuscular', semanas: '8-13',
      sesiones: { porSemana: 3 }, frecuencia: 'Delaware-Oslo: 10 sesiones supervisadas en 5 semanas. Añade el resto en casa.',
      nota: 'Al terminar esta fase toca decidir con tu cirujano si sigues sin operar o te reconstruyen el ligamento.',
      objetivos: ['Fuerza, equilibrio y saltos controlados de forma progresiva', 'Comprobar si la rodilla aguanta sin fallar', 'Decidir con el cirujano si sigues sin operar'],
      foco: ['Fuerza', 'Equilibrio y control', 'Que la rodilla no falle'],
      criterios: [
        { id: 'prog', texto: 'Has completado unas 10 sesiones del programa (5 semanas)', medida: 'manual', fuente: 'DO_5A' },
        { id: 'salto6', texto: 'Salto de 6 m a la pata coja al 80 % de la sana (umbral orientativo, sin verificar en el original)', medida: 'lsi_tipo', tipo: 'salto_6m', umbral: 80, fuente: 'COPER' },
        { id: 'fallos', texto: 'Como mucho un episodio de fallo de la rodilla desde la lesión (orientativo)', medida: 'manual', fuente: 'COPER' },
        { id: 'decision', texto: 'Lo has hablado con tu cirujano y seguís sin operar', medida: 'manual', fuente: 'DO_5A' },
      ],
      ejercicios: [perturb, sentadilla, stepUp, prensa, puenteUno, talonesUno, aterrizaje, bici2],
      evitar: ['Dar la rodilla por curada sin hacer las pruebas', 'Volver a deportes con pivotes si la rodilla falla: es la señal para plantear la operación'],
      fuentes: ['DO_5A', 'COPER'],
    },
    c3: {
      id: 'c3', nombre: 'Fuerza sin cirugía', semanas: '13-20',
      sesiones: { porSemana: 3 }, frecuencia: 'Gimnasio 2-3 días por semana. En Delaware-Oslo se seguía 3-4 meses más.',
      objetivos: ['Fuerza y saltos por encima del 80 % de la sana', 'Que la rodilla no falle nunca', 'Preparar la vuelta a correr'],
      foco: ['Fuerza a una pierna', 'Equilibrio', 'Que no falle la rodilla'],
      criterios: [
        { id: 'saltos', texto: 'Saltos a una pierna al 80 % de la sana', medida: 'lsi_saltos', umbral: 80, fuente: 'DO_5A' },
        { id: 'cuad', texto: 'Cuádriceps al 80 % de la sana', medida: 'lsi_cuad', umbral: 80, fuente: 'DO_5A' },
        { id: 'der', texto: 'Sin derrame o solo una traza', medida: 'derrame_max', umbral: 'traza', fuente: 'DO_5A' },
        { id: 'resist', texto: 'Puente, gemelo, plancha lateral y silla a una pierna al 85 % de la sana', medida: 'resistencia', umbral: 85, fuente: 'MEL2' },
        { id: 'fallos', texto: 'La rodilla no ha fallado en esta fase', medida: 'manual', fuente: 'DO_5A' },
      ],
      ejercicios: [sentadilla, prensa1, stepDown, zancada, extCompleta, curl, puenteUno, talonesUno, planchaLat, perturb, core, bici2],
      evitar: ['Deportes con pivotes si hay fallos o derrame que vuelve: se plantea la operación (Delaware-Oslo)'],
      fuentes: ['DO_5A', 'MEL2'],
    },
  };

  /* Desde la fase de fuerza y control (f3) y su equivalente sin operación (c3): calentamiento y opción de casa o gimnasio */
  ['f3', 'f4', 'f5', 'f6', 'c3'].forEach(id => { fases[id].calentamiento = CALENTAMIENTO; fases[id].casaGimnasio = true; });

  /* ---------- Resto del cuerpo: sesiones cortas ---------- */
  const fuerzaGeneral = {
    nombre: 'Resto del cuerpo', sesiones: { porSemana: 3 },
    nota: 'Para no perder forma mientras la rodilla se recupera. Si algo carga la rodilla operada, sáltatelo.',
    ejercicios: [
      ej('fg_flexiones', 'Flexiones', '3 × 10', 3, 'Con las rodillas apoyadas o contra una mesa si aún no puedes apoyar bien la pierna.', { video: 'push ups', rpe: '7', tecnica: ['Cuerpo recto de la cabeza a las rodillas o los pies', 'Codos a unos 45° del cuerpo', 'Baja controlado'] }),
      ej('fg_remo', 'Remo con banda o mancuerna', '3 × 12', 3, 'Sentado o apoyado en un banco, tira hacia el ombligo juntando las escápulas.', { video: 'seated band row', rpe: '7', tecnica: ['Espalda recta', 'Tira con los codos y junta las escápulas', 'Sin encoger los hombros'] }),
      ej('fg_press', 'Press de hombros sentado', '3 × 10', 3, 'Con mancuernas, sentado y con la espalda apoyada.', { video: 'seated dumbbell shoulder press', rpe: '7', tecnica: ['Espalda apoyada', 'Sube sin arquear la zona lumbar', 'Baja hasta la altura de las orejas'] }),
      ej('fg_plancha', 'Plancha', '3 × 30 s', 3, 'Antebrazos y rodillas (o pies) apoyados, cuerpo recto. No la hagas con los pies si molesta la rodilla.', { seg: 30, video: 'forearm plank', rpe: '6-7', tecnica: ['Cuerpo recto, sin hundir la cadera', 'Abdomen apretado', 'Respira con normalidad'] }),
      ej('fg_bicho', 'Bicho muerto', '3 × 10', 3, 'Boca arriba, baja brazo y pierna contrarios sin arquear la espalda.', { video: 'dead bug exercise', rpe: '6', tecnica: ['Zona lumbar pegada al suelo', 'Movimiento lento', 'Suelta el aire al estirar'] }),
      ej('fg_sana', 'Pierna sana: prensa o sentadilla a una pierna', '3 × 10', 3, 'Entrenar la pierna sana mantiene su fuerza y puede ayudar un poco a la operada (efecto cruzado).', { video: 'single leg press cross education', rpe: '7-8', tecnica: ['Rodilla alineada con el pie', 'Peso que puedas controlar', 'Recorrido completo y sin prisa'] }),
      ej('fg_brazos', 'Bici de brazos o remo ergómetro', '10 min', 1, 'Cardio sin la rodilla si tienes la máquina a mano.', { video: 'arm ergometer workout', tecnica: ['Ritmo constante', 'Espalda recta', 'Sube la intensidad poco a poco'] }),
    ],
  };
  /* Biblioteca de sesiones de 10-15 minutos para días sueltos. Mismo formato que fuerzaGeneral. Texto propio. */
  const sesionesExtra = [
    { id: 'movilidad', nombre: 'Movilidad', min: 12, nota: 'Espalda, hombros y respiración, para no quedarte rígido mientras la rodilla se recupera.', ejercicios: [
      ej('x_gato', 'Gato-vaca', '1 × 10', 1, 'A cuatro patas, redondea la espalda y luego húndela despacio, siguiendo la respiración. Con un cojín bajo las rodillas; si apoyar la operada molesta, hazlo de pie con las manos en una mesa.', { video: 'cat cow stretch', tecnica: ['Movimiento lento, de la pelvis a la cabeza', 'Suelta el aire al redondear', 'Sin dolor en la rodilla apoyada'] }),
      ej('x_libro', 'Libro abierto', '1 × 8 por lado', 2, 'Tumbado de lado con las rodillas dobladas y un cojín entre ellas, abre el brazo de arriba hacia el otro lado siguiendo la mano con la mirada.', { video: 'open book thoracic rotation', tecnica: ['Rodillas juntas y quietas', 'Gira desde la parte alta de la espalda', 'Sin forzar al final'] }),
      ej('x_palo', 'Hombros con un palo o una toalla', '1 × 10', 1, 'De pie o sentado, con un palo agarrado a lo ancho, sube los brazos estirados por encima de la cabeza y bájalos despacio.', { video: 'shoulder mobility stick', tecnica: ['Brazos estirados', 'Sin arquear la zona lumbar', 'Hasta donde llegues sin dolor'] }),
      ej('x_pecho', 'Estiramiento de pecho en una puerta', '2 × 30 s', 2, 'Antebrazo apoyado en el marco de una puerta, da un paso corto al frente hasta notar el estiramiento en el pecho.', { seg: 30, video: 'doorway chest stretch', tecnica: ['Hombro relajado, lejos de la oreja', 'Estiramiento suave, sin dolor'] }),
      ej('x_respira', 'Respiración profunda tumbado', '2 min', 1, 'Boca arriba con las rodillas dobladas o la pierna operada estirada, una mano en la tripa: coge aire por la nariz hinchando la tripa y suéltalo despacio.', { seg: 120, tecnica: ['Suelta el aire más despacio de lo que lo coges', 'Hombros quietos'] }),
    ] },
    { id: 'tronco', nombre: 'Tronco y abdomen', min: 12, nota: 'Un tronco fuerte ayuda a controlar la rodilla al saltar y al cambiar de dirección.', ejercicios: [
      ej('x_bicho', 'Bicho muerto', '3 × 8', 3, 'Boca arriba con brazos y piernas en alto, baja a la vez el brazo y la pierna contrarios sin arquear la espalda.', { video: 'dead bug exercise', rpe: '6', tecnica: ['Zona lumbar pegada al suelo', 'Movimiento lento', 'Suelta el aire al estirar'] }),
      ej('x_plancha', 'Plancha', '3 × 20-30 s', 3, 'Sobre los antebrazos y las rodillas (o los pies), cuerpo recto.', { seg: 30, video: 'forearm plank', rpe: '6-7', tecnica: ['Cuerpo recto, sin hundir la cadera', 'Abdomen apretado', 'Respira con normalidad'] }),
      ej('x_perro', 'Pájaro-perro', '3 × 8 por lado', 3, 'A cuatro patas con un cojín bajo las rodillas, estira a la vez un brazo y la pierna contraria. Si apoyar la operada molesta, sáltatelo.', { video: 'bird dog exercise', rpe: '6', tecnica: ['Espalda plana, sin girar la cadera', 'Estira despacio y aguanta 2 s', 'Mirada al suelo'] }),
      ej('x_pallof', 'Press Pallof con banda', '3 × 10 por lado', 3, 'De pie o sentado, con una banda atada a un lado a la altura del pecho, empuja los brazos al frente sin dejar que el tronco gire.', { video: 'pallof press', rpe: '6-7', tecnica: ['Tronco quieto, sin girar', 'Brazos al frente y vuelta despacio', 'Abdomen apretado'] }),
      ej('x_lateral', 'Plancha lateral con rodillas', '2 × 20 s por lado', 2, 'Apoyado en el antebrazo y las rodillas, sube la cadera hasta poner el cuerpo recto.', { seg: 20, video: 'side plank from knees', rpe: '6', tecnica: ['Cadera alta', 'Hombro sobre el codo'] }),
    ] },
    { id: 'superior', nombre: 'Tren superior', min: 15, nota: 'Brazos, espalda y hombros, sentado o de pie y sin cargar la rodilla.', ejercicios: [
      ej('x_flexiones', 'Flexiones inclinadas', '3 × 10', 3, 'Manos en una mesa firme o en la pared, cuerpo recto. Cuanto más bajo el apoyo, más difícil.', { video: 'incline push up', rpe: '7', tecnica: ['Cuerpo recto', 'Codos a unos 45° del cuerpo', 'Baja controlado'] }),
      ej('x_remo', 'Remo con banda', '3 × 12', 3, 'Sentado con las piernas estiradas o de pie con la banda atada a un mueble, tira hacia el ombligo juntando las escápulas.', { video: 'resistance band row', rpe: '7', tecnica: ['Espalda recta', 'Tira con los codos', 'Sin encoger los hombros'] }),
      ej('x_press', 'Press de hombros sentado', '3 × 10', 3, 'Con mancuernas o botellas, sentado y con la espalda apoyada.', { video: 'seated dumbbell shoulder press', rpe: '7', tecnica: ['Espalda apoyada', 'Sube sin arquear la zona lumbar'] }),
      ej('x_aperturas', 'Separar la banda delante del pecho', '3 × 15', 3, 'Brazos estirados al frente con una banda entre las manos, sepáralos hasta que la banda toque el pecho.', { video: 'band pull apart', rpe: '6-7', tecnica: ['Hombros abajo', 'Junta las escápulas al final'] }),
      ej('x_brazos', 'Bíceps y tríceps', '2 × 12 de cada', 2, 'Sentado, con mancuernas o una banda: dobla los codos para el bíceps y luego estíralos por encima de la cabeza para el tríceps.', { video: 'seated biceps curl triceps extension', rpe: '7', tecnica: ['Codos quietos', 'Sube y baja sin balanceo'] }),
    ] },
    { id: 'cardio', nombre: 'Cardio sin impacto', min: 15, nota: 'Para el corazón y los pulmones sin saltar ni correr. Si la rodilla aún no tolera la bici, haz solo lo de brazos.', ejercicios: [
      ej('x_bici', 'Bici estática o elíptica suave', '8 min', 1, 'Solo si tu fase ya la permite. Resistencia baja o media, a un ritmo que te deje hablar.', { seg: 480, video: 'stationary bike workout low impact', tecnica: ['Ritmo que te deje hablar', 'Rodilla alineada con el pie'] }),
      ej('x_boxeo', 'Boxeo sentado', '6 × 30 s rápido y 30 s suave', 6, 'Sentado con la espalda recta, lanza golpes al aire alternando los brazos: 30 s rápido y 30 s suave.', { seg: 30, video: 'seated boxing workout', tecnica: ['Espalda recta', 'Abdomen apretado', 'Respira al golpear'] }),
      ej('x_ergo', 'Bici de brazos o remo ergómetro', '5 min', 1, 'Si tienes la máquina a mano. Si no, repite el boxeo sentado.', { seg: 300, video: 'arm ergometer workout', tecnica: ['Ritmo constante', 'Espalda recta'] }),
    ] },
    { id: 'equilibrio', nombre: 'Equilibrio', min: 10, nota: 'Control y equilibrio con poca carga. Si aún no puedes apoyarte sobre la operada, haz solo la sana y el tándem.', ejercicios: [
      ej('x_tandem', 'Tándem: un pie delante del otro', '3 × 30 s', 3, 'De pie, con un pie justo delante del otro, cerca de una pared o una mesa para agarrarte.', { seg: 30, video: 'tandem stance balance', tecnica: ['Mirada al frente', 'Tronco recto'] }),
      ej('x_una', 'A una pierna, primero la sana', '3 × 30 s por pierna', 3, 'De pie sobre una pierna con la rodilla un poco doblada. Empieza por la sana y luego la operada, si tu fase lo permite.', { seg: 30, video: 'single leg balance', tecnica: ['Rodilla un poco doblada', 'Cadera nivelada', 'Mira un punto fijo'] }),
      ej('x_estrella', 'Alcances en estrella', '2 × 5 por dirección', 2, 'De pie sobre una pierna, toca el suelo con la punta del otro pie adelante, de lado y atrás, sin apoyar el peso.', { video: 'star excursion balance', tecnica: ['Rodilla de apoyo alineada con el pie', 'Toca suave y vuelve al centro', 'Sin girar la rodilla de apoyo'] }),
      ej('x_peso', 'Pasar el peso de un pie a otro', '1 min', 1, 'De pie con los pies separados, pasa el peso despacio de una pierna a la otra y luego adelante y atrás.', { seg: 60, tecnica: ['Movimiento lento', 'Rodillas un poco dobladas'] }),
    ] },
  ];

  /* Se aplican técnica, esfuerzo, variantes de casa y «solo nota» a cada ejercicio (los mismos objetos se comparten entre fases) */
  const todosEjercicios = new Set([...Object.values(fases).flatMap(f => f.ejercicios || []), ...CALENTAMIENTO, ...fuerzaGeneral.ejercicios, ...sesionesExtra.flatMap(s => s.ejercicios)]);
  todosEjercicios.forEach(e => {
    if (!e.tecnica && TECNICA[e.id]) e.tecnica = TECNICA[e.id];
    if (!e.rpe && RPE[e.id]) e.rpe = RPE[e.id];
    if (CASA[e.id]) e.casa = CASA[e.id];
    if (SIN_REGISTRO.includes(e.id)) e.sinRegistro = true;
  });

  window.PROTOCOLO = {
    fuentes: FUENTES,
    rutas: { pendiente: ['p1', 'p2', 'p3'], operado: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'], conservador: ['c1', 'c2', 'c3', 'f4', 'f5', 'f6'] },
    fases,
    notaDosis: 'Las guías marcan las fases y los criterios, pero casi nunca series y repeticiones. Las dosis de aquí son un punto de partida habitual: ajústalas con tu fisio.',
    reglaDolor: {
      corta: 'una molestia de hasta 5/10 durante el ejercicio vale si al día siguiente la rodilla no está más dolorida ni más hinchada. Si empeora, vuelve a la carga anterior.',
      siPeor: 'Cuando el dolor o la hinchazón suben de un día a otro, la rodilla te dice que ayer fue demasiado. Hoy repite la carga anterior y no subas hasta que se calme.',
      limite: 5,
      cortaMenisco: 'con el menisco tocado, el tope es más bajo: hasta 3/10 durante el ejercicio, y nada de dolor en la parte interna ni enganches. Si engancha, para ese ejercicio. Al día siguiente, la rodilla no debe estar peor.',
      limiteMenisco: 3,
    },
    notas: {
      meniscoReparado: 'con el menisco cosido, el cirujano suele limitar la flexión y la carga las primeras semanas. Si su pauta es distinta de la de la app, manda la suya.',
      meniscoRoto: 'con el menisco tocado, la app pone límites conservadores: sin flexión profunda con peso, sin giros con el pie apoyado y sin forzar la rodilla contra un tope. Son una opinión prudente, no una norma de las guías: confírmalos con tu fisio.',
    },
    fuerzaGeneral,
    sesionesExtra,
    notaExtra: 'Sesiones de 10 a 15 minutos para días sueltos. Elige las que no carguen la rodilla en tu fase y, si un ejercicio molesta, sáltatelo.',
    notaTecnica: 'Los puntos de técnica y el esfuerzo son pautas generales orientativas, no criterios clínicos.',
    rpeTxt: 'Esfuerzo (RPE) de 0 a 10: 0 es nada y 10, no poder hacer ni una repetición más. Un 7 deja unas 3 en la recámara.',
    /* Semáforo de carga del día (sale del chequeo diario). Umbrales prudentes de conocimiento clínico general, no de una guía:
       los mismos que ya disparan los avisos de Hoy. El tope del dolor es el de la regla del dolor (limite / limiteMenisco). */
    semaforo: { reposoRojo: 7, hinchazonRojo: 3, hinchazonAmbar: 2, subidaDolor: 2, suenoMin: 6 },
    alarmas: [
      { texto: 'Falta de aire repentina, dolor en el pecho, tos con sangre o desmayo', accion: 'Llama al 112 ahora', urgente: true },
      { texto: 'Pie frío, pálido o azulado, hormigueo que no se va o sangrado que no para', accion: 'Urgencias', urgente: true },
      { texto: 'Pantorrilla dolorida, hinchada, caliente o roja (sobre todo de una sola pierna)', accion: 'Llama al cirujano o ve a urgencias hoy. No te masajees la pierna', urgente: true },
      { texto: 'Fiebre de 38° o más, escalofríos o mucho malestar en las semanas tras la operación', accion: 'Llama al cirujano hoy; si no contesta o empeoras, urgencias', urgente: true },
      { texto: 'Herida roja, caliente, con pus, mal olor o que se abre', accion: 'Llama al cirujano hoy', urgente: true },
      { texto: 'Hinchazón grande y repentina, con la rodilla caliente y dolorida', accion: 'Para el ejercicio y llama al cirujano hoy. Con fiebre o muy caliente, urgencias', urgente: true },
      { texto: 'La rodilla se bloquea: de golpe no estira o no dobla del todo, y no se suelta', accion: 'No cargues y llama al cirujano en las próximas 24 h. Si no se desbloquea en unas horas o duele mucho, urgencias', urgente: true },
      { texto: 'La rodilla falla o se escapa', accion: 'Para de progresar y avisa al fisio y al cirujano. Cada fallo puede dañar el menisco y el cartílago', urgente: false },
      { texto: 'Enganche o chasquido doloroso dentro de la rodilla', accion: 'Deja el ejercicio o el gesto que lo provoca y avisa al fisio y al cirujano', urgente: false },
      { texto: 'Dolor en la parte interna de la rodilla al agacharte o al girar', accion: 'Evita ese gesto y coméntalo con tu fisio o tu cirujano', urgente: false },
      { texto: 'La hinchazón vuelve después de la actividad', accion: 'Baja la carga a lo de antes y avisa al fisio', urgente: false },
      { texto: 'Pierdes extensión que ya tenías', accion: 'Avisa pronto al fisio y al cirujano', urgente: false },
      { texto: 'Dolor que no cede con la medicación que te pautaron o va a más en reposo', accion: 'Llama al cirujano', urgente: false },
    ],
    fuentesAlarmas: ['GENERAL', 'MEL2'],
    medir: {
      movilidad: `## Extensión
Tumbado boca arriba con la pierna relajada. Lo ideal es que la mida tu fisio con un goniómetro (centro en el lateral de la rodilla, brazos hacia la cadera y el tobillo).
- **0°**: rodilla recta del todo. Apunta los grados que le **faltan** para estar recta.
- Truco de las guías: tumbado boca abajo con las piernas fuera de la cama, mira la diferencia de altura entre los talones. Más o menos, 1 cm = 1°.
## Flexión
Tumbado boca arriba, desliza el talón hacia el glúteo todo lo que puedas y mide el ángulo de la rodilla.
- Con «Medir con el móvil» puedes hacerlo tú, con un error de unos 5°. Esta forma no está validada en las guías: úsala para ver la tendencia.
- Mide la rodilla sana una vez: sirve para el criterio de «flexión al 95 % de la sana».
## Quién la mide
Para ver cómo evolucionas valen tus medidas. Para dar por buena la **extensión completa (0°)** antes de operar o para pasar de etapa, que la confirme tu fisio: con un error de 5°, un 0° falso es justo el fallo que importa.`,
      derrame: `Con la pierna estirada y relajada:
- Pasa la mano de abajo arriba por la cara **interna** de la rodilla, 2 o 3 veces, para empujar el líquido hacia arriba.
- Luego pásala de arriba abajo por la cara **externa** y mira la cara interna.
- **0**: no aparece nada. **Traza**: una ola pequeña. **1+**: un bulto claro. **2+**: el líquido vuelve solo sin pasar la mano. **3+**: hay tanto que no se puede desplazar.
Es la prueba del barrido (stroke test) que recoge la guía de Melbourne.`,
      perimetro: `Con una cinta métrica y la pierna estirada y relajada, siempre en el mismo punto y en las dos piernas:
- **Rodilla**: a la altura del centro de la rótula. Más centímetros que la sana = hinchazón.
- **Muslo**: a una distancia fija por encima del borde de arriba de la rótula (por defecto 5, 10 y 15 cm). Menos centímetros que la sana = músculo perdido.
Ninguna guía da un umbral para el muslo: sirve para ver si recuperas músculo.`,
      slr: `Tumbado boca arriba, aprieta el cuádriceps y levanta la pierna estirada. Si la rodilla se dobla un poco al subir (se «cae»), todavía hay «lag». Otra forma (Melbourne): sentado en el borde de la cama, alguien te estira la rodilla del todo y la suelta; mira cuánto cae. Se acepta de 0 a 5°.`,
      fuerza: `Lo ideal: dinamómetro de mano con un ayudante, sentado con cadera y rodilla a 90°, empujando contra la espinilla por encima del tobillo (delante para el cuádriceps, detrás para los isquios). Sin dinamómetro: el peso máximo que mueves con buena técnica en la máquina de extensión o de curl, con cada pierna por separado. Que lo mida tu fisio si puede: es la medida más importante para correr y volver al deporte.`,
      saltos: `Solo cuando tu fisio lo apruebe y sin derrame. Calienta, empieza siempre por la pierna sana y haz 2 intentos válidos con cada una (apunta el mejor o la media).
- **Salto simple**: salta lo más lejos que puedas a una pierna y cae sobre la misma sin perder el equilibrio.
- **Triple salto**: tres saltos seguidos con la misma pierna; mide la distancia total.
- **Triple cruzado**: igual, cruzando una línea de 15 cm a cada salto.
- **6 m a la pata coja**: cronometra cuánto tardas. Aquí menos es mejor.
LSI = operada ÷ sana × 100 (en el de 6 m, al revés).`,
      resistencia: `Pruebas de Melbourne hasta fallo (cuando ya no puedes con buena técnica), con cada pierna:
- **Puente a una pierna** con el talón sobre un banco o cajón: repeticiones. Mínimo 20.
- **Gemelo a una pierna** en un escalón, 1 repetición cada 2 s: repeticiones. Mínimo 20.
- **Plancha lateral** apoyado sobre el lado de la pierna operada y de la sana: segundos. Mínimo 30.
- **Levantarse de una silla a una pierna**: repeticiones. Mínimo 10.`,
      equilibrio: `De pie sobre una pierna, brazos cruzados. Para el cronómetro cuando descruzas los brazos, apoyas el otro pie o mueves el pie de apoyo (máximo 45 s). Hazlo con ojos abiertos y con ojos cerrados. Referencia de Melbourne para adultos de 18-39 años: más de 43 s con ojos abiertos y más de 9 s con ojos cerrados.`,
      aclrsi: `El ACL-RSI son 12 preguntas sobre emociones, confianza y miedo a volver a lesionarte, puntuadas de 0 a 100. No lo incluimos en la app porque su texto tiene derechos de autor: pídeselo a tu fisio y apunta aquí la puntuación. Melbourne usa más de 90 como criterio para volver al deporte.`,
      carrera: `Ninguna guía fija el programa exacto. Lo habitual: empezar alternando andar y trotar, en llano, días alternos, y alargar el trote poco a poco. Si al día siguiente la rodilla está más dolorida o hinchada, repite la sesión anterior en vez de subir.`,
    },
  };
})();
