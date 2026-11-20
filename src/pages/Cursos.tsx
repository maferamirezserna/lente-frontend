import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Curso, Panel, TextoEnCurso, TextoResumen } from '../api/types'
import { AZULES, Barra, Cargando, ErrorCaja, Pagina, neon, pct, useDatos } from '../components/ui'

// Pantalla «Mis cursos» según docs/diseno/mockups/Mock-Cursos.html.
// Solo muestra datos que entrega la API: GET /cursos, GET /textos y, por curso,
// GET /cursos/{id}/panel y GET /cursos/{id}/textos.

function saludo() {
  const h = new Date().getHours()
  return h < 12 ? 'Buenos días, profe' : h < 19 ? 'Buenas tardes, profe' : 'Buenas noches, profe'
}

// «7.° A» → «7°». Si el nombre no trae grado, se usan sus iniciales.
function insignia(nombre: string) {
  const g = nombre.match(/\d+/)?.[0]
  return g ? `${g}°` : nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
}

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`

function ResumenTextos() {
  const { datos } = useDatos(() => api.get<TextoResumen[]>('/textos'))
  if (!datos) return null
  const aprobados = datos.filter((t) => t.estado === 'aprobado').length
  const enRevision = datos.filter((t) => t.estado === 'en_revision').length
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 14, background: '#FFFFFF', border: '2px solid var(--borde)', fontWeight: 800, fontSize: 14 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cobalto)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z" /></svg>
        {plural(aprobados, 'texto aprobado', 'textos aprobados')}
      </span>
      {enRevision > 0 && (
        <Link to="/textos" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 14, background: 'var(--aviso-fondo)', border: '2px solid #FFD9A8', color: 'var(--aviso-texto)', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
          {plural(enRevision, 'texto en revisión', 'textos en revisión')}
        </Link>
      )}
    </div>
  )
}

function TarjetaCurso({ curso, i }: { curso: Curso; i: number }) {
  const color = neon(i)
  const panel = useDatos(() => api.get<Panel>(`/cursos/${curso.id}/panel`), [curso.id])
  const textos = useDatos(() => api.get<TextoEnCurso[]>(`/cursos/${curso.id}/textos`), [curso.id])
  const activos = textos.datos?.filter((t) => t.activo).length
  const alertas = panel.datos?.alertas_abiertas ?? 0

  return (
    <article className="card tarjeta-curso aparecer" style={{ flex: '1 1 260px', minWidth: 0, borderRadius: 22, padding: '0 0 18px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 14, animationDelay: `${i * 80}ms` }}>
      <div style={{ height: 10, background: color.fondo }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px' }}>
        <div aria-hidden="true" style={{ width: 54, height: 54, borderRadius: 16, background: color.fondo, borderBottom: `4px solid ${color.borde}`, color: color.texto, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, flexShrink: 0 }}>{insignia(curso.nombre)}</div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <strong style={{ fontWeight: 900, fontSize: 20 }}>{curso.nombre}</strong>
          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--gris)' }}>{curso.institucion || 'Colegio'} · {curso.anio}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '0 18px' }}>
        <span style={{ padding: '5px 10px', borderRadius: 10, background: color.fondo, color: color.texto, fontWeight: 900, fontSize: 12.5 }}>{plural(curso.estudiantes, 'estudiante', 'estudiantes')}</span>
        {activos != null && <span style={{ padding: '5px 10px', borderRadius: 10, border: '2px solid var(--borde)', fontWeight: 800, fontSize: 12.5 }}>{plural(activos, 'texto activo', 'textos activos')}</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: '0 18px' }}>
        <Barra etiqueta="Idea principal" valor={pct(panel.datos?.avance_macro)} color={AZULES.macro} />
        <Barra etiqueta="Organización" valor={pct(panel.datos?.avance_super)} color={AZULES.super} />
        <Barra etiqueta="Lenguaje" valor={pct(panel.datos?.avance_micro)} color={AZULES.micro} />
      </div>
      {panel.datos && (
        <div style={{ padding: '0 18px' }}>
          {alertas > 0 ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 12, background: 'var(--aviso-fondo)', color: 'var(--aviso-texto)', fontWeight: 800, fontSize: 12.5 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C26A00" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M12 8v5M12 16.5v.5" /><circle cx="12" cy="12" r="9" /></svg>
              {alertas === 1 ? '1 estudiante podría necesitar acompañamiento' : `${alertas} estudiantes podrían necesitar acompañamiento`}
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: 12, background: 'var(--hielo)', color: 'var(--cobalto-borde)', fontWeight: 800, fontSize: 12.5 }}>Sin alertas por ahora</span>
          )}
        </div>
      )}
      <Link to={`/cursos/${curso.id}`} className="btn" style={{ margin: 'auto 18px 0', borderRadius: 14 }} aria-label={`Abrir curso ${curso.nombre}`}>ABRIR CURSO</Link>
    </article>
  )
}

// Tarjeta punteada «Crear un curso» del mockup. Al tocarla se vuelve un formulario corto
// (POST /cursos: nombre obligatorio; colegio y año opcionales, vacío = año actual).
function CrearCurso({ alCrear }: { alCrear: () => void }) {
  const [abierto, setAbierto] = useState(false)
  const [nombre, setNombre] = useState('')
  const [institucion, setInstitucion] = useState('')
  const [anio, setAnio] = useState('')
  const [error, setError] = useState<unknown>(null)
  const [enviando, setEnviando] = useState(false)

  function cerrar() { setAbierto(false); setNombre(''); setInstitucion(''); setAnio(''); setError(null) }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!nombre.trim()) { setError(new Error('Escribe el nombre del curso, por ejemplo «7.° A».')); return }
    const a = anio.trim() ? Number(anio) : null
    if (a != null && (!Number.isInteger(a) || a < 2020 || a > 2100)) { setError(new Error('El año debe estar entre 2020 y 2100.')); return }
    setEnviando(true)
    try {
      await api.post<Curso>('/cursos', { nombre: nombre.trim(), institucion: institucion.trim() || null, anio: a })
      cerrar()
      alCrear()
    } catch (err) { setError(err) } finally { setEnviando(false) }
  }

  if (!abierto) {
    return (
      <button type="button" className="tarjeta-curso" onClick={() => setAbierto(true)} style={{ flex: '1 1 260px', minWidth: 0, minHeight: 300, borderRadius: 22, border: '3px dashed var(--celeste-suave)', background: '#F7F9FF', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, font: 'inherit', color: 'var(--cobalto-borde)' }}>
        <span style={{ width: 56, height: 56, borderRadius: '50%', background: '#FFFFFF', border: '2px solid var(--celeste-suave)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2F5BEA" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        </span>
        <span style={{ fontWeight: 900, fontSize: 17 }}>Crear un curso</span>
        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--gris)' }}>Nombre, colegio y año</span>
      </button>
    )
  }

  return (
    <form onSubmit={enviar} noValidate className="card aparecer" style={{ flex: '1 1 260px', minWidth: 0, minHeight: 300, borderRadius: 22, borderColor: 'var(--celeste-suave)', padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <strong style={{ fontWeight: 900, fontSize: 18 }}>Nuevo curso</strong>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label className="etiqueta" htmlFor="cnombre">Nombre del curso</label>
        <input id="cnombre" className="campo" autoFocus maxLength={80} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej.: 7.° A" style={{ minHeight: 46, padding: '10px 14px', fontSize: 16 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label className="etiqueta" htmlFor="ccolegio">Colegio (opcional)</label>
        <input id="ccolegio" className="campo" maxLength={120} value={institucion} onChange={(e) => setInstitucion(e.target.value)} placeholder="Ej.: Colegio San José" style={{ minHeight: 46, padding: '10px 14px', fontSize: 16 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label className="etiqueta" htmlFor="canio">Año (opcional)</label>
        <input id="canio" className="campo" inputMode="numeric" maxLength={4} value={anio} onChange={(e) => setAnio(e.target.value.replace(/\D/g, ''))} placeholder="Si lo dejas vacío, es este año" style={{ minHeight: 46, padding: '10px 14px', fontSize: 16 }} />
      </div>
      <ErrorCaja error={error} />
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <button type="button" className="btn btn-sec btn-peq" onClick={cerrar} style={{ flex: 1 }}>Cancelar</button>
        <button type="submit" className="btn btn-peq" disabled={enviando} style={{ flex: 1 }}>{enviando ? 'CREANDO…' : 'CREAR CURSO'}</button>
      </div>
    </form>
  )
}

export default function Cursos() {
  const { datos, error, cargando, recargar } = useDatos(() => api.get<Curso[]>('/cursos'))

  return (
    <Pagina>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--cobalto)' }}>{saludo()}</span>
          <h1 style={{ margin: 0, fontWeight: 900, fontSize: 36 }}>Mis cursos</h1>
        </div>
        <ResumenTextos />
      </div>
      {cargando && <Cargando texto="Cargando tus cursos" />}
      <ErrorCaja error={error} />
      {datos && datos.length === 0 && <div className="aviso aviso-info">Aún no tienes cursos. Crea el primero con «Crear un curso» y después agrega a tus estudiantes.</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
        {datos?.map((c, i) => <TarjetaCurso key={c.id} curso={c} i={i} />)}
        {datos && <CrearCurso alCrear={recargar} />}
      </div>
    </Pagina>
  )
}
