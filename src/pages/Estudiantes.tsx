import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { ActividadVista, Alerta, Curso, Estudiante, TextoEnCurso } from '../api/types'
import { AZULES, Avatar, Cargando, ErrorCaja, Pagina, pct, tipoTexto, useDatos } from '../components/ui'

// Pantalla del curso (modo aula) según docs/diseno/mockups/Mock-Estudiantes.html.

function Estrella() {
  return <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.3l-5.8 3 1.1-6.4-4.7-4.6 6.5-.9z" fill="#FFC800" /></svg>
}
function Llama() {
  return <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4 6 6 6 11.5A6 6 0 0 1 6 13.5c0-2.5 1.2-4.2 2.4-5.4 0 2.3 1.2 3.6 2.4 3.6C10.8 8 10 5 12 2z" fill="#FF9600" /></svg>
}

// Tres barras seguidas (idea principal, organización, lenguaje) sin etiquetas, como en el mockup.
function BarrasAvance({ e }: { e: Estudiante }) {
  const v = [pct(e.porcentaje_macro), pct(e.porcentaje_super), pct(e.porcentaje_micro)]
  const colores = [AZULES.macro, AZULES.super, AZULES.micro]
  const t = (x: number | null) => (x == null ? '—' : `${Math.round(x)}%`)
  return (
    <div role="img" aria-label={`Avance: idea principal ${t(v[0])}, organización ${t(v[1])}, lenguaje ${t(v[2])}`} style={{ flex: '2 1 220px', minWidth: 0, display: 'flex', gap: 6 }}>
      {v.map((x, k) => (
        <div key={k} className="barra" style={{ flex: '1 1 0' }}>
          {x != null && <div style={{ width: `${Math.round(x)}%`, background: colores[k] }} />}
        </div>
      ))}
    </div>
  )
}

const pestana = (activa: boolean) => ({
  padding: '10px 16px', borderRadius: 12, textDecoration: 'none', fontWeight: activa ? 900 : 800, fontSize: 15,
  ...(activa
    ? { background: 'var(--cobalto)', color: '#FFFFFF', borderBottom: '4px solid var(--cobalto-borde)' }
    : { color: 'var(--gris)', border: '2px solid var(--borde)', borderBottomWidth: 4 }),
})

