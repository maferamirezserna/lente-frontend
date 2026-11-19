import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Alerta, Panel as PanelT } from '../api/types'
import { AZULES, Avatar, Barra, Cargando, ErrorCaja, Pagina, PestanasCurso, pct, useDatos } from '../components/ui'

// Panel del curso según docs/diseno/mockups/Mock-Panel.html.

// Etiquetas exactas de la guía del backend. Nunca usar palabras clínicas.
const CLIMA = [
  { clave: 'motivacion_alta', nombre: 'Motivación alta', color: '#2F5BEA', borde: '#2F5BEA' },
  { clave: 'neutral', nombre: 'Neutral', color: '#C9DBFF', borde: '#9CC3FF' },
  { clave: 'requiere_apoyo', nombre: 'Podría necesitar acompañamiento', color: '#FF8A3D', borde: '#FF8A3D' },
]
const AVISO = 'Solo apoyo pedagógico. No es un diagnóstico y no afecta puntos ni calificación.'

function insignia(nombre: string) {
  const g = nombre.match(/\d+/)?.[0]
  return g ? `${g}°` : nombre.slice(0, 2).toUpperCase()
}

function Dato({ fondo, trazo, d, valor, etiqueta }: { fondo: string; trazo: string; d: string; valor: ReactNode; etiqueta: string }) {
  return (
    <div className="card" style={{ flex: '1 1 220px', minWidth: 0, borderRadius: 22, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: fondo, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={trazo} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 900, fontSize: 28, lineHeight: 1.1 }}>{valor}</span>
        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--gris)' }}>{etiqueta}</span>
      </div>
    </div>
  )
}

const tarjeta = { flex: '1 1 360px', minWidth: 0, borderRadius: 22, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 } as const

