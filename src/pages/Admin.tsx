import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useSesion } from '../auth'
import type { ClaveGenerada, EstudianteAdmin, Profesor, ProfesorCreado, ResumenAdmin } from '../api/types'
import { Avatar, Cargando, ErrorCaja, Pagina, useDatos } from '../components/ui'

// Panel de administración: cuentas de profesores y lista de estudiantes.
// Usa GET /admin/resumen, GET/POST /admin/profesores, PATCH /admin/profesores/{id},
// POST /admin/profesores/{id}/clave y GET /admin/estudiantes.

const PATRON_USUARIO = /^[a-z0-9._-]{3,40}$/

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

// La clave temporal llega una sola vez: se muestra para entregarla y no se guarda.
function ClaveUnaVez({ nombre, usuario, clave, onListo }: { nombre: string; usuario?: string; clave: string; onListo: () => void }) {
  const [copiada, setCopiada] = useState(false)
  async function copiar() {
    try { await navigator.clipboard.writeText(clave); setCopiada(true) } catch { /* el navegador puede negarlo */ }
  }
  return (
    <div role="status" className="aparecer" style={{ padding: '14px 16px', borderRadius: 16, background: 'var(--ok-fondo)', border: '2px solid var(--ok)', color: 'var(--ok-texto)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <strong style={{ fontWeight: 900, fontSize: 16 }}>Clave temporal para {nombre}</strong>
        <span style={{ fontWeight: 700, fontSize: 14 }}>
          {usuario && <>Usuario: <code style={{ fontWeight: 900 }}>{usuario}</code> · </>}
          Clave: <code style={{ fontWeight: 900, fontSize: 16, padding: '2px 8px', borderRadius: 8, background: '#FFFFFF' }}>{clave}</code>
        </span>
        <span style={{ fontWeight: 700, fontSize: 13 }}>Entrégasela al profe ahora: no se vuelve a mostrar. Al entrar, Lente le pedirá cambiarla.</span>
      </div>
      <button type="button" className="btn btn-sec btn-peq" onClick={copiar}>{copiada ? 'COPIADA ✓' : 'COPIAR CLAVE'}</button>
      <button type="button" className="btn btn-ok btn-peq" onClick={onListo}>LISTO</button>
    </div>
  )
}

function CrearProfesor({ alCrear }: { alCrear: () => void }) {
  const [nombre, setNombre] = useState('')
  const [usuario, setUsuario] = useState('')
  const [error, setError] = useState<unknown>(null)
  const [enviando, setEnviando] = useState(false)
  const [creado, setCreado] = useState<ProfesorCreado | null>(null)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const u = usuario.trim().toLowerCase()
    if (!nombre.trim()) { setError(new Error('Escribe el nombre completo del profe.')); return }
    if (u && !PATRON_USUARIO.test(u)) { setError(new Error('El usuario lleva de 3 a 40 letras minúsculas, números, punto, guion o guion bajo, sin espacios ni tildes.')); return }
    setEnviando(true)
    try {
      const p = await api.post<ProfesorCreado>('/admin/profesores', { nombre: nombre.trim(), usuario: u || null })
      setCreado(p)
      setNombre('')
      setUsuario('')
      alCrear()
    } catch (err) { setError(err) } finally { setEnviando(false) }
  }

  return (
    <section className="card" style={{ borderRadius: 22, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={{ margin: 0, fontWeight: 900, fontSize: 21 }}>Crear cuenta de profesor</h2>
      <form onSubmit={enviar} noValidate style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '2 1 260px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label className="etiqueta" htmlFor="pnombre">Nombre completo</label>
          <input id="pnombre" className="campo" maxLength={120} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del profesor" />
        </div>
        <div style={{ flex: '2 1 220px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label className="etiqueta" htmlFor="pusuario">Usuario (opcional)</label>
          <input id="pusuario" className="campo" maxLength={40} value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="Si lo dejas vacío, Lente lo propone" autoCapitalize="none" spellCheck={false} />
        </div>
        <button type="submit" className="btn" disabled={enviando} style={{ flex: '1 1 180px', minHeight: 52 }}>{enviando ? 'CREANDO…' : '+ CREAR CUENTA'}</button>
      </form>
      <ErrorCaja error={error} />
      {creado && (creado.clave_temporal
        ? <ClaveUnaVez nombre={creado.nombre} usuario={creado.usuario} clave={creado.clave_temporal} onListo={() => setCreado(null)} />
        : <div className="aviso aviso-info">Cuenta creada para {creado.nombre} con el usuario <code>{creado.usuario}</code>.</div>)}
    </section>
  )
}

const celda = { padding: '12px 10px', borderBottom: '2px solid var(--borde)', verticalAlign: 'middle' } as const
const cabecera = { padding: '10px', textAlign: 'left', fontWeight: 900, fontSize: 12, letterSpacing: 1, color: 'var(--gris-claro)', borderBottom: '2px solid var(--borde)', whiteSpace: 'nowrap' } as const

function EstadoCuenta({ activo, si = 'Activa', no = 'Desactivada' }: { activo: boolean; si?: string; no?: string }) {
  return <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 999, fontWeight: 900, fontSize: 12.5, background: activo ? 'var(--ok-fondo)' : '#F3F4F6', color: activo ? 'var(--ok-texto)' : 'var(--gris)' }}>{activo ? si : no}</span>
}

const accionEstilo = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', minHeight: 36, borderRadius: 10, border: '2px solid transparent', background: 'transparent', color: 'var(--cobalto-borde)', font: 'inherit', fontWeight: 900, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' } as const
const icono = (d: string) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
const ICONO_EDITAR = 'M4 20l4-1 11-11-3-3L5 16zM14 6l3 3'
const ICONO_CLAVE = 'M14 10a4 4 0 1 0-3.5 3.96L9 15.5V18h2.5v2H14v-2.5l1.04-1.04A4 4 0 0 0 14 10zM16 8h.01'
const ICONO_VER = 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'
const ICONO_ESTADO = 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM5.6 5.6l12.8 12.8'

const fechaIngreso = (iso: string | null) => (iso ? `Último ingreso: ${new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Aún no ha entrado')

function FilaProfesor({ p, i, alCambiar }: { p: Profesor; i: number; alCambiar: () => void }) {
  const [editando, setEditando] = useState(false)
  const [nombre, setNombre] = useState(p.nombre)
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [clave, setClave] = useState<string | null>(null)
  const [confirmarClave, setConfirmarClave] = useState(false)

  async function hacer(fn: () => Promise<unknown>) {
    setOcupado(true); setError(null)
    try { await fn(); alCambiar() } catch (e) { setError(e) } finally { setOcupado(false) }
  }

  const guardarNombre = () => hacer(async () => { await api.patch(`/admin/profesores/${p.id}`, { nombre: nombre.trim() }); setEditando(false) })
  const restablecer = () => hacer(async () => {
    const r = await api.post<ClaveGenerada>(`/admin/profesores/${p.id}/clave`, {})
    setConfirmarClave(false)
    setClave(r.clave_temporal)
  })
  const cambiarEstado = () => hacer(() => api.patch(`/admin/profesores/${p.id}`, { activo: !p.activo }))
  const { supervisar } = useSesion()
  const nav = useNavigate()
  const verModulos = () => { supervisar({ id: p.id, nombre: p.nombre }); nav('/cursos') }

  return (
    <>
      <tr style={{ opacity: p.activo ? 1 : 0.75 }}>
        <td style={celda}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar nombre={p.nombre} i={i} size={38} />
            {editando ? (
              <form onSubmit={(e) => { e.preventDefault(); if (nombre.trim()) guardarNombre() }} style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <input className="campo" aria-label="Nombre del profesor" autoFocus maxLength={120} value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ minHeight: 40, padding: '6px 10px', fontSize: 15, width: 220 }} />
                <button type="submit" className="btn btn-peq" disabled={ocupado || !nombre.trim()}>GUARDAR</button>
                <button type="button" className="btn btn-sec btn-peq" onClick={() => { setEditando(false); setNombre(p.nombre) }}>Cancelar</button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontWeight: 900, fontSize: 16 }}>{p.nombre}</strong>
                <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--gris-claro)' }}>{fechaIngreso(p.ultimo_ingreso)}</span>
              </div>
            )}
          </div>
        </td>
        <td data-etiqueta="Usuario" style={celda}><code style={{ fontSize: 14 }}>{p.usuario}</code></td>
        <td data-etiqueta="Cursos" style={{ ...celda, fontWeight: 800 }}>{p.cursos}</td>
        <td data-etiqueta="Estudiantes" style={{ ...celda, fontWeight: 800 }}>{p.estudiantes}</td>
        <td data-etiqueta="Estado" style={celda}><EstadoCuenta activo={p.activo} /></td>
        <td className="celda-acciones" style={{ ...celda, textAlign: 'right' }}>
          <button type="button" style={accionEstilo} disabled={ocupado} onClick={verModulos} title="Ver y editar sus cursos, estudiantes y textos">{icono(ICONO_VER)}Ver módulos</button>
          <button type="button" style={accionEstilo} disabled={ocupado} onClick={() => setEditando(true)}>{icono(ICONO_EDITAR)}Editar</button>
          <button type="button" style={accionEstilo} disabled={ocupado} onClick={() => setConfirmarClave(true)}>{icono(ICONO_CLAVE)}Contraseña</button>
          <button type="button" style={{ ...accionEstilo, color: p.activo ? 'var(--mejorar-texto)' : 'var(--ok-texto)' }} disabled={ocupado} onClick={cambiarEstado}>{icono(ICONO_ESTADO)}{p.activo ? 'Desactivar' : 'Activar'}</button>
        </td>
      </tr>
      {(confirmarClave || clave || !!error) && (
        <tr>
          <td colSpan={6} style={{ ...celda, background: '#FAFBFF' }}>
            {confirmarClave && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ flex: '1 1 300px', fontWeight: 800, fontSize: 14 }}>¿Restablecer la clave de {p.nombre}? Lente genera una clave temporal y su clave actual deja de funcionar.</span>
                <button type="button" className="btn btn-sec btn-peq" onClick={() => setConfirmarClave(false)}>Cancelar</button>
                <button type="button" className="btn btn-peq" disabled={ocupado} onClick={restablecer}>{ocupado ? 'GENERANDO…' : 'SÍ, RESTABLECER'}</button>
              </div>
            )}
            {clave && <ClaveUnaVez nombre={p.nombre} usuario={p.usuario} clave={clave} onListo={() => setClave(null)} />}
            <ErrorCaja error={error} />
          </td>
        </tr>
      )}
    </>
  )
}

export default function Admin() {
  const resumen = useDatos(() => api.get<ResumenAdmin>('/admin/resumen'))
  const profesores = useDatos(() => api.get<Profesor[]>('/admin/profesores'))
  const estudiantes = useDatos(() => api.get<EstudianteAdmin[]>('/admin/estudiantes'))
  const [pestana, setPestana] = useState<'profesores' | 'estudiantes'>('profesores')
  const [busca, setBusca] = useState('')
  const recargar = () => { resumen.recargar(); profesores.recargar(); estudiantes.recargar() }

  const q = busca.trim().toLowerCase()
  const profes = (profesores.datos || []).filter((p) => !q || p.nombre.toLowerCase().includes(q) || p.usuario.includes(q))
  const ests = (estudiantes.datos || []).filter((e) => !q || e.nombre.toLowerCase().includes(q) || e.profesor.toLowerCase().includes(q) || e.curso.toLowerCase().includes(q))
  const r = resumen.datos

  const tab = (clave: typeof pestana, texto: string) => {
    const on = pestana === clave
    return <button type="button" role="tab" aria-selected={on} onClick={() => setPestana(clave)} style={{ padding: '10px 16px', borderRadius: 12, font: 'inherit', fontWeight: on ? 900 : 800, fontSize: 15, cursor: 'pointer', ...(on ? { background: 'var(--cobalto)', color: '#FFFFFF', border: 0, borderBottom: '4px solid var(--cobalto-borde)' } : { background: '#FFFFFF', color: 'var(--gris)', border: '2px solid var(--borde)', borderBottomWidth: 4 }) }}>{texto}</button>
  }

  return (
    <Pagina>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span className="kicker">Administración</span>
        <h1 style={{ margin: 0, fontWeight: 900, fontSize: 36 }}>Cuentas de Lente</h1>
        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--gris)' }}>Crea las cuentas de los profes, restablece claves y revisa quién usa Lente.</span>
      </div>
      <ErrorCaja error={resumen.error} />
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Dato fondo="#2F6BFF" trazo="#FFFFFF" d="M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" valor={r?.total_profesores ?? '—'} etiqueta="Profesores registrados" />
        <Dato fondo="#2BEA7C" trazo="#111111" d="M5 12.5l4.5 4.5L19 7.5" valor={r?.profesores_activos ?? '—'} etiqueta="Profesores con cuenta activa" />
        <Dato fondo="#FFE600" trazo="#111111" d="M4 19V8l8-4 8 4v11M9 19v-6h6v6" valor={r?.total_estudiantes ?? '—'} etiqueta="Estudiantes registrados" />
        <Dato fondo="#00E1FF" trazo="#111111" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12l3 3 5-6" valor={r?.estudiantes_activos ?? '—'} etiqueta="Estudiantes activos" />
      </div>

      <CrearProfesor alCrear={recargar} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div role="tablist" aria-label="Listas" style={{ display: 'flex', gap: 8 }}>{tab('profesores', 'Profesores')}{tab('estudiantes', 'Estudiantes')}</div>
        <input className="campo" aria-label="Buscar" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={pestana === 'profesores' ? 'Buscar por nombre o usuario' : 'Buscar por estudiante, curso o profe'} style={{ width: 'min(340px, 100%)', minHeight: 46 }} />
      </div>

      <section className="card" style={{ borderRadius: 22, padding: '8px 12px', overflowX: 'auto' }}>
        {pestana === 'profesores' ? (
          <>
            {profesores.cargando && <Cargando texto="Cargando profesores" />}
            <ErrorCaja error={profesores.error} />
            <table className="tabla-adaptable" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead><tr><th style={cabecera}>PROFESOR</th><th style={cabecera}>USUARIO</th><th style={cabecera}>CURSOS</th><th style={cabecera}>ESTUDIANTES</th><th style={cabecera}>ESTADO</th><th style={{ ...cabecera, textAlign: 'right' }}>ACCIONES</th></tr></thead>
              <tbody>{profes.map((p, i) => <FilaProfesor key={p.id} p={p} i={i} alCambiar={recargar} />)}</tbody>
            </table>
            {profesores.datos && profes.length === 0 && <p className="sub" style={{ padding: 14 }}>{q ? 'Ningún profe coincide con la búsqueda.' : 'Aún no hay profes. Crea la primera cuenta arriba.'}</p>}
          </>
        ) : (
          <>
            {estudiantes.cargando && <Cargando texto="Cargando estudiantes" />}
            <ErrorCaja error={estudiantes.error} />
            <table className="tabla-adaptable" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead><tr><th style={cabecera}>ESTUDIANTE</th><th style={cabecera}>CURSO</th><th style={cabecera}>GRADO</th><th style={cabecera}>PROFESOR</th><th style={cabecera}>ESTADO</th></tr></thead>
              <tbody>
                {ests.map((e, i) => (
                  <tr key={e.id}>
                    <td style={celda}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar nombre={e.nombre} i={i} size={34} /><strong style={{ fontWeight: 900 }}>{e.nombre}</strong></div></td>
                    <td data-etiqueta="Curso" style={{ ...celda, fontWeight: 800 }}>{e.curso}</td>
                    <td data-etiqueta="Grado" style={{ ...celda, fontWeight: 700 }}>{e.grado_texto}</td>
                    <td data-etiqueta="Profesor" style={{ ...celda, fontWeight: 700 }}>{e.profesor}</td>
                    <td data-etiqueta="Estado" style={celda}><EstadoCuenta activo={e.estado === 'activo'} si="Activo" no="Inactivo" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {estudiantes.datos && ests.length === 0 && <p className="sub" style={{ padding: 14 }}>{q ? 'Ningún estudiante coincide con la búsqueda.' : 'Aún no hay estudiantes registrados.'}</p>}
          </>
        )}
      </section>
    </Pagina>
  )
}