function AgregarEstudiante({ cursoId, alTerminar }: { cursoId: string; alTerminar: (nuevo: boolean) => void }) {
  const [nombre, setNombre] = useState('')
  const [grado, setGrado] = useState('')
  const [error, setError] = useState<unknown>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(ev: FormEvent) {
    ev.preventDefault()
    if (!nombre.trim()) { setError(new Error('Escribe el nombre del estudiante.')); return }
    setEnviando(true)
    setError(null)
    try {
      await api.post(`/cursos/${cursoId}/estudiantes`, { nombre: nombre.trim(), grado: grado ? Number(grado) : null })
      alTerminar(true)
    } catch (e) { setError(e) } finally { setEnviando(false) }
  }

  return (
    <form onSubmit={enviar} noValidate className="card aparecer" style={{ padding: 18, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', borderColor: 'var(--celeste-suave)' }}>
      <div style={{ flex: '2 1 240px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label className="etiqueta" htmlFor="nuevo-nombre">Nombre del estudiante</label>
        <input id="nuevo-nombre" className="campo" autoFocus value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej.: Sofía Martínez" maxLength={80} />
      </div>
      <div style={{ flex: '1 1 140px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label className="etiqueta" htmlFor="nuevo-grado">Grado (opcional)</label>
        <select id="nuevo-grado" className="campo" value={grado} onChange={(e) => setGrado(e.target.value)}>
          <option value="">Sin grado</option>
          {[3, 4, 5, 6, 7, 8, 9, 10, 11].map((g) => <option key={g} value={g}>{g}.°</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn btn-sec" onClick={() => alTerminar(false)}>Cancelar</button>
        <button type="submit" className="btn" disabled={enviando}>{enviando ? 'Guardando…' : 'AGREGAR'}</button>
      </div>
      {!!error && <div style={{ flexBasis: '100%' }}><ErrorCaja error={error} /></div>}
    </form>
  )
}

export default function Estudiantes() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const curso = useDatos(() => api.get<Curso>(`/cursos/${id}`), [id])
  const lista = useDatos(() => api.get<Estudiante[]>(`/cursos/${id}/estudiantes`), [id])
  const textos = useDatos(() => api.get<TextoEnCurso[]>(`/cursos/${id}/textos`), [id])
  const alertas = useDatos(() => api.get<Alerta[]>('/alertas?atendida=false'))
  const [elegido, setElegido] = useState<Estudiante | null>(null)
  const [texto, setTexto] = useState<number | null>(null)
  const [abriendo, setAbriendo] = useState(false)
  const [agregando, setAgregando] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const activos = (textos.datos || []).filter((t) => t.activo)
  const conAlerta = new Set((alertas.datos || []).filter((a) => !a.atendida).map((a) => a.estudiante_id))
  const c = curso.datos

  function elegir(e: Estudiante) {
    setElegido(e)
    setError(null)
    if (texto == null && activos.length) setTexto(activos[0].id)
  }

  async function empezar() {
    if (!elegido || !texto) return
    setAbriendo(true)
    setError(null)
    // La pantalla completa se pide en el mismo clic (el navegador solo la permite así).
    document.documentElement.requestFullscreen?.().catch(() => { /* el navegador puede negarla */ })
    try {
      const a = await api.post<ActividadVista>('/actividades', { estudiante_id: elegido.id, texto_id: texto })
      nav(`/actividad/${a.id}`)
    } catch (e) {
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
      setError(e)
    } finally { setAbriendo(false) }
  }

  return (
    <Pagina>
      <nav aria-label="Ruta" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14, color: 'var(--gris)' }}>
        <Link to="/cursos" style={{ textDecoration: 'none' }}>Mis cursos</Link><span aria-hidden="true">›</span><span>{c?.nombre || 'Curso'}</span>
      </nav>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h1 style={{ margin: 0, fontWeight: 900, fontSize: 34 }}>{c?.nombre || 'Curso'}</h1>
          {c && <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--gris)' }}>{c.estudiantes} {c.estudiantes === 1 ? 'estudiante' : 'estudiantes'} · {c.institucion || 'Colegio'} · {c.anio}</span>}
        </div>
        {!agregando && <button type="button" className="btn btn-sec" onClick={() => setAgregando(true)} style={{ minHeight: 48, fontSize: 14 }}>+ AGREGAR ESTUDIANTE</button>}
      </div>
      <nav aria-label="Secciones del curso" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link to={`/cursos/${id}`} aria-current="page" style={pestana(true)}>Estudiantes</Link>
        <Link to="/textos" style={pestana(false)}>Textos activos</Link>
        <Link to={`/cursos/${id}/panel`} style={pestana(false)}>Panel del curso</Link>
      </nav>

      {agregando && <AgregarEstudiante cursoId={id} alTerminar={(nuevo) => { setAgregando(false); if (nuevo) { lista.recargar(); curso.recargar() } }} />}
      {lista.cargando && <Cargando texto="Cargando estudiantes" />}
      <ErrorCaja error={lista.error || curso.error} />
      {lista.datos && lista.datos.length === 0 && <div className="aviso aviso-info">Este curso aún no tiene estudiantes. Agrégalos con el botón «Agregar estudiante».</div>}

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <section aria-label="Lista de estudiantes" style={{ flex: '999 1 560px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!!lista.datos?.length && (
            <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', padding: '0 14px', fontWeight: 800, fontSize: 12, color: 'var(--gris-claro)' }}>
              <span style={{ flex: '1 1 180px', paddingLeft: 58 }}>Estudiante</span>
              <span style={{ flex: '2 1 220px', display: 'flex', gap: 6 }}><span style={{ flex: '1 1 0' }}>Idea principal</span><span style={{ flex: '1 1 0' }}>Organización</span><span style={{ flex: '1 1 0' }}>Lenguaje</span></span>
              <span style={{ width: 260 }}>Puntos · racha</span>
            </div>
          )}
          {lista.datos?.map((e, i) => {
            const sel = elegido?.id === e.id
            const sinActividades = e.porcentaje_macro == null && e.porcentaje_super == null && e.porcentaje_micro == null
            return (
              <div key={e.id} className="aparecer" style={{ animationDelay: `${i * 50}ms`, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', padding: '12px 14px', borderRadius: 18, background: '#FFFFFF', border: `2px solid ${sel ? 'var(--cobalto)' : 'var(--borde)'}` }}>
                <Avatar nombre={e.nombre} i={i} />
                <div style={{ flex: '1 1 180px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <strong style={{ fontWeight: 900, fontSize: 16 }}>{e.nombre}</strong>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {conAlerta.has(e.id) && <span title="Podría necesitar acompañamiento" style={{ padding: '3px 8px', borderRadius: 999, background: 'var(--aviso-fondo)', color: 'var(--aviso-texto)', fontWeight: 800, fontSize: 11.5 }}>Acompañamiento</span>}
                    {sinActividades && <span style={{ padding: '3px 8px', borderRadius: 999, background: 'var(--hielo)', color: 'var(--cobalto-borde)', fontWeight: 800, fontSize: 11.5 }}>Sin actividades aún</span>}
                  </div>
                </div>
                <BarrasAvance e={e} />
                <div style={{ display: 'flex', gap: 14, fontWeight: 900, fontSize: 14 }}>
                  <span title="Puntos" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9A6700' }}><Estrella />{e.puntos}</span>
                  <span title="Racha" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#C25A00' }}><Llama />{e.racha}</span>
                </div>
                <button type="button" className="btn btn-peq" onClick={() => elegir(e)} aria-pressed={sel} style={{ minHeight: 44, letterSpacing: 0.5 }}>ABRIR ACTIVIDAD</button>
              </div>
            )
          })}
        </section>

        {elegido && (
          <aside className="card" aria-label="Abrir actividad" style={{ flex: '1 1 320px', minWidth: 0, alignSelf: 'flex-start', position: 'sticky', top: 16, borderColor: 'var(--celeste-suave)', borderRadius: 22, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, animation: 'entrarLado .28s ease-out both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span className="kicker">Modo aula</span>
              <button type="button" onClick={() => setElegido(null)} aria-label="Cerrar" style={{ width: 36, height: 36, borderRadius: 10, border: 0, background: '#F3F4F6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--gris)' }}>Actividad para</span>
              <strong style={{ fontWeight: 900, fontSize: 24 }}>{elegido.nombre}</strong>
            </div>
            <span style={{ fontWeight: 800, fontSize: 15 }}>Elige el texto</span>
            {textos.cargando && <Cargando texto="Cargando textos" />}
            {!textos.cargando && activos.length === 0 && <div className="aviso aviso-info">Este curso aún no tiene textos activos. Aprueba uno en la <Link to="/textos">Biblioteca</Link> y actívalo para el curso.</div>}
            <div role="radiogroup" aria-label="Texto" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activos.map((t) => {
                const on = texto === t.id
                return (
                  <button key={t.id} type="button" role="radio" aria-checked={on} onClick={() => setTexto(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, cursor: 'pointer', font: 'inherit', color: 'var(--tinta)', background: on ? 'var(--hielo)' : '#FFFFFF', border: `2px solid ${on ? 'var(--cobalto)' : 'var(--borde)'}`, borderBottomWidth: 4 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', border: `3px solid ${on ? 'var(--cobalto)' : '#C9CED6'}`, background: on ? 'var(--celeste)' : '#FFFFFF', flexShrink: 0 }} />
                    <span style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                      <strong style={{ fontWeight: 900, fontSize: 15 }}>{t.titulo}</strong>
                      <span style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--gris)' }}>{tipoTexto(t.tipo)}{t.fuente ? ` · ${t.fuente}` : ''}</span>
                    </span>
                  </button>
                )
              })}
            </div>
            <p style={{ margin: 0, padding: '10px 12px', borderRadius: 12, background: 'var(--hielo)', color: 'var(--cobalto-borde)', fontWeight: 700, fontSize: 13, lineHeight: 1.4 }}>La actividad se abre en pantalla completa y tu panel se oculta mientras el estudiante trabaja.</p>
            <ErrorCaja error={error} />
            <button type="button" className="btn" disabled={!texto || abriendo} onClick={empezar} style={{ minHeight: 52, fontSize: 16 }}>{abriendo ? 'ABRIENDO…' : 'EMPEZAR EN MODO AULA'}</button>
          </aside>
        )}
      </div>
    </Pagina>
  )
}
