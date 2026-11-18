import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSesion } from '../auth'
import { api, DEMO } from '../api/client'
import { ErrorCaja, LupaIcono } from '../components/ui'

const RECORTE = 'Cientos de jóvenes invadieron el parque durante un festival que terminó en caos, según denunciaron los vecinos indignados.'

function Hero() {
  return (
    <section className="cobalto-fondo" style={{ flex: '1 1 480px', minHeight: 420, padding: 'clamp(28px, 5vw, 56px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 28, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 46, height: 46, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LupaIcono size={26} color="#2F5BEA" /></span>
        <span style={{ fontWeight: 900, fontSize: 30, letterSpacing: -1 }}>lente</span>
      </div>
      <div aria-hidden="true" style={{ position: 'relative', background: '#fff', color: '#1F2A37', borderRadius: 18, padding: '18px 22px', width: 460, maxWidth: '100%', boxShadow: '0 20px 50px rgba(10,20,80,.35)', transform: 'rotate(-2deg)', overflow: 'hidden' }}>
        <div style={{ fontWeight: 900, fontSize: 11, letterSpacing: 2, color: '#6B7280', marginBottom: 6 }}>EL DIARIO · LOCAL</div>
        <p className="lectura" style={{ margin: 0, fontSize: 17, lineHeight: 1.55, filter: 'blur(2.2px)' }}>{RECORTE}</p>
        <div className="barrido" style={{ position: 'absolute', left: 10, top: 18, width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', border: '6px solid #1A36A8', background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,.25)' }}>
          <div className="contra-barrido" style={{ position: 'absolute', left: -16, top: -24, width: 460, padding: '18px 22px' }}>
            <div style={{ fontWeight: 900, fontSize: 11, letterSpacing: 2, color: '#6B7280', marginBottom: 6 }}>EL DIARIO · LOCAL</div>
            <p className="lectura" style={{ margin: 0, fontSize: 17, lineHeight: 1.55 }}>
              Cientos de jóvenes <mark style={{ background: '#C9DBFF', color: '#1A36A8', fontWeight: 600 }}>invadieron</mark> el parque durante un festival que terminó en <mark style={{ background: '#C9DBFF', color: '#1A36A8', fontWeight: 600 }}>caos</mark>, según denunciaron los vecinos <mark style={{ background: '#C9DBFF', color: '#1A36A8', fontWeight: 600 }}>indignados</mark>.
            </p>
          </div>
        </div>
      </div>
      <div>
        <h1 style={{ margin: 0, fontWeight: 900, fontSize: 'clamp(32px, 4.4vw, 50px)', lineHeight: 1.05 }}>Tus estudiantes aprenden a leer<br />lo que hay detrás de una noticia.</h1>
        <p style={{ margin: '12px 0 0', fontWeight: 700, fontSize: 17, opacity: .9, maxWidth: 520 }}>Idea principal, organización y palabras cargadas: tres miradas para leer los medios con criterio.</p>
      </div>
    </section>
  )
}

export default function Login() {
  const { entrar } = useSesion()
  const nav = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [ver, setVer] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      const u = await entrar(usuario.trim(), clave)
      nav(u.debe_cambiar_clave ? '/cambiar-clave' : '/cursos', { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap', background: '#fff' }}>
      <Hero />
      <section style={{ flex: '1 1 380px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(24px, 5vw, 56px)' }}>
        <form onSubmit={enviar} style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
          <div>
            <h2 style={{ margin: 0, fontWeight: 900, fontSize: 30 }}>Hola, profe 👋</h2>
            <p className="sub" style={{ marginTop: 6 }}>Entra con el usuario que te dio el administrador del colegio.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="etiqueta" htmlFor="usuario">Usuario</label>
            <input id="usuario" className="campo" autoComplete="username" value={usuario} onChange={(e) => setUsuario(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="etiqueta" htmlFor="clave">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input id="clave" className="campo" type={ver ? 'text' : 'password'} autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} required style={{ paddingRight: 90 }} />
              <button type="button" onClick={() => setVer((v) => !v)} style={{ position: 'absolute', right: 8, top: 8, bottom: 12, border: 0, background: 'transparent', fontWeight: 900, color: 'var(--cobalto)', cursor: 'pointer' }}>{ver ? 'Ocultar' : 'Ver'}</button>
            </div>
          </div>
          <ErrorCaja error={error} />
          <button className="btn" type="submit" disabled={enviando || !usuario.trim() || !clave}>{enviando ? 'Entrando…' : 'ENTRAR'}</button>
          {DEMO && <div className="aviso aviso-info">Modo demo: escribe cualquier usuario y contraseña.</div>}
          <p className="sub" style={{ fontSize: 13 }}>¿Olvidaste la contraseña? Pídele al administrador que te la restablezca.</p>
        </form>
      </section>
    </div>
  )
}

export function CambiarClave() {
  const nav = useNavigate()
  const { salir } = useSesion()
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [repetir, setRepetir] = useState('')
  const [error, setError] = useState<unknown>(null)
  const [enviando, setEnviando] = useState(false)
  const problema = nueva && nueva.length < 8 ? 'La nueva contraseña debe tener al menos 8 caracteres.' : repetir && repetir !== nueva ? 'Las contraseñas no coinciden.' : nueva && nueva === actual ? 'La nueva debe ser distinta a la actual.' : null

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (problema) return
    setEnviando(true)
    setError(null)
    try {
      await api.post('/auth/cambiar-clave', { actual, nueva })
      // La guía pide volver a iniciar sesión con la clave nueva.
      salir()
      nav('/login', { replace: true })
    } catch (err) { setError(err) } finally { setEnviando(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <form onSubmit={enviar} className="card" style={{ width: '100%', maxWidth: 440, padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h1 style={{ margin: 0, fontWeight: 900, fontSize: 26 }}>Crea tu contraseña</h1>
        <p className="sub">Es tu primera vez: cambia la contraseña temporal por una tuya.</p>
        {[['Contraseña actual', actual, setActual, 'current-password'], ['Nueva contraseña', nueva, setNueva, 'new-password'], ['Repite la nueva', repetir, setRepetir, 'new-password']].map(([l, v, s, ac], i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="etiqueta" htmlFor={`c${i}`}>{l as string}</label>
            <input id={`c${i}`} type="password" className="campo" autoComplete={ac as string} value={v as string} onChange={(e) => (s as (x: string) => void)(e.target.value)} />
          </div>
        ))}
        {problema && <div className="aviso aviso-info">{problema}</div>}
        <ErrorCaja error={error} />
        <button className="btn" disabled={enviando || !!problema || !actual || !nueva || !repetir}>{enviando ? 'Guardando…' : 'GUARDAR'}</button>
      </form>
    </div>
  )
}
