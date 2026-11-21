'use strict';
/* Mi rodilla: seguimiento de la rehabilitación del LCA.
   Todo se guarda en este dispositivo (localStorage + IndexedDB para las fotos). */

const P = window.PROTOCOLO;
const ARTICULOS = window.APRENDER || [];
const CLAVE = 'rehablca.v1';

/* ---------- Utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const z2 = n => String(n).padStart(2, '0');
const hoyISO = (d = new Date()) => `${d.getFullYear()}-${z2(d.getMonth() + 1)}-${z2(d.getDate())}`;
const aFecha = iso => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
const diasEntre = (a, b) => Math.round((aFecha(b) - aFecha(a)) / 864e5);
const sumarDias = (iso, n) => { const d = aFecha(iso); d.setDate(d.getDate() + n); return hoyISO(d); };
const lunesDe = iso => { const d = aFecha(iso); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return hoyISO(d); };
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
const fCorta = iso => { const d = aFecha(iso); return `${d.getDate()} ${MESES[d.getMonth()]}`; };
const fLarga = iso => { const d = aFecha(iso); return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`; };
const num = v => { if (v == null || v === '') return null; const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? null : n; };
const fmt = (n, dec = 0) => n == null || isNaN(n) ? '—' : Number(n).toLocaleString('es-ES', { maximumFractionDigits: dec });
const ultimo = a => a.length ? a[a.length - 1] : null;
const media = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const porFecha = (a, b) => a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0;

const TXT = {
  situacion: { pendiente: 'Pendiente de operar', operado: 'Operado', conservador: 'Sin operación' },
  ligamento: { lca: 'Cruzado anterior (LCA)', lcp: 'Cruzado posterior (LCP)', ambos: 'Los dos cruzados' },
  injerto: { rotuliano: 'Tendón rotuliano', isquios: 'Isquiotibiales', cuadriceps: 'Tendón del cuádriceps', aloinjerto: 'De donante', nose: 'No lo sé' },
  extras: { menisco_roto: 'Menisco roto o posible', menisco_reparado: 'Menisco cosido', menisco_quitado: 'Menisco recortado', colateral: 'Ligamento colateral', cartilago: 'Cartílago' },
  mecanico: { fallo: 'Se me ha ido', enganche: 'Ha enganchado', bloqueo: 'Se ha bloqueado' },
  hinchazon: ['Nada', 'Poca', 'Moderada', 'Mucha'],
  cojera: { no: 'Sin cojear', poco: 'Cojeo un poco', muletas: 'Con muletas' },
};
const GRADOS = ['0', 'traza', '1+', '2+', '3+'];
const GRADO_TXT = { '0': '0 · nada', 'traza': 'Traza', '1+': '1+', '2+': '2+', '3+': '3+' };

const PRUEBAS = {
  slr: { nombre: 'Elevación de pierna recta', tipo: 'sino', medir: 'slr' },
  puente: { nombre: 'Puente a una pierna', unidad: 'reps', min: 20, medir: 'resistencia' },
  gemelo: { nombre: 'Gemelo a una pierna', unidad: 'reps', min: 20, medir: 'resistencia' },
  plancha: { nombre: 'Plancha lateral', unidad: 's', min: 30, medir: 'resistencia' },
  silla: { nombre: 'Levantarse de una silla a una pierna', unidad: 'reps', min: 10, medir: 'resistencia' },
  eq_abiertos: { nombre: 'Equilibrio, ojos abiertos', unidad: 's', min: 43, soloOp: true, medir: 'equilibrio' },
  eq_cerrados: { nombre: 'Equilibrio, ojos cerrados', unidad: 's', min: 9, soloOp: true, medir: 'equilibrio' },
  cuad: { nombre: 'Fuerza del cuádriceps', unidad: 'kg', medir: 'fuerza' },
  isquios: { nombre: 'Fuerza de isquiotibiales', unidad: 'kg', medir: 'fuerza' },
  salto_simple: { nombre: 'Salto simple a una pierna', unidad: 'cm', medir: 'saltos', salto: true },
  salto_triple: { nombre: 'Triple salto', unidad: 'cm', medir: 'saltos', salto: true },
  salto_cruzado: { nombre: 'Triple salto cruzado', unidad: 'cm', medir: 'saltos', salto: true },
  salto_6m: { nombre: '6 m a la pata coja', unidad: 's', menorMejor: true, medir: 'saltos', salto: true },
  acl_rsi: { nombre: 'ACL-RSI (confianza para volver)', tipo: 'valor', unidad: 'puntos', max: 100, medir: 'aclrsi' },
};
const SALTOS = ['salto_simple', 'salto_triple', 'salto_cruzado', 'salto_6m'];
const RESISTENCIA = ['puente', 'gemelo', 'plancha', 'silla'];

/* ---------- Estado ---------- */
function estadoVacio() {
  return {
    version: 1, perfil: null, checkins: [], movilidad: [], perimetros: [], derrame: [], pruebas: [],
    sesiones: [], carreras: [], fotos: [], evaluaciones: [], manuales: {}, misEjercicios: [], ocultos: {},
    leidos: {}, ajustes: { posicionesMuslo: [5, 10, 15] }, sesionActual: null, modificado: 0, ultimaCopia: null,
  };
}
const LISTAS = ['checkins', 'movilidad', 'perimetros', 'derrame', 'pruebas', 'sesiones', 'carreras', 'fotos', 'evaluaciones', 'misEjercicios'];
const fechaValida = f => typeof f === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(f);
/* Deja los datos en una forma que la app sabe pintar, venga de donde venga (copia, servidor, versión antigua). */
function sanear(d) {
  const s = Object.assign(estadoVacio(), d && typeof d === 'object' ? d : {});
  for (const k of LISTAS) s[k] = (Array.isArray(s[k]) ? s[k] : []).filter(x => x && typeof x === 'object' && (k === 'misEjercicios' || fechaValida(x.fecha)));
  for (const k of ['manuales', 'ocultos', 'leidos']) if (!s[k] || typeof s[k] !== 'object' || Array.isArray(s[k])) s[k] = {};
  s.ajustes = Object.assign(estadoVacio().ajustes, s.ajustes || {});
  if (s.perfil && typeof s.perfil !== 'object') s.perfil = null;
  /* La prehabilitación de una sola fase se partió en tres etapas (p1-p3). */
  if (s.perfil?.faseId === 'prehab') {
    s.perfil.faseId = 'p1';
    for (const [k, v] of Object.entries(s.manuales)) if (k.startsWith('prehab.')) s.manuales['p1.' + k.slice(7)] = v;
  }
  return s;
}
let aviso0 = null;
function cargar() {
  let raw = null;
  try { raw = localStorage.getItem(CLAVE); } catch (e) { return estadoVacio(); }
  if (!raw) return estadoVacio();
  try { return sanear(JSON.parse(raw)); }
  catch (e) {
    try { localStorage.setItem(CLAVE + '.corrupto', raw); } catch (e2) { /* sin espacio */ }
    aviso0 = 'Los datos guardados estaban dañados. Se ha apartado una copia; recupera tu última copia desde Ajustes.';
    return estadoVacio();
  }
}
let S = cargar();
const UI = { segSesion: 'rehab', fotosSel: [], verOcultos: false, crono: null, servidor: false };
function guardar() {
  S.modificado = Date.now();
  try { localStorage.setItem(CLAVE, JSON.stringify(S)); }
  catch (e) { avisar('No se ha podido guardar: no queda espacio'); }
  subirAlServidor();
}

/* ---------- Copia en el PC (server.py) ----------
   Si la app la sirve server.py, los datos se guardan también en datos/estado.json y las fotos en datos/fotos/.
   Así no se pierden aunque cambie el navegador o se borre su caché. En GitHub Pages no hay servidor y no pasa nada. */
let subidaT = null;
function subirAlServidor() {
  if (!UI.servidor) return;
  clearTimeout(subidaT);
  subidaT = setTimeout(async () => {
    try {
      const r = await fetch('api/datos', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Mi-Rodilla': '1' }, body: JSON.stringify(S) });
      if (!r.ok) throw new Error(r.status);
    } catch (e) { avisar('No se ha podido guardar en el PC. Los datos siguen en el navegador.'); }
  }, 700);
}
async function conectarServidor() {
  if (!/^https?:$/.test(location.protocol)) return false;
  try {
    const ping = await fetch('api/ping', { cache: 'no-store' });
    if (!ping.ok || (await ping.json()).app !== 'mi-rodilla') return false;
  } catch (e) { return false; }
  UI.servidor = true;
  try {
    const r = await fetch('api/datos', { cache: 'no-store' });
    if (r.ok) {
      const remoto = sanear(await r.json());
      if ((remoto.modificado || 0) > (S.modificado || 0)) { S = remoto; try { localStorage.setItem(CLAVE, JSON.stringify(S)); } catch (e) { /* sigue en memoria */ } return true; }
    }
    if (S.perfil || S.checkins.length) subirAlServidor();
  } catch (e) { /* sin datos en el PC todavía */ }
  return false;
}
function insertar(lista, item) { lista.push(item); lista.sort(porFecha); guardar(); }

/* ---------- Fotos (IndexedDB) ---------- */
const FotosDB = (() => {
  let dbp = null;
  const abrir = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open('rehablca-fotos', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('fotos');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  }));
  const tx = async (modo, fn) => {
    const db = await abrir();
    return new Promise((res, rej) => {
      const t = db.transaction('fotos', modo); const req = fn(t.objectStore('fotos'));
      t.oncomplete = () => res(req ? req.result : undefined); t.onerror = () => rej(t.error);
    });
  };
  return {
    put: (id, blob) => tx('readwrite', s => s.put(blob, id)),
    get: id => tx('readonly', s => s.get(id)),
    del: id => tx('readwrite', s => s.delete(id)),
    clear: () => tx('readwrite', s => s.clear()),
  };
})();
const urlFotos = {};
async function urlFoto(id) {
  if (urlFotos[id]) return urlFotos[id];
  let b = await FotosDB.get(id).catch(() => null);
  if (!b && UI.servidor) {
    try { const r = await fetch('api/fotos/' + encodeURIComponent(id)); if (r.ok) { b = await r.blob(); await FotosDB.put(id, b); } } catch (e) { /* sin copia en el PC */ }
  }
  if (!b) return null;
  return (urlFotos[id] = URL.createObjectURL(b));
}
async function fotoAlServidor(id, blob, borrar = false) {
  if (!UI.servidor) return;
  try { await fetch('api/fotos/' + encodeURIComponent(id), borrar ? { method: 'DELETE', headers: { 'X-Mi-Rodilla': '1' } } : { method: 'PUT', headers: { 'Content-Type': 'image/jpeg', 'X-Mi-Rodilla': '1' }, body: blob }); }
  catch (e) { /* se reintenta al guardar otra foto */ }
}

/* ---------- Perfil, fases y criterios ---------- */
const ruta = () => (S.perfil && P.rutas[S.perfil.situacion]) || [];
const faseActual = () => P.fases[S.perfil?.faseId] || P.fases[ruta()[0]];
function siguienteFase() {
  const r = ruta(); const i = r.indexOf(faseActual().id);
  return i >= 0 && i < r.length - 1 ? P.fases[r[i + 1]] : null;
}
function diasDesde() {
  const p = S.perfil; if (!p) return null;
  if (p.situacion === 'operado' && p.fechaOperacion) return diasEntre(p.fechaOperacion, hoyISO());
  if (p.situacion === 'conservador' && p.fechaLesion) return diasEntre(p.fechaLesion, hoyISO());
  return null;
}
function etiquetaTiempo() {
  const p = S.perfil, h = hoyISO();
  if (p.situacion === 'operado' && p.fechaOperacion) {
    const d = diasEntre(p.fechaOperacion, h);
    if (d < 0) return `Te operan en ${-d} días`;
    return `Día ${d} desde la operación · semana ${Math.floor(d / 7) + 1}`;
  }
  if (p.situacion === 'pendiente') {
    if (p.fechaOperacion) { const d = diasEntre(h, p.fechaOperacion); if (d > 0) return `Faltan ${d} días para la operación`; if (d === 0) return 'Hoy te operan. Mucha suerte'; }
    return 'Preparando la rodilla para la operación';
  }
  if (p.fechaLesion) { const d = diasEntre(p.fechaLesion, h); return `Día ${d} desde la lesión · semana ${Math.floor(d / 7) + 1}`; }
  return TXT.situacion[p.situacion] || '';
}
function rangoSemanas(txt) {
  const s = String(txt || '');
  let m = s.match(/(\d+)\s*[-–]\s*(\d+)/); if (m) return [+m[1], +m[2]];
  m = s.match(/(\d+)\s*\+/); if (m) return [+m[1], null];
  return [null, null];
}
function faseSugerida(situacion, fechaOp, fechaLesion) {
  const r = P.rutas[situacion] || []; if (!r.length) return null;
  let sem = null;
  if (situacion === 'operado' && fechaOp) sem = diasEntre(fechaOp, hoyISO()) / 7;
  if (situacion === 'conservador' && fechaLesion) sem = diasEntre(fechaLesion, hoyISO()) / 7;
  if (sem == null || sem < 0) return r[0];
  let elegida = r[0];
  for (const id of r) { const f = P.fases[id]; const [a] = rangoSemanas((situacion === 'conservador' && f.semanasSC) || f.semanas); if (a != null && sem >= a) elegida = id; }
  return elegida;
}
const tiene = extra => (S.perfil?.extras || []).includes(extra);
/* Menisco roto o posible, todavía sin operar: activa límites, alarmas y una regla del dolor más estricta. */
const menisco = () => tiene('menisco_roto') && S.perfil?.situacion !== 'operado';
const limiteDolor = () => menisco() ? (P.reglaDolor?.limiteMenisco ?? 3) : (P.reglaDolor?.limite ?? 5);
const mecanicoDesde = (tipo, dias) => S.checkins.filter(c => c.fecha >= sumarDias(hoyISO(), -dias) && (c.mecanico || []).includes(tipo));

function ultimaMov(campo) { for (let i = S.movilidad.length - 1; i >= 0; i--) if (S.movilidad[i][campo] != null) return S.movilidad[i]; return null; }
function mejorMov(campo) {
  const v = S.movilidad.map(m => m[campo]).filter(x => x != null);
  if (!v.length) return null; return campo === 'ext' ? Math.min(...v) : Math.max(...v);
}
const fmtExt = v => v == null ? '—' : v === 0 ? '0°' : v > 0 ? `${fmt(v)}°` : `−${fmt(-v)}°`;
const txtExt = v => v == null ? 'sin medir' : v === 0 ? 'recta del todo' : v > 0 ? `le faltan ${fmt(v)}°` : `${fmt(-v)}° de hiperextensión`;
function ultimosCheckins(n) { return S.checkins.slice(-n); }
function mediaCampo(campo, n = 3) { const v = ultimosCheckins(n).map(c => c[campo]).filter(x => x != null); return media(v); }
const checkinDe = f => S.checkins.find(c => c.fecha === f);
function ultimaPrueba(tipo) { for (let i = S.pruebas.length - 1; i >= 0; i--) if (S.pruebas[i].tipo === tipo) return S.pruebas[i]; return null; }
function lsiDe(p) {
  if (!p || !p.op || !p.sana) return null;
  return PRUEBAS[p.tipo]?.menorMejor ? (p.sana / p.op) * 100 : (p.op / p.sana) * 100;
}
const lsiTipo = t => lsiDe(ultimaPrueba(t));
function semanas() { const d = diasDesde(); return d == null ? null : d / 7; }

