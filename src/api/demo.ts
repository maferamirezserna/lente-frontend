// MODO DEMO (npm run demo): datos de ejemplo en el navegador para ver el diseño sin backend ni VPN.
// No reemplaza a la API: las calificaciones reales las hace la base de datos.
import type { ActividadVista, Alerta, Curso, Estudiante, EstadoMacro, Panel, ResultadoActividad, TextoDetalle } from './types'

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms))
const iso = (d = 0) => new Date(Date.now() - d * 86400000).toISOString()

const CUERPO = 'Cientos de jóvenes invadieron el sábado el parque de la Presidenta durante un festival de música que terminó en caos, según denunciaron los vecinos. Los residentes, indignados, aseguraron que el ruido fue insoportable hasta la madrugada y que los asistentes dejaron el lugar convertido en un basurero. Los organizadores afirmaron que el evento contaba con todos los permisos.'
const CUERPO2 = 'La Secretaría de Educación anunció que desde febrero las clases empezarán a las 6:00 a. m. Padres de familia, furiosos, calificaron la medida como un despropósito que obligará a los niños a madrugar de forma absurda. La Secretaría defendió que el cambio permitirá aprovechar mejor la jornada.'

function palabras(cuerpo: string, lista: [string, string][]) {
  return lista.map(([p, tipo], i) => {
    const inicio = cuerpo.indexOf(p)
    return { id: i + 1, palabra: p, tipo, inicio, fin: inicio + p.length, explicacion: null }
  })
}

