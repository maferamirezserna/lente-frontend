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
// Sesión de demo: escribir «admin» como usuario entra como administrador.
function usuarioDemo() {
  let rol = 'profesor'
  try { rol = sessionStorage.getItem('lente-demo-rol') || 'profesor' } catch { /* nada */ }
  return rol === 'administrador'
    ? { id: 99, rol, nombre: 'Administración del colegio', debe_cambiar_clave: false }
    : { id: 1, rol, nombre: 'Prof. Julián Castro', debe_cambiar_clave: false }
}
const claveDemo = () => `lente-${Math.random().toString(36).slice(2, 8)}`
const profesores = [
  { id: 1, nombre: 'Julián Castro', usuario: 'jcastro', activo: true, ultimo_ingreso: iso(0), cursos: 3, estudiantes: 8 },
  { id: 2, nombre: 'Ana María Duque', usuario: 'aduque', activo: true, ultimo_ingreso: iso(2), cursos: 2, estudiantes: 31 },
  { id: 3, nombre: 'Carlos Ibarra', usuario: 'cibarra', activo: true, ultimo_ingreso: iso(5), cursos: 1, estudiantes: 18 },
  { id: 4, nombre: 'Lucía Vargas', usuario: 'lvargas', activo: true, ultimo_ingreso: null, cursos: 1, estudiantes: 27 },
  { id: 5, nombre: 'Pedro Arango', usuario: 'parango', activo: false, ultimo_ingreso: iso(40), cursos: 0, estudiantes: 0 },
]