function claveManual(faseId, cid) { return `${faseId}.${cid}`; }
function evaluar(c, faseId) {
  const u = c.umbral;
  const falta = (detalle, ir) => ({ estado: 'falta', detalle, ir });
  const res = (ok, detalle) => ({ estado: ok ? 'ok' : 'no', detalle });
  switch (c.medida) {
    case 'ext_max': {
      const m = ultimaMov('ext'); if (!m) return falta('Aún no has medido la extensión', 'progreso-movilidad');
      if (c.profesional && m.ext <= u && m.metodo !== 'fisio') {
        const f = [...S.movilidad].reverse().find(x => x.ext != null && x.metodo === 'fisio');
        if (!f || f.ext > u) return { estado: 'falta', detalle: `Tú mides ${fmtExt(m.ext)}: falta que lo confirme tu fisio (apúntalo como medido por el fisio)`, ir: 'progreso-movilidad' };
      }
      return res(m.ext <= u, `Última: ${fmtExt(m.ext)} (${fCorta(m.fecha)})${m.metodo === 'fisio' ? ', medida por el fisio' : ''}`);
    }
    case 'derrame_estable': {
      const dias = c.dias || 14, desde = sumarDias(hoyISO(), -dias);
      const r = S.derrame.filter(d => d.fecha >= desde);
      if (r.length < 2 || diasEntre(r[0].fecha, ultimo(r).fecha) < Math.floor(dias / 2)) return falta(`Mide el derrame al menos una vez por semana durante ${dias} días`, 'progreso-hinchazon');
      const peor = r.reduce((a, d) => GRADOS.indexOf(d.grado) > GRADOS.indexOf(a) ? d.grado : a, '0');
      return res(GRADOS.indexOf(peor) <= GRADOS.indexOf(String(u)), `${r.length} medidas en ${dias} días · la peor: ${GRADO_TXT[peor]}`);
    }
    case 'sin_fallos': {
      const dias = c.dias || 28, desde = sumarDias(hoyISO(), -dias);
      const ck = S.checkins.filter(x => x.fecha >= desde);
      const fallos = ck.filter(x => (x.mecanico || []).includes('fallo'));
      if (fallos.length) return res(false, `Ha fallado ${fallos.length} ${fallos.length === 1 ? 'vez' : 'veces'} (la última, el ${fCorta(ultimo(fallos).fecha)})`);
      if (ck.length < Math.min(10, dias / 2)) return falta(`Haz el chequeo diario: hay ${ck.length} en los últimos ${dias} días`, 'checkin');
      return res(true, `Sin fallos en ${ck.length} chequeos de los últimos ${dias} días`);
    }
    case 'linea_base': {
      const hecho = [
        ['flexión de la sana', !!S.perfil.flexSana], ['movilidad', S.movilidad.length > 0], ['derrame', S.derrame.length > 0], ['perímetros', S.perimetros.length > 0],
        ['fuerza del cuádriceps', !!ultimaPrueba('cuad')], ['resistencia', RESISTENCIA.every(t => ultimaPrueba(t))], ['equilibrio', !!(ultimaPrueba('eq_abiertos') && ultimaPrueba('eq_cerrados'))],
      ];
      const faltan = hecho.filter(x => !x[1]).map(x => x[0]);
      return faltan.length ? { estado: 'falta', detalle: `Te falta: ${faltan.join(', ')}`, ir: 'progreso-pruebas' } : res(true, 'Todas guardadas');
    }
    case 'flex_min': { const m = ultimaMov('flex'); if (!m) return falta('Aún no has medido la flexión', 'progreso-movilidad'); return res(m.flex >= u, `Última: ${fmt(m.flex)}° (${fCorta(m.fecha)})`); }
    case 'derrame_max': { const d = ultimo(S.derrame); if (!d) return falta('Haz la prueba del derrame', 'progreso-hinchazon'); return res(GRADOS.indexOf(d.grado) <= GRADOS.indexOf(String(u)), `Último: ${GRADO_TXT[d.grado]} (${fCorta(d.fecha)})`); }
    case 'dolor_max': { const v = mediaCampo('dolorActividad', 3); if (v == null) return falta('Haz el chequeo diario', 'checkin'); return res(v <= u, `Media de tus últimos chequeos: ${fmt(v, 1)}/10`); }
    case 'sin_cojera': { const c2 = [...S.checkins].reverse().find(x => x.cojera); if (!c2) return falta('Dilo en el chequeo diario', 'checkin'); return res(c2.cojera === 'no', `Último chequeo: ${TXT.cojera[c2.cojera].toLowerCase()}`); }
    case 'confianza_min': { const v = mediaCampo('confianza', 3); if (v == null) return falta('Haz el chequeo diario', 'checkin'); return res(v >= u, `Media de tus últimos chequeos: ${fmt(v, 1)}/10`); }
    case 'slr_sin_lag': { const p = ultimaPrueba('slr'); if (!p) return falta('Haz la prueba de la pierna recta', 'progreso-pruebas'); return res(p.valor === 'si', p.valor === 'si' ? `Sin caída (${fCorta(p.fecha)})` : `Aún cae la rodilla (${fCorta(p.fecha)})`); }
    case 'lsi_cuad': case 'lsi_isquios': {
      const t = c.medida === 'lsi_cuad' ? 'cuad' : 'isquios'; const v = lsiTipo(t);
      if (v == null) return falta('Mide la fuerza de las dos piernas', 'progreso-pruebas');
      return res(v >= u, `Tu pierna operada rinde un ${fmt(v)} % de la sana`);
    }
    case 'lsi_saltos': {
      const v = SALTOS.map(lsiTipo).filter(x => x != null);
      if (!v.length) return falta('Haz las pruebas de salto', 'progreso-pruebas');
      const min = Math.min(...v); const completo = !c.todos || v.length === SALTOS.length;
      return res(min >= u && completo, `La peor: ${fmt(min)} % · ${v.length} de ${SALTOS.length} pruebas hechas`);
    }
    case 'lsi_tipo': { const v = lsiTipo(c.tipo); if (v == null) return falta(`Haz la prueba: ${PRUEBAS[c.tipo].nombre.toLowerCase()}`, 'progreso-pruebas'); return res(v >= u, `${fmt(v)} % de la sana`); }
    case 'resistencia': {
      const hechas = RESISTENCIA.map(t => ({ t, p: ultimaPrueba(t) })).filter(x => x.p);
      if (!hechas.length) return falta('Haz las pruebas de puente, gemelo, plancha lateral y silla', 'progreso-pruebas');
      const bien = hechas.filter(({ t, p }) => lsiDe(p) >= u && p.op >= (PRUEBAS[t].min || 0));
      return res(bien.length === RESISTENCIA.length, `${bien.length} de ${RESISTENCIA.length} cumplen · ${hechas.length} hechas`);
    }
    case 'equilibrio': {
      const a = ultimaPrueba('eq_abiertos'), b = ultimaPrueba('eq_cerrados');
      if (!a && !b) return falta('Haz las pruebas de equilibrio', 'progreso-pruebas');
      const ok = a && b && a.op >= PRUEBAS.eq_abiertos.min && b.op >= PRUEBAS.eq_cerrados.min;
      return res(!!ok, `Ojos abiertos ${a ? fmt(a.op) + ' s' : '—'} · cerrados ${b ? fmt(b.op) + ' s' : '—'}`);
    }
    case 'funcion_min': { const v = mediaCampo('funcion', 3); if (v == null) return falta('Responde «cómo funciona tu rodilla» en el chequeo', 'checkin'); return res(v >= u, `Media de tus últimos chequeos: ${fmt(v, 1)}/10`); }
    case 'flex_pct': {
      const m = ultimaMov('flex'), s = S.perfil.flexSana;
      if (!m) return falta('Aún no has medido la flexión', 'progreso-movilidad');
      if (!s) return falta('Mide una vez la flexión de la rodilla sana', 'progreso-movilidad');
      const pct = m.flex / s * 100; return res(pct >= u, `${fmt(m.flex)}° de ${fmt(s)}° de la sana (${fmt(pct)} %)`);
    }
    case 'aclrsi_min': { const p = ultimaPrueba('acl_rsi'); if (!p) return falta('Haz el cuestionario ACL-RSI', 'progreso-pruebas'); return res(p.valor >= u, `Último: ${fmt(p.valor)} puntos`); }
    case 'semanas_min': {
      const s = semanas(); if (s == null) return falta('Pon la fecha en tu perfil', 'bienvenida');
      return res(s >= u, `Llevas ${Math.floor(s)} semanas`);
    }
    default: {
      const k = S.manuales[claveManual(faseId, c.id)];
      return { estado: k ? 'ok' : 'manual', detalle: k ? `Marcado el ${fCorta(k)}` : 'Márcalo tú (o tu fisio) cuando lo cumplas', manual: true };
    }
  }
}
const criteriosDe = f => (f.criterios || []).filter(c => !c.solo || c.solo === S.perfil?.situacion);
const semanasDe = f => (S.perfil?.situacion === 'conservador' && f.semanasSC) || f.semanas;
function estadoFase(f = faseActual()) {
  const ev = criteriosDe(f).map(c => ({ c, r: evaluar(c, f.id) }));
  return { ev, ok: ev.filter(x => x.r.estado === 'ok').length, total: ev.length };
}

/* ---------- Sesiones ---------- */
function objetivo(f) {
  const s = f?.sesiones || {};
  if (s.porDia) return { n: s.porDia, periodo: 'hoy', semana: s.porDia * 7 };
  return { n: s.porSemana || 3, periodo: 'semana', semana: s.porSemana || 3 };
}
function sesionesEn(tipo, desde, hasta = hoyISO()) { return S.sesiones.filter(s => s.tipo === tipo && s.fecha >= desde && s.fecha <= hasta).length; }
const sesionesHoy = (tipo = 'rehab') => sesionesEn(tipo, hoyISO());
const sesionesSemana = (tipo = 'rehab') => sesionesEn(tipo, lunesDe(hoyISO()));
function ejerciciosFase(f = faseActual(), conOcultos = false) {
  const base = (f.ejercicios || []).filter(e => conOcultos || !S.ocultos[e.id]);
  const mios = S.misEjercicios.filter(e => e.activo !== false).map(e => ({ ...e, mio: true }));
  return [...base, ...mios];
}
function notasEjercicio(e) {
  const out = [];
  const inj = S.perfil?.injerto;
  if (e.injerto && S.perfil?.situacion === 'operado') {
    if (inj && inj !== 'nose' && e.injerto[inj]) out.push(e.injerto[inj]);
    else if (!inj || inj === 'nose') Object.entries(e.injerto).forEach(([k, v]) => out.push(`${TXT.injerto[k] || k}: ${v}`));
  }
  if (e.menisco && (tiene('menisco_reparado'))) out.push(e.menisco);
  if (e.meniscoRoto && menisco()) out.push(e.meniscoRoto);
  return out;
}

/* ---------- Racha y logros ---------- */
function racha() {
  const dias = new Set([...S.checkins.map(c => c.fecha), ...S.sesiones.map(s => s.fecha)]);
  let d = hoyISO(); if (!dias.has(d)) d = sumarDias(d, -1);
  let n = 0; while (dias.has(d)) { n++; d = sumarDias(d, -1); }
  return n;
}
function logros() {
  const L = [];
  const add = (ico, t, si) => L.push({ ico, t, si: !!si });
  const nSes = S.sesiones.length, r = racha(), bf = mejorMov('flex'), be = mejorMov('ext');
  const saltos = SALTOS.map(lsiTipo).filter(x => x != null);
  add('🏁', 'Primera sesión', nSes >= 1);
  add('🔥', '7 días seguidos', r >= 7);
  add('📅', '30 días seguidos', r >= 30);
  add('💪', '25 sesiones', nSes >= 25);
  add('🏋️', '100 sesiones', nSes >= 100);
  add('📏', 'Rodilla recta', be != null && be <= 0);
  add('↩️', 'Flexión de 90°', bf >= 90);
  add('🔄', 'Flexión de 120°', bf >= 120);
  add('🎯', 'Flexión de 135°', bf >= 135);
  add('🦵', 'Pierna recta sin caer', S.pruebas.some(p => p.tipo === 'slr' && p.valor === 'si'));
  add('💧', 'Sin derrame', S.derrame.length > 1 && ultimo(S.derrame).grado === '0');
  add('🚶', 'Sin cojear', S.checkins.some(c => c.cojera === 'no'));
  add('🪜', 'Primera fase superada', S.evaluaciones.length >= 1);
  add('👟', 'Primera carrera', S.carreras.length >= 1);
  add('🏃', '5 km seguidos', S.carreras.some(c => c.km >= 5));
  add('🏆', 'Saltos al 90 %', saltos.length === SALTOS.length && Math.min(...saltos) >= 90);
  return L;
}

/* ---------- Gráficos (SVG propio, sin librerías) ---------- */
function marcas(a, b, n = 4) {
  const bruto = (b - a) / n; if (!(bruto > 0)) return [a];
  const mag = Math.pow(10, Math.floor(Math.log10(bruto)));
  const paso = [1, 2, 2.5, 5, 10].map(m => m * mag).find(p => p >= bruto) || bruto;
  const out = []; for (let v = Math.ceil(a / paso) * paso; v <= b + 1e-9; v += paso) out.push(+v.toFixed(6));
  return out;
}
function grafLinea(series, o = {}) {
  const W = 340, H = o.alto || 170, pl = 34, pr = 12, pt = 14, pb = 22;
  const todos = series.flatMap(s => s.puntos);
  if (!todos.length) return `<div class="vacio">${esc(o.vacio || 'Aún no hay datos. Añade la primera medida.')}</div>`;
  const ts = todos.map(p => aFecha(p.x).getTime());
  let x0 = Math.min(...ts), x1 = Math.max(...ts);
  if (x1 - x0 < 864e5 * 6) { const c = (x0 + x1) / 2; x0 = c - 864e5 * 3.5; x1 = c + 864e5 * 3.5; }
  const vals = todos.map(p => p.y); if (o.objetivo != null) vals.push(o.objetivo);
  let y0 = Math.min(...vals), y1 = Math.max(...vals);
  const m = Math.max((y1 - y0) * 0.15, o.margen ?? 2); y0 -= m; y1 += m;
  if (o.min != null) y0 = o.min; if (o.max != null) y1 = o.max;
  const X = t => pl + (t - x0) / (x1 - x0) * (W - pl - pr);
  const Y = v => pt + (y1 - v) / (y1 - y0) * (H - pt - pb);
  let s = `<svg class="grafico" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.titulo || 'Gráfico')}">`;
  for (const t of marcas(y0, y1, 4)) s += `<line x1="${pl}" x2="${W - pr}" y1="${Y(t).toFixed(1)}" y2="${Y(t).toFixed(1)}" class="rej"/><text x="${pl - 6}" y="${(Y(t) + 3).toFixed(1)}" text-anchor="end">${fmt(t, 1)}${o.sufijo || ''}</text>`;
  if (o.objetivo != null) s += `<line x1="${pl}" x2="${W - pr}" y1="${Y(o.objetivo).toFixed(1)}" y2="${Y(o.objetivo).toFixed(1)}" class="obj"/><text class="obj-t" x="${pl + 4}" y="${(Y(o.objetivo) - 4).toFixed(1)}" text-anchor="start">objetivo</text>`;
  const fx = [x0, (x0 + x1) / 2, x1];
  fx.forEach((t, i) => { s += `<text x="${X(t).toFixed(1)}" y="${H - 6}" text-anchor="${['start', 'middle', 'end'][i]}">${fCorta(hoyISO(new Date(t)))}</text>`; });
  for (const se of series) {
    const p = [...se.puntos].sort((a, b) => a.x < b.x ? -1 : 1);
    if (!p.length) continue;
    const d = p.map((q, i) => `${i ? 'L' : 'M'}${X(aFecha(q.x).getTime()).toFixed(1)},${Y(q.y).toFixed(1)}`).join(' ');
    s += `<path d="${d}" class="curva" style="stroke:${se.color}"/>`;
    if (p.length <= 45) p.forEach(q => { s += `<circle cx="${X(aFecha(q.x).getTime()).toFixed(1)}" cy="${Y(q.y).toFixed(1)}" r="3" class="pto" style="stroke:${se.color}"/>`; });
    const u = p[p.length - 1];
    s += `<text x="${Math.min(X(aFecha(u.x).getTime()), W - pr - 2).toFixed(1)}" y="${(Y(u.y) - 8).toFixed(1)}" text-anchor="end" style="fill:${se.color};font-weight:700">${fmt(u.y, 1)}${o.sufijo || ''}</text>`;
  }
  s += '</svg>';
  const conDatos = series.filter(se => se.puntos.length);
  if (conDatos.length > 1 || (series.length > 1 && conDatos.length === 1)) s += `<div class="leyenda">${conDatos.map(se => `<span><i style="background:${se.color}"></i>${esc(se.nombre)}</span>`).join('')}</div>`;
  return s;
}
function grafBarras(datos, o = {}) {
  const W = 340, H = o.alto || 150, pl = 8, pr = 8, pt = 18, pb = 22;
  const max = Math.max(o.objetivo || 0, ...datos.map(d => d.v), 1);
  const bw = (W - pl - pr) / datos.length;
  let s = `<svg class="grafico" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.titulo || 'Gráfico de barras')}">`;
  datos.forEach((d, i) => {
    const h = (d.v / max) * (H - pt - pb); const x = pl + i * bw + bw * 0.18; const w = bw * 0.64; const y = H - pb - h;
    s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${Math.max(h, d.v ? 2 : 0).toFixed(1)}" rx="4" style="fill:${d.color || 'var(--g1)'}"/>`;
    if (d.v) s += `<text x="${(x + w / 2).toFixed(1)}" y="${(y - 4).toFixed(1)}" text-anchor="middle" class="val-barra">${fmt(d.v, 1)}</text>`;
    s += `<text x="${(x + w / 2).toFixed(1)}" y="${H - 6}" text-anchor="middle">${esc(d.etq)}</text>`;
  });
  if (o.objetivo) { const y = H - pb - (o.objetivo / max) * (H - pt - pb); s += `<line x1="${pl}" x2="${W - pr}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" class="obj"/>`; }
  return s + '</svg>';
}
function anillo(v, total, etq) {
  const r = 30, c = 2 * Math.PI * r, f = total ? Math.min(1, v / total) : 0;
  return `<div class="anillo"><svg viewBox="0 0 74 74" width="74" height="74"><circle cx="37" cy="37" r="${r}" class="ani-pista"/><circle cx="37" cy="37" r="${r}" class="ani-valor" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - f)).toFixed(1)}"/></svg><div class="centro"><div><b>${v}/${total}</b><br><span>${esc(etq)}</span></div></div></div>`;
}