const cursos: Curso[] = [
  { id: 1, nombre: '7.° A', institucion: 'Colegio de prueba', anio: 2026, activo: true, estudiantes: 6 },
  { id: 2, nombre: '7.° B', institucion: 'Colegio de prueba', anio: 2026, activo: true, estudiantes: 4 },
  { id: 3, nombre: '4.° A', institucion: 'Colegio de prueba', anio: 2026, activo: true, estudiantes: 3 },
]
const est = (id: number, nombre: string, curso_id: number, grado: number, p: [number | null, number | null, number | null], puntos: number, racha: number): Estudiante => ({
  id, nombre, curso_id, curso: cursos.find((c) => c.id === curso_id)!.nombre, grado, grado_texto: `${grado}.°`,
  nivel_escolar: grado <= 5 ? 'primaria' : grado <= 9 ? 'secundaria' : 'media', estado: 'activo', puntos, nivel: Math.floor(puntos / 100) + 1,
  racha, mejor_racha: racha + 2, porcentaje_macro: p[0], porcentaje_super: p[1], porcentaje_micro: p[2],
})
const estudiantes: Estudiante[] = [
  est(1, 'Sofía Martínez', 1, 7, [78, 60, 45], 340, 4), est(2, 'Camilo Restrepo', 1, 7, [52, 40, 33], 120, 0),
  est(3, 'Isabela Torres', 1, 7, [66, 55, 40], 210, 1), est(4, 'Mateo Gómez', 1, 7, [84, 75, 70], 420, 6),
  est(5, 'Valentina Ríos', 1, 7, [70, 68, 58], 300, 3), est(6, 'Samuel Ospina', 1, 7, [null, null, null], 0, 0),
  est(7, 'Lucía Pérez', 2, 7, [60, 50, 40], 150, 2), est(8, 'Tomás Arango', 3, 4, [80, 66, 60], 260, 5),
]
const textos: TextoDetalle[] = [
  {
    id: 1, tipo: 'noticia', titulo: 'Miles de jóvenes «invaden» el parque', fuente: 'El Diario', nota: null, estado: 'aprobado',
    preparado_por_ia: true, aprobado_en: iso(5), creado_en: iso(6), cuerpo: CUERPO, enlace: null,
    idea_principal: 'Un festival de música en el parque generó quejas de los vecinos por el ruido y la basura, aunque los organizadores dicen que tenían permiso.',
    elementos_clave: ['festival en el parque', 'quejas de los vecinos', 'permisos'], consejo_macro: null, consejo_super: null, consejo_micro: null,
    preguntas: [
      { id: 11, orden: 1, pregunta: '¿Qué aparece primero en la noticia?', opciones: ['La opinión de los organizadores', 'Lo que pasó y la queja de los vecinos', 'Una entrevista a la policía'], correcta: 2, dificultad: 1 },
      { id: 12, orden: 2, pregunta: '¿A quién le da más espacio la noticia?', opciones: ['A los vecinos', 'A los jóvenes', 'A la alcaldía'], correcta: 1, dificultad: 1 },
    ],
    palabras: palabras(CUERPO, [['invadieron', 'verbo'], ['caos', 'expresion'], ['indignados', 'adjetivo'], ['insoportable', 'adjetivo'], ['basurero', 'expresion']]),
  },
  {
    id: 2, tipo: 'noticia', titulo: 'Polémica por nuevo horario escolar', fuente: 'La Patria', nota: null, estado: 'en_revision',
    preparado_por_ia: true, aprobado_en: null, creado_en: iso(3), cuerpo: CUERPO2, enlace: null,
    idea_principal: 'La Secretaría de Educación cambió el horario de clases a las 6:00 a. m. y los padres protestan, aunque la Secretaría dice que así se aprovecha mejor la jornada.',
    elementos_clave: [], consejo_macro: null, consejo_super: null, consejo_micro: null,
    preguntas: [
      { id: 21, orden: 1, pregunta: '¿Qué cuenta primero la noticia?', opciones: ['El anuncio de la Secretaría', 'La opinión de los padres', 'La historia del colegio'], correcta: 1, dificultad: 1 },
      { id: 22, orden: 2, pregunta: '¿Quién tiene más espacio en la noticia?', opciones: ['La Secretaría', 'Los padres de familia', 'Los estudiantes'], correcta: 2, dificultad: 1 },
      { id: 23, orden: 3, pregunta: '¿Cómo termina la noticia?', opciones: ['Con una encuesta', 'Con la opinión de un experto', 'Con la respuesta de la Secretaría'], correcta: 3, dificultad: 2 },
    ],
    palabras: palabras(CUERPO2, [['furiosos', 'adjetivo'], ['despropósito', 'expresion'], ['obligará', 'verbo'], ['absurda', 'adjetivo']]),
  },
  {
    id: 3, tipo: 'video', titulo: 'El video viral del perro bombero', fuente: 'Red social', nota: null, estado: 'preparando',
    preparado_por_ia: false, aprobado_en: null, creado_en: iso(1), cuerpo: 'Texto del video.', enlace: null, idea_principal: null,
    elementos_clave: [], consejo_macro: null, consejo_super: null, consejo_micro: null, preguntas: [], palabras: [],
  },
  {
    id: 4, tipo: 'publicacion', titulo: '«Los jóvenes de hoy no leen»', fuente: 'Publicación', nota: null, estado: 'borrador',
    preparado_por_ia: false, aprobado_en: null, creado_en: iso(0), cuerpo: 'Texto de la publicación.', enlace: null, idea_principal: null,
    elementos_clave: [], consejo_macro: null, consejo_super: null, consejo_micro: null, preguntas: [], palabras: [],
  },
]
let alertas: Alerta[] = [
  { id: 1, estudiante_id: 2, estudiante: 'Camilo Restrepo', curso: '7.° A', motivo: 'Respuestas muy cortas y actividades sin terminar, tres veces seguidas.', atendida: false, nota_profesor: null, creada_en: iso(1), atendida_en: null, aviso: '' },
  { id: 2, estudiante_id: 3, estudiante: 'Isabela Torres', curso: '7.° A', motivo: 'Tres actividades seguidas con señales de poco ánimo.', atendida: false, nota_profesor: null, creada_en: iso(2), atendida_en: null, aviso: '' },
]

interface ActDemo { vista: ActividadVista; macro?: { texto: string; en: number }; super?: Record<number, number>; marcas?: { texto: string; inicio: number; fin: number; tipo_palabra?: string | null }[]; resultado?: ResultadoActividad }
const actividades = new Map<number, ActDemo>()
let sigAct = 100

