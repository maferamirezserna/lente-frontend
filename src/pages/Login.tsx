import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { inicioDe, useSesion } from '../auth'
import { api, DEMO } from '../api/client'
import { ErrorCaja } from '../components/ui'

// Pantalla de entrada idéntica a docs/diseno/mockups/Mock-Login.html.
const ACC = '#9CC3FF'
const ACC_OSCURO = '#2F5BEA'
const SERIF = "Georgia, 'Times New Roman', serif"
const MARCA = '#1A36A8'
// Acento «amarillo» del mockup (opción acento = amarillo) para los títulos del lado azul.
const AMARILLO = '#FFD43B'

// Texto de la noticia. Dentro de la lupa se resaltan las palabras con postura.
function TextoNoticia({ marcar }: { marcar?: boolean }) {
  const m = (t: string, negrita = true) => (marcar ? <tspan fill={MARCA} fontWeight={negrita ? 700 : undefined}>{t}</tspan> : t)
  const cuerpo = { fontFamily: 'Georgia, serif', fontSize: 13, fill: '#4B5563' }
  const titulo = { fontFamily: SERIF, fontWeight: 700, fontSize: 30, fill: '#1F2A37' }
  return (
    <>
      <text x="44" y="72" {...titulo}>Miles de jóvenes</text>
      <text x="44" y="108" {...titulo}>«{m('invaden', false)}» el parque</text>
      <text x="44" y="146" {...cuerpo}>Los vecinos, {m('indignados')}, aseguraron que el ruido fue</text>
      <text x="44" y="168" {...cuerpo}>{m('insoportable')} hasta la madrugada y que el lugar quedó</text>
      <text x="44" y="190" {...cuerpo}>convertido en un {m('basurero')}, según denunciaron ayer.</text>
      <text x="44" y="212" {...cuerpo}>Los organizadores dicen que todo se hizo con permiso</text>
      <text x="44" y="234" {...cuerpo}>y que el parque quedó limpio a las seis de la mañana.</text>
    </>
  )
}

// Recorte de periódico con una lupa de vidrio que lo recorre y aclara el texto.
function Recorte() {
  return (
    <svg width="100%" style={{ maxWidth: 620, display: 'block' }} viewBox="0 0 520 290" role="img" aria-label="Lupa de vidrio que aclara una noticia sobre fondo azul">
      <defs>
        <linearGradient id="rimA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".42" stopColor="#9AA6B6" /><stop offset=".58" stopColor="#EEF2F7" /><stop offset="1" stopColor="#5E6A7A" /></linearGradient>
        <radialGradient id="glassA" cx=".35" cy=".3" r=".85"><stop offset="0" stopColor="#FFFFFF" stopOpacity=".55" /><stop offset=".5" stopColor="#FFFFFF" stopOpacity=".06" /><stop offset="1" stopColor="#2F5BEA" stopOpacity=".22" /></radialGradient>
        <linearGradient id="handleA" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={ACC_OSCURO} /><stop offset=".45" stopColor={ACC} /><stop offset="1" stopColor={ACC_OSCURO} /></linearGradient>
        <radialGradient id="causticA" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#FFFBEA" /><stop offset=".6" stopColor="#FFF3B0" stopOpacity=".5" /><stop offset="1" stopColor="#FFF3B0" stopOpacity="0" /></radialGradient>
        <clipPath id="magA"><circle cx="130" cy="110" r="56" /></clipPath>
      </defs>
      <g transform="rotate(-3 260 150)">
        <rect x="26" y="28" width="470" height="244" rx="14" fill="#0B1A4A" opacity=".35" style={{ filter: 'blur(10px)' }} />
        <rect x="20" y="20" width="480" height="246" rx="14" fill="#FBFAF7" />
        <g style={{ filter: 'blur(1.4px)', opacity: 0.65 }}><TextoNoticia /></g>
        <g className="lupa-glide">
          <ellipse cx="150" cy="184" rx="62" ry="16" fill="#0B1A4A" opacity=".2" style={{ filter: 'blur(7px)' }} />
          <ellipse className="lupa-glow" cx="148" cy="182" rx="20" ry="6" fill="url(#causticA)" />
          <rect x="182" y="135" width="20" height="74" rx="10" fill="url(#handleA)" transform="rotate(-45 192 172)" />
          <g clipPath="url(#magA)">
            <circle cx="130" cy="110" r="56" fill="#FFFFFF" />
            <g transform="translate(-58.5 -49.5) scale(1.45)">
              <g className="lupa-unglide"><TextoNoticia marcar /></g>
            </g>
            <circle cx="130" cy="110" r="56" fill="url(#glassA)" />
            <circle cx="129" cy="110" r="54" fill="none" stroke="#22D3EE" strokeOpacity=".35" strokeWidth="3" />
            <circle cx="131" cy="110" r="54" fill="none" stroke="#FF4D6D" strokeOpacity=".25" strokeWidth="3" />
          </g>
          <circle cx="130" cy="110" r="61" fill="none" stroke="url(#rimA)" strokeWidth="10" />
          <g className="lupa-fb lupa-glint">
            <circle cx="130" cy="110" r="61" fill="none" stroke="none" />
            <path d="M130 49a61 61 0 0 1 22 4" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
          </g>
          <path d="M94 84a44 44 0 0 1 26-22" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity=".9" />
          <circle cx="100" cy="94" r="3" fill="#FFFFFF" opacity=".9" />
        </g>
      </g>
    </svg>
  )
}

