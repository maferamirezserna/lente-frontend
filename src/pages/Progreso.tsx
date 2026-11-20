import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Estudiante, Historial, Progreso as ProgresoT } from '../api/types'
import { AZULES, Avatar, Barra, Cargando, ErrorCaja, Pagina, Volver, pct, useDatos } from '../components/ui'

// Progreso individual de un estudiante: GET /estudiantes/{id}/progreso y GET /estudiantes/{id}/historial.
// Todos los números vienen de la API; aquí solo se muestran.

// Etiquetas exactas de la guía del backend. Nunca usar palabras clínicas.
const ANIMO: Record<string, { nombre: string; fondo: string; texto: string }> = {
  motivacion_alta: { nombre: 'Motivación alta', fondo: '#EEF3FF', texto: '#1A36A8' },
  neutral: { nombre: 'Neutral', fondo: '#F3F4F6', texto: '#4B5563' },
  requiere_apoyo: { nombre: 'Podría necesitar acompañamiento', fondo: '#FFF4E5', texto: '#8A4B00' },
}
const NIVELES: Record<string, { nombre: string; color: string; tinta: string }> = {
  macro: { nombre: 'Idea principal', color: AZULES.macro, tinta: '#FFFFFF' },
  super: { nombre: 'Organización', color: AZULES.super, tinta: '#FFFFFF' },
  micro: { nombre: 'Lenguaje', color: AZULES.micro, tinta: '#10193D' },
}

const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
const porc = (v: number | null | undefined) => (v == null ? '—' : `${Math.round(pct(v)!)}%`)

function Dato({ fondo, trazo, d, valor, etiqueta, detalle }: { fondo: string; trazo: string; d: string; valor: ReactNode; etiqueta: string; detalle?: string }) {
  return (
    <div className="card" style={{ flex: '1 1 220px', minWidth: 0, borderRadius: 22, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: fondo, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={trazo} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 900, fontSize: 28, lineHeight: 1.1 }}>{valor}</span>
        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--gris)' }}>{etiqueta}</span>
        {detalle && <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--gris-claro)' }}>{detalle}</span>}
      </div>
    </div>
  )
}

const tarjeta = { borderRadius: 22, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 } as const
const h2 = { margin: 0, fontWeight: 900, fontSize: 21 } as const