function nuevaActividad(estudiante_id: number, texto_id: number): ActividadVista {
  const e = estudiantes.find((x) => x.id === estudiante_id)!
  const t = textos.find((x) => x.id === texto_id)!
  const id = sigAct++
  const vista: ActividadVista = {
    id, estudiante_id, estudiante: e.nombre, texto_id, titulo: t.titulo, cuerpo: t.cuerpo, fuente: t.fuente, numero: 1,
    estado: 'en_curso', paso: 'macro', grado: e.grado, nivel_escolar: e.nivel_escolar,
    instruccion: e.nivel_escolar === 'primaria' ? '¿De qué trata la noticia? Cuéntalo con tus palabras.' : 'Escribe con tus palabras la idea principal de la noticia.',
    preguntas: [], palabras_esperadas: null, iniciada_en: iso(),
  }
  actividades.set(id, { vista })
  return vista
}

function vistaPaso(a: ActDemo): ActividadVista {
  const t = textos.find((x) => x.id === a.vista.texto_id)!
  const v = { ...a.vista }
  if (v.paso === 'super') {
    v.instruccion = 'Responde cómo está organizada la noticia.'
    v.preguntas = t.preguntas.map(({ correcta: _c, ...p }) => p)
  } else v.preguntas = []
  if (v.paso === 'micro') {
    v.instruccion = 'Marca en la noticia las palabras que muestran una postura.'
    v.palabras_esperadas = v.nivel_escolar === 'primaria' ? t.palabras.length : null
  }
  return v
}

function terminar(a: ActDemo): ResultadoActividad {
  if (a.resultado) return a.resultado
  const t = textos.find((x) => x.id === a.vista.texto_id)!
  const marcadas = a.marcas || []
  const aciertos = t.palabras.filter((p) => marcadas.some((m) => m.inicio === p.inicio))
  const omisiones = t.palabras.filter((p) => !aciertos.includes(p))
  const neutras = marcadas.filter((m) => !t.palabras.some((p) => p.inicio === m.inicio))
  const preg = t.preguntas.map((p) => {
    const elegida = a.super?.[p.id] || 0
    return { orden: p.orden, pregunta: p.pregunta, tu_opcion: p.opciones[elegida - 1] || '—', opcion_correcta: p.opciones[p.correcta - 1], es_correcta: elegida === p.correcta }
  })
  const okSuper = preg.filter((p) => p.es_correcta).length
  const r: ResultadoActividad = {
    actividad_id: a.vista.id, titulo: a.vista.titulo, puntos_ganados: 20 + okSuper * 10 + aciertos.length * 4,
    macro: { resultado: 0.6, logrado: true, tu_respuesta: a.macro?.texto || '', veredicto: 'coincide_en_parte', faltantes: 'Quién se queja: los vecinos.', explicacion: 'Dijiste qué pasó y dónde, pero te faltó decir quién se queja.', cita: 'según denunciaron los vecinos', idea_principal: t.idea_principal },
    super: { resultado: preg.length ? okSuper / preg.length : 0, logrado: okSuper === preg.length, preguntas: preg, explicacion: null },
    micro: {
      resultado: t.palabras.length ? aciertos.length / t.palabras.length : 0, logrado: aciertos.length >= t.palabras.length - 1,
      aciertos: aciertos.map((p) => ({ palabra: p.palabra, tipo: p.tipo, tu_tipo: marcadas.find((m) => m.inicio === p.inicio)?.tipo_palabra ?? null })),
      omisiones: omisiones.map((p) => ({ palabra: p.palabra, tipo: p.tipo })), neutras_marcadas: neutras.map((m) => ({ palabra: m.texto })),
      explicacion: null, tipos_evaluados: 0, tipos_correctos: 0,
    },
    recomendaciones: ['Cambia cada palabra por una neutra: si cambia lo que sientes, está cargada.'],
    logros_nuevos: [{ nombre: 'Detective de noticias', descripcion: 'Terminaste tu primera actividad.' }], instruccion: '',
  }
  a.resultado = r
  a.vista = { ...a.vista, paso: 'resultado', estado: 'terminada' }
  return r
}