function Hero() {
  return (
    <section className="cobalto-fondo entrada-hero" style={{ flex: '1 1 560px', minWidth: 0, minHeight: 420, padding: '48px clamp(24px, 5vw, 64px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28 }}>
      <Recorte />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 560 }}>
        <span style={{ alignSelf: 'flex-start', marginBottom: 6, padding: '6px 14px', borderRadius: 999, background: AMARILLO, color: '#10193D', fontWeight: 900, fontSize: 13, letterSpacing: 0.6 }}>PARA PROFES DE 3.° A 11.°</span>
        <span className="lupa-tag" style={{ fontWeight: 800, fontSize: 22, color: '#DCE6FF' }}>Mira más allá de la noticia</span>
        <p style={{ margin: '10px 0 0', fontWeight: 700, fontSize: 21, lineHeight: 1.5, color: '#FFFFFF' }}>Tus estudiantes aprenden a leer noticias como detectives: la idea principal, cómo está organizada y qué palabras muestran una postura.</p>
      </div>
    </section>
  )
}

// Logo: la palabra «lente» con una lupa que la recorre y la agranda en cobalto.
function Logo() {
  const palabra = { x: 100, y: 182, fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 128, letterSpacing: -4 }
  return (
    <svg width="380" height="197" style={{ display: 'block', marginLeft: -66, marginTop: -24, marginBottom: -16, maxWidth: 'calc(100% + 66px)', height: 'auto' }} viewBox="0 0 520 270" role="img" aria-label="Palabra lente con una lupa de vidrio que recorre las letras">
      <defs>
        <linearGradient id="rimB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".42" stopColor="#9AA6B6" /><stop offset=".58" stopColor="#EEF2F7" /><stop offset="1" stopColor="#5E6A7A" /></linearGradient>
        <radialGradient id="glassB" cx=".35" cy=".3" r=".85"><stop offset="0" stopColor="#FFFFFF" stopOpacity=".5" /><stop offset=".6" stopColor="#FFFFFF" stopOpacity=".04" /><stop offset="1" stopColor="#2F5BEA" stopOpacity=".2" /></radialGradient>
        <linearGradient id="handleB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={ACC_OSCURO} /><stop offset=".45" stopColor={ACC} /><stop offset="1" stopColor={ACC_OSCURO} /></linearGradient>
        <radialGradient id="causticB" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#FFF7D6" /><stop offset="1" stopColor="#FFF7D6" stopOpacity="0" /></radialGradient>
        <clipPath id="magB"><circle cx="170" cy="150" r="54" /></clipPath>
      </defs>
      <text {...palabra} fill="#1F2A37">lente</text>
      <g className="lupa-word">
        <ellipse cx="184" cy="236" rx="56" ry="11" fill="#1F2A37" opacity=".13" style={{ filter: 'blur(6px)' }} />
        <ellipse className="lupa-glow" cx="182" cy="234" rx="18" ry="5" fill="url(#causticB)" />
        <rect x="221" y="177" width="18" height="66" rx="9" fill="#FFC800" transform="rotate(-45 230 210)" />
        <g clipPath="url(#magB)">
          <circle cx="170" cy="150" r="54" fill="#3D68F0" />
          <g transform="translate(-85 -75) scale(1.5)">
            <g className="lupa-unword"><text {...palabra} fill="#FFE14D">lente</text></g>
          </g>
          <circle cx="170" cy="150" r="54" fill="url(#glassB)" />
          <circle cx="169" cy="150" r="52" fill="none" stroke="#22D3EE" strokeOpacity=".35" strokeWidth="3" />
          <circle cx="171" cy="150" r="52" fill="none" stroke="#FF4D6D" strokeOpacity=".25" strokeWidth="3" />
        </g>
        <circle cx="170" cy="150" r="58" fill="none" stroke="url(#rimB)" strokeWidth="9" />
        <g className="lupa-fb lupa-glint">
          <circle cx="170" cy="150" r="58" fill="none" stroke="none" />
          <path d="M170 92a58 58 0 0 1 21 4" fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
        </g>
        <path d="M134 128a42 42 0 0 1 26-22" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity=".9" />
      </g>
    </svg>
  )
}

