import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { ActividadVista, Curso, Estudiante, TextoEnCurso } from '../api/types'
import { AZULES, Avatar, Barra, Cargando, ErrorCaja, Pagina, pct, useDatos } from '../components/ui'

export default function Estudiantes() {
  const { id } = useParams()
  const nav = useNavigate()
  const curso = useDatos(() => api.get<Curso>(`/cursos/${id}`), [id])
  const lista = useDatos(() => api.get<Estudiante[]>(`/cursos/${id}/estudiantes`), [id])
  const textos = useDatos(() => api.get<TextoEnCurso[]>(`/cursos/${id}/textos`), [id])
  const [elegido, setElegido] = useState<Estudiante | null>(null)
  const [texto, setTexto] = useState<number | null>(null)
  const [abriendo, setAbriendo] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [busca, setBusca] = useState('')

  const activos = (textos.datos || []).filter((t) => t.activo)
  const visibles = (lista.datos || []).filter((e) => e.nombre.toLowerCase().includes(busca.toLowerCase()))

  async function abrir() {
    if (!elegido || !texto) return
    setAbriendo(true)
    setError(null)
    try {
      const a = await api.post<ActividadVista>('/actividades', { estudiante_id: elegido.id, texto_id: texto })
      try { await document.documentElement.requestFullscreen?.() } catch { /* el navegador puede negarlo */ }
      nav(`/actividad/${a.id}`)
    } catch (e) { setError(e) } finally { setAbriendo(false) }
  }

  return (
    <Pagina>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <Link to="/cursos" style={{ fontWeight: 800, textDecoration: 'none' }}>← Mis cursos</Link>
          <h1 className="titulo" style={{ marginTop: 6 }}>{curso.datos?.nombre || 'Curso'}</h1>
          <p className="sub" style={{ marginTop: 6 }}>Toca a un estudiante para abrirle una actividad en este dispositivo.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input className="campo" style={{ width: 240, minHeight: 46 }} placeholder="Buscar estudiante" aria-label="Buscar estudiante" value={busca} onChange={(e) => setBusca(e.target.value)} />
          <Link to={`/cursos/${id}/panel`} className="btn btn-sec">Panel del curso</Link>
        </div>
      </div>
      {lista.cargando && <Cargando texto="Cargando estudiantes" />}
      <ErrorCaja error={lista.error || curso.error} />

      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '3 1 560px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 14 }}>
          {visibles.map((e, i) => {
            const sel = elegido?.id === e.id
            return (
              <button key={e.id} type="button" onClick={() => setElegido(e)} className="card aparecer" aria-pressed={sel}
                style={{ textAlign: 'left', padding: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12, font: 'inherit', color: 'inherit', borderColor: sel ? 'var(--cobalto)' : undefined, background: sel ? 'var(--hielo)' : '#fff', animationDelay: `${i * 30}ms` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar nombre={e.nombre} i={e.id} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>{e.nombre}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--gris)' }}>Nivel {e.nivel} · {e.puntos} pts{e.racha > 0 ? ` · 🔥 ${e.racha}` : ''}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Barra etiqueta="Idea principal" valor={pct(e.porcentaje_macro)} color={AZULES.macro} />
                  <Barra etiqueta="Organización" valor={pct(e.porcentaje_super)} color={AZULES.super} />
                  <Barra etiqueta="Palabras" valor={pct(e.porcentaje_micro)} color={AZULES.micro} />
                </div>
              </button>
            )
          })}
        </div>

        <aside className="card" aria-label="Modo aula" style={{ flex: '1 1 300px', position: 'sticky', top: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="kicker">Modo aula</div>
          {!elegido ? (
            <p className="sub">Elige un estudiante de la lista para abrirle una actividad.</p>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar nombre={elegido.nombre} i={elegido.id} size={52} />
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>{elegido.nombre}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--gris)' }}>{elegido.grado_texto} · {elegido.nivel_escolar}</div>
                </div>
              </div>
              <div style={{ fontWeight: 800 }}>¿Qué texto va a leer?</div>
              {textos.cargando && <Cargando texto="Cargando textos" />}
              {!textos.cargando && activos.length === 0 && <div className="aviso aviso-info">Este curso aún no tiene textos activos. Aprueba uno en la <Link to="/textos">Biblioteca</Link> y actívalo para el curso.</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activos.map((t) => (
                  <label key={t.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', borderRadius: 14, cursor: 'pointer', border: `2px solid ${texto === t.id ? 'var(--cobalto)' : 'var(--borde)'}`, background: texto === t.id ? 'var(--hielo)' : '#fff', fontWeight: 800 }}>
                    <input type="radio" name="texto" checked={texto === t.id} onChange={() => setTexto(t.id)} />
                    <span>{t.titulo}<br /><small style={{ fontWeight: 700, color: 'var(--gris)' }}>{t.fuente || t.tipo}</small></span>
                  </label>
                ))}
              </div>
              <ErrorCaja error={error} />
              <button className="btn" disabled={!texto || abriendo} onClick={abrir}>{abriendo ? 'Abriendo…' : 'ABRIR ACTIVIDAD'}</button>
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: 'var(--gris)' }}>Se abre en pantalla completa. Al terminar, el estudiante entrega el dispositivo de vuelta.</p>
            </>
          )}
        </aside>
      </div>
    </Pagina>
  )
}
