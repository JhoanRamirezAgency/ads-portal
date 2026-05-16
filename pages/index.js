import { useSession, signIn, signOut } from "next-auth/react"
import { useState, useRef } from "react"
import Head from "next/head"

const PHASES = {
  Alcance: {
    color: "#1D6AE5",
    bg: "#EBF1FD",
    desc: "Estilo de vida, videos con rostro (Taylor & Jeff), contenido aspiracional",
    examples: ["Videos lifestyle", "Cara de fundadores", "Ambiente y marca personal", "Contenido aspiracional"],
    copyNote: "Para alcance los copys deben despertar curiosidad e identificación. No vendas el producto directamente — vende el estilo de vida.",
    copyTituloEx: "Así se ve vivir diferente",
    copyDescEx: "Cada espacio cuenta una historia. ¿Cuál es la tuya?",
    copyBotonEx: "Descubrir más",
  },
  Consideracion: {
    color: "#B07D1A",
    bg: "#FDF3DC",
    desc: "Unboxing, contenido UGC, testimonios, reviews, behind the scenes",
    examples: ["Unboxing del producto", "Testimonios de clientes", "Videos UGC (usuarios reales)", "Behind the scenes"],
    copyNote: "Para consideración los copys deben generar confianza y credibilidad. Usa prueba social, resultados reales y beneficios concretos.",
    copyTituloEx: "Lo que dicen nuestros clientes",
    copyDescEx: "Más de 500 personas ya transformaron su espacio. ¿Eres el próximo?",
    copyBotonEx: "Ver testimonios",
  },
  Conversion: {
    color: "#2A7A3B",
    bg: "#E8F5EB",
    desc: "Foto de producto, ecommerce, bodegón, catálogo, precio y oferta",
    examples: ["Foto producto sobre fondo blanco", "Bodegón / Flat lay", "Catálogo con precio", "Oferta o promoción"],
    copyNote: "Para conversión los copys deben ser directos y urgentes. Muestra precio, beneficio claro y elimina objeciones. El usuario ya te conoce.",
    copyTituloEx: "Envío gratis hoy",
    copyDescEx: "Solo quedan 12 unidades. Ordena ahora y recíbelo en 48 horas.",
    copyBotonEx: "Comprar ahora",
  },
}

const TABS = ["guia", "medidas", "fases", "proceso", "subir"]
const TAB_LABELS = { guia: "Guía", medidas: "Medidas", fases: "Fases del embudo", proceso: "Proceso", subir: "Subir contenido" }