export default function Panel() {
  const { id = '' } = useParams()
  const p = useDatos(() => api.get<PanelT>(`/cursos/${id}/panel`), [id])
  const alertas = useDatos(() => api.get<Alerta[]>('/alertas?atendida=false'), [])
  const [error, setError] = useState<unknown>(null)
  const [atendiendo, setAtendiendo] = useState<number | null>(null)

  async function atender(a: Alerta) {
    setError(null)
    setAtendiendo(a.id)
    try { await api.post(`/alertas/${a.id}/atender`, { nota_profesor: null }); alertas.recargar(); p.recargar() } catch (e) { setError(e) } finally { setAtendiendo(null) }
  }

  const d = p.datos
  const delCurso = (alertas.datos || []).filter((a) => !a.atendida && (!d || a.curso === d.curso))

  // Consejo según el nivel con menor avance que entrega la API.
  const niveles = d ? [
    { n: 'Idea principal', v: pct(d.avance_macro), consejo: 'vale la pena repasar cómo encontrar la idea principal en la próxima clase.' },
    { n: 'Organización', v: pct(d.avance_super), consejo: 'vale la pena repasar cómo está organizada una noticia en la próxima clase.' },
    { n: 'Lenguaje', v: pct(d.avance_micro), consejo: 'vale la pena repasar las palabras cargadas en la próxima clase.' },
  ].filter((x) => x.v != null) : []
  const masBajo = niveles.length > 1 ? niveles.reduce((a, b) => ((b.v as number) < (a.v as number) ? b : a)) : null

  return (
    <Pagina>
      <nav aria-label="Ruta" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14, color: 'var(--gris)' }}>
        <Link to="/cursos" style={{ textDecoration: 'none' }}>Mis cursos</Link><span aria-hidden="true">›</span>
        <Link to={`/cursos/${id}`} style={{ textDecoration: 'none' }}>{d?.curso || 'Curso'}</Link><span aria-hidden="true">›</span>
        <span>Panel del curso</span>
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div aria-hidden="true" style={{ width: 54, height: 54, borderRadius: 16, background: 'var(--cobalto)', borderBottom: '4px solid var(--cobalto-borde)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18 }}>{d ? insignia(d.curso) : ''}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ margin: 0, fontWeight: 900, fontSize: 32 }}>Panel de {d?.curso || 'curso'}</h1>
          {d && <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--gris)' }}>{d.estudiantes_activos} {d.estudiantes_activos === 1 ? 'estudiante activo' : 'estudiantes activos'} · {d.participaron} ya {d.participaron === 1 ? 'participó' : 'participaron'}</span>}
        </div>
      </div>
      <PestanasCurso id={id} actual="panel" />

      {p.cargando && <Cargando texto="Cargando el panel" />}
      <ErrorCaja error={p.error || error} />
      {d && (
        <>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Dato fondo="#2F6BFF" trazo="#FFFFFF" d="M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" valor={`${d.participaron}/${d.estudiantes_activos}`} etiqueta="Participación" />
            <Dato fondo="#2BEA7C" trazo="#111111" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" valor={d.acierto_promedio == null ? '—' : `${Math.round(pct(d.acierto_promedio)!)}%`} etiqueta="Acierto promedio" />
            <Dato fondo="#FFE600" trazo="#111111" d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" valor={d.puntos_del_curso.toLocaleString('es-CO')} etiqueta="Puntos del curso" />
            <Dato fondo="#FF7A00" trazo="#111111" d="M12 3c1 4 5 6 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-8.5z" valor={`${d.racha_mas_larga} ${d.racha_mas_larga === 1 ? 'día' : 'días'}`} etiqueta="Racha más larga" />
          </div>

          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'stretch' }}>
            <section className="card" style={{ ...tarjeta, gap: 16 }}>
              <h2 style={{ margin: 0, fontWeight: 900, fontSize: 21 }}>Avance por nivel</h2>
              <Barra etiqueta="Idea principal" valor={pct(d.avance_macro)} color={AZULES.macro} />
              <Barra etiqueta="Organización" valor={pct(d.avance_super)} color={AZULES.super} />
              <Barra etiqueta="Lenguaje" valor={pct(d.avance_micro)} color={AZULES.micro} />
              {masBajo && <p style={{ margin: 0, padding: '10px 12px', borderRadius: 12, background: 'var(--hielo)', color: 'var(--cobalto-borde)', fontWeight: 700, fontSize: 13.5, lineHeight: 1.4 }}>{masBajo.n} es el nivel más bajo: {masBajo.consejo}</p>}
            </section>
            <section className="card" style={tarjeta}>
              <h2 style={{ margin: 0, fontWeight: 900, fontSize: 21 }}>Ánimo del curso</h2>
              <div role="img" aria-label={CLIMA.map((c) => `${d.clima[c.clave] || 0} ${c.nombre.toLowerCase()}`).join(', ')} style={{ display: 'flex', gap: 4, height: 22 }}>
                {CLIMA.filter((c) => (d.clima[c.clave] || 0) > 0).map((c) => <div key={c.clave} style={{ flex: d.clima[c.clave], borderRadius: 999, background: c.color }} />)}
                {CLIMA.every((c) => !d.clima[c.clave]) && <div style={{ flex: 1, borderRadius: 999, background: '#EEF2F7' }} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontWeight: 800, fontSize: 14 }}>
                {CLIMA.map((c) => (
                  <span key={c.clave} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: c.color, border: `1px solid ${c.borde}` }} />{c.nombre} · {d.clima[c.clave] || 0}
                  </span>
                ))}
              </div>
              <p style={{ margin: 0, padding: '10px 12px', borderRadius: 12, background: '#F3F4F6', color: 'var(--gris)', fontWeight: 700, fontSize: 13, lineHeight: 1.4 }}>{d.aviso_clima || AVISO}</p>
            </section>
          </div>

          <section className="card" style={{ borderRadius: 22, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ margin: 0, fontWeight: 900, fontSize: 21, flexGrow: 1 }}>Alertas para acompañar</h2>
              {delCurso.length > 0 && <span style={{ padding: '5px 12px', borderRadius: 999, background: 'var(--aviso-fondo)', color: 'var(--aviso-texto)', fontWeight: 900, fontSize: 13 }}>{delCurso.length} {delCurso.length === 1 ? 'pendiente' : 'pendientes'}</span>}
            </div>
            {alertas.cargando && <Cargando texto="Cargando alertas" />}
            {delCurso.map((a, i) => (
              <div key={a.id} className="aparecer" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '12px 14px', borderRadius: 16, background: '#FFF9F2', border: '2px solid #FFE3C2' }}>
                <Avatar nombre={a.estudiante} i={i + 1} />
                <div style={{ flex: '1 1 260px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <strong style={{ fontWeight: 900, fontSize: 16 }}>{a.estudiante}</strong>
                  <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--gris)' }}>{a.motivo}</span>
                </div>
                <Link to={`/cursos/${id}`} className="btn btn-sec btn-peq" style={{ minHeight: 44, color: 'var(--tinta)', borderColor: 'var(--borde)' }}>VER PROGRESO</Link>
                <button type="button" className="btn btn-peq" disabled={atendiendo === a.id} onClick={() => atender(a)} style={{ minHeight: 44 }}>{atendiendo === a.id ? 'GUARDANDO…' : 'MARCAR COMO ATENDIDA'}</button>
              </div>
            ))}
            {alertas.datos && delCurso.length === 0 && <div style={{ padding: 18, borderRadius: 16, background: 'var(--hielo)', color: 'var(--cobalto-borde)', fontWeight: 800, fontSize: 15, textAlign: 'center' }}>No hay alertas pendientes. ¡Buen trabajo con el curso!</div>}
          </section>
        </>
      )}
    </Pagina>
  )
}
