// Tipos tomados de los esquemas del backend (mvega09/lente, app/schemas).
// Si la API cambia, actualizar aquí revisando /openapi.json.

export type Rol = 'administrador' | 'profesor'

export interface UsuarioSesion { id: number; rol: Rol | string; nombre: string; debe_cambiar_clave: boolean }
export interface TokenSalida { access_token: string; token_type: string; usuario: UsuarioSesion }

export interface Curso { id: number; nombre: string; institucion: string | null; anio: number; activo: boolean; estudiantes: number }

export interface Estudiante {
  id: number; nombre: string; curso_id: number; curso: string; grado: number | null; grado_texto: string
  nivel_escolar: string; estado: string; puntos: number; nivel: number; racha: number; mejor_racha: number
  porcentaje_macro: number | null; porcentaje_super: number | null; porcentaje_micro: number | null
}

export type EstadoTexto = 'borrador' | 'preparando' | 'en_revision' | 'aprobado' | 'archivado'
export interface TextoResumen {
  id: number; tipo: string; titulo: string; fuente: string | null; nota: string | null; estado: EstadoTexto | string
  preparado_por_ia: boolean; aprobado_en: string | null; creado_en: string
}
export interface Pregunta { id: number; orden: number; pregunta: string; opciones: string[]; correcta: number; dificultad: number }
export interface Palabra { id: number; palabra: string; tipo: string; inicio: number; fin: number; explicacion: string | null }
export interface TextoDetalle extends TextoResumen {
  cuerpo: string | null; enlace: string | null; idea_principal: string | null; elementos_clave: string[]
  consejo_macro: string | null; consejo_super: string | null; consejo_micro: string | null
  preguntas: Pregunta[]; palabras: Palabra[]
}
export interface TextoEnCurso { id: number; titulo: string; tipo: string; fuente: string | null; activo: boolean; activado_en: string }

export type Paso = 'macro' | 'super' | 'micro' | 'resultado'
export interface PreguntaActividad { id: number; orden: number; pregunta: string; opciones: string[]; dificultad: number }
export interface ActividadVista {
  id: number; estudiante_id: number; estudiante: string; texto_id: number; titulo: string; cuerpo: string | null
  fuente: string | null; numero: number; estado: string; paso: Paso | string; grado: number | null; nivel_escolar: string
  instruccion: string; preguntas: PreguntaActividad[]; palabras_esperadas: number | null; iniciada_en: string
}
export interface EstadoMacro {
  estado_ia: string; analizando: boolean; mensaje: string | null; veredicto: string | null; faltantes: string | null
  explicacion: string | null; cita: string | null; idea_principal: string | null
}
export interface ResultadoPregunta { pregunta_id: number; es_correcta: boolean; correcta: number; opcion_correcta: string }
export interface EstadoSuper { paso: string; resultados: ResultadoPregunta[]; faltan: number; consejo: string | null }
export type TipoPalabra = 'adjetivo' | 'verbo' | 'expresion'
export interface PalabraResultado { palabra: string; tipo?: string | null; explicacion?: string | null; tu_tipo?: string | null; tipo_correcto?: boolean | null }
export interface ResultadoActividad {
  actividad_id: number; titulo: string; puntos_ganados: number
  macro: { resultado: number; logrado: boolean; tu_respuesta: string; veredicto: string | null; faltantes: string | null; explicacion: string | null; cita: string | null; idea_principal: string | null }
  super: { resultado: number; logrado: boolean; preguntas: { orden: number; pregunta: string; tu_opcion: string; opcion_correcta: string; es_correcta: boolean }[]; explicacion: string | null }
  micro: { resultado: number; logrado: boolean; aciertos: PalabraResultado[]; omisiones: PalabraResultado[]; neutras_marcadas: PalabraResultado[]; explicacion: string | null; tipos_evaluados: number; tipos_correctos: number }
  recomendaciones: string[]; logros_nuevos: { nombre: string; descripcion: string }[]; instruccion: string
}

export interface Panel {
  curso_id: number; curso: string; estudiantes_activos: number; participaron: number; acierto_promedio: number | null
  puntos_del_curso: number; racha_mas_larga: number; clima: Record<string, number>; aviso_clima: string
  alertas_abiertas: number; avance_macro: number | null; avance_super: number | null; avance_micro: number | null
  destacados: { id: number; nombre: string; puntos: number; nivel: number; racha: number }[]
}
// Administración (app/schemas/admin.py)
export interface ResumenAdmin { total_profesores: number; profesores_activos: number; total_estudiantes: number; estudiantes_activos: number }
export interface Profesor { id: number; nombre: string; usuario: string; activo: boolean; ultimo_ingreso: string | null; cursos: number; estudiantes: number }
export interface ProfesorCreado extends Profesor { clave_temporal: string | null }
export interface ClaveGenerada { clave_temporal: string | null }
export interface EstudianteAdmin extends Estudiante { profesor_id: number; profesor: string }

export interface Alerta {
  id: number; estudiante_id: number; estudiante: string; curso: string; motivo: string; atendida: boolean
  nota_profesor: string | null; creada_en: string; atendida_en: string | null; aviso: string
}