export default function Home() {
  const { data: session, status } = useSession()
  const [tab, setTab] = useState("guia")
  const [phase, setPhase] = useState("")
  const [brand, setBrand] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [notes, setNotes] = useState("")
  const [copyTitulo, setCopyTitulo] = useState("")
  const [copyDescripcion, setCopyDescripcion] = useState("")
  const [copyBoton, setCopyBoton] = useState("")
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const fileRef = useRef()

  const phaseData = PHASES[phase]

  function addFiles(e) {
    const newFiles = Array.from(e.target.files)
    setFiles(prev => [...prev, ...newFiles])
  }

  function removeFile(i) {
    setFiles(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit() {
    if (!brand || !phase || !clientEmail || files.length === 0) return
    setLoading(true)
    setError("")
    setResult(null)

    const fd = new FormData()
    fd.append("brand", brand)
    fd.append("phase", phase)
    fd.append("clientEmail", clientEmail)
    fd.append("notes", notes)
    fd.append("copyTitulo", copyTitulo)
    fd.append("copyDescripcion", copyDescripcion)
    fd.append("copyBoton", copyBoton)
    files.forEach(f => fd.append("files", f))

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al subir")
      setResult(data)
      setFiles([])
      setCopyTitulo("")
      setCopyDescripcion("")
      setCopyBoton("")
      setNotes("")
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  const canSubmit = brand && phase && clientEmail && files.length > 0 && !loading

  if (status === "loading") return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ width: 32, height: 32, border: "3px solid #eee", borderTopColor: "#1a1a1a", borderRadius: "50%" }}></div>
    </div>
  )

  return (
    <>
      <Head>
        <title>Portal de Anuncios — JhoanRamirez Agency</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #F7F6F2; color: #1a1a1a; min-height: 100vh; }
        input, textarea, select { font-family: 'DM Sans', sans-serif; }
        a { color: inherit; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .card { background: #fff; border-radius: 16px; border: 1px solid #ECEAE2; padding: 24px; margin-bottom: 16px; animation: fadeIn 0.2s ease; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .tag { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 12px; background: #F0EFE8; color: #555; margin: 2px; }
        input[type=text], input[type=email], textarea {
          width: 100%; padding: 11px 14px; border: 1px solid #DDD; border-radius: 10px;
          font-size: 14px; background: #FAFAF7; color: #1a1a1a; outline: none; transition: border 0.15s;
        }
        input[type=text]:focus, input[type=email]:focus, textarea:focus { border-color: #1a1a1a; background: #fff; }
        textarea { resize: vertical; min-height: 70px; }
        label { font-size: 13px; color: #666; display: block; margin-bottom: 6px; }
        .phase-btn {
          padding: 10px 18px; border-radius: 10px; border: 1.5px solid #DDD;
          font-size: 13px; font-weight: 500; cursor: pointer; background: #fff; transition: all 0.15s; color: #555;
        }
        .submit-btn {
          width: 100%; padding: 14px; border-radius: 12px; border: none;
          background: #1a1a1a; color: #fff; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: opacity 0.15s; font-family: 'DM Sans', sans-serif;
        }
        .submit-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .submit-btn:not(:disabled):hover { opacity: 0.85; }
        .nav-tab {
          padding: 8px 16px; border-radius: 8px; border: none; background: transparent;
          font-size: 13px; font-weight: 500; cursor: pointer; color: #888; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif; white-space: nowrap;
        }
        .nav-tab.active { background: #1a1a1a; color: #fff; }
        .file-item {
          display: flex; align-items: center; gap: 10px; padding: 10px 14px;
          background: #F7F6F2; border-radius: 10px; margin-bottom: 8px; font-size: 13px;
        }
        .copy-box { background: #F7F6F2; border-radius: 10px; padding: 14px; margin-bottom: 10px; border-left: 3px solid; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #ECEAE2", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Portal de Anuncios</div>
            <div style={{ fontSize: 12, color: "#999" }}>JhoanRamirez Agency</div>
          </div>
          {session ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{session.user.name}</div>
                <div style={{ fontSize: 11, color: "#999" }}>{session.user.email}</div>
              </div>
              <button onClick={() => signOut()} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #DDD", background: "transparent", fontSize: 12, cursor: "pointer", color: "#666" }}>
                Salir
              </button>
            </div>
          ) : (
            <button onClick={() => signIn("google")} style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: "#1a1a1a", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              Conectar con Google
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "24px 20px" }}>

        {!session ? (
          <div className="card" style={{ textAlign: "center", padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📁</div>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Bienvenido al portal</div>
            <div style={{ fontSize: 14, color: "#888", marginBottom: 24, maxWidth: 380, margin: "0 auto 24px" }}>
              Conecta tu cuenta de Google para subir contenido directamente a Drive y recibir notificaciones.
            </div>
            <button onClick={() => signIn("google")} style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: "#1a1a1a", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              Conectar con Google →
            </button>
          </div>
        ) : (
          <>
            {/* Nav */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
              {TABS.map(t => (
                <button key={t} className={`nav-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>

            {/* GUIA */}
            {tab === "guia" && (
              <>
                <div className="card">
                  <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>¿Cómo funciona este portal?</div>
                  <div style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>
                    Aquí puedes entregarnos todo lo que necesitamos para correr tus anuncios: piezas gráficas, videos y copys organizados por fase del embudo. Todo se sube directo a Drive y nos llega una notificación.
                  </div>
                </div>
                {[
                  { icon: "🖼️", title: "Piezas gráficas", desc: "Imágenes y videos en las medidas correctas, organizados según la fase del embudo (alcance, consideración o conversión)." },
                  { icon: "✍️", title: "Copys de los anuncios", desc: "Por cada pieza necesitamos 3 textos: título, descripción y botón CTA. Los copys cambian según la fase — no es lo mismo alcance que conversión." },
                  { icon: "✅", title: "Revisión y aprobación total", desc: "Nada sale al aire sin que tú lo hayas aprobado. Te pasamos todo para revisión antes de publicar, hasta el mínimo detalle." },
                  { icon: "📂", title: "Drive automático", desc: "Al subir aquí, se crea automáticamente una carpeta en Drive con el nombre de tu marca, fecha y fase. Se comparte contigo al instante." },
                ].map((item, i) => (
                  <div key={i} className="card" style={{ display: "flex", gap: 16 }}>
                    <div style={{ fontSize: 28, minWidth: 36 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* MEDIDAS */}
            {tab === "medidas" && (
              <>
                <div className="card">
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Formatos requeridos</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {/* Cuadrado */}
                    <div style={{ border: "1px solid #ECEAE2", borderRadius: 12, padding: 20, textAlign: "center" }}>
                      <div style={{ width: 80, height: 80, border: "2px solid #DDD", borderRadius: 8, margin: "0 auto 14px", background: "#F7F6F2" }} />
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>Cuadrado</div>
                      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "DM Mono", margin: "6px 0" }}>1080×1080</div>
                      <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>Feed de Instagram y Facebook</div>
                      <span className="badge" style={{ background: "#EBF1FD", color: "#1D6AE5" }}>Imagen</span>
                    </div>
                    {/* Historia */}
                    <div style={{ border: "1px solid #ECEAE2", borderRadius: 12, padding: 20, textAlign: "center" }}>
                      <div style={{ width: 50, height: 89, border: "2px solid #DDD", borderRadius: 6, margin: "0 auto 14px", background: "#F7F6F2" }} />
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>Historia / Reel</div>
                      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "DM Mono", margin: "6px 0" }}>1080×1920</div>
                      <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>Stories, Reels, TikTok</div>
                      <span className="badge" style={{ background: "#EBF1FD", color: "#1D6AE5", marginRight: 4 }}>Imagen</span>
                      <span className="badge" style={{ background: "#FDF3DC", color: "#B07D1A" }}>Video</span>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontWeight: 600, marginBottom: 12 }}>Resumen de formatos</div>
                  <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #ECEAE2" }}>
                        <th style={{ textAlign: "left", padding: "8px 0", color: "#888", fontWeight: 500 }}>Formato</th>
                        <th style={{ textAlign: "left", padding: "8px 0", color: "#888", fontWeight: 500 }}>Medida</th>
                        <th style={{ textAlign: "left", padding: "8px 0", color: "#888", fontWeight: 500 }}>Tipo</th>
                        <th style={{ textAlign: "left", padding: "8px 0", color: "#888", fontWeight: 500 }}>Uso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Cuadrado", "1080 × 1080", "Imagen", "Feed Instagram / Facebook"],
                        ["Vertical", "1080 × 1920", "Imagen", "Stories Instagram / Facebook"],
                        ["Vertical", "1080 × 1920", "Video", "Reels / Stories / TikTok"],
                      ].map(([f, m, t, u], i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #F0EFE8" }}>
                          <td style={{ padding: "10px 0" }}>{f}</td>
                          <td style={{ padding: "10px 0", fontFamily: "DM Mono", fontSize: 12 }}>{m}</td>
                          <td style={{ padding: "10px 0" }}><span className="badge" style={{ background: t === "Video" ? "#FDF3DC" : "#EBF1FD", color: t === "Video" ? "#B07D1A" : "#1D6AE5" }}>{t}</span></td>
                          <td style={{ padding: "10px 0", color: "#888" }}>{u}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card" style={{ background: "#FFFBF0", border: "1px solid #F0E0A0" }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>💡 Recomendación</div>
                  <div style={{ fontSize: 14, color: "#7A5C00", lineHeight: 1.7 }}>
                    Para la fase de <strong>alcance</strong>, los videos y fotos que mejor funcionan son los que muestran las caras de los fundadores (Taylor y Jeff). El reconocimiento de marca personal es el gancho más fuerte para el público que ya los sigue.
                  </div>
                </div>
              </>
            )}

            {/* FASES */}
            {tab === "fases" && (
              <>
                <div className="card">
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Fases del embudo de ventas</div>
                  <div style={{ fontSize: 14, color: "#888", lineHeight: 1.6 }}>
                    Cada tipo de contenido tiene un propósito específico dentro del proceso de compra. Los copys también cambian según la fase — no puedes usar el mismo mensaje para quien te acaba de conocer y para quien ya está listo para comprar.
                  </div>
                </div>
                {Object.entries(PHASES).map(([name, p]) => (
                  <div key={name} className="card">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <span className="badge" style={{ background: p.bg, color: p.color, fontSize: 13 }}>{name}</span>
                      <div style={{ fontSize: 14, color: "#666" }}>{p.desc}</div>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 12, color: "#999", marginBottom: 6, fontWeight: 500 }}>TIPOS DE CONTENIDO</div>
                      <div>{p.examples.map((e, i) => <span key={i} className="tag">{e}</span>)}</div>
                    </div>
                    <div className="copy-box" style={{ borderLeftColor: p.color, background: p.bg + "80" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: p.color, marginBottom: 8 }}>📝 COPYS PARA {name.toUpperCase()}</div>
                      <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 10 }}>{p.copyNote}</div>
                      <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Ejemplo:</div>
                      <div style={{ fontSize: 13, display: "grid", gap: 4 }}>
                        <div><strong>Título:</strong> "{p.copyTituloEx}"</div>
                        <div><strong>Descripción:</strong> "{p.copyDescEx}"</div>
                        <div><strong>Botón:</strong> "{p.copyBotonEx}"</div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* PROCESO */}
            {tab === "proceso" && (
              <>
                <div className="card">
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Proceso de inicio de campañas</div>
                  <div style={{ fontSize: 14, color: "#888", lineHeight: 1.6 }}>Si estás comenzando con anuncios pagos, esto es lo que debes saber para tener expectativas reales desde el primer día.</div>
                </div>
                <div className="card">
                  <div style={{ fontWeight: 600, marginBottom: 14 }}>Tiempos de aprendizaje por plataforma</div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {[
                      { platform: "Meta Ads", time: "Día 7", color: "#1D6AE5", bg: "#EBF1FD", desc: "El algoritmo entra en fase de aprendizaje desde el día 1. A partir del día 7 comienza a optimizar de verdad." },
                      { platform: "Google Ads", time: "Semana 2", color: "#B07D1A", bg: "#FDF3DC", desc: "Similar proceso, pero la optimización real comienza a partir de la segunda semana de campaña activa." },
                    ].map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 16, background: item.bg, borderRadius: 12 }}>
                        <div style={{ textAlign: "center", minWidth: 70 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: item.color }}>{item.platform}</div>
                          <div style={{ fontSize: 22, fontWeight: 700, color: item.color, margin: "4px 0" }}>{item.time}</div>
                        </div>
                        <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, paddingTop: 2 }}>{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontWeight: 600, marginBottom: 16 }}>Proyección mes a mes</div>
                  {[
                    { mes: "Mes 1", titulo: "Fase de testeo", color: "#1D6AE5", bg: "#EBF1FD", desc: "Probamos creatividades, audiencias y copys. El algoritmo está aprendiendo. No se garantizan ventas — es inversión en datos e información." },
                    { mes: "Mes 2", titulo: "Primeras ventas", color: "#B07D1A", bg: "#FDF3DC", desc: "Con los datos del mes anterior empieza a haber resultados. Hay ventas, pero no prometemos una cantidad específica. Seguimos optimizando." },
                    { mes: "Mes 3", titulo: "Análisis y escala", color: "#2A7A3B", bg: "#E8F5EB", desc: "Analizamos todo lo aprendido, hacemos proyecciones reales y comenzamos a escalar las campañas que mejor funcionaron." },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 0, marginBottom: i < 2 ? 0 : 0 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 16 }}>
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: item.color, marginTop: 4, minHeight: 12 }} />
                        {i < 2 && <div style={{ width: 1, flex: 1, background: "#ECEAE2", margin: "4px 0" }} />}
                      </div>
                      <div style={{ paddingBottom: i < 2 ? 20 : 0 }}>
                        <div style={{ fontSize: 12, color: "#999", marginBottom: 2 }}>{item.mes}</div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.titulo}</div>
                        <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card" style={{ background: "#F0EFE8", border: "none" }}>
                  <div style={{ fontSize: 14, color: "#555", lineHeight: 1.7 }}>
                    🚀 La publicidad digital es un proceso de optimización constante. Los mejores resultados vienen de la consistencia y la paciencia, no de la inmediatez. Estamos contigo en cada paso.
                  </div>
                </div>
              </>
            )}

            {/* SUBIR */}
            {tab === "subir" && (
              <>
                {result ? (
                  <div className="card" style={{ textAlign: "center", padding: 40 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                    <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
                      {result.isNewBrand ? "¡Nueva marca creada!" : "¡Contenido subido!"}
                    </div>
                    <div style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>
                      <strong>{result.brand}</strong> / {result.phase} / {result.date}
                    </div>
                    <div style={{ fontSize: 13, color: "#aaa", marginBottom: 24 }}>
                      {result.filesUploaded} archivo(s) subidos · Notificación enviada a hi@jhoanramirez.com · Drive compartido con el cliente
                    </div>
                    <a href={result.folderLink} target="_blank" rel="noreferrer" style={{ display: "inline-block", padding: "11px 24px", background: "#1a1a1a", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: "none", marginBottom: 16 }}>
                      Ver carpeta en Drive →
                    </a>
                    <br />
                    <button onClick={() => setResult(null)} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #DDD", background: "transparent", fontSize: 13, cursor: "pointer", color: "#666" }}>
                      Subir más contenido
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="card">
                      <div style={{ fontWeight: 600, marginBottom: 16 }}>Información de la marca</div>
                      <div style={{ marginBottom: 14 }}>
                        <label>Nombre de la marca *</label>
                        <input type="text" placeholder="Ej: Good Park NYC" value={brand} onChange={e => setBrand(e.target.value)} />
                      </div>
                      <div>
                        <label>Tu correo electrónico * (para compartirte el Drive)</label>
                        <input type="email" placeholder="tucorreo@gmail.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
                        <div style={{ fontSize: 12, color: "#aaa", marginTop: 5 }}>La carpeta en Drive se compartirá automáticamente con este correo.</div>
                      </div>
                    </div>

                    <div className="card">
                      <div style={{ fontWeight: 600, marginBottom: 14 }}>Fase del embudo *</div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {Object.entries(PHASES).map(([name, p]) => (
                          <button
                            key={name}
                            className="phase-btn"
                            onClick={() => setPhase(name)}
                            style={phase === name ? { background: p.bg, color: p.color, borderColor: p.color } : {}}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                      {phaseData && (
                        <div style={{ marginTop: 14, padding: 14, background: phaseData.bg, borderRadius: 10, fontSize: 13, color: "#555", lineHeight: 1.6 }}>
                          <strong style={{ color: phaseData.color }}>{phase}:</strong> {phaseData.desc}
                        </div>
                      )}
                    </div>

                    {phaseData && (
                      <div className="card">
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>Copys del anuncio</div>
                        <div style={{ fontSize: 13, color: "#888", marginBottom: 14, lineHeight: 1.6 }}>{phaseData.copyNote}</div>
                        <div style={{ marginBottom: 12 }}>
                          <label>Título del anuncio <span style={{ color: "#bbb" }}>(máx. 40 caracteres)</span></label>
                          <input type="text" placeholder={`Ej: "${phaseData.copyTituloEx}"`} value={copyTitulo} onChange={e => setCopyTitulo(e.target.value)} maxLength={40} />
                          <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>{copyTitulo.length}/40</div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <label>Descripción / Texto principal</label>
                          <textarea placeholder={`Ej: "${phaseData.copyDescEx}"`} value={copyDescripcion} onChange={e => setCopyDescripcion(e.target.value)} />
                        </div>
                        <div>
                          <label>Botón CTA</label>
                          <input type="text" placeholder={`Ej: "${phaseData.copyBotonEx}"`} value={copyBoton} onChange={e => setCopyBoton(e.target.value)} />
                        </div>
                      </div>
                    )}

                    <div className="card">
                      <div style={{ fontWeight: 600, marginBottom: 14 }}>Archivos *</div>
                      <div
                        onClick={() => fileRef.current.click()}
                        style={{ border: "2px dashed #DDD", borderRadius: 12, padding: "32px 20px", textAlign: "center", cursor: "pointer", background: "#FAFAF7", marginBottom: 12 }}
                        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#888" }}
                        onDragLeave={e => { e.currentTarget.style.borderColor = "#DDD" }}
                        onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#DDD"; setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]) }}
                      >
                        <div style={{ fontSize: 28, marginBottom: 8 }}>☁️</div>
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>Arrastra o haz clic para seleccionar</div>
                        <div style={{ fontSize: 12, color: "#aaa" }}>Imágenes y videos — múltiples archivos permitidos</div>
                      </div>
                      <input ref={fileRef} type="file" multiple style={{ display: "none" }} onChange={addFiles} accept="image/*,video/*" />
                      {files.map((f, i) => (
                        <div key={i} className="file-item">
                          <span>{f.type.startsWith("video") ? "🎬" : "🖼️"}</span>
                          <span style={{ flex: 1 }}>{f.name}</span>
                          <span style={{ color: "#aaa", fontSize: 12 }}>{f.size > 1048576 ? (f.size / 1048576).toFixed(1) + " MB" : (f.size / 1024).toFixed(0) + " KB"}</span>
                          <button onClick={() => removeFile(i)} style={{ border: "none", background: "none", cursor: "pointer", color: "#bbb", fontSize: 18 }}>×</button>
                        </div>
                      ))}
                    </div>

                    <div className="card">
                      <label>Notas adicionales (opcional)</label>
                      <textarea placeholder="Ej: Estos son los videos para la campaña de verano. El video 1 es para stories y el 2 para feed..." value={notes} onChange={e => setNotes(e.target.value)} />
                    </div>

                    {error && (
                      <div style={{ background: "#FEF0F0", border: "1px solid #FCC", borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13, color: "#C00" }}>
                        ⚠️ {error}
                      </div>
                    )}

                    <button className="submit-btn" disabled={!canSubmit} onClick={handleSubmit}>
                      {loading ? "Subiendo..." : "Enviar a Drive →"}
                    </button>
                    {loading && (
                      <div style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: "#888" }}>
                        Creando carpetas y subiendo archivos, un momento...
                      </div>
                    )}
                    <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "#bbb" }}>
                      Se creará la carpeta en Drive, se compartirá contigo y nos llegará una notificación a hi@jhoanramirez.com
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}