/* ---------- Piezas de formulario ---------- */
function opciones(grupo, items, sel, completas = false, multi = false) {
  const activo = v => multi ? (sel || []).includes(v) : sel != null && String(sel) === String(v);
  return `<div class="opciones${completas ? ' completas' : ''}" data-grupo="${grupo}"${multi ? ' data-multi="1"' : ''}>${items.map(([v, t]) => `<button type="button" data-valor="${esc(v)}" class="${activo(v) ? 'activo' : ''}">${esc(t)}</button>`).join('')}</div>`;
}
function deslizador(id, etq, v, min, max, a, b) {
  return `<div class="deslizador"><div class="cab"><label for="${id}">${etq}</label><span class="valor" id="${id}-v">${v}</span></div><input type="range" id="${id}" min="${min}" max="${max}" step="1" value="${v}" data-salida="${id}-v"><div class="extremos"><span>${a}</span><span>${b}</span></div></div>`;
}
function paso(id, etq, v, min, max, step) {
  return `<div class="campo"><span class="etq">${etq}</span><div class="paso" id="${id}" data-min="${min}" data-max="${max}" data-step="${step}" data-v="${v}"><button type="button" data-d="-1" aria-label="Menos">−</button><output>${fmt(v, 1)}</output><button type="button" data-d="1" aria-label="Más">+</button></div></div>`;
}
const leerOpcion = g => $(`[data-grupo="${g}"] .activo`)?.dataset.valor ?? null;
const leerMulti = g => $$(`[data-grupo="${g}"] .activo`).map(b => b.dataset.valor);
const leerPaso = id => num($('#' + id)?.dataset.v);
const leerNum = id => num($('#' + id)?.value);
const leerTxt = id => ($('#' + id)?.value || '').trim();
const cabHoja = t => `<div class="cab-panel"><h2>${t}</h2><button class="enlace" data-accion="cerrar">Cerrar</button></div>`;
const campoFecha = (id, v = hoyISO()) => `<div class="campo"><label for="${id}">Fecha</label><input id="${id}" type="date" value="${v}" max="${hoyISO()}"></div>`;
const como = clave => P.medir?.[clave] ? `<details class="card"><summary><b>Cómo se mide</b></summary><div class="articulo" style="margin-top:8px">${md(P.medir[clave])}</div></details>` : '';

/* Mini markdown: ## títulos, - listas, **negrita**, párrafos */
function md(txt) {
  const lineas = String(txt).split('\n'); let html = '', lista = false, parrafo = [];
  const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const cerrarP = () => { if (parrafo.length) { html += `<p>${inline(parrafo.join(' '))}</p>`; parrafo = []; } };
  for (const l0 of lineas) {
    const l = l0.trim();
    if (l.startsWith('## ')) { cerrarP(); if (lista) { html += '</ul>'; lista = false; } html += `<h2>${inline(l.slice(3))}</h2>`; }
    else if (l.startsWith('- ')) { cerrarP(); if (!lista) { html += '<ul>'; lista = true; } html += `<li>${inline(l.slice(2))}</li>`; }
    else if (!l) { cerrarP(); if (lista) { html += '</ul>'; lista = false; } }
    else { if (lista) { html += '</ul>'; lista = false; } parrafo.push(l); }
  }
  cerrarP(); if (lista) html += '</ul>';
  return html;
}
const fuenteTxt = ids => {
  const l = [].concat(ids || []).map(id => P.fuentes[id]).filter(Boolean);
  return l.length ? `<p class="fuente">Fuente: ${l.map(f => f.url ? `<a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.corto || f.nombre)}</a>` : esc(f.corto || f.nombre)).join(' · ')}</p>` : '';
};

/* ---------- Vistas ---------- */
const VISTAS = {};

VISTAS.bienvenida = () => {
  const p = S.perfil || {};
  return `<div class="pila">
    <div class="saludo"><h1>${S.perfil ? 'Tu perfil' : 'Vamos a montar tu plan'}</h1><p>Con esto la app sabe en qué fase estás y qué ejercicios te tocan. Puedes cambiarlo cuando quieras.</p></div>
    <div class="card pila" id="form-perfil">
      <div class="campo"><label for="f-nombre">¿Cómo te llamas?</label><input id="f-nombre" type="text" value="${esc(p.nombre || '')}" autocomplete="given-name"></div>
      <div class="campo"><span class="etq">¿Qué rodilla?</span>${opciones('rodilla', [['izquierda', 'Izquierda'], ['derecha', 'Derecha']], p.rodilla, true)}</div>
      <div class="campo"><span class="etq">¿Qué ligamento?</span>${opciones('ligamento', Object.entries({ lca: 'Anterior (LCA)', lcp: 'Posterior (LCP)', ambos: 'Los dos' }), p.ligamento || 'lca', true)}</div>
      <div class="campo"><span class="etq">¿Algo más?</span><span class="ayuda">Si lo sabes. Cambia alguna pauta.</span>${opciones('extras', Object.entries(TXT.extras), p.extras || [], false, true)}</div>
    </div>
    <div class="card pila">
      <div class="campo"><span class="etq">¿En qué punto estás?</span>${opciones('situacion', [['pendiente', 'Me van a operar'], ['operado', 'Ya me han operado'], ['conservador', 'Sin operación']], p.situacion)}</div>
      <div class="campo"><label for="f-lesion">Fecha de la lesión</label><input id="f-lesion" type="date" value="${p.fechaLesion || ''}" max="${hoyISO()}"></div>
      <div class="campo" id="c-op"><label for="f-op">Fecha de la operación</label><input id="f-op" type="date" value="${p.fechaOperacion || ''}"><span class="ayuda" id="f-op-ayuda"></span></div>
      <div class="campo" id="c-injerto"><span class="etq">Injerto</span><span class="ayuda">De dónde sale el ligamento nuevo. Lo pone el informe de la operación.</span>${opciones('injerto', Object.entries(TXT.injerto), p.injerto || 'nose')}</div>
    </div>
    <div class="card pila">
      <div class="campo"><label for="f-deporte">¿A qué quieres volver?</label><input id="f-deporte" type="text" placeholder="Fútbol, esquí, pádel, correr…" value="${esc(p.deporte || '')}"></div>
      <div class="campo" id="c-fase"><label for="f-fase">Fase en la que empiezas</label><select id="f-fase"></select><span class="ayuda" id="f-fase-ayuda"></span></div>
    </div>
    <p class="sub">La app no sustituye a tu cirujano ni a tu fisio. Si te dicen algo distinto, manda lo que digan ellos.</p>
    <button class="btn ancho" data-accion="guardar-perfil">${S.perfil ? 'Guardar' : 'Empezar'}</button>
  </div>`;
};
function actualizarFormPerfil() {
  if (!$('#form-perfil')) return;
  const sit = leerOpcion('situacion');
  $('#c-op').hidden = !(sit === 'operado' || sit === 'pendiente');
  $('#c-injerto').hidden = !(sit === 'operado' || sit === 'pendiente');
  $('#f-op-ayuda').textContent = sit === 'pendiente' ? 'Si aún no la sabes, déjala vacía.' : '';
  const sel = $('#f-fase'); const r = P.rutas[sit] || [];
  $('#c-fase').hidden = !r.length;
  if (!r.length) return;
  const sug = faseSugerida(sit, $('#f-op').value, $('#f-lesion').value);
  const actual = S.perfil?.situacion === sit ? S.perfil.faseId : null;
  const elegida = sel.dataset.tocado ? sel.value : (actual || sug);
  sel.innerHTML = r.map(id => { const f = P.fases[id], s = (sit === 'conservador' && f.semanasSC) || f.semanas; return `<option value="${id}" ${id === elegida ? 'selected' : ''}>${esc(f.nombre)}${s ? ` · semanas ${esc(s)}` : ''}</option>`; }).join('');
  $('#f-fase-ayuda').textContent = sit === 'pendiente' ? 'Antes de operar toca preparar la rodilla.' : `Por las fechas te tocaría «${P.fases[sug].nombre}». Si no tienes claro que cumples lo de las fases anteriores, empieza antes y haz la prueba para avanzar.`;
}

VISTAS.hoy = () => {
  const p = S.perfil, f = faseActual(), sig = siguienteFase(), ef = estadoFase(f), obj = objetivo(f);
  const hechas = obj.periodo === 'hoy' ? sesionesHoy() : sesionesSemana();
  const ck = checkinDe(hoyISO());
  const avisos = [];
  if (p.situacion === 'pendiente' && p.fechaOperacion && p.fechaOperacion <= hoyISO()) avisos.push(`<div class="card acento pila"><h3>¿Ya te han operado?</h3><p class="sub">Cuando lo marques, la app pasa al plan de después de la operación.</p><button class="btn peq" data-accion="ya-operado">Sí, ya me han operado</button></div>`);
  if (p.ligamento !== 'lca') avisos.push(`<div class="card aviso-suave"><h3>Ojo: cruzado posterior</h3><p style="margin-top:4px">Este programa está hecho para el cruzado anterior. El posterior se rehabilita distinto (por ejemplo, sin cargar los isquiotibiales al principio y a veces con una rodillera especial). Usa los ejercicios que te mande tu fisio y apúntalos en «Ejercicios de tu fisio».</p></div>`);
  if (ck && (ck.hinchazon >= 3 || ck.dolorReposo >= 7)) avisos.push(`<div class="card alerta pila"><h3>Hoy marcas mucho dolor o hinchazón</h3><p>Si ha aparecido de golpe, o hay fiebre, calor, enrojecimiento o dolor en la pantorrilla, llama a tu cirujano.</p><button class="btn peq peligro" data-ir="alarma">Ver señales de alarma</button></div>`);
  else if (ck) {
    const ayer = checkinDe(sumarDias(hoyISO(), -1));
    if (ayer && (ck.hinchazon > ayer.hinchazon || ck.dolorActividad - ayer.dolorActividad >= 2)) avisos.push(`<div class="card aviso-suave"><h3>Hoy estás algo peor que ayer</h3><p style="margin-top:4px">${esc(P.reglaDolor?.siPeor || 'Baja un poco la carga de hoy y vuelve a subir cuando la rodilla se calme.')}</p></div>`);
  }
  const mec = ck?.mecanico || [];
  if (mec.includes('bloqueo')) avisos.unshift(`<div class="card alerta pila"><h3>Hoy se te ha bloqueado la rodilla</h3><p>Si no estira o no dobla del todo y no se suelta, no cargues y llama a tu cirujano en las próximas 24 horas. Si no se desbloquea en unas horas o duele mucho, ve a urgencias.</p><button class="btn peq peligro" data-ir="alarma">Ver señales de alarma</button></div>`);
  else if (mec.includes('fallo') || mec.includes('enganche')) avisos.unshift(`<div class="card aviso-suave pila"><h3>Hoy la rodilla ${mec.includes('fallo') ? 'se te ha ido' : 'ha enganchado'}</h3><p>No subas la carga, deja el gesto o el ejercicio que lo provocó y coméntalo con tu fisio. Si se repite, también con tu cirujano.</p></div>`);
  const recordatorios = [];
  const refCopia = S.ultimaCopia || p.creado;
  if (!UI.servidor && refCopia && diasEntre(refCopia, hoyISO()) >= 7) recordatorios.push(`<div class="card pulsable" data-ir="ajustes"><div class="fila entre"><div><h3>Haz una copia de seguridad</h3><p class="sub">${S.ultimaCopia ? `La última fue el ${fCorta(S.ultimaCopia)}` : 'Aún no has hecho ninguna'}. Tus datos solo están en este dispositivo.</p></div><span class="chip acento">Copia</span></div></div>`);
  const ultM = ultimaMov('flex') || ultimaMov('ext');
  if (!ultM || diasEntre(ultM.fecha, hoyISO()) >= 7) recordatorios.push(`<div class="card pulsable" data-ir="progreso-movilidad"><div class="fila entre"><div><h3>Toca medir la movilidad</h3><p class="sub">${ultM ? `La última fue el ${fCorta(ultM.fecha)}` : 'Aún no la has medido'}. Una vez por semana basta.</p></div><span class="chip acento">Medir</span></div></div>`);

  const art = ARTICULOS.find(a => (a.fases || []).includes(f.id) && !S.leidos[a.id]) || ARTICULOS.find(a => !S.leidos[a.id]);
  const ext = ultimaMov('ext'), flex = ultimaMov('flex'), der = ultimo(S.derrame);
  return `<div class="pila">
    <div class="saludo"><h1>Hola${p.nombre ? ', ' + esc(p.nombre) : ''}</h1><p>${esc(etiquetaTiempo())}</p></div>
    ${avisos.join('')}
    <div class="card oscura pila">
      <div class="fila entre" style="align-items:flex-start">
        <div><p class="sub">Tu fase</p><h2 style="font-size:1.35rem;margin-top:2px">${esc(f.nombre)}</h2>${semanasDe(f) ? `<p class="sub" style="margin-top:2px">Orientativo: semanas ${esc(semanasDe(f))}</p>` : ''}</div>
        ${anillo(hechas, obj.n, obj.periodo === 'hoy' ? 'hoy' : 'semana')}
      </div>
      <div><div class="fila entre" style="margin-bottom:6px"><span class="sub">${sig ? 'Criterios para avanzar' : p.situacion === 'pendiente' ? 'Objetivos antes de operar' : 'Criterios para el alta'}</span><b>${ef.ok} de ${ef.total}</b></div><div class="barra"><i style="width:${ef.total ? (ef.ok / ef.total * 100) : 0}%"></i></div></div>
      <div class="rejilla-2"><button class="btn" data-ir="sesion">${S.sesionActual ? 'Seguir la sesión' : 'Empezar sesión'}</button><button class="btn borde" data-ir="evaluar">${sig ? '¿Puedo avanzar?' : 'Ver criterios'}</button></div>
    </div>
    <div class="card pulsable" data-accion="abrir-checkin">
      ${ck ? `<div class="fila entre"><h3>Chequeo de hoy hecho</h3><span class="chip ok">Editar</span></div>
        <div class="rejilla-3" style="margin-top:10px">
          <div class="dato"><span class="n">${ck.dolorActividad}<small>/10</small></span><span class="l">Dolor al moverte</span></div>
          <div class="dato"><span class="n" style="font-size:1.1rem;padding-top:6px">${TXT.hinchazon[ck.hinchazon] || '—'}</span><span class="l">Hinchazón</span></div>
          <div class="dato"><span class="n">${ck.confianza ?? '—'}<small>/10</small></span><span class="l">Confianza</span></div>
        </div>`
      : `<div class="fila entre"><div><h3>¿Cómo está hoy la rodilla?</h3><p class="sub">Chequeo diario: 30 segundos</p></div><span class="chip acento">Hacer</span></div>`}
    </div>
    ${recordatorios.join('')}
    <div class="titulo-seccion"><h2>Foco de esta fase</h2></div>
    <div class="card"><ul style="margin:0;padding-left:20px">${(f.foco || f.objetivos || []).slice(0, 4).map(o => `<li>${esc(o)}</li>`).join('')}</ul></div>
    <div class="titulo-seccion"><h2>Tus números</h2><button data-ir="progreso">Ver todo</button></div>
    <div class="rejilla-3">
      <div class="card pulsable dato" data-ir="progreso-movilidad"><span class="n">${fmtExt(ext?.ext)}</span><span class="l">Extensión</span></div>
      <div class="card pulsable dato" data-ir="progreso-movilidad"><span class="n">${flex ? fmt(flex.flex) + '°' : '—'}</span><span class="l">Flexión</span></div>
      <div class="card pulsable dato" data-ir="progreso-hinchazon"><span class="n">${der ? esc(der.grado) : '—'}</span><span class="l">Derrame</span></div>
    </div>
    ${art ? `<div class="titulo-seccion"><h2>Para leer hoy</h2></div><div class="card pulsable" data-ir="articulo-${art.id}"><h3>${esc(art.titulo)}</h3><p class="sub">${esc(art.resumen || '')}</p></div>` : ''}
    <div class="card pulsable" data-ir="alarma"><div class="fila entre"><div><h3>Señales de alarma</h3><p class="sub">Cuándo llamar al cirujano o ir a urgencias</p></div><span class="chip no">Ver</span></div></div>
    <p class="sub" style="text-align:center;margin-top:4px">Racha: ${racha()} ${racha() === 1 ? 'día' : 'días'} seguidos</p>
  </div>`;
};