function OjoIcono({ tachado }: { tachado: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" /><circle cx="12" cy="12" r="2.6" />
      {tachado && <path d="M4 4l16 16" />}
    </svg>
  )
}

// Estado del servidor con GET /salud (responde sin sesión).
function EstadoServidor() {
  const [estado, setEstado] = useState<'revisando' | 'ok' | 'caido'>('revisando')
  useEffect(() => {
    let vivo = true
    api.get('/salud').then(() => vivo && setEstado('ok')).catch(() => vivo && setEstado('caido'))
    return () => { vivo = false }
  }, [])
  const estilos = {
    revisando: { bg: 'var(--hielo)', fg: 'var(--gris)', punto: 'var(--gris-claro)', texto: 'Revisando el servidor…' },
    ok: { bg: '#E9F9EF', fg: '#1D6B3A', punto: '#22A559', texto: 'Servidor disponible' },
    caido: { bg: 'var(--mejorar-fondo)', fg: 'var(--mejorar-texto)', punto: 'var(--mejorar)', texto: 'Servidor no disponible' },
  }[estado]
  return (
    <span role="status" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, background: estilos.bg, color: estilos.fg, fontWeight: 800, fontSize: 13 }}>
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: estilos.punto }} />{estilos.texto}
    </span>
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
    if (enviando) return
    setError(null)
    if (!usuario.trim() || !clave) {
      setError(new Error('Escribe tu usuario y tu clave.'))
      return
    }
    setEnviando(true)
    try {
      const u = await entrar(usuario.trim(), clave)
      nav(u.debe_cambiar_clave ? '/cambiar-clave' : inicioDe(u), { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap', background: '#FFFFFF' }}>
      <Hero />
      <section className="entrada-formulario" style={{ flex: '1 1 420px', minWidth: 0, padding: '48px clamp(24px, 5vw, 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}><Logo /></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1 style={{ margin: 0, fontWeight: 900, fontSize: 32, lineHeight: 1.15 }}>¡Hola, profe!</h1>
          <span aria-hidden="true" style={{ width: 64, height: 6, borderRadius: 999, background: ACC }} />
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#4B5563' }}>Inicia sesión para abrir tus cursos.</p>
        </div>

        <form onSubmit={enviar} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="etiqueta" htmlFor="usuario">Usuario</label>
            <input id="usuario" className="campo" type="text" autoComplete="username" placeholder="Ej.: jcastro" value={usuario} onChange={(e) => setUsuario(e.target.value)} required style={{ padding: '14px 16px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="etiqueta" htmlFor="clave">Clave</label>
            <div style={{ position: 'relative' }}>
              <input id="clave" className="campo" type={ver ? 'text' : 'password'} autoComplete="current-password" placeholder="Tu clave" value={clave} onChange={(e) => setClave(e.target.value)} required style={{ padding: '14px 56px 14px 16px' }} />
              <button type="button" onClick={() => setVer((v) => !v)} aria-label={ver ? 'Ocultar clave' : 'Mostrar clave'} aria-pressed={ver} style={{ position: 'absolute', right: 6, top: 6, width: 44, height: 40, border: 0, borderRadius: 12, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><OjoIcono tachado={!ver} /></button>
            </div>
          </div>
          <ErrorCaja error={error} />
          <button className="btn" type="submit" aria-busy={enviando} style={{ minHeight: 56, gap: 10, fontSize: 17, letterSpacing: 0.8 }}>
            {enviando && (
              <svg className="girar" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M12 3a9 9 0 1 1-9 9" /></svg>
            )}
            {enviando ? 'ENTRANDO…' : 'INICIAR SESIÓN'}
          </button>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#4B5563' }}>¿Olvidaste tu clave? Pídele al administrador que te la restablezca.</p>
          {DEMO && <div className="aviso aviso-info" style={{ fontSize: 13 }}>Modo demo: escribe cualquier usuario y clave. Con el usuario «admin» entras como administrador.</div>}
        </form>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', maxWidth: 420, paddingTop: 18, borderTop: '2px solid #F0F2F5' }}>
          <EstadoServidor />
          <span style={{ fontWeight: 700, fontSize: 12, color: '#6B7280' }}>Universidad de Manizales · Proyecto de grado</span>
        </div>
        </div>
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