function HistorialRespuestas({ id }: { id: string }) {
  const [nivel, setNivel] = useState<string>('')
  const h = useDatos(() => api.get<Historial[]>(`/estudiantes/${id}/historial${nivel ? `?nivel=${nivel}` : ''}`), [id, nivel])
  const filtro = (clave: string, texto: string) => {
    const on = nivel === clave
    return <button key={clave} type="button" aria-pressed={on} onClick={() => setNivel(clave)} style={{ padding: '6px 12px', minHeight: 36, borderRadius: 999, border: `2px solid ${on ? 'var(--cobalto)' : 'var(--borde)'}`, background: on ? 'var(--cobalto)' : '#FFFFFF', color: on ? '#FFFFFF' : 'var(--gris)', font: 'inherit', fontWeight: on ? 900 : 800, fontSize: 13, cursor: 'pointer' }}>{texto}</button>
  }
  return (
    <section className="card" style={tarjeta}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <h2 style={{ ...h2, flexGrow: 1 }}>Historial de respuestas</h2>
        <div role="group" aria-label="Filtrar por nivel" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {filtro('', 'Todos')}{Object.entries(NIVELES).map(([k, v]) => filtro(k, v.nombre))}
        </div>
      </div>
      {h.cargando && <Cargando texto="Cargando respuestas" />}
      <ErrorCaja error={h.error} />
      {h.datos && h.datos.length === 0 && <p className="sub">Aún no hay respuestas{nivel ? ' en este nivel' : ''}.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {h.datos?.map((r, i) => {
          const n = NIVELES[r.nivel]
          const bien = r.es_correcta === true, mal = r.es_correcta === false
          return (
            <div key={`${r.actividad_id}-${i}`} style={{ padding: '12px 14px', borderRadius: 16, background: '#F8FAFC', border: '2px solid #EEF0F3', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12.5, fontWeight: 800, color: 'var(--gris)' }}>
                {n && <span style={{ padding: '3px 8px', borderRadius: 999, background: n.color, color: n.tinta, fontWeight: 900 }}>{n.nombre}</span>}
                <span>{r.titulo}</span><span aria-hidden="true">·</span><span>{fecha(r.fecha)}</span>
                {r.resultado && <span style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 999, fontWeight: 900, background: bien ? 'var(--ok-fondo)' : mal ? 'var(--mejorar-fondo)' : 'var(--hielo)', color: bien ? 'var(--ok-texto)' : mal ? 'var(--mejorar-texto)' : 'var(--cobalto-borde)' }}>{r.resultado.replace(/_/g, ' ')}</span>}
              </div>
              <strong style={{ fontWeight: 900, fontSize: 15 }}>{r.pregunta}</strong>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 14 }}>
                <div style={{ flex: '1 1 240px' }}><span style={{ fontWeight: 800, fontSize: 12, color: 'var(--gris-claro)' }}>RESPONDIÓ</span><p className="lectura" style={{ margin: '2px 0 0' }}>{r.respuesta || '—'}</p></div>
                {r.respuesta_esperada && <div style={{ flex: '1 1 240px' }}><span style={{ fontWeight: 800, fontSize: 12, color: 'var(--gris-claro)' }}>SE ESPERABA</span><p className="lectura" style={{ margin: '2px 0 0', color: 'var(--cobalto-borde)' }}>{r.respuesta_esperada}</p></div>}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default function Progreso() {
  const { id = '' } = useParams()
  const p = useDatos(() => api.get<ProgresoT>(`/estudiantes/${id}/progreso`), [id])
  const e = useDatos(() => api.get<Estudiante>(`/estudiantes/${id}`), [id])
  const d = p.datos
  const cursoId = e.datos?.curso_id
  const animo = d?.animo ? ANIMO[d.animo] : null

  return (
    <Pagina>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Volver porDefecto={cursoId ? `/cursos/${cursoId}` : '/cursos'} />
        <nav aria-label="Ruta" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14, color: 'var(--gris)' }}>
          <Link to="/cursos" style={{ textDecoration: 'none' }}>Mis cursos</Link><span aria-hidden="true">›</span>
          {cursoId ? <Link to={`/cursos/${cursoId}`} style={{ textDecoration: 'none' }}>{d?.curso || e.datos?.curso}</Link> : <span>{d?.curso || 'Curso'}</span>}
          <span aria-hidden="true">›</span><span>{d?.nombre || 'Estudiante'}</span>
        </nav>
      </div>
      {p.cargando && <Cargando texto="Cargando el progreso" />}
      <ErrorCaja error={p.error} />
      {d && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Avatar nombre={d.nombre} i={d.id} size={64} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexGrow: 1 }}>
              <span className="kicker">Progreso individual</span>
              <h1 style={{ margin: 0, fontWeight: 900, fontSize: 32 }}>{d.nombre}</h1>
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--gris)' }}>{d.curso} · {d.grado_texto} · {d.nivel_escolar}</span>
            </div>
            {animo && <span title={d.aviso_animo} style={{ padding: '7px 14px', borderRadius: 999, background: animo.fondo, color: animo.texto, fontWeight: 900, fontSize: 14 }}>Ánimo: {animo.nombre}</span>}
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Dato fondo="#FFE600" trazo="#111111" d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" valor={d.puntos.toLocaleString('es-CO')} etiqueta="Puntos" detalle={`Nivel ${d.nivel}${d.nivel_nombre ? ` · ${d.nivel_nombre}` : ''}`} />
            <Dato fondo="#FF7A00" trazo="#111111" d="M12 3c1 4 5 6 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-8.5z" valor={`${d.racha} ${d.racha === 1 ? 'día' : 'días'}`} etiqueta="Racha actual" detalle={`Mejor racha: ${d.mejor_racha}`} />
            <Dato fondo="#2F6BFF" trazo="#FFFFFF" d="M4 5h13v14H6a2 2 0 0 1-2-2zM8 9h5M8 13h5" valor={d.actividades_hechas} etiqueta="Actividades hechas" detalle={`${d.actividades_pendientes} pendientes`} />
            <Dato fondo="#2BEA7C" trazo="#111111" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" valor={porc(d.porcentaje_acierto)} etiqueta="Acierto" detalle={`${d.correctas} bien · ${d.incorrectas} por mejorar`} />
          </div>

          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'stretch' }}>
            <section className="card" style={{ ...tarjeta, flex: '1 1 360px', minWidth: 0 }}>
              <h2 style={h2}>Avance por nivel</h2>
              <Barra etiqueta="Idea principal" valor={pct(d.porcentaje_macro)} color={AZULES.macro} />
              <Barra etiqueta="Organización" valor={pct(d.porcentaje_super)} color={AZULES.super} />
              <Barra etiqueta="Lenguaje" valor={pct(d.porcentaje_micro)} color={AZULES.micro} />
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--gris)' }}>{d.preguntas_respondidas} preguntas respondidas</span>
            </section>
            <section className="card" style={{ ...tarjeta, flex: '1 1 360px', minWidth: 0 }}>
              <h2 style={h2}>Textos pendientes</h2>
              {d.pendientes.length === 0 && <p className="sub">No tiene textos pendientes. ¡Va al día!</p>}
              {d.pendientes.map((t) => (
                <div key={t.texto_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14, background: '#F8FAFC', border: '2px solid #EEF0F3' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2F5BEA" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5h13v14H6a2 2 0 0 1-2-2zM8 9h5M8 13h5" /></svg>
                  <span style={{ fontWeight: 800, flexGrow: 1 }}>{t.titulo}</span>
                </div>
              ))}
              {cursoId && d.pendientes.length > 0 && <Link to={`/cursos/${cursoId}`} className="btn btn-peq" style={{ alignSelf: 'flex-start' }}>ABRIR UNA ACTIVIDAD</Link>}
              {animo && <p style={{ margin: 0, padding: '10px 12px', borderRadius: 12, background: '#F3F4F6', color: 'var(--gris)', fontWeight: 700, fontSize: 13, lineHeight: 1.4 }}>{d.aviso_animo}</p>}
            </section>
          </div>

          <section className="card" style={tarjeta}>
            <h2 style={h2}>Logros · {d.logros_catalogo.filter((l) => l.ganado).length} de {d.logros_catalogo.length}</h2>
            {d.logros_catalogo.length === 0 && <p className="sub">Aún no hay logros configurados.</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
              {d.logros_catalogo.map((l) => (
                <div key={l.nombre} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 16, border: `2px solid ${l.ganado ? '#FFC800' : 'var(--borde)'}`, background: l.ganado ? '#FFFBEA' : '#F8FAFC', opacity: l.ganado ? 1 : 0.7 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: l.ganado ? '#FFF4D6' : '#EEF0F3', border: `3px solid ${l.ganado ? '#FFC800' : '#D1D5DB'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={l.ganado ? '#9A6700' : '#9AA3AF'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={l.ganado ? 'M7 4h10v4a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6' : 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z'} /></svg>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <strong style={{ fontWeight: 900, fontSize: 15 }}>{l.nombre}</strong>
                    <span style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--gris)' }}>{l.descripcion}</span>
                    {l.ganado && l.ganado_en && <span style={{ fontWeight: 800, fontSize: 12, color: '#9A6700' }}>Ganado el {fecha(l.ganado_en)}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card" style={tarjeta}>
            <h2 style={h2}>Evolución por actividad</h2>
            {d.evolucion.length === 0 && <p className="sub">Aún no ha hecho actividades.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {d.evolucion.map((a) => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', padding: '10px 12px', borderRadius: 14, background: '#F8FAFC', border: '2px solid #EEF0F3' }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--cobalto)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>{a.numero}</span>
                  <div style={{ flex: '1 1 200px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontWeight: 900, fontSize: 15 }}>{a.titulo}</strong>
                    <span style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--gris)' }}>{fecha(a.iniciada_en)} · {a.terminada_en ? 'Terminada' : 'Sin terminar'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, fontWeight: 900, fontSize: 12.5 }}>
                    {(['macro', 'super', 'micro'] as const).map((k) => {
                      const v = a[`resultado_${k}`]
                      return <span key={k} title={NIVELES[k].nombre} style={{ padding: '4px 8px', borderRadius: 10, background: NIVELES[k].color, color: NIVELES[k].tinta }}>{NIVELES[k].nombre.split(' ')[0]} {porc(v)}</span>
                    })}
                  </div>
                  <span style={{ fontWeight: 900, color: '#9A6700' }}>+{a.puntos_ganados}</span>
                </div>
              ))}
            </div>
          </section>

          <HistorialRespuestas id={id} />
        </>
      )}
    </Pagina>
  )
}
