import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Curso } from '../api/types'
import { Cargando, ErrorCaja, Pagina, neon, useDatos } from '../components/ui'
import { useSesion } from '../auth'

export default function Cursos() {
  const { usuario } = useSesion()
  const { datos, error, cargando } = useDatos(() => api.get<Curso[]>('/cursos'))
  const nombre = usuario?.nombre.replace(/^Prof\.?\s*/i, '').split(' ')[0]

  return (
    <Pagina>
      <div>
        <h1 className="titulo">¡Hola{nombre ? `, ${nombre}` : ''}!</h1>
        <p className="sub" style={{ marginTop: 6 }}>Elige un curso para ver a tus estudiantes y abrirles una actividad.</p>
      </div>
      {cargando && <Cargando texto="Cargando tus cursos" />}
      <ErrorCaja error={error} />
      {datos && datos.length === 0 && <div className="aviso aviso-info">Aún no tienes cursos asignados. El administrador del colegio los crea y te los asigna.</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
        {datos?.map((c, i) => {
          const color = neon(i)
          return (
            <Link key={c.id} to={`/cursos/${c.id}`} className="card aparecer" style={{ textDecoration: 'none', color: 'inherit', overflow: 'hidden', display: 'flex', flexDirection: 'column', animationDelay: `${i * 60}ms` }}>
              <div style={{ background: color.fondo, borderBottom: `4px solid ${color.borde}`, color: color.texto, padding: '22px 22px 18px' }}>
                <div style={{ fontWeight: 900, fontSize: 40, letterSpacing: -1 }}>{c.nombre}</div>
                <div style={{ fontWeight: 900, fontSize: 14 }}>{c.institucion || 'Colegio'} · {c.anio}</div>
              </div>
              <div style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800 }}>{c.estudiantes} estudiantes</span>
                <span style={{ fontWeight: 900, color: 'var(--cobalto)' }}>Abrir →</span>
              </div>
            </Link>
          )
        })}
      </div>
    </Pagina>
  )
}
