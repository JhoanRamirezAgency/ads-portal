import { useSession, signIn, signOut } from "next-auth/react"
import { useState, useRef } from "react"
import Head from "next/head"

const PHASES = {
  Alcance: {
    color: "#1D6AE5", bg: "#EBF1FD",
    desc: "Estilo de vida, videos con rostro de la marca, contenido aspiracional",
    examples: ["Videos lifestyle", "Contenido aspiracional", "Ambiente y marca personal", "Videos de fundadores"],
    copyNote: "Para alcance los copys deben despertar curiosidad e identificación. No vendas el producto directamente — vende el estilo de vida.",
    copyTituloEx: "Así se ve vivir diferente",
    copyDescEx: "Cada espacio cuenta una historia. ¿Cuál es la tuya?",
    copyBotonEx: "Descubrir más",
  },
  Consideracion: {
    color: "#B07D1A", bg: "#FDF3DC",
    desc: "Unboxing, contenido UGC, testimonios, reviews, behind the scenes",
    examples: ["Unboxing del producto", "Testimonios de clientes", "Videos UGC (usuarios reales)", "Behind the scenes"],
    copyNote: "Para consideración los copys deben generar confianza y credibilidad. Usa prueba social, resultados reales y beneficios concretos.",
    copyTituloEx: "Lo que dicen nuestros clientes",
    copyDescEx: "Más de 500 personas ya lo tienen. ¿Eres el próximo?",
    copyBotonEx: "Ver testimonios",
  },
  Conversion: {
    color: "#2A7A3B", bg: "#E8F5EB",
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
const emptyCopy = () => ({ nombre: "", titulo: "", descripcion: "", boton: "" })

export default function Home() {
  const { data: session, status } = useSession()
  const [tab, setTab] = useState("guia")
  const [phase, setPhase] = useState("")
  const [brand, setBrand] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [notes, setNotes] = useState("")
  const [copys, setCopys] = useState([emptyCopy()])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState("")
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const fileRef = useRef()
  const phaseData = PHASES[phase]

  function addFiles(e) { setFiles(prev => [...prev, ...Array.from(e.target.files)]) }
  function removeFile(i) { setFiles(prev => prev.filter((_, idx) => idx !== i)) }
  function updateCopy(i, field, val) { setCopys(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c)) }
  function addCopy() { setCopys(prev => [...prev, emptyCopy()]) }
  function removeCopy(i) { setCopys(prev => prev.filter((_, idx) => idx !== i)) }

  function downloadWordDoc() {
    const rows = copys.map((c, i) => `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">${i+1}. ${c.nombre||"Sin nombre"}</td><td style="padding:8px;border:1px solid #ddd">${c.titulo}</td><td style="padding:8px;border:1px solid #ddd">${c.descripcion}</td><td style="padding:8px;border:1px solid #ddd">${c.boton}</td></tr>`).join("")
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>Copys ${brand}</title></head><body><h1 style="font-family:Arial">Copys de Anuncios — ${brand}</h1><p style="font-family:Arial;color:#666">Fase: ${phase} | Fecha: ${new Date().toLocaleDateString("es-CO")}</p><br/><table style="border-collapse:collapse;width:100%;font-family:Arial;font-size:13px"><tr style="background:#1a1a1a;color:white"><th style="padding:10px;border:1px solid #ddd;text-align:left">Nombre del anuncio</th><th style="padding:10px;border:1px solid #ddd;text-align:left">Título</th><th style="padding:10px;border:1px solid #ddd;text-align:left">Descripción</th><th style="padding:10px;border:1px solid #ddd;text-align:left">Botón CTA</th></tr>${rows}</table><br/>${notes?`<p style="font-family:Arial"><strong>Notas:</strong> ${notes}</p>`:""}</body></html>`
    const blob = new Blob(["\ufeff", html], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Copys_${brand}_${phase}_${new Date().toISOString().slice(0,10)}.doc`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleSubmit() {
    if (!brand || !phase || !clientEmail || files.length === 0) return
    setLoading(true); setError(""); setResult(null)
    try {
      setLoadingMsg("Creando carpetas en Drive...")
      const metaFd = new FormData()
      metaFd.append("brand", brand); metaFd.append("phase", phase)
      metaFd.append("clientEmail", clientEmail); metaFd.append("notes", notes)
      metaFd.append("copys", JSON.stringify(copys)); metaFd.append("metaOnly", "true")
      const metaRes = await fetch("/api/upload", { method: "POST", body: metaFd })
      const metaData = await metaRes.json()
      if (!metaRes.ok) throw new Error(metaData.error || "Error al crear carpetas")
      const { phaseFolderId, isNewBrand } = metaData

      let uploaded = 0
      for (const file of files) {
        setLoadingMsg(`Subiendo ${uploaded + 1} de ${files.length}: ${file.name}...`)
        const fileFd = new FormData()
        fileFd.append("file", file); fileFd.append("phaseFolderId", phaseFolderId); fileFd.append("fileOnly", "true")
        await fetch("/api/upload", { method: "POST", body: fileFd })
        uploaded++
      }

      setLoadingMsg("Enviando notificación...")
      const emailFd = new FormData()
      emailFd.append("brand", brand); emailFd.append("phase", phase)
      emailFd.append("clientEmail", clientEmail); emailFd.append("notes", notes)
      emailFd.append("copys", JSON.stringify(copys)); emailFd.append("filesCount", files.length.toString())
      emailFd.append("phaseFolderId", phaseFolderId); emailFd.append("isNewBrand", isNewBrand.toString())
      emailFd.append("emailOnly", "true")
      await fetch("/api/upload", { method: "POST", body: emailFd })

      setResult({ success: true, isNewBrand, folderLink: `https://drive.google.com/drive/folders/${phaseFolderId}`, filesUploaded: uploaded, brand, phase, date: new Date().toISOString().slice(0,10) })
      setFiles([]); setCopys([emptyCopy()]); setNotes("")
    } catch (e) { setError(e.message) }
    setLoading(false); setLoadingMsg("")
  }

  const canSubmit = brand && phase && clientEmail && files.length > 0 && !loading

  if (status === "loading") return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <div style={{ width:32, height:32, border:"3px solid #eee", borderTopColor:"#1a1a1a", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}></div>
    </div>
  )

  return (
    <>
      <Head>
        <title>Portal de Anuncios — JhoanRamirez Agency</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#F7F6F2;color:#1a1a1a;min-height:100vh}
        input,textarea{font-family:'DM Sans',sans-serif}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .card{background:#fff;border-radius:16px;border:1px solid #ECEAE2;padding:24px;margin-bottom:16px;animation:fadeIn 0.2s ease}
        .badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500}
        .tag{display:inline-block;padding:3px 10px;border-radius:6px;font-size:12px;background:#F0EFE8;color:#555;margin:2px}
        input[type=text],input[type=email],textarea{width:100%;padding:11px 14px;border:1px solid #DDD;border-radius:10px;font-size:14px;background:#FAFAF7;color:#1a1a1a;outline:none;transition:border 0.15s}
        input[type=text]:focus,input[type=email]:focus,textarea:focus{border-color:#1a1a1a;background:#fff}
        textarea{resize:vertical;min-height:70px}
        label{font-size:13px;color:#666;display:block;margin-bottom:6px}
        .phase-btn{padding:10px 18px;border-radius:10px;border:1.5px solid #DDD;font-size:13px;font-weight:500;cursor:pointer;background:#fff;transition:all 0.15s;color:#555}
        .submit-btn{width:100%;padding:14px;border-radius:12px;border:none;background:#1a1a1a;color:#fff;font-size:15px;font-weight:600;cursor:pointer;transition:opacity 0.15s;font-family:'DM Sans',sans-serif}
        .submit-btn:disabled{opacity:0.35;cursor:not-allowed}
        .submit-btn:not(:disabled):hover{opacity:0.85}
        .nav-tab{padding:8px 16px;border-radius:8px;border:none;background:transparent;font-size:13px;font-weight:500;cursor:pointer;color:#888;transition:all 0.15s;font-family:'DM Sans',sans-serif;white-space:nowrap}
        .nav-tab.active{background:#1a1a1a;color:#fff}
        .file-item{display:flex;align-items:center;gap:10px;padding:10px 14px;background:#F7F6F2;border-radius:10px;margin-bottom:8px;font-size:13px}
        .copy-block{border:1px solid #ECEAE2;border-radius:12px;padding:20px 16px 16px;margin-bottom:12px;background:#FAFAF7;position:relative}
        .copy-number{font-size:11px;font-weight:600;color:#aaa;margin-bottom:12px}
        .add-copy-btn{width:100%;padding:11px;border-radius:10px;border:1.5px dashed #DDD;background:transparent;font-size:13px;font-weight:500;cursor:pointer;color:#888;font-family:'DM Sans',sans-serif;transition:all 0.15s;margin-bottom:12px}
        .add-copy-btn:hover{border-color:#1a1a1a;color:#1a1a1a}
        .remove-copy-btn{position:absolute;top:12px;right:12px;border:none;background:none;cursor:pointer;color:#ccc;font-size:18px;line-height:1;padding:2px 6px;border-radius:4px}
        .remove-copy-btn:hover{color:#888;background:#F0EFE8}
        .word-btn{width:100%;padding:11px;border-radius:10px;border:1.5px solid #1a1a1a;background:transparent;font-size:13px;font-weight:500;cursor:pointer;color:#1a1a1a;font-family:'DM Sans',sans-serif;margin-bottom:4px;transition:all 0.15s}
        .word-btn:hover{background:#1a1a1a;color:#fff}
      `}</style>

      <div style={{ background:"#fff", borderBottom:"1px solid #ECEAE2", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:780, margin:"0 auto", padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:15, fontWeight:600 }}>Portal de Anuncios</div>
            <div style={{ fontSize:12, color:"#999" }}>JhoanRamirez Agency</div>
          </div>
          {session ? (
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:13, fontWeight:500 }}>{session.user.name}</div>
                <div style={{ fontSize:11, color:"#999" }}>{session.user.email}</div>
              </div>
              <button onClick={() => signOut()} style={{ padding:"7px 14px", borderRadius:8, border:"1px solid #DDD", background:"transparent", fontSize:12, cursor:"pointer", color:"#666" }}>Salir</button>
            </div>
          ) : (
            <button onClick={() => signIn("google")} style={{ padding:"9px 18px", borderRadius:10, border:"none", background:"#1a1a1a", color:"#fff", fontSize:13, fontWeight:500, cursor:"pointer" }}>Conectar con Google</button>
          )}
        </div>
      </div>

      <div style={{ maxWidth:780, margin:"0 auto", padding:"24px 20px" }}>
        {!session ? (
          <div className="card" style={{ textAlign:"center", padding:48 }}>
            <div style={{ fontSize:40, marginBottom:16 }}>📁</div>
            <div style={{ fontSize:20, fontWeight:600, marginBottom:8 }}>Bienvenido al portal</div>
            <div style={{ fontSize:14, color:"#888", marginBottom:24, maxWidth:380, margin:"0 auto 24px" }}>Conecta tu cuenta de Google para subir contenido directamente a Drive.</div>
            <button onClick={() => signIn("google")} style={{ padding:"12px 28px", borderRadius:12, border:"none", background:"#1a1a1a", color:"#fff", fontSize:15, fontWeight:600, cursor:"pointer" }}>Conectar con Google →</button>
          </div>
        ) : (
          <>
            <div style={{ display:"flex", gap:6, marginBottom:20, overflowX:"auto", paddingBottom:4 }}>
              {TABS.map(t => <button key={t} className={`nav-tab ${tab===t?"active":""}`} onClick={() => setTab(t)}>{TAB_LABELS[t]}</button>)}
            </div>

            {tab === "guia" && (
              <>
                <div className="card">
                  <div style={{ fontSize:20, fontWeight:600, marginBottom:8 }}>¿Cómo funciona este portal?</div>
                  <div style={{ fontSize:14, color:"#666", lineHeight:1.7 }}>Aquí puedes entregarnos todo lo que necesitamos para correr tus anuncios: piezas gráficas, videos y copys organizados por fase del embudo. Todo se sube directo a Drive y nos llega una notificación automática.</div>
                </div>
                {[
                  { icon:"🖼️", title:"Piezas gráficas", desc:"Imágenes y videos en las medidas correctas, organizados según la fase del embudo." },
                  { icon:"✍️", title:"Copys de los anuncios", desc:"Por cada anuncio necesitamos: nombre del anuncio, título, descripción y botón CTA. Puedes agregar tantos anuncios como necesites y descargarlos en Word." },
                  { icon:"✅", title:"Revisión y aprobación total", desc:"Nada sale al aire sin que tú lo hayas aprobado. Te pasamos todo para revisión antes de publicar, hasta el mínimo detalle." },
                  { icon:"📂", title:"Drive automático", desc:"Al subir aquí, se crea automáticamente una carpeta en Drive con el nombre de tu marca, fecha y fase. Se comparte contigo al instante." },
                ].map((item, i) => (
                  <div key={i} className="card" style={{ display:"flex", gap:16 }}>
                    <div style={{ fontSize:28, minWidth:36 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontWeight:600, marginBottom:4 }}>{item.title}</div>
                      <div style={{ fontSize:14, color:"#666", lineHeight:1.6 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {tab === "medidas" && (
              <>
                <div className="card">
                  <div style={{ fontSize:18, fontWeight:600, marginBottom:16 }}>Formatos requeridos</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                    <div style={{ border:"1px solid #ECEAE2", borderRadius:12, padding:20, textAlign:"center" }}>
                      <div style={{ width:80, height:80, border:"2px solid #DDD", borderRadius:8, margin:"0 auto 14px", background:"#F7F6F2" }} />
                      <div style={{ fontWeight:600, marginBottom:4 }}>Cuadrado</div>
                      <div style={{ fontSize:22, fontWeight:700, fontFamily:"DM Mono", margin:"6px 0" }}>1080×1080</div>
                      <div style={{ fontSize:12, color:"#888", marginBottom:10 }}>Feed de Instagram y Facebook</div>
                      <span className="badge" style={{ background:"#EBF1FD", color:"#1D6AE5" }}>Solo Imagen</span>
                    </div>
                    <div style={{ border:"1px solid #ECEAE2", borderRadius:12, padding:20, textAlign:"center" }}>
                      <div style={{ width:50, height:89, border:"2px solid #DDD", borderRadius:6, margin:"0 auto 14px", background:"#F7F6F2" }} />
                      <div style={{ fontWeight:600, marginBottom:4 }}>Historia / Reel</div>
                      <div style={{ fontSize:22, fontWeight:700, fontFamily:"DM Mono", margin:"6px 0" }}>1080×1920</div>
                      <div style={{ fontSize:12, color:"#888", marginBottom:10 }}>Stories, Reels, Videos</div>
                      <span className="badge" style={{ background:"#EBF1FD", color:"#1D6AE5", marginRight:4 }}>Imagen</span>
                      <span className="badge" style={{ background:"#FDF3DC", color:"#B07D1A" }}>Video</span>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontWeight:600, marginBottom:12 }}>Buenas prácticas</div>
                  {["Exporta en alta resolución (mínimo 72 DPI)","Videos: formato MP4, H.264","Imágenes: JPG o PNG sin texto excesivo","Nombra los archivos con el número del anuncio: Anuncio_01.jpg"].map((t,i) => (
                    <div key={i} style={{ fontSize:13, color:"#666", display:"flex", gap:8, marginBottom:8 }}><span style={{ color:"#2A7A3B" }}>✓</span>{t}</div>
                  ))}
                </div>
              </>
            )}

            {tab === "fases" && (
              <>
                <div className="card">
                  <div style={{ fontSize:18, fontWeight:600, marginBottom:6 }}>Fases del embudo de ventas</div>
                  <div style={{ fontSize:14, color:"#888", lineHeight:1.6 }}>Cada tipo de contenido tiene un propósito específico. Los copys también cambian según la fase — no es lo mismo alcance que conversión.</div>
                </div>
                {Object.entries(PHASES).map(([name, p]) => (
                  <div key={name} className="card">
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                      <span className="badge" style={{ background:p.bg, color:p.color, fontSize:13 }}>{name}</span>
                      <div style={{ fontSize:14, color:"#666" }}>{p.desc}</div>
                    </div>
                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontSize:12, color:"#999", marginBottom:6, fontWeight:500 }}>TIPOS DE CONTENIDO</div>
                      <div>{p.examples.map((e,i) => <span key={i} className="tag">{e}</span>)}</div>
                    </div>
                    <div style={{ background:p.bg+"80", borderLeft:`3px solid ${p.color}`, borderRadius:10, padding:14 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:p.color, marginBottom:8 }}>📝 COPYS PARA {name.toUpperCase()}</div>
                      <div style={{ fontSize:13, color:"#555", lineHeight:1.6, marginBottom:10 }}>{p.copyNote}</div>
                      <div style={{ fontSize:12, color:"#888", marginBottom:4 }}>Ejemplo:</div>
                      <div style={{ fontSize:13, display:"grid", gap:4 }}>
                        <div><strong>Título:</strong> "{p.copyTituloEx}"</div>
                        <div><strong>Descripción:</strong> "{p.copyDescEx}"</div>
                        <div><strong>Botón:</strong> "{p.copyBotonEx}"</div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {tab === "proceso" && (
              <>
                <div className="card">
                  <div style={{ fontSize:18, fontWeight:600, marginBottom:6 }}>Proceso de inicio de campañas</div>
                  <div style={{ fontSize:14, color:"#888", lineHeight:1.6 }}>Si estás comenzando con anuncios pagos, esto es lo que debes saber para tener expectativas reales.</div>
                </div>
                <div className="card">
                  <div style={{ fontWeight:600, marginBottom:14 }}>Tiempos de aprendizaje</div>
                  {[
                    { platform:"Meta Ads", time:"Día 7", color:"#1D6AE5", bg:"#EBF1FD", desc:"El algoritmo entra en fase de aprendizaje desde el día 1. A partir del día 7 comienza a optimizar de verdad." },
                    { platform:"Google Ads", time:"Semana 2", color:"#B07D1A", bg:"#FDF3DC", desc:"Similar proceso, pero la optimización real comienza a partir de la segunda semana de campaña activa." },
                  ].map((item,i) => (
                    <div key={i} style={{ display:"flex", gap:14, alignItems:"flex-start", padding:16, background:item.bg, borderRadius:12, marginBottom:10 }}>
                      <div style={{ textAlign:"center", minWidth:70 }}>
                        <div style={{ fontWeight:600, fontSize:13, color:item.color }}>{item.platform}</div>
                        <div style={{ fontSize:22, fontWeight:700, color:item.color, margin:"4px 0" }}>{item.time}</div>
                      </div>
                      <div style={{ fontSize:13, color:"#555", lineHeight:1.6, paddingTop:2 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div style={{ fontWeight:600, marginBottom:16 }}>Proyección mes a mes</div>
                  {[
                    { mes:"Mes 1", titulo:"Fase de testeo", color:"#1D6AE5", desc:"Probamos creatividades, audiencias y copys. El algoritmo está aprendiendo. No se garantizan ventas — es inversión en datos." },
                    { mes:"Mes 2", titulo:"Primeras ventas", color:"#B07D1A", desc:"Con los datos del mes anterior empieza a haber resultados. Hay ventas, pero no prometemos una cantidad específica." },
                    { mes:"Mes 3", titulo:"Análisis y escala", color:"#2A7A3B", desc:"Analizamos todo lo aprendido, hacemos proyecciones reales y comenzamos a escalar las campañas que mejor funcionaron." },
                  ].map((item,i) => (
                    <div key={i} style={{ display:"flex", gap:0 }}>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginRight:16 }}>
                        <div style={{ width:12, height:12, borderRadius:"50%", background:item.color, marginTop:4, minHeight:12 }} />
                        {i < 2 && <div style={{ width:1, flex:1, background:"#ECEAE2", margin:"4px 0" }} />}
                      </div>
                      <div style={{ paddingBottom: i < 2 ? 20 : 0 }}>
                        <div style={{ fontSize:12, color:"#999", marginBottom:2 }}>{item.mes}</div>
                        <div style={{ fontWeight:600, marginBottom:4 }}>{item.titulo}</div>
                        <div style={{ fontSize:13, color:"#666", lineHeight:1.6 }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "subir" && (
              <>
                {result ? (
                  <div className="card" style={{ textAlign:"center", padding:40 }}>
                    <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
                    <div style={{ fontSize:20, fontWeight:600, marginBottom:8 }}>{result.isNewBrand ? "¡Nueva marca creada!" : "¡Contenido subido!"}</div>
                    <div style={{ fontSize:14, color:"#888", marginBottom:6 }}><strong>{result.brand}</strong> / {result.phase} / {result.date}</div>
                    <div style={{ fontSize:13, color:"#aaa", marginBottom:24 }}>{result.filesUploaded} archivo(s) · Notificación enviada · Drive compartido</div>
                    <a href={result.folderLink} target="_blank" rel="noreferrer" style={{ display:"inline-block", padding:"11px 24px", background:"#1a1a1a", color:"#fff", borderRadius:10, fontSize:14, fontWeight:500, textDecoration:"none", marginBottom:16 }}>Ver carpeta en Drive →</a><br/>
                    <button onClick={() => setResult(null)} style={{ padding:"10px 20px", borderRadius:10, border:"1px solid #DDD", background:"transparent", fontSize:13, cursor:"pointer", color:"#666" }}>Subir más contenido</button>
                  </div>
                ) : (
                  <>
                    <div className="card">
                      <div style={{ fontWeight:600, marginBottom:16 }}>Información de la marca</div>
                      <div style={{ marginBottom:14 }}>
                        <label>Nombre de la marca *</label>
                        <input type="text" placeholder="Ej: Good Park NYC" value={brand} onChange={e => setBrand(e.target.value)} />
                      </div>
                      <div>
                        <label>Tu correo electrónico * (para compartirte el Drive)</label>
                        <input type="email" placeholder="tucorreo@gmail.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
                        <div style={{ fontSize:12, color:"#aaa", marginTop:5 }}>La carpeta en Drive se compartirá automáticamente con este correo.</div>
                      </div>
                    </div>

                    <div className="card">
                      <div style={{ fontWeight:600, marginBottom:14 }}>Fase del embudo *</div>
                      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                        {Object.entries(PHASES).map(([name, p]) => (
                          <button key={name} className="phase-btn" onClick={() => setPhase(name)} style={phase===name ? { background:p.bg, color:p.color, borderColor:p.color } : {}}>{name}</button>
                        ))}
                      </div>
                      {phaseData && <div style={{ marginTop:14, padding:14, background:phaseData.bg, borderRadius:10, fontSize:13, color:"#555", lineHeight:1.6 }}><strong style={{ color:phaseData.color }}>{phase}:</strong> {phaseData.desc}</div>}
                    </div>

                    <div className="card">
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                        <div style={{ fontWeight:600 }}>Copys de los anuncios</div>
                        <span style={{ fontSize:12, color:"#aaa" }}>{copys.length} anuncio(s)</span>
                      </div>
                      {phaseData && <div style={{ fontSize:13, color:"#888", marginBottom:16, lineHeight:1.6 }}>{phaseData.copyNote}</div>}

                      {copys.map((c, i) => (
                        <div key={i} className="copy-block">
                          <div className="copy-number">ANUNCIO {i+1}</div>
                          {copys.length > 1 && <button className="remove-copy-btn" onClick={() => removeCopy(i)}>×</button>}
                          <div style={{ display:"grid", gap:10 }}>
                            <div>
                              <label>Nombre del anuncio</label>
                              <input type="text" placeholder="Ej: Video lifestyle verano" value={c.nombre} onChange={e => updateCopy(i,"nombre",e.target.value)} />
                            </div>
                            <div>
                              <label>Título <span style={{ color:"#bbb" }}>(máx. 40 caracteres)</span></label>
                              <input type="text" placeholder={phaseData ? `Ej: "${phaseData.copyTituloEx}"` : "Título"} value={c.titulo} onChange={e => updateCopy(i,"titulo",e.target.value)} maxLength={40} />
                              <div style={{ fontSize:11, color:"#bbb", marginTop:3 }}>{c.titulo.length}/40</div>
                            </div>
                            <div>
                              <label>Descripción</label>
                              <textarea placeholder={phaseData ? `Ej: "${phaseData.copyDescEx}"` : "Texto principal"} value={c.descripcion} onChange={e => updateCopy(i,"descripcion",e.target.value)} style={{ minHeight:60 }} />
                            </div>
                            <div>
                              <label>Botón CTA</label>
                              <input type="text" placeholder={phaseData ? `Ej: "${phaseData.copyBotonEx}"` : "Ej: Comprar ahora"} value={c.boton} onChange={e => updateCopy(i,"boton",e.target.value)} />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button className="add-copy-btn" onClick={addCopy}>+ Agregar otro anuncio</button>
                      <button className="word-btn" onClick={downloadWordDoc}>📄 Descargar copys en Word (.doc)</button>
                    </div>

                    <div className="card">
                      <div style={{ fontWeight:600, marginBottom:14 }}>Archivos *</div>
                      <div onClick={() => fileRef.current.click()} style={{ border:"2px dashed #DDD", borderRadius:12, padding:"32px 20px", textAlign:"center", cursor:"pointer", background:"#FAFAF7", marginBottom:12 }}
                        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor="#888" }}
                        onDragLeave={e => { e.currentTarget.style.borderColor="#DDD" }}
                        onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor="#DDD"; setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]) }}>
                        <div style={{ fontSize:28, marginBottom:8 }}>☁️</div>
                        <div style={{ fontWeight:500, marginBottom:4 }}>Arrastra o haz clic para seleccionar</div>
                        <div style={{ fontSize:12, color:"#aaa" }}>Imágenes y videos — múltiples archivos permitidos</div>
                      </div>
                      <input ref={fileRef} type="file" multiple style={{ display:"none" }} onChange={addFiles} accept="image/*,video/*" />
                      {files.map((f,i) => (
                        <div key={i} className="file-item">
                          <span>{f.type.startsWith("video") ? "🎬" : "🖼️"}</span>
                          <span style={{ flex:1 }}>{f.name}</span>
                          <span style={{ color:"#aaa", fontSize:12 }}>{f.size > 1048576 ? (f.size/1048576).toFixed(1)+" MB" : (f.size/1024).toFixed(0)+" KB"}</span>
                          <button onClick={() => removeFile(i)} style={{ border:"none", background:"none", cursor:"pointer", color:"#bbb", fontSize:18 }}>×</button>
                        </div>
                      ))}
                    </div>

                    <div className="card">
                      <label>Notas adicionales (opcional)</label>
                      <textarea placeholder="Ej: El video 1 es para stories y el 2 para feed..." value={notes} onChange={e => setNotes(e.target.value)} />
                    </div>

                    {error && <div style={{ background:"#FEF0F0", border:"1px solid #FCC", borderRadius:10, padding:14, marginBottom:16, fontSize:13, color:"#C00" }}>⚠️ {error}</div>}

                    <button className="submit-btn" disabled={!canSubmit} onClick={handleSubmit}>
                      {loading ? loadingMsg || "Procesando..." : "Enviar a Drive →"}
                    </button>
                    {loading && <div style={{ textAlign:"center", marginTop:12, fontSize:13, color:"#888" }}>Los archivos grandes pueden tardar varios minutos. No cierres esta página.</div>}
                    <div style={{ textAlign:"center", marginTop:12, fontSize:12, color:"#bbb" }}>Se creará la carpeta en Drive, se compartirá contigo y nos llegará una notificación a hi@jhoanramirez.com</div>
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