// Textos activos en cada curso (curso_id → textos).
const activosEnCurso: Record<number, Set<number>> = { 1: new Set([1]), 2: new Set([1]) }

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
  ['POST', /^\/auth\/login$/, (_m, b) => {
    const admin = b?.usuario === 'admin'
    try { sessionStorage.setItem('lente-demo-rol', admin ? 'administrador' : 'profesor') } catch { /* nada */ }
    return { access_token: 'demo', token_type: 'bearer', usuario: usuarioDemo() }
  }],
  ['GET', /^\/auth\/yo$/, () => usuarioDemo()],
  ['GET', /^\/admin\/resumen$/, () => ({
    total_profesores: profesores.length, profesores_activos: profesores.filter((p) => p.activo).length,
    total_estudiantes: estudiantes.length, estudiantes_activos: estudiantes.filter((e) => e.estado === 'activo').length,
  })],
  ['GET', /^\/admin\/profesores$/, () => profesores],
  ['POST', /^\/admin\/profesores$/, (_m, b) => {
    const usuario = b.usuario || b.nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim().split(/\s+/).join('.')
    if (profesores.some((p) => p.usuario === usuario)) throw Object.assign(new Error('Ese usuario ya existe. Escribe otro.'), { status: 409 })
    const p = { id: Math.max(...profesores.map((x) => x.id)) + 1, nombre: b.nombre, usuario, activo: true, ultimo_ingreso: null, cursos: 0, estudiantes: 0 }
    profesores.push(p)
    return { ...p, clave_temporal: claveDemo() }
  }],
  ['PATCH', /^\/admin\/profesores\/(\d+)$/, (m, b) => { const p = profesores.find((x) => x.id === +m[1])!; Object.assign(p, b); return p }],
  ['POST', /^\/admin\/profesores\/(\d+)\/clave$/, () => ({ clave_temporal: claveDemo() })],
  ['GET', /^\/admin\/estudiantes$/, () => estudiantes.map((e) => ({ ...e, profesor_id: 1, profesor: 'Julián Castro' }))],
  ['POST', /^\/auth\/cambiar-clave$/, () => undefined],
  ['GET', /^\/salud$/, () => ({ estado: 'ok' })],
  ['GET', /^\/cursos$/, () => cursos],
  ['GET', /^\/cursos\/(\d+)$/, (m) => cursos.find((c) => c.id === +m[1])],
  ['GET', /^\/estudiantes\/(\d+)$/, (m) => estudiantes.find((e) => e.id === +m[1])],
  ['PATCH', /^\/estudiantes\/(\d+)$/, (m, b) => {
    const e = estudiantes.find((x) => x.id === +m[1])!
    if (b.nombre !== undefined) e.nombre = b.nombre
    if (b.grado !== undefined) { e.grado = b.grado; e.grado_texto = b.grado == null ? 'Sin grado' : `${b.grado}.°` }
    return e
  }],
  ['GET', /^\/estudiantes\/(\d+)\/progreso$/, (m) => {
    const e = estudiantes.find((x) => x.id === +m[1])!
    const hizo = e.porcentaje_macro != null
    return {
      id: e.id, nombre: e.nombre, curso: e.curso, grado_texto: e.grado_texto, nivel_escolar: e.nivel_escolar, puntos: e.puntos, nivel: e.nivel,
      nivel_nombre: e.nivel >= 4 ? 'Analista crítico' : e.nivel >= 2 ? 'Lector atento' : 'Explorador', racha: e.racha, mejor_racha: e.mejor_racha,
      actividades_hechas: hizo ? 4 : 0, actividades_pendientes: 1, preguntas_respondidas: hizo ? 11 : 0, correctas: hizo ? 7 : 0, incorrectas: hizo ? 4 : 0,
      porcentaje_acierto: hizo ? 64 : null, porcentaje_macro: e.porcentaje_macro, porcentaje_super: e.porcentaje_super, porcentaje_micro: e.porcentaje_micro,
      animo: alertas.some((a) => a.estudiante_id === e.id && !a.atendida) ? 'requiere_apoyo' : hizo ? 'motivacion_alta' : null,
      aviso_animo: 'Solo apoyo pedagógico. No es un diagnóstico y no afecta puntos ni calificación.',
      pendientes: [{ texto_id: 1, titulo: 'Miles de jóvenes «invaden» el parque' }],
      logros_catalogo: [
        { nombre: 'Detective de noticias', descripcion: 'Completa tu primera actividad.', regla: 'actividades_terminadas', meta: 1, ganado: hizo, ganado_en: hizo ? iso(10) : null },
        { nombre: 'Racha de 3 días', descripcion: 'Participa tres días seguidos.', regla: 'racha', meta: 3, ganado: e.mejor_racha >= 3, ganado_en: e.mejor_racha >= 3 ? iso(4) : null },
        { nombre: 'Ojo de águila', descripcion: 'Encuentra todas las palabras cargadas.', regla: 'micro_perfecto', meta: 1, ganado: false, ganado_en: null },
        { nombre: 'Llega al nivel 5', descripcion: 'Suma 400 puntos.', regla: 'nivel', meta: 5, ganado: e.nivel >= 5, ganado_en: e.nivel >= 5 ? iso(1) : null },
      ],
      logros: [],
      evolucion: hizo ? [
        { id: 31, titulo: 'Polémica por nuevo horario escolar', numero: 1, estado: 'terminada', resultado_macro: 0.5, resultado_super: 0.5, resultado_micro: 0.4, puntos_ganados: 46, iniciada_en: iso(12), terminada_en: iso(12) },
        { id: 32, titulo: 'Miles de jóvenes «invaden» el parque', numero: 2, estado: 'terminada', resultado_macro: 1, resultado_super: 1, resultado_micro: 0.6, puntos_ganados: 52, iniciada_en: iso(5), terminada_en: iso(5) },
      ] : [],
    }
  }],
  ['GET', /^\/estudiantes\/(\d+)\/historial$/, (m) => {
    const e = estudiantes.find((x) => x.id === +m[1])!
    if (e.porcentaje_macro == null) return []
    return [
      { actividad_id: 32, titulo: 'Miles de jóvenes «invaden» el parque', fecha: iso(5), nivel: 'macro', pregunta: '¿De qué trata la noticia?', respuesta: 'Un festival en el parque dejó ruido y basura y los vecinos se quejaron.', respuesta_esperada: 'Un festival de música en el parque generó quejas de los vecinos por el ruido y la basura.', resultado: 'coincide', es_correcta: true },
      { actividad_id: 32, titulo: 'Miles de jóvenes «invaden» el parque', fecha: iso(5), nivel: 'super', pregunta: '¿Qué aparece primero en la noticia?', respuesta: 'Lo que pasó y la queja de los vecinos', respuesta_esperada: 'Lo que pasó y la queja de los vecinos', resultado: 'correcta', es_correcta: true },
      { actividad_id: 32, titulo: 'Miles de jóvenes «invaden» el parque', fecha: iso(5), nivel: 'micro', pregunta: 'Palabras con carga', respuesta: 'invadieron, indignados, parque', respuesta_esperada: 'invadieron, caos, indignados, insoportable, basurero', resultado: 'en_parte', es_correcta: null },
      { actividad_id: 31, titulo: 'Polémica por nuevo horario escolar', fecha: iso(12), nivel: 'super', pregunta: '¿Quién tiene más espacio en la noticia?', respuesta: 'La Secretaría', respuesta_esperada: 'Los padres de familia', resultado: 'incorrecta', es_correcta: false },
    ]
  }],
  ['GET', /^\/cursos\/(\d+)\/estudiantes$/, (m) => estudiantes.filter((e) => e.curso_id === +m[1])],
  ['POST', /^\/cursos\/(\d+)\/estudiantes$/, (m, b) => {
    const c = cursos.find((x) => x.id === +m[1])!
    const e = est(Math.max(...estudiantes.map((x) => x.id)) + 1, b.nombre, c.id, b.grado ?? 7, [null, null, null], 0, 0)
    if (b.grado == null) Object.assign(e, { grado: null, grado_texto: 'Sin grado' })
    estudiantes.push(e)
    c.estudiantes += 1
    return e
  }],
  ['POST', /^\/cursos$/, (_m, b) => {
    const c: Curso = { id: Math.max(...cursos.map((x) => x.id)) + 1, nombre: b.nombre, institucion: b.institucion ?? null, anio: b.anio ?? new Date().getFullYear(), activo: true, estudiantes: 0 }
    cursos.push(c)
    return c
  }],
  ['GET', /^\/cursos\/(\d+)\/textos$/, (m) => [...(activosEnCurso[+m[1]] || [])].map((id) => textos.find((t) => t.id === id)!).filter(Boolean).map((t) => ({ id: t.id, titulo: t.titulo, tipo: t.tipo, fuente: t.fuente, activo: true, activado_en: iso(2) }))],
  ['POST', /^\/cursos\/(\d+)\/textos$/, (m, b) => { (activosEnCurso[+m[1]] ||= new Set()).add(b.texto_id); return undefined }],
  ['DELETE', /^\/cursos\/(\d+)\/textos\/(\d+)$/, (m) => { activosEnCurso[+m[1]]?.delete(+m[2]); return undefined }],
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
  // En el demo se comporta como si los textos aprobados ya tuvieran actividades de estudiantes
  ['DELETE', /^\/textos\/(\d+)\/definitivo$/, (m) => {
    const i = textos.findIndex((t) => t.id === +m[1])
    if (textos[i]?.estado === 'aprobado') throw Object.assign(new Error('Este texto ya tiene actividades de estudiantes y no se puede borrar sin perder su historial. Archívelo para ocultarlo'), { status: 409 })
    if (i >= 0) textos.splice(i, 1)
    for (const s of Object.values(activosEnCurso)) s.delete(+m[1])
    return undefined
  }],
  ['DELETE', /^\/textos\/(\d+)$/, (m) => { const t = textos.find((x) => x.id === +m[1])!; t.estado = 'archivado'; for (const s of Object.values(activosEnCurso)) s.delete(t.id); return t }],
  ['PATCH', /^\/textos\/(\d+)\/paquete$/, (m, b) => { const t = textos.find((x) => x.id === +m[1])!; Object.assign(t, b); return t }],
  ['POST', /^\/textos\/(\d+)\/aprobar$/, (m) => { const t = textos.find((x) => x.id === +m[1])!; t.estado = 'aprobado'; t.aprobado_en = iso(); return t }],
  ['POST', /^\/textos\/(\d+)\/preparar$/, (m) => { const t = textos.find((x) => x.id === +m[1])!; t.estado = 'preparando'; return t }],
  ['POST', /^\/textos\/(\d+)\/revisar$/, (m) => { const t = textos.find((x) => x.id === +m[1])!; t.estado = 'en_revision'; t.aprobado_en = null; for (const s of Object.values(activosEnCurso)) s.delete(t.id); return t }],
  ['POST', /^\/textos\/(\d+)\/preguntas$/, (m, b) => {
    const t = textos.find((x) => x.id === +m[1])!
    const p = { id: Date.now(), orden: t.preguntas.length + 1, pregunta: b.pregunta, opciones: b.opciones, correcta: b.correcta, dificultad: b.dificultad ?? 1 }
    t.preguntas.push(p)
    return p
  }],
  ['POST', /^\/textos\/(\d+)\/palabras$/, (m, b) => {
    const t = textos.find((x) => x.id === +m[1])!
    const inicio = (t.cuerpo || '').indexOf(b.palabra)
    if (inicio < 0) throw Object.assign(new Error('Esa palabra no aparece en el texto.'), { status: 422 })
    const p = { id: Date.now(), palabra: b.palabra, tipo: b.tipo, inicio, fin: inicio + b.palabra.length, explicacion: null }
    t.palabras.push(p)
    return p
  }],
  ['PATCH', /^\/textos\/(\d+)\/preguntas\/(\d+)$/, (m, b) => {
    const p = textos.find((x) => x.id === +m[1])!.preguntas.find((q) => q.id === +m[2])!
    Object.assign(p, b)
    return p
  }],
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
    if (!a.macro) return { estado_ia: 'sin_respuesta', analizando: false, mensaje: null, veredicto: null, faltantes: null, explicacion: null, cita: null, idea_principal: null }
    const listo = Date.now() - a.macro.en > 4000
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