VISTAS.sesion = () => {
  const f = faseActual(), tipo = UI.segSesion;
  const seg = `<div class="seg">${[['rehab', 'Rehabilitación'], ['fuerza', 'Resto del cuerpo']].map(([v, t]) => `<button data-accion="seg-sesion" data-v="${v}" class="${tipo === v ? 'activo' : ''}">${t}</button>`).join('')}</div>`;
  if (tipo === 'fuerza') {
    const g = P.fuerzaGeneral; const obj = objetivo(g);
    return `<div class="pila">${seg}
      <div class="card"><h2>${esc(g.nombre)}</h2><p class="sub" style="margin-top:4px">${esc(g.nota || '')}</p><p class="sub" style="margin-top:6px">Esta semana: ${sesionesSemana('fuerza')} de ${obj.n}</p></div>
      ${listaEjercicios(g.ejercicios, false)}
      <button class="btn ancho" data-accion="empezar-sesion" data-tipo="fuerza">${S.sesionActual?.tipo === 'fuerza' ? 'Seguir la sesión' : 'Empezar sesión'}</button>
    </div>`;
  }
  const ej = ejerciciosFase(f); const ocultos = (f.ejercicios || []).filter(e => S.ocultos[e.id]);
  const obj = objetivo(f); const hechas = obj.periodo === 'hoy' ? sesionesHoy() : sesionesSemana();
  const notas = [];
  if (menisco()) notas.push(`<div class="nota injerto"><b>Menisco tocado:</b> ${esc(P.notas?.meniscoRoto || '')}</div>`);
  if (tiene('menisco_reparado')) notas.push(`<div class="nota injerto"><b>Menisco cosido:</b> ${esc(P.notas?.meniscoReparado || 'tu cirujano suele limitar la flexión y la carga las primeras semanas. Manda su pauta sobre la de la app.')}</div>`);
  if (S.perfil.ligamento !== 'lca') notas.push(`<div class="nota injerto">Programa pensado para el cruzado anterior: confirma cada ejercicio con tu fisio.</div>`);
  return `<div class="pila">${seg}
    <div class="card">
      <div class="fila entre"><div><p class="sub">${esc(f.nombre)}</p><h2>Sesión de hoy</h2></div><span class="chip acento">${hechas}/${obj.n} ${obj.periodo === 'hoy' ? 'hoy' : 'esta semana'}</span></div>
      ${f.frecuencia ? `<p class="sub" style="margin-top:6px">${esc(f.frecuencia)}</p>` : ''}
      <div class="nota"><b>Regla del dolor:</b> ${esc((menisco() ? P.reglaDolor?.cortaMenisco : P.reglaDolor?.corta) || '')}</div>
      ${notas.join('')}
      <p class="sub" style="margin-top:8px">${esc(P.notaDosis || '')}</p>
    </div>
    ${listaEjercicios(ej, true)}
    ${f.evitar?.length ? `<div class="card aviso-suave"><h3>En esta fase, evita</h3><ul style="margin:6px 0 0;padding-left:20px">${f.evitar.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
    <div class="fila" style="flex-wrap:wrap"><button class="btn borde peq" data-accion="nuevo-ejercicio">Añadir ejercicio de tu fisio</button>${ocultos.length ? `<button class="btn borde peq" data-accion="ver-ocultos">${UI.verOcultos ? 'Esconder' : 'Ver'} quitados (${ocultos.length})</button>` : ''}</div>
    ${UI.verOcultos && ocultos.length ? `<div class="card"><h3>Quitados de tu sesión</h3><div class="lista" style="margin-top:6px">${ocultos.map(e => `<div class="item"><div class="cuerpo">${esc(e.nombre)}</div><button class="btn claro peq" data-accion="mostrar-ej" data-id="${e.id}">Volver a poner</button></div>`).join('')}</div></div>` : ''}
    <button class="btn ancho" data-accion="empezar-sesion" data-tipo="rehab">${S.sesionActual?.tipo === 'rehab' ? 'Seguir la sesión' : 'Empezar sesión'}</button>
    ${fuenteTxt(f.fuentes)}
  </div>`;
};
function listaEjercicios(lista, editable) {
  if (!lista.length) return `<div class="card vacio">No hay ejercicios en esta fase. Añade los de tu fisio.</div>`;
  return `<div class="card"><div class="lista">${lista.map((e, i) => {
    const notas = notasEjercicio(e);
    return `<div class="item" style="align-items:flex-start"><div class="ej" style="flex:1">
      <div class="num">${i + 1}</div>
      <div class="cuerpo"><h3>${esc(e.nombre)}${e.mio ? ' <span class="chip acento">Tu fisio</span>' : ''}</h3><p class="dosis">${esc(e.dosis || '')}</p>${e.desc ? `<p class="sub" style="margin-top:4px">${esc(e.desc)}</p>` : ''}
        ${notas.map(n => `<div class="nota injerto">${esc(n)}</div>`).join('')}
        <div class="fila" style="margin-top:8px;gap:14px">${e.mio ? '' : `<a href="https://www.youtube.com/results?search_query=${encodeURIComponent(e.video || e.nombre)}" target="_blank" rel="noopener" class="enlace" style="font-size:.88rem">Ver vídeos</a>`}
        ${editable ? (e.mio ? `<button class="enlace" style="font-size:.88rem;color:var(--bad)" data-accion="borrar-mio" data-id="${e.id}">Borrar</button>` : `<button class="enlace" style="font-size:.88rem;color:var(--muted)" data-accion="ocultar-ej" data-id="${e.id}">No me lo han mandado</button>`) : ''}</div>
      </div></div></div>`;
  }).join('')}</div></div>`;
}

VISTAS.guiada = () => {
  const sa = S.sesionActual; if (!sa) { setTimeout(() => ir('sesion'), 0); return ''; }
  const lista = listaSesion(sa); const e = lista[sa.idx]; if (!e) { setTimeout(() => ir('sesion'), 0); return ''; }
  const series = e.series || 1, hechas = sa.hechas[e.id] || 0;
  const notas = notasEjercicio(e);
  return `<div class="pila guiada">
    <div class="cab"><span>Ejercicio ${sa.idx + 1} de ${lista.length}</span><button class="enlace" data-accion="salir-guiada">Salir</button></div>
    <div class="barra"><i style="width:${((sa.idx) / lista.length) * 100}%"></i></div>
    <div class="card pila">
      <h1>${esc(e.nombre)}</h1>
      <p class="dosis" style="font-size:1.05rem">${esc(e.dosis || '')}</p>
      ${e.desc ? `<p>${esc(e.desc)}</p>` : ''}
      ${notas.map(n => `<div class="nota injerto">${esc(n)}</div>`).join('')}
      ${e.mio ? '' : `<a class="enlace" href="https://www.youtube.com/results?search_query=${encodeURIComponent(e.video || e.nombre)}" target="_blank" rel="noopener">Ver vídeos de cómo se hace</a>`}
    </div>
    <div class="card pila">
      <h3>Series hechas</h3>
      <div class="series">${Array.from({ length: series }, (_, i) => `<button data-accion="serie" data-n="${i + 1}" class="${i < hechas ? 'hecho' : ''}">${i + 1}</button>`).join('')}</div>
      ${e.seg ? `<div class="crono" id="crono">${e.seg}s</div><button class="btn claro ancho" data-accion="crono" data-seg="${e.seg}">Empezar ${e.seg} segundos</button>` : ''}
    </div>
    <div class="rejilla-2">
      <button class="btn borde" data-accion="ej-ant" ${sa.idx === 0 ? 'disabled' : ''}>Anterior</button>
      ${sa.idx < lista.length - 1 ? `<button class="btn" data-accion="ej-sig">Siguiente</button>` : `<button class="btn" data-accion="terminar-sesion">Terminar</button>`}
    </div>
  </div>`;
};
function listaSesion(sa) { return sa.tipo === 'fuerza' ? P.fuerzaGeneral.ejercicios : ejerciciosFase(P.fases[sa.faseId] || faseActual()); }

VISTAS.evaluar = () => {
  const f = faseActual(), sig = siguienteFase(), ef = estadoFase(f);
  const todo = ef.ok === ef.total;
  const estadoChip = r => r.estado === 'ok' ? '<span class="chip ok">Cumplido</span>' : r.estado === 'no' ? '<span class="chip no">Aún no</span>' : r.estado === 'falta' ? '<span class="chip falta">Falta medir</span>' : '<span class="chip">Márcalo</span>';
  return `<div class="pila">
    <div class="saludo"><h1>${sig ? `De ${esc(f.nombre)} a ${esc(sig.nombre)}` : esc(f.nombre)}</h1><p>${S.perfil.situacion === 'pendiente' && !sig ? 'Lo que conviene tener antes de entrar al quirófano.' : 'Se avanza cuando la rodilla cumple los criterios, no por el calendario.'}</p></div>
    ${f.nota ? `<div class="card acento"><p>${esc(f.nota)}</p></div>` : ''}
    <div class="card"><div class="lista">${ef.ev.map(({ c, r }) => `
      <div class="item" style="align-items:flex-start">
        ${r.manual || (c.medida === 'manual') ? `<button class="check ${r.estado === 'ok' ? 'hecho' : ''}" data-accion="manual" data-id="${c.id}" aria-label="Marcar">${r.estado === 'ok' ? '✓' : ''}</button>` : `<div class="check ${r.estado === 'ok' ? 'hecho' : ''}">${r.estado === 'ok' ? '✓' : ''}</div>`}
        <div class="cuerpo"><h3 style="font-weight:600">${esc(c.texto)}</h3><p class="sub">${esc(r.detalle)}</p>
          ${r.ir ? `<button class="enlace" style="font-size:.88rem;margin-top:4px" data-${r.ir === 'checkin' ? 'accion="abrir-checkin"' : `ir="${r.ir}"`}>Medirlo ahora</button>` : ''}
          ${c.fuente ? fuenteTxt(c.fuente) : ''}</div>
        ${estadoChip(r)}
      </div>`).join('')}</div></div>
    ${sig ? (todo
      ? `<div class="card bien pila"><h3>Cumples todo para pasar a ${esc(sig.nombre)}</h3><p>Coméntalo con tu fisio en la próxima cita. Si te da el visto bueno, avanza.</p><button class="btn" data-accion="avanzar">Pasar a ${esc(sig.nombre)}</button></div>`
      : `<div class="card pila"><p class="sub">Te faltan ${ef.total - ef.ok} de ${ef.total}. Si tu fisio ya te ha dicho que pases, puedes avanzar igualmente.</p><button class="btn borde" data-accion="avanzar" data-forzar="1">Mi fisio me ha dicho que pase</button></div>`)
      : S.perfil.situacion === 'pendiente'
        ? `<div class="card acento pila"><h3>Después de la operación</h3><p>Cuando te operen, márcalo y la app pasa al plan del postoperatorio.</p><button class="btn peq" data-accion="ya-operado">Ya me han operado</button></div>`
        : `<div class="card bien"><h3>Es la última fase</h3><p style="margin-top:4px">Cuando cumplas todo, el alta para volver a competir la da tu equipo médico.</p></div>`}
    ${sig ? `<div class="titulo-seccion"><h2>Lo que viene en ${esc(sig.nombre)}</h2></div><div class="card"><ul style="margin:0;padding-left:20px">${(sig.objetivos || []).map(o => `<li>${esc(o)}</li>`).join('')}</ul></div>` : ''}
    ${ruta().indexOf(f.id) > 0 ? `<button class="enlace" data-accion="retroceder" style="align-self:center">Volver a la fase anterior</button>` : ''}
  </div>`;
};

/* Progreso */
const SUB_PROG = [['resumen', 'Resumen'], ['movilidad', 'Movilidad'], ['hinchazon', 'Hinchazón y muslo'], ['pruebas', 'Fuerza y saltos'], ['carrera', 'Carrera'], ['habitos', 'Día a día'], ['fotos', 'Fotos']];
VISTAS.progreso = (sub = 'resumen') => {
  if (!SUB_PROG.some(([v]) => v === sub)) sub = 'resumen';
  const seg = `<div class="seg">${SUB_PROG.map(([v, t]) => `<button data-ir="progreso-${v}" class="${sub === v ? 'activo' : ''}">${t}</button>`).join('')}</div>`;
  return `<div class="pila">${seg}${PROG[sub]()}</div>`;
};
const PROG = {};
PROG.resumen = () => {
  const h = hoyISO(), l = lunesDe(h), lAnt = sumarDias(l, -7);
  const f = faseActual(), obj = objetivo(f);
  const ses = sesionesEn('rehab', l), sesAnt = sesionesEn('rehab', lAnt, sumarDias(l, -1));
  const ckSem = S.checkins.filter(c => c.fecha >= l), ckAnt = S.checkins.filter(c => c.fecha >= lAnt && c.fecha < l);
  const dSem = media(ckSem.map(c => c.dolorActividad)), dAnt = media(ckAnt.map(c => c.dolorActividad));
  const flexAhora = ultimaMov('flex'); const flexAntes = [...S.movilidad].reverse().find(m => m.flex != null && m.fecha < l);
  const kmSem = S.carreras.filter(c => c.fecha >= l).reduce((a, c) => a + (c.km || 0), 0);
  const cambio = (a, b, menorMejor) => { if (a == null || b == null) return ''; const d = a - b; if (Math.abs(d) < 0.05) return '<span class="chip">igual</span>'; const bien = menorMejor ? d < 0 : d > 0; return `<span class="chip ${bien ? 'ok' : 'no'}">${d > 0 ? '+' : ''}${fmt(d, 1)}</span>`; };
  const ultP = ultimo(S.perimetros); const dif = ultP ? difMuslo(ultP) : null;
  return `
    <div class="card"><h2>Esta semana</h2><p class="sub">Desde el lunes ${fCorta(l)}</p>
      <div class="lista" style="margin-top:8px">
        <div class="item"><div class="cuerpo">Sesiones de rehabilitación</div><b>${ses} / ${obj.semana}</b>${cambio(ses, sesAnt)}</div>
        <div class="item"><div class="cuerpo">Chequeos hechos</div><b>${ckSem.length} / 7</b></div>
        <div class="item"><div class="cuerpo">Dolor medio al moverte</div><b>${fmt(dSem, 1)}</b>${cambio(dSem, dAnt, true)}</div>
        <div class="item"><div class="cuerpo">Flexión</div><b>${flexAhora ? fmt(flexAhora.flex) + '°' : '—'}</b>${flexAntes && flexAhora && flexAhora.fecha >= l ? cambio(flexAhora.flex, flexAntes.flex) : ''}</div>
        ${kmSem ? `<div class="item"><div class="cuerpo">Kilómetros corridos</div><b>${fmt(kmSem, 1)}</b></div>` : ''}
      </div></div>
    <div class="rejilla-2">
      <div class="card dato"><span class="n">${fmtExt(mejorMov('ext'))}</span><span class="l">Mejor extensión</span></div>
      <div class="card dato"><span class="n">${mejorMov('flex') != null ? fmt(mejorMov('flex')) + '°' : '—'}</span><span class="l">Mejor flexión</span></div>
      <div class="card dato"><span class="n">${dif != null ? fmt(dif, 1) + '<small>cm</small>' : '—'}</span><span class="l">Muslo: diferencia con la sana</span></div>
      <div class="card dato"><span class="n">${S.sesiones.length}</span><span class="l">Sesiones en total</span></div>
    </div>
    <div class="titulo-seccion"><h2>Logros</h2></div>
    <div class="logros">${logros().map(x => `<div class="logro ${x.si ? 'si' : ''}"><div class="ico">${x.ico}</div><div class="t">${esc(x.t)}</div></div>`).join('')}</div>
    <button class="btn borde ancho" data-ir="informe" style="margin-top:6px">Informe para tu fisio</button>`;
};
PROG.movilidad = () => {
  const ext = ultimaMov('ext'), flex = ultimaMov('flex');
  const objFlex = (faseActual().criterios || []).find(c => c.medida === 'flex_min')?.umbral;
  const hist = [...S.movilidad].reverse().slice(0, 30);
  return `
    <div class="rejilla-2">
      <div class="card dato"><span class="l">Extensión</span><span class="n">${fmtExt(ext?.ext)}</span><span class="l">${esc(txtExt(ext?.ext))}</span></div>
      <div class="card dato"><span class="l">Flexión</span><span class="n">${flex ? fmt(flex.flex) + '°' : '—'}</span><span class="l">${objFlex ? `Para avanzar: ${objFlex}°` : 'Objetivo final: como la sana'}</span></div>
    </div>
    <div class="rejilla-2"><button class="btn" data-accion="nueva-mov">Añadir medida</button><button class="btn claro" data-accion="gonio">Medir con el móvil</button></div>
    <div class="card"><h3>Extensión</h3><p class="sub">Grados que le faltan para estar recta. 0° = recta; negativo = pasa de recta.</p>${grafLinea([{ nombre: 'Extensión', color: 'var(--g1)', puntos: S.movilidad.filter(m => m.ext != null).map(m => ({ x: m.fecha, y: m.ext })) }], { objetivo: 0, sufijo: '°', titulo: 'Evolución de la extensión' })}</div>
    <div class="card"><h3>Flexión</h3>${grafLinea([{ nombre: 'Flexión', color: 'var(--g1)', puntos: S.movilidad.filter(m => m.flex != null).map(m => ({ x: m.fecha, y: m.flex })) }], { objetivo: objFlex ?? null, sufijo: '°', titulo: 'Evolución de la flexión' })}</div>
    ${como('movilidad')}
    <div class="card"><h3>Historial</h3>${hist.length ? `<div class="lista" style="margin-top:6px">${hist.map(m => `<div class="item"><div class="cuerpo"><b>${fLarga(m.fecha)}</b><div class="sub">Extensión ${fmtExt(m.ext)} · Flexión ${m.flex != null ? fmt(m.flex) + '°' : '—'}${m.metodo === 'movil' ? ' · con el móvil' : ''}${m.nota ? ' · ' + esc(m.nota) : ''}</div></div><button class="borrar" data-accion="borrar" data-lista="movilidad" data-id="${m.id}" aria-label="Borrar">✕</button></div>`).join('')}</div>` : '<div class="vacio">Sin medidas</div>'}</div>`;
};
function difMuslo(p, pos) {
  const posiciones = pos != null ? [String(pos)] : Object.keys(p.muslo || {});
  const d = posiciones.map(k => p.muslo?.[k]).filter(m => m && m.op && m.sana).map(m => m.sana - m.op);
  return d.length ? Math.max(...d) : null;
}
PROG.hinchazon = () => {
  const der = ultimo(S.derrame), per = S.perimetros;
  const posiciones = S.ajustes.posicionesMuslo;
  const colores = ['var(--g1)', 'var(--g2)', 'var(--g3)'];
  const rod = per.filter(p => p.rodilla?.op && p.rodilla?.sana).map(p => ({ x: p.fecha, y: +(p.rodilla.op - p.rodilla.sana).toFixed(1) }));
  return `
    <div class="card pila"><div class="fila entre"><div><h3>Derrame (prueba del barrido)</h3><p class="sub">${der ? `Último: <b>${GRADO_TXT[der.grado]}</b> · ${fLarga(der.fecha)}` : 'Aún no lo has medido'}</p></div><button class="btn peq" data-accion="nuevo-derrame">Añadir</button></div>
      ${S.derrame.length ? `<div class="fila" style="flex-wrap:wrap;gap:6px">${S.derrame.slice(-10).map(d => `<span class="chip ${d.grado === '0' ? 'ok' : GRADOS.indexOf(d.grado) >= 3 ? 'no' : 'falta'}">${fCorta(d.fecha)}: ${esc(d.grado)}</span>`).join('')}</div>
      <details><summary class="sub">Ver todas o borrar una</summary><div class="lista" style="margin-top:6px">${[...S.derrame].reverse().map(d => `<div class="item"><div class="cuerpo">${fLarga(d.fecha)} · <b>${esc(GRADO_TXT[d.grado])}</b></div><button class="borrar" data-accion="borrar" data-lista="derrame" data-id="${d.id}" aria-label="Borrar">✕</button></div>`).join('')}</div></details>` : ''}
    </div>
    ${como('derrame')}
    <div class="card pila"><div class="fila entre"><div><h3>Perímetros</h3><p class="sub">Rodilla (hinchazón) y muslo (músculo) de las dos piernas</p></div><button class="btn peq" data-accion="nuevo-perimetro">Añadir</button></div></div>
    <div class="card"><h3>Hinchazón de la rodilla</h3><p class="sub">Centímetros de más en la operada respecto a la sana. Lo ideal: 0.</p>${grafLinea([{ nombre: 'Diferencia', color: 'var(--g1)', puntos: rod }], { objetivo: 0, sufijo: ' cm', titulo: 'Diferencia de perímetro de rodilla' })}</div>
    <div class="card"><h3>Músculo del muslo</h3><p class="sub">Centímetros que le faltan a la operada respecto a la sana. Lo ideal: 0.</p>${grafLinea(posiciones.map((pos, i) => ({ nombre: `${pos} cm sobre la rótula`, color: colores[i % 3], puntos: per.filter(p => p.muslo?.[pos]?.op && p.muslo?.[pos]?.sana).map(p => ({ x: p.fecha, y: +(p.muslo[pos].sana - p.muslo[pos].op).toFixed(1) })) })), { objetivo: 0, sufijo: ' cm', titulo: 'Diferencia de perímetro del muslo' })}</div>
    ${como('perimetro')}
    <div class="card"><h3>Historial</h3>${per.length ? `<div class="lista" style="margin-top:6px">${[...per].reverse().slice(0, 20).map(p => `<div class="item"><div class="cuerpo"><b>${fLarga(p.fecha)}</b><div class="sub">${p.rodilla?.op ? `Rodilla ${fmt(p.rodilla.op, 1)} / ${fmt(p.rodilla.sana, 1)} cm · ` : ''}${Object.entries(p.muslo || {}).filter(([, m]) => m.op).map(([k, m]) => `Muslo ${k}: ${fmt(m.op, 1)} / ${fmt(m.sana, 1)}`).join(' · ')}</div></div><button class="borrar" data-accion="borrar" data-lista="perimetros" data-id="${p.id}" aria-label="Borrar">✕</button></div>`).join('')}</div><p class="sub" style="margin-top:6px">Operada / sana</p>` : '<div class="vacio">Sin medidas</div>'}</div>`;
};
PROG.pruebas = () => {
  const filas = Object.entries(PRUEBAS).map(([t, d]) => {
    const p = ultimaPrueba(t); let val = '—', chip = '';
    if (p) {
      if (d.tipo === 'sino') { val = p.valor === 'si' ? 'Sin caída' : 'Cae'; chip = `<span class="chip ${p.valor === 'si' ? 'ok' : 'no'}">${p.valor === 'si' ? 'Bien' : 'Aún no'}</span>`; }
      else if (d.tipo === 'valor') { val = `${fmt(p.valor)} ${d.unidad}`; }
      else if (d.soloOp) { val = `${fmt(p.op, 1)} ${d.unidad}${p.sana ? ` (sana ${fmt(p.sana, 1)})` : ''}`; chip = `<span class="chip ${p.op >= d.min ? 'ok' : 'no'}">${p.op >= d.min ? 'Bien' : `Meta ${d.min} ${d.unidad}`}</span>`; }
      else { const l = lsiDe(p); val = `${fmt(p.op, 1)} / ${fmt(p.sana, 1)} ${d.unidad}`; const minOk = !d.min || p.op >= d.min; chip = l != null ? `<span class="chip ${l >= 90 && minOk ? 'ok' : l >= 80 ? 'falta' : 'no'}">${fmt(l)} %</span>` : ''; }
    }
    return `<div class="item"><div class="cuerpo"><b>${esc(d.nombre)}</b><div class="sub">${val}${p ? ' · ' + fCorta(p.fecha) : ''}</div></div>${chip}<button class="btn claro peq" data-accion="nueva-prueba" data-tipo="${t}">Añadir</button></div>`;
  }).join('');
  const lsiSeries = SALTOS.map((t, i) => ({ nombre: PRUEBAS[t].nombre, color: ['var(--g1)', 'var(--g2)', 'var(--g3)', 'var(--g4)'][i], puntos: S.pruebas.filter(p => p.tipo === t).map(p => ({ x: p.fecha, y: Math.round(lsiDe(p)) })).filter(p => !isNaN(p.y)) }));
  const fuerza = ['cuad', 'isquios'].map((t, i) => ({ nombre: PRUEBAS[t].nombre, color: ['var(--g1)', 'var(--g3)'][i], puntos: S.pruebas.filter(p => p.tipo === t).map(p => ({ x: p.fecha, y: Math.round(lsiDe(p)) })).filter(p => !isNaN(p.y)) }));
  return `
    <div class="card"><p class="sub">El índice de simetría (LSI) compara la pierna operada con la sana: operada ÷ sana × 100. Para volver al deporte se pide un 90 % o más.</p></div>
    <div class="card"><div class="lista">${filas}</div></div>
    <div class="card"><h3>Simetría de fuerza</h3>${grafLinea(fuerza, { objetivo: 90, sufijo: ' %', titulo: 'Simetría de fuerza', vacio: 'Sin medidas de fuerza todavía' })}</div>
    <div class="card"><h3>Simetría en los saltos</h3>${grafLinea(lsiSeries, { objetivo: 90, sufijo: ' %', titulo: 'Simetría en los saltos', vacio: 'Los saltos llegan en las últimas fases' })}</div>
    ${como('slr')}${como('resistencia')}${como('equilibrio')}${como('fuerza')}${como('saltos')}${como('aclrsi')}
    <div class="card"><h3>Historial</h3>${S.pruebas.length ? `<div class="lista" style="margin-top:6px">${[...S.pruebas].reverse().slice(0, 25).map(p => `<div class="item"><div class="cuerpo"><b>${esc(PRUEBAS[p.tipo]?.nombre || p.tipo)}</b><div class="sub">${fLarga(p.fecha)} · ${p.valor != null ? (p.tipo === 'slr' ? (p.valor === 'si' ? 'sin caída' : 'cae') : fmt(p.valor)) : `${fmt(p.op, 1)} / ${fmt(p.sana, 1)} ${PRUEBAS[p.tipo]?.unidad || ''}`}</div></div><button class="borrar" data-accion="borrar" data-lista="pruebas" data-id="${p.id}" aria-label="Borrar">✕</button></div>`).join('')}</div>` : '<div class="vacio">Sin pruebas</div>'}</div>`;
};
PROG.carrera = () => {
  const c = S.carreras, u = ultimo(c);
  const total = c.reduce((a, x) => a + (x.km || 0), 0);
  const larga = c.reduce((a, x) => Math.max(a, x.km || 0), 0);
  const lunesHoy = lunesDe(hoyISO());
  const semanasD = Array.from({ length: 8 }, (_, i) => { const l = sumarDias(lunesHoy, -7 * (7 - i)); const fin = sumarDias(l, 6); return { etq: fCorta(l).replace(' ', ' '), v: +c.filter(x => x.fecha >= l && x.fecha <= fin).reduce((a, x) => a + (x.km || 0), 0).toFixed(1) }; });
  const r = ruta(), iCarrera = r.findIndex(id => P.fases[id].carrera), iAct = r.indexOf(faseActual().id);
  const ritmo = x => x.km && x.min ? `${Math.floor(x.min / x.km)}:${z2(Math.round((x.min / x.km % 1) * 60))} min/km` : '';
  return `
    ${iCarrera > -1 && iAct < iCarrera ? `<div class="card aviso-suave"><h3>Todavía no toca correr</h3><p style="margin-top:4px">Se empieza en la fase «${esc(P.fases[r[iCarrera]].nombre)}», cuando cumplas sus criterios. Puedes ir registrando la bici o andar en las notas.</p></div>` : ''}
    <div class="card oscura pila"><div class="fila entre"><div><p class="sub">Última carrera</p><h2 style="font-size:1.6rem">${u ? fmt(u.km, 2) + ' km' : '—'}</h2></div><p class="sub">${u ? fLarga(u.fecha) : ''}</p></div>
      ${u ? `<div class="rejilla-3"><div class="dato"><span class="n" style="font-size:1.1rem">${u.min ? fmt(u.min) + ' min' : '—'}</span><span class="l">Duración</span></div><div class="dato"><span class="n" style="font-size:1.1rem">${ritmo(u) || '—'}</span><span class="l">Ritmo</span></div><div class="dato"><span class="n" style="font-size:1.1rem">${u.dolor ?? '—'}/10</span><span class="l">Dolor después</span></div></div>` : ''}
    </div>
    <button class="btn ancho" data-accion="nueva-carrera">Añadir carrera</button>
    <div class="rejilla-3"><div class="card dato"><span class="n">${fmt(total, 1)}</span><span class="l">km en total</span></div><div class="card dato"><span class="n">${c.length}</span><span class="l">carreras</span></div><div class="card dato"><span class="n">${fmt(larga, 1)}</span><span class="l">la más larga</span></div></div>
    <div class="card"><h3>Kilómetros por semana</h3>${grafBarras(semanasD, { titulo: 'Kilómetros por semana' })}</div>
    ${como('carrera')}
    <div class="card"><h3>Historial</h3>${c.length ? `<div class="lista" style="margin-top:6px">${[...c].reverse().slice(0, 30).map(x => `<div class="item"><div class="cuerpo"><b>${fmt(x.km, 2)} km</b> <span class="sub">${x.tipo === 'intervalos' ? 'andar y correr' : 'seguida'}</span><div class="sub">${fLarga(x.fecha)}${x.min ? ' · ' + fmt(x.min) + ' min' : ''}${x.dolor != null ? ' · dolor ' + x.dolor + '/10' : ''}${x.nota ? ' · ' + esc(x.nota) : ''}</div></div><button class="borrar" data-accion="borrar" data-lista="carreras" data-id="${x.id}" aria-label="Borrar">✕</button></div>`).join('')}</div>` : '<div class="vacio">Sin carreras</div>'}</div>`;
};
PROG.habitos = () => {
  const desde = sumarDias(hoyISO(), -30); const ck = S.checkins.filter(c => c.fecha >= desde);
  const serie = (campo, nombre, color) => ({ nombre, color, puntos: ck.filter(c => c[campo] != null && c[campo] !== '').map(c => ({ x: c.fecha, y: c[campo] })) });
  return `
    <div class="card"><h3>Dolor (últimos 30 días)</h3>${grafLinea([serie('dolorReposo', 'En reposo', 'var(--g6)'), serie('dolorActividad', 'Al moverte', 'var(--g7)')], { min: 0, max: 10, titulo: 'Dolor', vacio: 'Haz el chequeo diario para ver tu evolución' })}</div>
    <div class="card"><h3>Confianza en la rodilla</h3>${grafLinea([serie('confianza', 'Confianza', 'var(--g1)')], { min: 0, max: 10, titulo: 'Confianza' })}</div>
    <div class="card"><h3>Sueño</h3>${grafLinea([serie('sueno', 'Horas', 'var(--g5)')], { sufijo: ' h', titulo: 'Horas de sueño', min: 0 })}</div>
    <div class="card"><h3>Agua</h3>${grafLinea([serie('agua', 'Vasos', 'var(--g2)')], { titulo: 'Vasos de agua', min: 0 })}</div>
    <div class="card"><h3>Pasos</h3>${grafLinea([serie('pasos', 'Pasos', 'var(--g4)')], { titulo: 'Pasos al día', margen: 200, min: 0 })}</div>
    <div class="card"><div class="fila entre"><h3>Tus chequeos</h3><button class="btn claro peq" data-accion="checkin-otro-dia">Otro día</button></div><p class="sub">Toca uno para corregirlo.</p>
      ${S.checkins.length ? `<div class="lista" style="margin-top:6px">${[...S.checkins].reverse().slice(0, 40).map(c => `<div class="item"><div class="cuerpo pulsable" data-accion="abrir-checkin" data-fecha="${c.fecha}" style="cursor:pointer"><b>${fLarga(c.fecha)}</b><div class="sub">Dolor ${c.dolorActividad ?? '—'}/10 · hinchazón ${(TXT.hinchazon[c.hinchazon] || '—').toLowerCase()}${(c.mecanico || []).length ? ' · ' + c.mecanico.map(m => TXT.mecanico[m].toLowerCase()).join(', ') : ''}${c.notas ? ' · ' + esc(c.notas) : ''}</div></div><button class="borrar" data-accion="borrar-checkin" data-fecha="${c.fecha}" aria-label="Borrar">✕</button></div>`).join('')}</div>` : '<div class="vacio">Sin chequeos</div>'}</div>`;
};
PROG.fotos = () => {
  const sel = UI.fotosSel;
  const fotos = [...S.fotos].reverse();
  const a = S.fotos.find(f => f.id === sel[0]), b = S.fotos.find(f => f.id === sel[1]);
  let comp = '';
  if (a && b) { const [x, y] = [a, b].sort(porFecha); comp = `<div class="card pila"><div class="fila entre"><h3>Comparación</h3><span class="chip acento">${diasEntre(x.fecha, y.fecha)} días</span></div><div class="comparar"><figure><img data-foto="${x.id}" alt="Foto del ${fLarga(x.fecha)}"><figcaption style="position:absolute;left:6px;bottom:6px;background:rgba(15,23,42,.7);color:#fff;font-size:.75rem;padding:2px 6px;border-radius:6px">${fCorta(x.fecha)}</figcaption></figure><figure><img data-foto="${y.id}" alt="Foto del ${fLarga(y.fecha)}"><figcaption style="position:absolute;left:6px;bottom:6px;background:rgba(15,23,42,.7);color:#fff;font-size:.75rem;padding:2px 6px;border-radius:6px">${fCorta(y.fecha)}</figcaption></figure></div><button class="enlace" data-accion="limpiar-sel">Quitar selección</button></div>`; }
  return `
    <div class="card pila"><h3>Fotos de la rodilla y el muslo</h3><p class="sub">Haz la foto siempre igual: misma luz, misma distancia, de pie y de frente. Se guardan solo en este móvil.</p>
      <label class="btn ancho" style="cursor:pointer">Hacer o elegir foto<input type="file" accept="image/*" capture="environment" id="foto-input" hidden></label></div>
    ${comp}
    ${fotos.length ? `<p class="sub">Toca dos fotos para compararlas.</p><div class="fotos">${fotos.map(f => `<figure class="${sel.includes(f.id) ? 'sel' : ''}" data-accion="sel-foto" data-id="${f.id}"><img data-foto="${f.id}" alt="Foto del ${fLarga(f.fecha)}" loading="lazy"><figcaption>${fCorta(f.fecha)}</figcaption></figure>`).join('')}</div>
      ${sel.length === 1 ? `<button class="btn borde peq" data-accion="borrar-foto" data-id="${sel[0]}" style="align-self:flex-start">Borrar la foto seleccionada</button>` : ''}` : '<div class="card vacio">Aún no hay fotos</div>'}`;
};

VISTAS.aprender = () => {
  const grupos = [...new Set(ARTICULOS.map(a => a.grupo))];
  const f = faseActual();
  return `<div class="pila">
    <div class="saludo"><h1>Aprender</h1><p>Entender lo que le pasa a tu rodilla ayuda a no agobiarse y a no pasarse.</p></div>
    <div class="card alerta pulsable" data-ir="alarma"><div class="fila entre"><div><h3>Señales de alarma</h3><p>Cuándo llamar al cirujano o ir a urgencias</p></div><span>›</span></div></div>
    ${grupos.map(g => `<div class="titulo-seccion"><h2>${esc(g)}</h2></div><div class="card"><div class="lista">${ARTICULOS.filter(a => a.grupo === g).map(a => `<div class="item pulsable" data-ir="articulo-${a.id}" style="cursor:pointer"><div class="cuerpo"><b>${esc(a.titulo)}</b>${(a.fases || []).includes(f.id) ? ' <span class="chip acento">Tu fase</span>' : ''}<div class="sub">${esc(a.resumen || '')}</div></div>${S.leidos[a.id] ? '<span class="chip ok">Leído</span>' : '<span style="color:var(--muted)">›</span>'}</div>`).join('')}</div></div>`).join('')}
    <div class="titulo-seccion"><h2>De dónde sale todo esto</h2></div>
    <div class="card"><p class="sub">Las fases, los criterios y los ejercicios salen de guías clínicas públicas. Los textos están escritos para esta app.</p><ul style="margin:8px 0 0;padding-left:20px">${Object.values(P.fuentes).map(x => `<li style="margin-top:4px">${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.nombre)}</a>` : esc(x.nombre)}</li>`).join('')}</ul></div>
  </div>`;
};
VISTAS.articulo = id => {
  const a = ARTICULOS.find(x => x.id === id); if (!a) return '<div class="vacio">No encontrado</div>';
  if (!S.leidos[a.id]) { S.leidos[a.id] = hoyISO(); guardar(); }
  return `<div class="pila articulo"><button class="enlace" data-ir="aprender" style="align-self:flex-start">‹ Aprender</button><h1>${esc(a.titulo)}</h1><div class="card">${md(a.texto)}${fuenteTxt(a.fuentes)}</div></div>`;
};
VISTAS.alarma = () => `<div class="pila">
  <div class="saludo"><h1>Señales de alarma</h1><p>Si tienes alguna de estas, no esperes a la próxima cita.</p></div>
  ${P.alarmas.map(x => `<div class="card ${x.urgente ? 'alerta' : 'aviso-suave'}"><h3>${esc(x.texto)}</h3><p style="margin-top:4px"><b>${esc(x.accion)}</b></p>${x.detalle ? `<p style="margin-top:4px">${esc(x.detalle)}</p>` : ''}</div>`).join('')}
  <div class="card"><p>Emergencias en España: <a href="tel:112"><b>112</b></a>. Ten a mano el teléfono de la unidad o del cirujano que te operó.</p></div>
  ${fuenteTxt(P.fuentesAlarmas)}
</div>`;

VISTAS.ajustes = () => {
  const p = S.perfil;
  return `<div class="pila">
    <div class="saludo"><h1>Ajustes</h1></div>
    <div class="card pulsable" data-ir="bienvenida"><div class="fila entre"><div><h3>Tu perfil</h3><p class="sub">${esc([p.nombre, 'rodilla ' + (p.rodilla || ''), TXT.ligamento[p.ligamento], TXT.situacion[p.situacion], p.injerto && p.situacion !== 'conservador' ? 'injerto: ' + TXT.injerto[p.injerto].toLowerCase() : ''].filter(Boolean).join(' · '))}</p></div><span>›</span></div></div>
    <div class="card pila"><h3>Fase</h3><p class="sub">Normalmente se cambia desde «¿Puedo avanzar?». Aquí puedes ponerla a mano.</p>
      <select id="aj-fase">${ruta().map(id => `<option value="${id}" ${id === faseActual().id ? 'selected' : ''}>${esc(P.fases[id].nombre)}</option>`).join('')}</select>
      <button class="btn borde peq" data-accion="fase-manual" style="align-self:flex-start">Cambiar de fase</button></div>
    <div class="card pila"><h3>Ejercicios de tu fisio</h3><p class="sub">${S.misEjercicios.length ? S.misEjercicios.map(e => esc(e.nombre)).join(' · ') : 'Ninguno todavía'}</p><button class="btn borde peq" data-accion="nuevo-ejercicio" style="align-self:flex-start">Añadir ejercicio</button></div>
    <div class="card pila"><h3>Posiciones del muslo</h3><p class="sub">Centímetros por encima de la rótula donde mides el muslo.</p><input id="aj-pos" type="text" value="${S.ajustes.posicionesMuslo.join(', ')}"><button class="btn borde peq" data-accion="guardar-pos" style="align-self:flex-start">Guardar</button></div>
    <div class="card pila"><h3>Recordatorio diario</h3><p class="sub">Crea un evento diario en el calendario del móvil para el chequeo y la sesión.</p><input id="aj-hora" type="time" value="20:00"><button class="btn borde peq" data-accion="recordatorio" style="align-self:flex-start">Crear recordatorio</button></div>
    <div class="card pila"><h3>Copia de seguridad</h3><p class="sub">${UI.servidor ? 'En este PC tus datos se guardan solos en la carpeta «datos» de la app, con una copia por día. Para pasarlos al móvil, guarda una copia aquí y recupérala allí.' : 'Tus datos viven solo en este dispositivo. Haz una copia de vez en cuando (y antes de cambiar de móvil).'}${S.ultimaCopia ? ` Última copia: ${fLarga(S.ultimaCopia)}.` : ''}</p>
      <div class="fila" style="flex-wrap:wrap"><button class="btn peq" data-accion="exportar">Guardar copia</button><button class="btn borde peq" data-accion="exportar" data-fotos="1">Copia con fotos</button><label class="btn borde peq" style="cursor:pointer">Recuperar copia<input type="file" accept="application/json,.json" id="importar-input" hidden></label></div></div>
    <div class="card pulsable" data-ir="informe"><div class="fila entre"><div><h3>Informe para tu fisio</h3><p class="sub">Resumen para enseñar en consulta o guardar en PDF</p></div><span>›</span></div></div>
    <div class="card pila"><h3>Borrar todo</h3><p class="sub">Elimina todos tus datos de este dispositivo.</p><button class="btn peligro peq" data-accion="borrar-todo" style="align-self:flex-start">Borrar todos los datos</button></div>
    <p class="sub" style="text-align:center">Mi rodilla · hecha a medida, sin cuotas. No sustituye a tu equipo médico.</p>
  </div>`;
};

VISTAS.informe = () => {
  const p = S.perfil, f = faseActual(), ef = estadoFase(f);
  const ext = ultimaMov('ext'), flex = ultimaMov('flex'), der = ultimo(S.derrame), per = ultimo(S.perimetros);
  const h = hoyISO(), hace14 = sumarDias(h, -14);
  const ck7 = S.checkins.filter(c => c.fecha >= sumarDias(h, -7));
  const ses14 = S.sesiones.filter(s => s.fecha >= hace14 && s.tipo === 'rehab');
  const dolSes = media(ses14.map(s => s.dolor).filter(x => x != null));
  const movs = [...S.movilidad].reverse().slice(0, 8);
  return `<div class="pila informe">
    <div class="fila entre no-imprimir"><button class="enlace" data-ir="progreso">‹ Volver</button><div class="fila"><button class="btn peq borde" data-accion="compartir-informe">Compartir</button><button class="btn peq" data-accion="imprimir">Imprimir o PDF</button></div></div>
    <div class="card"><h1>Informe de rehabilitación</h1><p class="sub">${esc(p.nombre || '')} · ${fLarga(h)}</p>
      <table class="tabla" style="margin-top:10px"><tbody>
        <tr><td>Lesión</td><td>${esc(TXT.ligamento[p.ligamento])}, rodilla ${esc(p.rodilla || '')}${(p.extras || []).length ? ' + ' + p.extras.map(x => TXT.extras[x].toLowerCase()).join(', ') : ''}</td></tr>
        <tr><td>Situación</td><td>${esc(TXT.situacion[p.situacion])}${p.fechaOperacion ? ' · operación ' + fLarga(p.fechaOperacion) : ''}${p.situacion !== 'conservador' && p.injerto ? ' · injerto: ' + TXT.injerto[p.injerto].toLowerCase() : ''}</td></tr>
        <tr><td>Momento</td><td>${esc(etiquetaTiempo())}</td></tr>
        <tr><td>Fase</td><td>${esc(f.nombre)} (criterios cumplidos: ${ef.ok} de ${ef.total})</td></tr>
      </tbody></table></div>
    <div class="card"><h2>Movilidad</h2><table class="tabla"><thead><tr><th>Fecha</th><th>Extensión</th><th>Flexión</th></tr></thead><tbody>${movs.map(m => `<tr><td>${fLarga(m.fecha)}</td><td class="n">${fmtExt(m.ext)}</td><td class="n">${m.flex != null ? fmt(m.flex) + '°' : '—'}</td></tr>`).join('') || '<tr><td colspan="3">Sin medidas</td></tr>'}</tbody></table>
      <p class="sub" style="margin-top:6px">Mejor extensión ${fmtExt(mejorMov('ext'))} · mejor flexión ${mejorMov('flex') != null ? fmt(mejorMov('flex')) + '°' : '—'}. Extensión: grados que faltan para estar recta.</p></div>
    <div class="card"><h2>Hinchazón y músculo</h2><table class="tabla"><tbody>
      <tr><td>Derrame (barrido)</td><td class="n">${der ? `${GRADO_TXT[der.grado]} (${fCorta(der.fecha)})` : '—'}</td></tr>
      <tr><td>Perímetro rodilla operada / sana</td><td class="n">${per?.rodilla?.op ? `${fmt(per.rodilla.op, 1)} / ${fmt(per.rodilla.sana, 1)} cm` : '—'}</td></tr>
      ${Object.entries(per?.muslo || {}).filter(([, m]) => m.op).map(([k, m]) => `<tr><td>Muslo a ${k} cm, operada / sana</td><td class="n">${fmt(m.op, 1)} / ${fmt(m.sana, 1)} cm</td></tr>`).join('')}
    </tbody></table></div>
    <div class="card"><h2>Últimos 7 días</h2><table class="tabla"><tbody>
      <tr><td>Chequeos</td><td class="n">${ck7.length}</td></tr>
      <tr><td>Dolor medio en reposo / al moverse</td><td class="n">${fmt(media(ck7.map(c => c.dolorReposo)), 1)} / ${fmt(media(ck7.map(c => c.dolorActividad)), 1)}</td></tr>
      <tr><td>Confianza media</td><td class="n">${fmt(media(ck7.map(c => c.confianza).filter(x => x != null)), 1)}/10</td></tr>
      <tr><td>Marcha (último)</td><td class="n">${ck7.length && ultimo(ck7).cojera ? TXT.cojera[ultimo(ck7).cojera] : '—'}</td></tr>
      <tr><td>Sesiones de rehabilitación (14 días)</td><td class="n">${ses14.length}${dolSes != null ? ` · dolor medio ${fmt(dolSes, 1)}/10` : ''}</td></tr>
    </tbody></table></div>
    <div class="card"><h2>Fuerza y saltos (LSI)</h2><table class="tabla"><tbody>${Object.entries(PRUEBAS).map(([t, d]) => { const x = ultimaPrueba(t); if (!x) return ''; const l = lsiDe(x); return `<tr><td>${esc(d.nombre)}</td><td class="n">${d.tipo === 'sino' ? (x.valor === 'si' ? 'sin caída' : 'cae') : d.tipo === 'valor' ? fmt(x.valor) : `${fmt(x.op, 1)} / ${fmt(x.sana, 1)} ${d.unidad} · ${fmt(l)} %`} (${fCorta(x.fecha)})</td></tr>`; }).join('') || '<tr><td>Sin pruebas</td></tr>'}</tbody></table></div>
    ${S.checkins.filter(c => c.notas && c.fecha >= hace14).length ? `<div class="card"><h2>Notas</h2><ul style="margin:6px 0 0;padding-left:20px">${S.checkins.filter(c => c.notas && c.fecha >= hace14).map(c => `<li>${fCorta(c.fecha)}: ${esc(c.notas)}</li>`).join('')}</ul></div>` : ''}
  </div>`;
};
function textoInforme() {
  const p = S.perfil, f = faseActual(), ext = ultimaMov('ext'), flex = ultimaMov('flex'), der = ultimo(S.derrame);
  const ck7 = S.checkins.filter(c => c.fecha >= sumarDias(hoyISO(), -7));
  return [`Rehabilitación de ${p.nombre || ''} (${fLarga(hoyISO())})`, etiquetaTiempo(), `Fase: ${f.nombre}`,
    `Extensión: ${ext ? fmtExt(ext.ext) : '—'} · Flexión: ${flex ? fmt(flex.flex) + '°' : '—'}`,
    `Derrame: ${der ? GRADO_TXT[der.grado] : '—'}`,
    `Dolor medio 7 días (al moverse): ${fmt(media(ck7.map(c => c.dolorActividad)), 1)}/10`,
    `Sesiones esta semana: ${sesionesSemana()}`].join('\n');
}

/* ---------- Hojas (formularios) ---------- */
function abrirHoja(html) {
  const h = $('#hoja'); h.innerHTML = `<div class="panel" role="dialog" aria-modal="true"><div class="asa"></div>${html}</div>`;
  h.hidden = false; document.body.style.overflow = 'hidden';
}
function cerrarHoja() {
  const h = $('#hoja'); h.hidden = true; h.innerHTML = ''; document.body.style.overflow = ''; pararGonio();
  if (resolverConfirmar) { const r = resolverConfirmar; resolverConfirmar = null; r(false); }
}
/* Confirmación dentro de la app (el visor de Claude no muestra confirm()). */
let resolverConfirmar = null;
function confirmar(texto, si = 'Sí, seguir') {
  return new Promise(res => {
    if (resolverConfirmar) resolverConfirmar(false);
    abrirHoja(`<div class="pila"><h2 style="margin-top:6px;text-wrap:balance">${esc(texto)}</h2><div class="rejilla-2"><button class="btn borde" data-accion="conf-no">Cancelar</button><button class="btn peligro" data-accion="conf-si">${esc(si)}</button></div></div>`);
    resolverConfirmar = res;
  });
}
/* Dentro del visor de Claude (un marco) no se puede imprimir ni descargar archivos. */
const EMBEBIDA = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
const avisoEmbebida = () => avisar('En esta vista de prueba no se pueden descargar ni imprimir archivos. Hazlo desde la app del PC.');

function hojaCheckin(fecha = hoyISO()) {
  const c = checkinDe(fecha) || {}; const prev = ultimo(S.checkins) || {};
  abrirHoja(`${cabHoja(fecha === hoyISO() ? 'Chequeo de hoy' : `Chequeo del ${fLarga(fecha)}`)}<div class="pila" data-fecha="${fecha}" id="ck-form">
    <div class="card pila">
      ${deslizador('ck-dr', 'Dolor en reposo', c.dolorReposo ?? 0, 0, 10, 'Nada', 'El peor')}
      ${deslizador('ck-da', 'Dolor al moverte o caminar', c.dolorActividad ?? 0, 0, 10, 'Nada', 'El peor')}
    </div>
    <div class="card pila">
      <div class="campo"><span class="etq">Hinchazón</span>${opciones('ck-hi', TXT.hinchazon.map((t, i) => [String(i), t]), c.hinchazon ?? prev.hinchazon ?? null, true)}</div>
      <div class="campo"><span class="etq">¿Cómo caminas?</span>${opciones('ck-co', Object.entries(TXT.cojera), c.cojera ?? prev.cojera ?? null, true)}</div>
      <div class="campo"><span class="etq">¿Le ha pasado algo de esto a la rodilla hoy?</span><span class="ayuda">Marca lo que toque. Si no ha pasado nada, déjalo vacío.</span>${opciones('ck-me', Object.entries(TXT.mecanico), c.mecanico || [], false, true)}</div>
      ${deslizador('ck-cf', 'Confianza en la rodilla', c.confianza ?? prev.confianza ?? 5, 0, 10, 'Ninguna', 'Total')}
      ${deslizador('ck-fu', '¿Cómo de normal funciona hoy tu rodilla?', c.funcion ?? prev.funcion ?? 5, 0, 10, 'No puedo hacer nada', 'Como antes')}
    </div>
    <div class="card pila">
      <div class="rejilla-2">${paso('ck-su', 'Horas de sueño', c.sueno ?? prev.sueno ?? 7, 0, 14, 0.5)}${paso('ck-ag', 'Vasos de agua', c.agua ?? 0, 0, 30, 1)}</div>
      <div class="campo"><label for="ck-pa">Pasos de hoy</label><input id="ck-pa" type="number" inputmode="numeric" value="${c.pasos ?? ''}" placeholder="Los ves en la app de salud del móvil"></div>
      <div class="campo"><label for="ck-no">Notas</label><textarea id="ck-no" placeholder="Algo que quieras contarle a tu fisio">${esc(c.notas || '')}</textarea></div>
    </div>
    <button class="btn ancho" data-accion="guardar-checkin">Guardar</button>
  </div>`);
}
function hojaMovilidad(pre = {}) {
  abrirHoja(`${cabHoja('Movilidad')}<div class="pila"><div class="card pila">
    ${campoFecha('mv-f')}
    <div class="campo"><label for="mv-e">Extensión (grados)</label><input id="mv-e" type="text" inputmode="decimal" value="${pre.ext != null ? Math.abs(pre.ext) : ''}" placeholder="0 = recta del todo">
      ${opciones('mv-hiper', [['falta', 'Le faltan para estar recta'], ['pasa', 'Pasa de recta']], pre.ext < 0 ? 'pasa' : 'falta', true)}</div>
    <div class="campo"><label for="mv-fl">Flexión (grados)</label><input id="mv-fl" type="text" inputmode="decimal" value="${pre.flex ?? ''}" placeholder="Por ejemplo, 95"></div>
    <div class="campo"><span class="etq">¿Quién la ha medido?</span>${opciones('mv-quien', [['yo', 'Yo'], ['fisio', 'Fisio o médico'], ['movil', 'El móvil']], pre.metodo || 'yo', true)}<span class="ayuda">Para dar por buena la extensión completa antes de operar cuenta la del fisio.</span></div>
    <div class="campo"><label for="mv-n">Nota</label><input id="mv-n" type="text" placeholder="Medido por mi fisio, con goniómetro…"></div>
    <div class="campo"><label for="mv-fs">Flexión de la rodilla sana (grados)</label><input id="mv-fs" type="text" inputmode="decimal" value="${S.perfil?.flexSana ?? ''}" placeholder="Basta medirla una vez"><span class="ayuda">Sirve para comparar: el objetivo es llegar al 95 % de la sana.</span></div>
  </div><button class="btn ancho" data-accion="guardar-mov" data-metodo="${pre.metodo || ''}">Guardar</button></div>`);
}
function hojaDerrame() {
  abrirHoja(`${cabHoja('Derrame')}<div class="pila"><div class="card pila">${campoFecha('dr-f')}
    <div class="campo"><span class="etq">Resultado de la prueba del barrido</span>${opciones('dr-g', GRADOS.map(g => [g, g === '0' ? '0' : g === 'traza' ? 'Traza' : g]), null, true)}</div>
    <p class="sub">0: no vuelve nada de líquido. Traza: una ola mínima. 1+: vuelve una ola pequeña. 2+: el líquido vuelve solo, sin barrer hacia abajo. 3+: tanto líquido que no se puede barrer.</p></div>
    <button class="btn ancho" data-accion="guardar-derrame">Guardar</button></div>`);
}
function hojaPerimetro() {
  const ult = ultimo(S.perimetros);
  const fila = (id, etq, v) => `<div class="campo"><span class="etq">${etq}</span><div class="num-par"><div class="campo"><label for="${id}-o">Operada (cm)</label><input id="${id}-o" type="text" inputmode="decimal" step="0.1"></div><div class="campo"><label for="${id}-s">Sana (cm)</label><input id="${id}-s" type="text" inputmode="decimal" step="0.1" value="${v ?? ''}"></div></div></div>`;
  abrirHoja(`${cabHoja('Perímetros')}<div class="pila"><div class="card pila">${campoFecha('pe-f')}
    <p class="sub">Con una cinta métrica, de pie o tumbado con la pierna estirada y relajada. Rellena lo que midas.</p>
    ${fila('pe-r', 'Rodilla, a la altura de la rótula', ult?.rodilla?.sana)}
    ${S.ajustes.posicionesMuslo.map(pos => fila('pe-m' + pos, `Muslo, ${pos} cm por encima de la rótula`, ult?.muslo?.[pos]?.sana)).join('')}
  </div><button class="btn ancho" data-accion="guardar-perimetro">Guardar</button></div>`);
}
function hojaPrueba(tipo) {
  const d = PRUEBAS[tipo]; let cuerpo = '';
  if (d.tipo === 'sino') cuerpo = `<div class="campo"><span class="etq">Tumbado boca arriba, al levantar la pierna estirada, ¿la rodilla se mantiene recta?</span>${opciones('pr-v', [['si', 'Sí, sin caer'], ['no', 'No, se dobla']], null, true)}</div>`;
  else if (d.tipo === 'valor') cuerpo = `<div class="campo"><label for="pr-val">Puntuación (0-${d.max})</label><input id="pr-val" type="text" inputmode="decimal" min="0" max="${d.max}"></div>`;
  else cuerpo = `<div class="num-par"><div class="campo"><label for="pr-o">Operada (${d.unidad})</label><input id="pr-o" type="text" inputmode="decimal" step="0.1"></div><div class="campo"><label for="pr-s">Sana (${d.unidad})${d.soloOp ? ', opcional' : ''}</label><input id="pr-s" type="text" inputmode="decimal" step="0.1"></div></div>${d.min ? `<p class="sub">Mínimo de referencia (Melbourne): ${d.min} ${d.unidad}.</p>` : ''}${d.salto ?'<p class="sub">Haz 2-3 intentos válidos con cada pierna y apunta el mejor. Empieza siempre por la sana.</p>' : ''}${d.menorMejor ? '<p class="sub">Aquí menos segundos es mejor.</p>' : ''}`;
  abrirHoja(`${cabHoja(esc(d.nombre))}<div class="pila"><div class="card pila">${campoFecha('pr-f')}${cuerpo}</div><button class="btn ancho" data-accion="guardar-prueba" data-tipo="${tipo}">Guardar</button></div>`);
}
function hojaCarrera() {
  abrirHoja(`${cabHoja('Carrera')}<div class="pila"><div class="card pila">${campoFecha('ca-f')}
    <div class="num-par"><div class="campo"><label for="ca-km">Kilómetros</label><input id="ca-km" type="text" inputmode="decimal" step="0.01"></div><div class="campo"><label for="ca-min">Minutos</label><input id="ca-min" type="text" inputmode="decimal"></div></div>
    <div class="campo"><span class="etq">Tipo</span>${opciones('ca-t', [['intervalos', 'Andar y correr'], ['continua', 'Seguida']], 'intervalos', true)}</div>
    ${deslizador('ca-d', 'Dolor después', 0, 0, 10, 'Nada', 'El peor')}
    <div class="campo"><label for="ca-n">Nota</label><input id="ca-n" type="text" placeholder="1 min corriendo, 1 andando × 10…"></div>
  </div><button class="btn ancho" data-accion="guardar-carrera">Guardar</button></div>`);
}
function hojaEjercicio() {
  abrirHoja(`${cabHoja('Ejercicio de tu fisio')}<div class="pila"><div class="card pila">
    <div class="campo"><label for="ej-n">Nombre</label><input id="ej-n" type="text" placeholder="Puente de glúteo con banda"></div>
    <div class="num-par"><div class="campo"><label for="ej-s">Series</label><input id="ej-s" type="number" inputmode="numeric" value="3"></div><div class="campo"><label for="ej-r">Repeticiones</label><input id="ej-r" type="number" inputmode="numeric" value="10"></div></div>
    <div class="campo"><label for="ej-seg">Segundos por repetición (si es de aguantar)</label><input id="ej-seg" type="number" inputmode="numeric" placeholder="Opcional"></div>
    <div class="campo"><label for="ej-d">Cómo se hace</label><textarea id="ej-d" placeholder="Lo que te haya explicado"></textarea></div>
  </div><button class="btn ancho" data-accion="guardar-ejercicio">Añadir a mi sesión</button></div>`);
}
function hojaFinSesion() {
  abrirHoja(`${cabHoja('Sesión terminada')}<div class="pila"><div class="card pila">
    ${deslizador('fs-d', '¿Cuánto te ha dolido durante la sesión?', 0, 0, 10, 'Nada', 'El peor')}
    <div class="campo"><label for="fs-n">Nota</label><input id="fs-n" type="text" placeholder="Me ha costado el último ejercicio…"></div>
  </div><button class="btn ancho" data-accion="guardar-sesion">Guardar sesión</button></div>`);
}

/* ---------- Medir con el móvil (sensores) ---------- */
let gon = null;
function hojaGonio() {
  abrirHoja(`${cabHoja('Medir con el móvil')}<div class="pila">
    <div class="card"><p><b>1.</b> Apoya el móvil a lo largo del <b>muslo</b>, por el lado de fuera, con la pantalla hacia fuera y la parte de arriba hacia la cadera.</p><p style="margin-top:8px"><b>2.</b> Quieto, pulsa «Fijar el muslo».</p><p style="margin-top:8px"><b>3.</b> Ponlo igual (mismo lado, misma orientación) a lo largo de la <b>espinilla</b> y pulsa «Medir».</p><p class="sub" style="margin-top:8px">Error típico de unos 5°. Sirve para seguir la tendencia; la medida buena es la del goniómetro de tu fisio. Necesita abrir la app desde su dirección https.</p></div>
    <div class="card" style="text-align:center"><div class="crono" id="gon-angulo">—</div><div class="sub" id="gon-estado">Pulsa «Activar sensores»</div></div>
    <button class="btn ancho" data-accion="gon" id="gon-btn">Activar sensores</button>
    <div class="rejilla-2" id="gon-guardar" hidden><button class="btn claro" data-accion="gon-guardar" data-campo="flex">Guardar como flexión</button><button class="btn claro" data-accion="gon-guardar" data-campo="ext">Guardar como extensión</button></div>
  </div>`);
}
const anguloEntre = (a, b) => { const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; const n = Math.hypot(...a) * Math.hypot(...b); return Math.acos(Math.max(-1, Math.min(1, d / n))) * 180 / Math.PI; };
function onMotion(e) {
  const a = e.accelerationIncludingGravity; if (!gon || !a || a.x == null) return;
  const k = 0.15, g = gon.g || [a.x, a.y, a.z];
  gon.g = [g[0] + k * (a.x - g[0]), g[1] + k * (a.y - g[1]), g[2] + k * (a.z - g[2])];
  if (!gon.recibido) { gon.recibido = true; gon.fase = 'fijar'; pintarGonio(); }
  if (gon.ref && gon.fase === 'medir') { const el = $('#gon-angulo'); if (el) el.textContent = Math.round(anguloEntre(gon.ref, gon.g)) + '°'; }
}
function pintarGonio(msg) {
  const btn = $('#gon-btn'), est = $('#gon-estado'); if (!btn) return;
  const t = { fijar: ['Fijar el muslo', 'Móvil en el muslo y pulsa'], medir: ['Medir', 'Ahora en la espinilla, igual de orientado'], hecho: ['Repetir', 'Medida tomada'] }[gon?.fase] || ['Activar sensores', ''];
  btn.textContent = t[0]; est.textContent = msg || t[1];
  $('#gon-guardar').hidden = gon?.fase !== 'hecho';
}
async function accionGonio() {
  if (!gon || !gon.recibido) {
    if (typeof DeviceMotionEvent === 'undefined') return pintarGonio('Este dispositivo no tiene sensores de movimiento.');
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      try { if (await DeviceMotionEvent.requestPermission() !== 'granted') return pintarGonio('Sin permiso para usar los sensores.'); }
      catch (err) { return pintarGonio('Abre la app desde su dirección https para poder usar los sensores.'); }
    }
    gon = { g: null, ref: null, fase: 'esperando' };
    window.addEventListener('devicemotion', onMotion);
    setTimeout(() => { if (gon && !gon.recibido) pintarGonio('No llegan datos de los sensores. En el ordenador no funciona: hazlo desde el móvil.'); }, 1500);
    return;
  }
  if (gon.fase === 'fijar') { gon.ref = [...gon.g]; gon.fase = 'medir'; }
  else if (gon.fase === 'medir') { gon.valor = Math.round(anguloEntre(gon.ref, gon.g)); gon.fase = 'hecho'; $('#gon-angulo').textContent = gon.valor + '°'; navigator.vibrate?.(60); }
  else if (gon.fase === 'hecho') { gon.ref = null; gon.fase = 'fijar'; $('#gon-angulo').textContent = '—'; }
  pintarGonio();
}
function pararGonio() { if (gon) { window.removeEventListener('devicemotion', onMotion); gon = null; } }

/* ---------- Acciones ---------- */
const ACC = {};
ACC.cerrar = () => cerrarHoja();
ACC['conf-si'] = () => { const r = resolverConfirmar; resolverConfirmar = null; cerrarHoja(); r?.(true); };
ACC['conf-no'] = () => cerrarHoja();
ACC['guardar-perfil'] = () => {
  const sit = leerOpcion('situacion'), rodilla = leerOpcion('rodilla');
  if (!rodilla) return avisar('Elige qué rodilla');
  if (!sit) return avisar('Dime en qué punto estás');
  const antes = S.perfil;
  const faseId = (P.rutas[sit] || []).length ? $('#f-fase').value : null;
  S.perfil = {
    ...(antes || {}), nombre: leerTxt('f-nombre'), rodilla, ligamento: leerOpcion('ligamento') || 'lca', extras: leerMulti('extras'),
    situacion: sit, fechaLesion: $('#f-lesion').value || null, fechaOperacion: $('#f-op').value || null,
    injerto: leerOpcion('injerto') || 'nose', deporte: leerTxt('f-deporte'), faseId, creado: antes?.creado || hoyISO(),
  };
  if (!antes || antes.faseId !== faseId) S.perfil.faseDesde = hoyISO();
  guardar(); avisar(antes ? 'Perfil guardado' : 'Plan listo'); ir('hoy');
};
ACC['ya-operado'] = () => {
  S.perfil.situacion = 'operado'; S.perfil.fechaOperacion = S.perfil.fechaOperacion || hoyISO();
  S.perfil.faseId = P.rutas.operado[0]; S.perfil.faseDesde = hoyISO(); guardar(); avisar('Plan de después de la operación activado'); pintar();
};
ACC['abrir-checkin'] = el => hojaCheckin(el?.dataset?.fecha || hoyISO());
ACC['guardar-checkin'] = () => {
  const h = $('#ck-form')?.dataset.fecha || hoyISO(); const prev = checkinDe(h);
  const hi = leerOpcion('ck-hi');
  const c = { id: prev?.id || uid(), fecha: h, dolorReposo: leerNum('ck-dr'), dolorActividad: leerNum('ck-da'), hinchazon: hi != null ? +hi : null, cojera: leerOpcion('ck-co'), mecanico: leerMulti('ck-me'), confianza: leerNum('ck-cf'), funcion: leerNum('ck-fu'), sueno: leerPaso('ck-su'), agua: leerPaso('ck-ag'), pasos: leerNum('ck-pa'), notas: leerTxt('ck-no') };
  S.checkins = S.checkins.filter(x => x.fecha !== h); insertar(S.checkins, c);
  cerrarHoja(); avisar(c.mecanico.includes('bloqueo') ? 'Guardado. Mira el aviso: un bloqueo hay que consultarlo' : 'Chequeo guardado'); pintar(true);
};
ACC['checkin-otro-dia'] = () => abrirHoja(`${cabHoja('Chequeo de otro día')}<div class="pila"><div class="card pila">${campoFecha('ck-otro', sumarDias(hoyISO(), -1))}</div><button class="btn ancho" data-accion="checkin-fecha">Seguir</button></div>`);
ACC['checkin-fecha'] = () => { const f = $('#ck-otro').value; hojaCheckin(fechaValida(f) && f <= hoyISO() ? f : hoyISO()); };
ACC['borrar-checkin'] = async el => {
  if (!(await confirmar(`¿Borrar el chequeo del ${fLarga(el.dataset.fecha)}?`))) return;
  S.checkins = S.checkins.filter(x => x.fecha !== el.dataset.fecha); guardar(); pintar(true);
};
ACC['seg-sesion'] = el => { UI.segSesion = el.dataset.v; pintar(true); };
ACC['ocultar-ej'] = el => { S.ocultos[el.dataset.id] = true; guardar(); avisar('Quitado de tu sesión'); pintar(true); };
ACC['mostrar-ej'] = el => { delete S.ocultos[el.dataset.id]; guardar(); pintar(true); };
ACC['ver-ocultos'] = () => { UI.verOcultos = !UI.verOcultos; pintar(true); };
ACC['nuevo-ejercicio'] = () => hojaEjercicio();
ACC['guardar-ejercicio'] = () => {
  const nombre = leerTxt('ej-n'); if (!nombre) return avisar('Ponle un nombre');
  const s = leerNum('ej-s') || 1, r = leerNum('ej-r'), seg = leerNum('ej-seg');
  S.misEjercicios.push({ id: 'mio-' + uid(), nombre, series: s, reps: r, seg, desc: leerTxt('ej-d'), dosis: `${s} × ${r || ''}${seg ? ` · aguanta ${seg} s` : ''}`.replace(' × ·', ' ·') });
  guardar(); cerrarHoja(); avisar('Añadido a tu sesión'); pintar(true);
};
ACC['borrar-mio'] = async el => { if (!(await confirmar('¿Borrar este ejercicio?'))) return; S.misEjercicios = S.misEjercicios.filter(e => e.id !== el.dataset.id); guardar(); pintar(true); };
ACC['empezar-sesion'] = el => {
  const tipo = el.dataset.tipo;
  /* Si había una sesión a medias del mismo tipo se sigue (aunque haya pasado la medianoche); se queda con su fecha. */
  if (!S.sesionActual || S.sesionActual.tipo !== tipo || diasEntre(S.sesionActual.fecha, hoyISO()) > 1) {
    S.sesionActual = { id: uid(), tipo, fecha: hoyISO(), inicio: Date.now(), faseId: faseActual().id, idx: 0, hechas: {} };
    guardar();
  }
  ir('guiada');
};
ACC.serie = el => {
  const sa = S.sesionActual, e = listaSesion(sa)[sa.idx]; const n = +el.dataset.n;
  sa.hechas[e.id] = (sa.hechas[e.id] || 0) >= n ? n - 1 : n; guardar(); pintar(true);
  if (sa.hechas[e.id] === (e.series || 1)) navigator.vibrate?.(40);
};
ACC['ej-sig'] = () => { S.sesionActual.idx++; guardar(); pararCrono(); pintar(); };
ACC['ej-ant'] = () => { S.sesionActual.idx = Math.max(0, S.sesionActual.idx - 1); guardar(); pararCrono(); pintar(); };
ACC['salir-guiada'] = () => { pararCrono(); ir(S.sesionActual?.tipo === 'fuerza' ? 'sesion' : 'hoy'); };
ACC['terminar-sesion'] = () => { pararCrono(); hojaFinSesion(); };
ACC['guardar-sesion'] = () => {
  const sa = S.sesionActual; if (!sa) return cerrarHoja();
  const dolor = leerNum('fs-d');
  const lista = listaSesion(sa);
  insertar(S.sesiones, { id: sa.id, fecha: sa.fecha, tipo: sa.tipo, faseId: sa.faseId, min: Math.round((Date.now() - sa.inicio) / 60000), ejercicios: lista.map(e => ({ id: e.id, series: sa.hechas[e.id] || 0 })), dolor, nota: leerTxt('fs-n') });
  S.sesionActual = null; guardar(); cerrarHoja();
  avisar(dolor > limiteDolor() ? 'Guardada. Te ha dolido bastante: la próxima, algo más suave' : 'Sesión guardada. Buen trabajo');
  ir(sa.tipo === 'fuerza' ? 'sesion' : 'hoy');
};
ACC.crono = el => {
  pararCrono(); let t = +el.dataset.seg; const out = $('#crono'); out.textContent = t + 's'; el.textContent = 'Contando…';
  UI.crono = setInterval(() => {
    t--; if ($('#crono')) $('#crono').textContent = Math.max(t, 0) + 's';
    if (t <= 0) { pararCrono(); pitido(); navigator.vibrate?.([120, 60, 120]); if (el.isConnected) el.textContent = `Otra vez (${el.dataset.seg} s)`; }
  }, 1000);
};
ACC.manual = el => {
  const f = faseActual(), k = claveManual(f.id, el.dataset.id);
  if (S.manuales[k]) delete S.manuales[k]; else S.manuales[k] = hoyISO();
  guardar(); pintar(true);
};
ACC.avanzar = async el => {
  const f = faseActual(), sig = siguienteFase(); if (!sig) return;
  if (el.dataset.forzar && !(await confirmar(`¿Pasar a «${sig.nombre}» aunque no cumplas todos los criterios?`))) return;
  const ef = estadoFase(f);
  S.evaluaciones.push({ fecha: hoyISO(), de: f.id, a: sig.id, cumplidos: ef.ok, total: ef.total, forzado: !!el.dataset.forzar });
  S.perfil.faseId = sig.id; S.perfil.faseDesde = hoyISO(); S.sesionActual = null; guardar();
  avisar(`Ahora estás en ${sig.nombre}`); ir('hoy');
};
ACC.retroceder = async () => {
  const r = ruta(), i = r.indexOf(faseActual().id); if (i <= 0) return;
  if (!(await confirmar(`¿Volver a «${P.fases[r[i - 1]].nombre}»?`))) return;
  S.perfil.faseId = r[i - 1]; S.perfil.faseDesde = hoyISO(); S.sesionActual = null; guardar(); ir('hoy');
};
ACC['fase-manual'] = () => { const v = $('#aj-fase').value; if (v === S.perfil.faseId) return; S.perfil.faseId = v; S.perfil.faseDesde = hoyISO(); S.sesionActual = null; guardar(); avisar('Fase cambiada'); };
ACC['nueva-mov'] = () => hojaMovilidad();
ACC['guardar-mov'] = el => {
  const e0 = leerNum('mv-e'), flex = leerNum('mv-fl'), fs = leerNum('mv-fs');
  const ext = e0 == null ? null : (leerOpcion('mv-hiper') === 'pasa' ? -Math.abs(e0) : Math.abs(e0));
  if (fs != null && fs > 90 && fs <= 170 && fs !== S.perfil.flexSana) { S.perfil.flexSana = fs; guardar(); }
  if (ext == null && flex == null) { if (fs != null) { cerrarHoja(); avisar('Flexión de la sana guardada'); pintar(true); return; } return avisar('Pon al menos un valor'); }
  if (flex != null && (flex < 0 || flex > 170)) return avisar('La flexión debe estar entre 0 y 170°');
  if (ext != null && (ext < -20 || ext > 60)) return avisar('Revisa la extensión');
  insertar(S.movilidad, { id: uid(), fecha: $('#mv-f').value || hoyISO(), ext, flex, nota: leerTxt('mv-n'), metodo: leerOpcion('mv-quien') || el.dataset.metodo || null });
  cerrarHoja(); avisar('Medida guardada'); pintar(true);
};
ACC.gonio = () => hojaGonio();
ACC.gon = () => accionGonio();
ACC['gon-guardar'] = el => { const v = gon?.valor; pararGonio(); hojaMovilidad({ [el.dataset.campo]: v, metodo: 'movil' }); };
ACC['nuevo-derrame'] = () => hojaDerrame();
ACC['guardar-derrame'] = () => { const g = leerOpcion('dr-g'); if (g == null) return avisar('Elige un resultado'); insertar(S.derrame, { id: uid(), fecha: $('#dr-f').value || hoyISO(), grado: g }); cerrarHoja(); avisar('Guardado'); pintar(true); };
ACC['nuevo-perimetro'] = () => hojaPerimetro();
ACC['guardar-perimetro'] = () => {
  const par = id => ({ op: leerNum(id + '-o'), sana: leerNum(id + '-s') });
  const rodilla = par('pe-r'); const muslo = {};
  S.ajustes.posicionesMuslo.forEach(pos => { const m = par('pe-m' + pos); if (m.op || m.sana) muslo[pos] = m; });
  if (!rodilla.op && !Object.keys(muslo).length) return avisar('Rellena al menos una medida');
  insertar(S.perimetros, { id: uid(), fecha: $('#pe-f').value || hoyISO(), rodilla, muslo });
  cerrarHoja(); avisar('Guardado'); pintar(true);
};
ACC['nueva-prueba'] = el => hojaPrueba(el.dataset.tipo);
ACC['guardar-prueba'] = el => {
  const t = el.dataset.tipo, d = PRUEBAS[t]; const p = { id: uid(), fecha: $('#pr-f').value || hoyISO(), tipo: t };
  if (d.tipo === 'sino') { p.valor = leerOpcion('pr-v'); if (!p.valor) return avisar('Elige una respuesta'); }
  else if (d.tipo === 'valor') { p.valor = leerNum('pr-val'); if (p.valor == null) return avisar('Pon la puntuación'); }
  else { p.op = leerNum('pr-o'); p.sana = leerNum('pr-s'); if (!p.op || (!p.sana && !d.soloOp)) return avisar(d.soloOp ? 'Pon el resultado de la operada' : 'Pon las dos piernas'); }
  insertar(S.pruebas, p); cerrarHoja(); avisar('Guardado'); pintar(true);
};
ACC['nueva-carrera'] = () => hojaCarrera();
ACC['guardar-carrera'] = () => {
  const km = leerNum('ca-km'); if (!km) return avisar('Pon los kilómetros');
  insertar(S.carreras, { id: uid(), fecha: $('#ca-f').value || hoyISO(), km, min: leerNum('ca-min'), tipo: leerOpcion('ca-t'), dolor: leerNum('ca-d'), nota: leerTxt('ca-n') });
  cerrarHoja(); avisar('Carrera guardada'); pintar(true);
};
ACC.borrar = async el => {
  if (!(await confirmar('¿Borrar este registro?'))) return;
  S[el.dataset.lista] = S[el.dataset.lista].filter(x => x.id !== el.dataset.id); guardar(); pintar(true);
};
ACC['sel-foto'] = el => {
  const id = el.dataset.id, s = UI.fotosSel;
  UI.fotosSel = s.includes(id) ? s.filter(x => x !== id) : [...s, id].slice(-2); pintar(true);
};
ACC['limpiar-sel'] = () => { UI.fotosSel = []; pintar(true); };
ACC['borrar-foto'] = async el => {
  if (!(await confirmar('¿Borrar esta foto?'))) return;
  await FotosDB.del(el.dataset.id); fotoAlServidor(el.dataset.id, null, true);
  S.fotos = S.fotos.filter(f => f.id !== el.dataset.id); UI.fotosSel = []; guardar(); pintar(true);
};
ACC['guardar-pos'] = () => {
  const v = $('#aj-pos').value.split(/[,;\s]+/).map(num).filter(x => x != null && x > 0 && x < 40);
  if (!v.length) return avisar('Pon al menos una posición, por ejemplo 10');
  S.ajustes.posicionesMuslo = [...new Set(v)].slice(0, 3); guardar(); avisar('Guardado');
};
ACC.recordatorio = async () => {
  if (EMBEBIDA) return avisoEmbebida();
  const [hh, mm] = ($('#aj-hora').value || '20:00').split(':'); const d = sumarDias(hoyISO(), 1).replace(/-/g, '');
  const fin = `${z2((+hh + (+mm + 15 >= 60 ? 1 : 0)) % 24)}${z2((+mm + 15) % 60)}`;
  const ahora = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Mi rodilla//ES', 'BEGIN:VEVENT', `UID:${uid()}@mi-rodilla`, `DTSTAMP:${ahora}`, `DTSTART:${d}T${z2(hh)}${z2(mm)}00`, `DTEND:${d}T${fin}00`, 'RRULE:FREQ=DAILY', 'SUMMARY:Rodilla: chequeo y sesión', 'DESCRIPTION:Abre Mi rodilla', 'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:Rodilla: chequeo y sesión', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  await compartirArchivo(new Blob([ics], { type: 'text/calendar' }), 'recordatorio-rodilla.ics');
};
ACC.exportar = async el => {
  if (EMBEBIDA) return avisoEmbebida();
  const datos = JSON.parse(JSON.stringify(S)); datos.sesionActual = null; datos.exportado = new Date().toISOString();
  if (el.dataset.fotos) { datos.fotosDatos = {}; for (const f of S.fotos) { const b = await FotosDB.get(f.id); if (b) datos.fotosDatos[f.id] = await blobADataURL(b); } }
  await compartirArchivo(new Blob([JSON.stringify(datos)], { type: 'application/json' }), `mi-rodilla-${hoyISO()}.json`);
  S.ultimaCopia = hoyISO(); guardar();
};
ACC['borrar-todo'] = async () => {
  if (!(await confirmar('Se borrarán todos tus datos de este dispositivo. ¿Seguro?'))) return;
  if (!(await confirmar('Última confirmación: no se puede deshacer si no tienes copia.'))) return;
  try { localStorage.removeItem(CLAVE); } catch (e) { /* nada que borrar */ }
  await FotosDB.clear().catch(() => {}); S = estadoVacio();
  if (UI.servidor) guardar(); /* el PC guarda copias diarias en datos/copias por si acaso */
  ir('bienvenida');
};
ACC.imprimir = () => EMBEBIDA ? avisoEmbebida() : window.print();
ACC['compartir-informe'] = async () => {
  const t = textoInforme();
  if (navigator.share) { try { await navigator.share({ title: 'Informe de rehabilitación', text: t }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  try { await navigator.clipboard.writeText(t); avisar('Resumen copiado'); } catch (e) { avisar('No se ha podido compartir'); }
};

/* ---------- Archivos ---------- */
const blobADataURL = b => new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(b); });
async function compartirArchivo(blob, nombre) {
  const file = new File([blob], nombre, { type: blob.type });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: nombre }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
async function reducirImagen(file, max = 1280) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return await new Promise(res => c.toBlob(res, 'image/jpeg', 0.82));
  } finally { URL.revokeObjectURL(url); }
}
document.addEventListener('change', async e => {
  if (e.target.id === 'foto-input' && e.target.files[0]) {
    try {
      const blob = await reducirImagen(e.target.files[0]); const id = uid();
      await FotosDB.put(id, blob); fotoAlServidor(id, blob); insertar(S.fotos, { id, fecha: hoyISO() }); avisar('Foto guardada'); pintar(true);
    } catch (err) { avisar('No se ha podido guardar la foto'); }
  }
  if (e.target.id === 'importar-input' && e.target.files[0]) {
    try {
      const datos = JSON.parse(await e.target.files[0].text());
      if (!('perfil' in datos) || !Array.isArray(datos.checkins)) throw new Error('formato');
      if (!(await confirmar(`Copia del ${datos.exportado ? fLarga(datos.exportado.slice(0, 10)) : 'archivo'}. Sustituirá los datos actuales. ¿Seguir?`))) return;
      const fotos = datos.fotosDatos || {}; delete datos.fotosDatos;
      try { localStorage.setItem(CLAVE + '.antes-de-importar', JSON.stringify(S)); } catch (e2) { /* sin espacio: se sigue */ }
      for (const [id, durl] of Object.entries(fotos)) { const b = await (await fetch(durl)).blob(); await FotosDB.put(id, b); fotoAlServidor(id, b); }
      S = sanear(datos); guardar(); avisar('Copia recuperada'); ir('hoy');
    } catch (err) { avisar('Ese archivo no es una copia válida'); }
  }
  if (e.target.matches('#f-op, #f-lesion')) actualizarFormPerfil();
  if (e.target.id === 'f-fase') e.target.dataset.tocado = '1';
});