type Ruta = [string, RegExp, (m: RegExpMatchArray, body: any) => unknown]
const rutas: Ruta[] = [
  ['POST', /^\/auth\/login$/, (_m, b) => ({ access_token: 'demo', token_type: 'bearer', usuario: { id: 1, rol: b?.usuario === 'admin' ? 'administrador' : 'profesor', nombre: 'Prof. Julián Castro', debe_cambiar_clave: false } })],
  ['GET', /^\/auth\/yo$/, () => ({ id: 1, rol: 'profesor', nombre: 'Prof. Julián Castro', debe_cambiar_clave: false })],
  ['POST', /^\/auth\/cambiar-clave$/, () => undefined],
  ['GET', /^\/salud$/, () => ({ estado: 'ok' })],
  ['GET', /^\/cursos$/, () => cursos],
  ['GET', /^\/cursos\/(\d+)$/, (m) => cursos.find((c) => c.id === +m[1])],
  ['GET', /^\/cursos\/(\d+)\/estudiantes$/, (m) => estudiantes.filter((e) => e.curso_id === +m[1])],
  ['GET', /^\/cursos\/(\d+)\/textos$/, () => textos.filter((t) => t.estado === 'aprobado').map((t) => ({ id: t.id, titulo: t.titulo, tipo: t.tipo, fuente: t.fuente, activo: true, activado_en: iso(2) }))],
  ['GET', /^\/cursos\/(\d+)\/panel$/, (m): Panel => {
    const c = cursos.find((x) => x.id === +m[1])!
    return { curso_id: c.id, curso: c.nombre, estudiantes_activos: 6, participaron: 5, acierto_promedio: 64, puntos_del_curso: 1390, racha_mas_larga: 6,
      clima: { motivacion_alta: 3, neutral: 1, requiere_apoyo: 2 }, aviso_clima: 'Solo apoyo pedagógico. No es un diagnóstico y no afecta puntos ni calificación.',
      alertas_abiertas: alertas.filter((a) => !a.atendida).length, avance_macro: 71, avance_super: 62, avance_micro: 55,
      destacados: [{ id: 4, nombre: 'Mateo Gómez', puntos: 420, nivel: 5, racha: 6 }] }
  }],
  ['GET', /^\/alertas/, () => alertas.filter((a) => !a.atendida)],
  ['POST', /^\/alertas\/(\d+)\/atender$/, (m) => { alertas = alertas.map((a) => (a.id === +m[1] ? { ...a, atendida: true } : a)); return undefined }],
  ['GET', /^\/textos$/, () => textos.map(({ cuerpo: _c, enlace: _e, preguntas: _p, palabras: _w, idea_principal: _i, elementos_clave: _k, consejo_macro: _a, consejo_super: _b, consejo_micro: _d, ...r }) => r)],
  ['POST', /^\/textos$/, (_m, b) => {
    const t: TextoDetalle = { id: textos.length + 10, tipo: b.tipo || 'noticia', titulo: b.titulo, fuente: b.fuente || null, nota: null, estado: b.preparar_con_ia ? 'preparando' : 'borrador',
      preparado_por_ia: false, aprobado_en: null, creado_en: iso(), cuerpo: b.cuerpo || null, enlace: b.enlace || null, idea_principal: null, elementos_clave: [],
      consejo_macro: null, consejo_super: null, consejo_micro: null, preguntas: [], palabras: [] }
    textos.unshift(t)
    return t
  }],
  ['GET', /^\/textos\/(\d+)$/, (m) => textos.find((t) => t.id === +m[1])],
  ['PATCH', /^\/textos\/(\d+)\/paquete$/, (m, b) => { const t = textos.find((x) => x.id === +m[1])!; Object.assign(t, b); return t }],
  ['POST', /^\/textos\/(\d+)\/aprobar$/, (m) => { const t = textos.find((x) => x.id === +m[1])!; t.estado = 'aprobado'; t.aprobado_en = iso(); return t }],
  ['POST', /^\/textos\/(\d+)\/preparar$/, (m) => { const t = textos.find((x) => x.id === +m[1])!; t.estado = 'preparando'; return t }],
  ['DELETE', /^\/textos\/(\d+)\/preguntas\/(\d+)$/, (m) => { const t = textos.find((x) => x.id === +m[1])!; t.preguntas = t.preguntas.filter((p) => p.id !== +m[2]); return undefined }],
  ['DELETE', /^\/textos\/(\d+)\/palabras\/(\d+)$/, (m) => { const t = textos.find((x) => x.id === +m[1])!; t.palabras = t.palabras.filter((p) => p.id !== +m[2]); return undefined }],
  ['POST', /^\/actividades$/, (_m, b) => nuevaActividad(b.estudiante_id, b.texto_id)],
  ['GET', /^\/actividades\/(\d+)$/, (m) => vistaPaso(actividades.get(+m[1])!)],
  ['POST', /^\/actividades\/(\d+)\/macro$/, (m, b): EstadoMacro => {
    const a = actividades.get(+m[1])!
    a.macro = { texto: b.texto, en: Date.now() }
    return { estado_ia: 'pendiente', analizando: true, mensaje: null, veredicto: null, faltantes: null, explicacion: null, cita: null, idea_principal: null }
  }],
  ['GET', /^\/actividades\/(\d+)\/macro$/, (m): EstadoMacro => {
    const a = actividades.get(+m[1])!
    const listo = a.macro && Date.now() - a.macro.en > 4000
    if (!listo) return { estado_ia: 'procesando', analizando: true, mensaje: null, veredicto: null, faltantes: null, explicacion: null, cita: null, idea_principal: null }
    if (a.vista.paso === 'macro') a.vista = { ...a.vista, paso: 'super' }
    const t = textos.find((x) => x.id === a.vista.texto_id)!
    return { estado_ia: 'listo', analizando: false, mensaje: null, veredicto: 'coincide_en_parte', faltantes: 'Quién se queja: los vecinos.',
      explicacion: 'Dijiste qué pasó y dónde, pero te faltó decir quién se queja. La noticia lo cuenta desde los vecinos.', cita: 'según denunciaron los vecinos', idea_principal: t.idea_principal }
  }],
  ['POST', /^\/actividades\/(\d+)\/super$/, (m, b) => {
    const a = actividades.get(+m[1])!
    const t = textos.find((x) => x.id === a.vista.texto_id)!
    a.super = Object.fromEntries(b.respuestas.map((r: { pregunta_id: number; opcion_elegida: number }) => [r.pregunta_id, r.opcion_elegida]))
    a.vista = { ...a.vista, paso: 'micro' }
    return { paso: 'micro', faltan: 0, consejo: null, resultados: t.preguntas.map((p) => ({ pregunta_id: p.id, es_correcta: a.super![p.id] === p.correcta, correcta: p.correcta, opcion_correcta: p.opciones[p.correcta - 1] })) }
  }],
  ['POST', /^\/actividades\/(\d+)\/micro$/, (m, b) => { const a = actividades.get(+m[1])!; a.marcas = b.marcas; return { recibidas: b.marcas.length, paso: 'micro' } }],
  ['POST', /^\/actividades\/(\d+)\/terminar$/, (m) => terminar(actividades.get(+m[1])!)],
  ['GET', /^\/actividades\/(\d+)\/resultado$/, (m) => terminar(actividades.get(+m[1])!)],
]

export async function demoRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  await espera(250)
  const limpio = path.split('?')[0]
  for (const [met, re, fn] of rutas) {
    const m = limpio.match(re)
    if (met === method && m) return fn(m, body) as T
  }
  throw Object.assign(new Error('Esta acción no está disponible en el modo demo.'), { status: 404 })
}
