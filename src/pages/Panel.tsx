import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Alerta, Panel as PanelT } from '../api/types'
import { AZULES, Avatar, Barra, Cargando, ErrorCaja, Pagina, pct, useDatos } from '../components/ui'

// Etiquetas exactas de la guía del backend. Nunca usar palabras clínicas.
const CLIMA = [
  { clave: 'motivacion_alta', nombre: 'Motivación alta', color: '#2BEA7C' },
  { clave: 'neutral', nombre: 'Neutral', color: '#9CC3FF' },
  { clave: 'requiere_apoyo', nombre: 'Podría necesitar acompañamiento', color: '#FFE600' },
]
const AVISO = 'Solo apoyo pedagógico. No es un diagnóstico y no afecta puntos ni calificación.'

export default function Panel() {
  const { id } = useParams()
  const p = useDatos(() => api.get<PanelT>(`/cursos/${id}/panel`), [id])
  const alertas = useDatos(() => api.get<Alerta[]>('/alertas?atendida=false'), [])
  const [notas, setNotas] = useState<Record<number, string>>({})
  const [error, setError] = useState<unknown>(null)

  async function atender(a: Alerta) {
    setError(null)
    try { await api.post(`/alertas/${a.id}/atender`, { nota_profesor: notas[a.id]?.trim() || null }); alertas.recargar(); p.recargar() } catch (e) { setError(e) }
  }

  const d = p.datos
  const totalClima = d ? Object.values(d.clima).reduce((s, n) => s + n, 0) : 0
  const delCurso = (alertas.datos || []).filter((a) => !d || a.curso === d.curso)

  return (
    <Pagina>
      <div>
        <Link to={`/cursos/${id}`} style={{ fontWeight: 800, textDecoration: 'none' }}>← Estudiantes</Link>
        <h1 className="titulo" style={{ marginTop: 6 }}>Panel · {d?.curso || 'Curso'}</h1>
      </div>
      {p.cargando && <Cargando texto="Cargando el panel" />}
      <ErrorCaja error={p.error || error} />
      {d && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
            {[
              ['Participaron', `${d.participaron} de ${d.estudiantes_activos}`],
              ['Acierto promedio', d.acierto_promedio == null ? '—' : `${Math.round(pct(d.acierto_promedio)!)}%`],
              ['Puntos del curso', d.puntos_del_curso.toLocaleString('es-CO')],
              ['Racha más larga', `🔥 ${d.racha_mas_larga}`],
            ].map(([k, v]) => (
              <div key={k} className="card" style={{ padding: 18 }}>
                <div style={{ fontWeight: 800, color: 'var(--gris)', fontSize: 14 }}>{k}</div>
                <div style={{ fontWeight: 900, fontSize: 30 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <section className="card" style={{ flex: '1 1 360px', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="kicker">Avance por lente</div>
              <Barra etiqueta="Idea principal" valor={pct(d.avance_macro)} color={AZULES.macro} />
              <Barra etiqueta="Organización" valor={pct(d.avance_super)} color={AZULES.super} />
              <Barra etiqueta="Palabras" valor={pct(d.avance_micro)} color={AZULES.micro} />
              {d.destacados.length > 0 && <div className="kicker" style={{ marginTop: 10 }}>Destacados</div>}
              {d.destacados.map((e) => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar nombre={e.nombre} i={e.id} size={38} />
                  <span style={{ flex: 1, fontWeight: 900 }}>{e.nombre}</span>
                  <span style={{ fontWeight: 800, color: 'var(--gris)' }}>{e.puntos} pts · 🔥 {e.racha}</span>
                </div>
              ))}
            </section>
            <section className="card" style={{ flex: '1 1 360px', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="kicker">Clima del curso</div>
              <div style={{ display: 'flex', height: 22, borderRadius: 999, overflow: 'hidden', background: '#EEF2F7' }} role="img" aria-label="Clima del curso">
                {CLIMA.map((c) => <div key={c.clave} style={{ width: `${totalClima ? ((d.clima[c.clave] || 0) / totalClima) * 100 : 0}%`, background: c.color }} />)}
              </div>
              {CLIMA.map((c) => (
                <div key={c.clave} style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
                  <span style={{ width: 14, height: 14, borderRadius: 4, background: c.color, border: '1px solid rgba(0,0,0,.15)' }} />
                  <span style={{ flex: 1 }}>{c.nombre}</span><span>{d.clima[c.clave] || 0}</span>
                </div>
              ))}
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--gris)' }}>{AVISO}</p>
            </section>
          </div>
          <section className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="kicker">Acompañamiento ({delCurso.length})</div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--gris)' }}>{AVISO}</p>
            {delCurso.length === 0 && <p className="sub">No hay estudiantes pendientes de acompañamiento.</p>}
            {delCurso.map((a) => (
              <div key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', borderTop: '2px solid var(--borde)', paddingTop: 12 }}>
                <Avatar nombre={a.estudiante} i={a.estudiante_id} />
                <div style={{ flex: '1 1 240px' }}>
                  <div style={{ fontWeight: 900 }}>{a.estudiante}</div>
                  <div style={{ fontWeight: 700, color: 'var(--gris)', fontSize: 14 }}>{a.motivo}</div>
                </div>
                <input className="campo" style={{ flex: '1 1 220px', minHeight: 44, fontSize: 14 }} placeholder="Nota (opcional)" aria-label={`Nota sobre ${a.estudiante}`} value={notas[a.id] || ''} onChange={(e) => setNotas((n) => ({ ...n, [a.id]: e.target.value }))} />
                <button className="btn btn-sec btn-peq" onClick={() => atender(a)}>Marcar atendida</button>
              </div>
            ))}
          </section>
        </>
      )}
    </Pagina>
  )
}