/* ---------- Sonido y avisos ---------- */
let audioCtx = null;
function pitido() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(audioCtx.destination);
    g.gain.setValueAtTime(0.2, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5); o.start(); o.stop(audioCtx.currentTime + 0.5);
  } catch (e) { /* sin sonido */ }
}
function pararCrono() { if (UI.crono) { clearInterval(UI.crono); UI.crono = null; } }
let avisoT = null;
function avisar(t) { const el = $('#aviso'); el.textContent = t; el.classList.add('ver'); clearTimeout(avisoT); avisoT = setTimeout(() => el.classList.remove('ver'), 2600); }

/* ---------- Navegación ---------- */
const TITULOS = { hoy: 'Mi rodilla', sesion: 'Sesión', progreso: 'Progreso', aprender: 'Aprender', articulo: 'Aprender', ajustes: 'Ajustes', evaluar: 'Avanzar de fase', guiada: 'Sesión', informe: 'Informe', alarma: 'Señales de alarma', bienvenida: 'Mi rodilla' };
const NAV = { hoy: 'hoy', evaluar: 'hoy', alarma: 'hoy', sesion: 'sesion', guiada: 'sesion', progreso: 'progreso', informe: 'progreso', aprender: 'aprender', articulo: 'aprender' };
function ir(destino) { if (location.hash === '#' + destino) pintar(); else location.hash = destino; }
function pintar(mantenerScroll = false) {
  const h = decodeURIComponent(location.hash.replace(/^#/, '')) || 'hoy';
  /* Rutas tipo «progreso-movilidad»: el visor de Claude solo admite #nombre sencillo, sin barras. */
  const guion = h.indexOf('-');
  let r = guion < 0 ? h : h.slice(0, guion);
  const sub = guion < 0 ? undefined : h.slice(guion + 1);
  if (!S.perfil && r !== 'bienvenida') r = 'bienvenida';
  if (!VISTAS[r]) r = 'hoy';
  const y = window.scrollY;
  $('#vista').innerHTML = VISTAS[r](sub);
  $('#titulo').textContent = TITULOS[r] || 'Mi rodilla';
  document.body.classList.toggle('nav-oculta', r === 'guiada' || !S.perfil);
  $$('#nav button').forEach(b => b.classList.toggle('activo', b.dataset.ir === NAV[r]));
  $('.top .icono-btn').hidden = !S.perfil;
  window.scrollTo(0, mantenerScroll ? y : 0);
  if (r === 'bienvenida') actualizarFormPerfil();
  $$('img[data-foto]').forEach(async img => { const u = await urlFoto(img.dataset.foto); if (u) img.src = u; });
}
window.addEventListener('hashchange', () => { pararCrono(); cerrarHoja(); pintar(); });

document.addEventListener('click', async e => {
  if (e.target.id === 'hoja') return cerrarHoja();
  const op = e.target.closest('.opciones button');
  if (op) {
    const g = op.parentElement;
    if (g.dataset.multi) op.classList.toggle('activo'); else $$('button', g).forEach(b => b.classList.toggle('activo', b === op));
    if (g.closest('#vista')) actualizarFormPerfil();
    return;
  }
  const ps = e.target.closest('.paso button');
  if (ps) {
    const box = ps.parentElement, st = +box.dataset.step, v = Math.min(+box.dataset.max, Math.max(+box.dataset.min, +box.dataset.v + st * +ps.dataset.d));
    box.dataset.v = v; $('output', box).textContent = fmt(v, 1); return;
  }
  const irEl = e.target.closest('[data-ir]');
  if (irEl) { e.preventDefault(); ir(irEl.dataset.ir); return; }
  const ac = e.target.closest('[data-accion]');
  if (ac && ACC[ac.dataset.accion]) { e.preventDefault(); await ACC[ac.dataset.accion](ac, e); }
});
document.addEventListener('input', e => { if (e.target.matches('input[type=range][data-salida]')) $('#' + e.target.dataset.salida).textContent = e.target.value; });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#hoja').hidden) cerrarHoja(); });

/* ---------- Arranque ---------- */
if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
pintar();
if (aviso0) avisar(aviso0);
conectarServidor().then(cambiado => { if (cambiado) { pintar(); avisar('Datos cargados del PC'); } });
