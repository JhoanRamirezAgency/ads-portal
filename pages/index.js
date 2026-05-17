import { useSession, signIn, signOut } from "next-auth/react"
import { useState, useRef, useEffect } from "react"
import Head from "next/head"

const T = {
  es: {
    portalTitle: "Portal de Anuncios",
    portalSub: "JhoanRamirez Agency",
    connectGoogle: "Conectar con Google",
    signOut: "Salir",
    welcomeTitle: "Bienvenido al portal",
    welcomeDesc: "Conecta tu cuenta de Google para subir contenido directamente a Drive y recibir notificaciones.",
    connectBtn: "Conectar con Google →",
    tabs: { guia: "Guía", medidas: "Medidas", fases: "Fases del embudo", proceso: "Proceso", subir: "Subir contenido" },
    guia: {
      title: "¿Cómo funciona este portal?",
      desc: "Aquí puedes entregarnos todo lo que necesitamos para correr tus anuncios: piezas gráficas, videos y copys organizados por fase del embudo. Todo se sube directo a Drive y nos llega una notificación automática.",
      items: [
        { icon: "🖼️", title: "Piezas gráficas", desc: "Imágenes y videos en las medidas correctas, organizados según la fase del embudo." },
        { icon: "✍️", title: "Copys de los anuncios", desc: "Por cada anuncio necesitamos: nombre del anuncio, título, descripción y botón CTA. Puedes agregar tantos como necesites y descargarlos en Word." },
        { icon: "✅", title: "Revisión y aprobación total", desc: "Nada sale al aire sin que tú lo hayas aprobado. Te pasamos todo para revisión antes de publicar, hasta el mínimo detalle." },
        { icon: "📂", title: "Drive automático", desc: "Al subir aquí, se crea automáticamente una carpeta en Drive con el nombre de tu marca, fecha y fase. Se comparte contigo al instante." },
      ],
    },
    medidas: {
      title: "Formatos requeridos",
      square: "Cuadrado", squareSub: "Feed de Instagram y Facebook", squareType: "Solo Imagen",
      story: "Historia / Reel", storySub: "Stories, Reels, Videos",
      practices: "Buenas prácticas",
      practicesList: ["Exporta en alta resolución (mínimo 72 DPI)", "Videos: formato MP4, H.264", "Imágenes: JPG o PNG sin texto excesivo", "Nombra los archivos con el número del anuncio: Anuncio_01.jpg"],
    },
    fases: {
      title: "Fases del embudo de ventas",
      desc: "Cada tipo de contenido tiene un propósito específico. Los copys también cambian según la fase.",
      contentTypes: "TIPOS DE CONTENIDO",
      example: "Ejemplo:",
    },
    proceso: {
      title: "Proceso de inicio de campañas",
      desc: "Si estás comenzando con anuncios pagos, esto es lo que debes saber para tener expectativas reales.",
      learningTitle: "Tiempos de aprendizaje",
      platforms: [
        { name: "Meta Ads", time: "Día 7", desc: "El algoritmo entra en fase de aprendizaje desde el día 1. A partir del día 7 comienza a optimizar de verdad." },
        { name: "Google Ads", time: "Semana 2", desc: "Similar proceso, pero la optimización real comienza a partir de la segunda semana de campaña activa." },
      ],
      projTitle: "Proyección mes a mes",
      months: [
        { mes: "Mes 1", titulo: "Fase de testeo", desc: "Probamos creatividades, audiencias y copys. El algoritmo está aprendiendo. No se garantizan ventas — es inversión en datos." },
        { mes: "Mes 2", titulo: "Primeras ventas", desc: "Con los datos del mes anterior empieza a haber resultados. Hay ventas, pero no prometemos una cantidad específica." },
        { mes: "Mes 3", titulo: "Análisis y escala", desc: "Analizamos todo lo aprendido, hacemos proyecciones reales y comenzamos a escalar las campañas que mejor funcionaron." },
      ],
    },
    subir: {
      brandTitle: "Información de la marca",
      brandLabel: "Nombre de la marca *",
      brandPlaceholder: "Ej: Good Park NYC",
      emailLabel: "Tu correo electrónico * (para compartirte el Drive)",
      emailPlaceholder: "tucorreo@gmail.com",
      emailNote: "La carpeta en Drive se compartirá automáticamente con este correo.",
      phaseTitle: "Fase del embudo *",
      copysTitle: "Copys de los anuncios",
      adLabel: "ANUNCIO",
      adName: "Nombre del anuncio",
      adNamePlaceholder: "Ej: Video lifestyle verano",
      adTitle: "Título",
      adTitleSub: "(máx. 40 caracteres)",
      adDesc: "Descripción",
      adBtn: "Botón CTA",
      addAd: "+ Agregar otro anuncio",
      downloadWord: "📄 Descargar copys en Word (.doc)",
      filesTitle: "Archivos *",
      filesDrop: "Arrastra o haz clic para seleccionar",
      filesSub: "Imágenes y videos — múltiples archivos permitidos",
      notesLabel: "Notas adicionales (opcional)",
      notesPlaceholder: "Ej: El video 1 es para stories y el 2 para feed...",
      sendBtn: "Enviar a Drive →",
      sendingBtn: "Procesando...",
      sendNote: "Se creará la carpeta en Drive, se compartirá contigo y nos llegará una notificación a hi@jhoanramirez.com",
      filesWarning: "Los archivos grandes pueden tardar varios minutos. No cierres esta página.",
      successNewBrand: "¡Nueva marca creada!",
      successUploaded: "¡Contenido subido!",
      successNote: "archivo(s) · Notificación enviada · Drive compartido",
      viewDrive: "Ver carpeta en Drive →",
      uploadMore: "Subir más contenido",
    },
    phases: {
      Alcance: { color: "#1D6AE5", bg: "#EBF1FD", desc: "Estilo de vida, videos con rostro de la marca, contenido aspiracional", examples: ["Videos lifestyle", "Contenido aspiracional", "Ambiente y marca personal", "Videos de fundadores"], copyNote: "Para alcance los copys deben despertar curiosidad e identificación. No vendas el producto — vende el estilo de vida.", copyTituloEx: "Así se ve vivir diferente", copyDescEx: "Cada espacio cuenta una historia. ¿Cuál es la tuya?", copyBotonEx: "Descubrir más" },
      Consideracion: { color: "#B07D1A", bg: "#FDF3DC", desc: "Unboxing, contenido UGC, testimonios, reviews, behind the scenes", examples: ["Unboxing del producto", "Testimonios de clientes", "Videos UGC (usuarios reales)", "Behind the scenes"], copyNote: "Los copys deben generar confianza. Usa prueba social y resultados reales.", copyTituloEx: "Lo que dicen nuestros clientes", copyDescEx: "Más de 500 personas ya lo tienen. ¿Eres el próximo?", copyBotonEx: "Ver testimonios" },
      Conversion: { color: "#2A7A3B", bg: "#E8F5EB", desc: "Foto de producto, ecommerce, bodegón, catálogo, precio y oferta", examples: ["Foto producto fondo blanco", "Bodegón / Flat lay", "Catálogo con precio", "Oferta o promoción"], copyNote: "Los copys deben ser directos y urgentes. Muestra precio y elimina objeciones.", copyTituloEx: "Envío gratis hoy", copyDescEx: "Solo quedan 12 unidades. Ordena ahora.", copyBotonEx: "Comprar ahora" },
    },
    phaseNames: ["Alcance", "Consideracion", "Conversion"],
    wordDoc: { title: "Copys de Anuncios", fase: "Fase", fecha: "Fecha", col1: "Nombre del anuncio", col2: "Título", col3: "Descripción", col4: "Botón CTA", notas: "Notas" },
  },
  en: {
    portalTitle: "Ads Portal",
    portalSub: "JhoanRamirez Agency",
    connectGoogle: "Connect with Google",
    signOut: "Sign out",
    welcomeTitle: "Welcome to the portal",
    welcomeDesc: "Connect your Google account to upload content directly to Drive and receive notifications.",
    connectBtn: "Connect with Google →",
    tabs: { guia: "Guide", medidas: "Sizes", fases: "Funnel Stages", proceso: "Process", subir: "Upload Content" },
    guia: {
      title: "How does this portal work?",
      desc: "Here you can deliver everything we need to run your ads: graphics, videos and ad copies organized by funnel stage. Everything goes straight to Drive and we get an automatic notification.",
      items: [
        { icon: "🖼️", title: "Creative assets", desc: "Images and videos in the correct dimensions, organized by funnel stage (awareness, consideration or conversion)." },
        { icon: "✍️", title: "Ad copies", desc: "For each ad we need: ad name, headline, description and CTA button. You can add as many ads as you need and download them as a Word file." },
        { icon: "✅", title: "Full review & approval", desc: "Nothing goes live without your approval. We send everything for your review before publishing, down to the smallest detail." },
        { icon: "📂", title: "Automatic Drive folder", desc: "When you upload here, a folder is automatically created in Drive with your brand name, date and stage. Shared with you instantly." },
      ],
    },
    medidas: {
      title: "Required formats",
      square: "Square", squareSub: "Instagram & Facebook Feed", squareType: "Image only",
      story: "Story / Reel", storySub: "Stories, Reels, Videos",
      practices: "Best practices",
      practicesList: ["Export in high resolution (minimum 72 DPI)", "Videos: MP4 format, H.264", "Images: JPG or PNG with minimal text overlay", "Name files with ad number: Ad_01.jpg"],
    },
    fases: {
      title: "Sales funnel stages",
      desc: "Each type of content has a specific purpose. Ad copies also change by stage.",
      contentTypes: "CONTENT TYPES",
      example: "Example:",
    },
    proceso: {
      title: "Campaign launch process",
      desc: "If you're starting with paid ads, here's what you need to know to set realistic expectations.",
      learningTitle: "Learning periods",
      platforms: [
        { name: "Meta Ads", time: "Day 7", desc: "The algorithm enters a learning phase from day 1. From day 7 onwards it starts optimizing properly." },
        { name: "Google Ads", time: "Week 2", desc: "Similar process, but real optimization begins from the second week of active campaign." },
      ],
      projTitle: "Month-by-month projection",
      months: [
        { mes: "Month 1", titulo: "Testing phase", desc: "We test creatives, audiences and copies. The algorithm is learning. No sales are guaranteed — it's an investment in data." },
        { mes: "Month 2", titulo: "First sales", desc: "With data from month 1 we start seeing results. There are sales, but we don't promise a specific number." },
        { mes: "Month 3", titulo: "Analysis & scale", desc: "We analyze everything learned, make real projections and begin scaling the best performing campaigns." },
      ],
    },
    subir: {
      brandTitle: "Brand information",
      brandLabel: "Brand name *",
      brandPlaceholder: "E.g: Good Park NYC",
      emailLabel: "Your email * (so we can share the Drive with you)",
      emailPlaceholder: "youremail@gmail.com",
      emailNote: "The Drive folder will be automatically shared with this email.",
      phaseTitle: "Funnel stage *",
      copysTitle: "Ad copies",
      adLabel: "AD",
      adName: "Ad name",
      adNamePlaceholder: "E.g: Summer lifestyle video",
      adTitle: "Headline",
      adTitleSub: "(max. 40 characters)",
      adDesc: "Description",
      adBtn: "CTA Button",
      addAd: "+ Add another ad",
      downloadWord: "📄 Download copies as Word (.doc)",
      filesTitle: "Files *",
      filesDrop: "Drag or click to select files",
      filesSub: "Images and videos — multiple files allowed",
      notesLabel: "Additional notes (optional)",
      notesPlaceholder: "E.g: Video 1 is for stories and video 2 for feed...",
      sendBtn: "Send to Drive →",
      sendingBtn: "Processing...",
      sendNote: "A Drive folder will be created, shared with you, and we'll receive a notification at hi@jhoanramirez.com",
      filesWarning: "Large files may take several minutes. Do not close this page.",
      successNewBrand: "New brand created!",
      successUploaded: "Content uploaded!",
      successNote: "file(s) · Notification sent · Drive shared",
      viewDrive: "View folder in Drive →",
      uploadMore: "Upload more content",
    },
    phases: {
      Alcance: { color: "#1D6AE5", bg: "#EBF1FD", desc: "Lifestyle content, brand face videos, aspirational content", examples: ["Lifestyle videos", "Aspirational content", "Brand environment", "Founder videos"], copyNote: "Awareness copies should spark curiosity. Don't sell the product — sell the lifestyle.", copyTituloEx: "This is what living differently looks like", copyDescEx: "Every space tells a story. What's yours?", copyBotonEx: "Discover more" },
      Consideracion: { color: "#B07D1A", bg: "#FDF3DC", desc: "Unboxing, UGC content, testimonials, reviews, behind the scenes", examples: ["Product unboxing", "Customer testimonials", "UGC videos (real users)", "Behind the scenes"], copyNote: "Consideration copies must build trust. Use social proof and real results.", copyTituloEx: "What our customers are saying", copyDescEx: "Over 500 people already have it. Are you next?", copyBotonEx: "See testimonials" },
      Conversion: { color: "#2A7A3B", bg: "#E8F5EB", desc: "Product photos, ecommerce, flat lay, catalog, price and offers", examples: ["White background product shot", "Flat lay / Bodegón", "Catalog with price", "Offer or promotion"], copyNote: "Conversion copies must be direct and urgent. Show price and remove objections.", copyTituloEx: "Free shipping today", copyDescEx: "Only 12 units left. Order now and receive it in 48 hours.", copyBotonEx: "Buy now" },
    },
    phaseNames: ["Alcance", "Consideracion", "Conversion"],
    wordDoc: { title: "Ad Copies", fase: "Stage", fecha: "Date", col1: "Ad name", col2: "Headline", col3: "Description", col4: "CTA Button", notas: "Notes" },
  },
}

const PHASE_COLORS = {
  Alcance: { color: "#1D6AE5", bg: "#EBF1FD" },
  Consideracion: { color: "#B07D1A", bg: "#FDF3DC" },
  Conversion: { color: "#2A7A3B", bg: "#E8F5EB" },
}

const emptyCopy = () => ({ nombre: "", titulo: "", descripcion: "", boton: "" })

export default function Home() {
  const { data: session, status } = useSession()
  const [lang, setLang] = useState("es")
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

  useEffect(() => {
    const browserLang = navigator.language || navigator.languages?.[0] || "es"
    setLang(browserLang.toLowerCase().startsWith("en") ? "en" : "es")
  }, [])

  const t = T[lang]
  const phaseData = phase ? { ...t.phases[phase], ...PHASE_COLORS[phase] } : null

  function addFiles(e) { setFiles(prev => [...prev, ...Array.from(e.target.files)]) }
  function removeFile(i) { setFiles(prev => prev.filter((_, idx) => idx !== i)) }
  function updateCopy(i, field, val) { setCopys(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c)) }
  function addCopy() { setCopys(prev => [...prev, emptyCopy()]) }
  function removeCopy(i) { setCopys(prev => prev.filter((_, idx) => idx !== i)) }

  function downloadWordDoc() {
    const rows = copys.map((c, i) => `<tr style="background:${i%2===0?"#fafaf7":"#fff"}"><td style="padding:8px;border:1px solid #ddd;font-weight:bold">${i+1}. ${c.nombre||"—"}</td><td style="padding:8px;border:1px solid #ddd">${c.titulo||"—"}</td><td style="padding:8px;border:1px solid #ddd">${c.descripcion||"—"}</td><td style="padding:8px;border:1px solid #ddd">${c.boton||"—"}</td></tr>`).join("")
    const wd = t.wordDoc
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><h1 style="font-family:Arial">${wd.title} — ${brand}</h1><p style="font-family:Arial;color:#666">${wd.fase}: ${phase} | ${wd.fecha}: ${new Date().toLocaleDateString()}</p><br/><table style="border-collapse:collapse;width:100%;font-family:Arial;font-size:13px"><tr style="background:#1a1a1a;color:white"><th style="padding:10px;border:1px solid #ddd;text-align:left">${wd.col1}</th><th style="padding:10px;border:1px solid #ddd;text-align:left">${wd.col2}</th><th style="padding:10px;border:1px solid #ddd;text-align:left">${wd.col3}</th><th style="padding:10px;border:1px solid #ddd;text-align:left">${wd.col4}</th></tr>${rows}</table><br/>${notes?`<p style="font-family:Arial"><strong>${wd.notas}:</strong> ${notes}</p>`:""}</body></html>`
    const blob = new Blob(["\ufeff", html], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${wd.title}_${brand}_${phase}_${new Date().toISOString().slice(0,10)}.doc`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleSubmit() {
    if (!brand || !phase || !clientEmail || files.length === 0) return
    setLoading(true); setError(""); setResult(null)
    try {
      setLoadingMsg(lang === "es" ? "Creando carpetas en Drive..." : "Creating folders in Drive...")
      const metaFd = new FormData()
      metaFd.append("brand", brand); metaFd.append("phase", phase)
      metaFd.append("clientEmail", clientEmail); metaFd.append("notes", notes)
      metaFd.append("copys", JSON.stringify(copys)); metaFd.append("metaOnly", "true")
      const metaRes = await fetch("/api/upload", { method: "POST", body: metaFd })
      const metaData = await metaRes.json()
      if (!metaRes.ok) throw new Error(metaData.error || "Error")
      const { phaseFolderId, isNewBrand } = metaData

      let uploaded = 0
      for (const file of files) {
        setLoadingMsg(lang === "es" ? `Subiendo ${uploaded+1} de ${files.length}: ${file.name}...` : `Uploading ${uploaded+1} of ${files.length}: ${file.name}...`)
        const fileFd = new FormData()
        fileFd.append("file", file); fileFd.append("phaseFolderId", phaseFolderId); fileFd.append("fileOnly", "true")
        await fetch("/api/upload", { method: "POST", body: fileFd })
        uploaded++
      }

      setLoadingMsg(lang === "es" ? "Enviando notificación..." : "Sending notification...")
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
        <title>{t.portalTitle} — JhoanRamirez Agency</title>
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
        .lang-btn{padding:5px 12px;border-radius:6px;border:1px solid #DDD;background:transparent;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500;transition:all 0.15s}
        .lang-btn.active{background:#1a1a1a;color:#fff;border-color:#1a1a1a}
      `}</style>

      <div style={{ background:"#fff", borderBottom:"1px solid #ECEAE2", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:780, margin:"0 auto", padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:15, fontWeight:600 }}>{t.portalTitle}</div>
            <div style={{ fontSize:12, color:"#999" }}>{t.portalSub}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ display:"flex", gap:4 }}>
              <button className={`lang-btn ${lang==="es"?"active":""}`} onClick={() => setLang("es")}>ES</button>
              <button className={`lang-btn ${lang==="en"?"active":""}`} onClick={() => setLang("en")}>EN</button>
            </div>
            {session ? (
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:13, fontWeight:500 }}>{session.user.name}</div>
                  <div style={{ fontSize:11, color:"#999" }}>{session.user.email}</div>
                </div>
                <button onClick={() => signOut()} style={{ padding:"7px 14px", borderRadius:8, border:"1px solid #DDD", background:"transparent", fontSize:12, cursor:"pointer", color:"#666" }}>{t.signOut}</button>
              </div>
            ) : (
              <button onClick={() => signIn("google")} style={{ padding:"9px 18px", borderRadius:10, border:"none", background:"#1a1a1a", color:"#fff", fontSize:13, fontWeight:500, cursor:"pointer" }}>{t.connectGoogle}</button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:780, margin:"0 auto", padding:"24px 20px" }}>
        {!session ? (
          <div className="card" style={{ textAlign:"center", padding:48 }}>
            <div style={{ fontSize:40, marginBottom:16 }}>📁</div>
            <div style={{ fontSize:20, fontWeight:600, marginBottom:8 }}>{t.welcomeTitle}</div>
            <div style={{ fontSize:14, color:"#888", marginBottom:24, maxWidth:380, margin:"0 auto 24px" }}>{t.welcomeDesc}</div>
            <button onClick={() => signIn("google")} style={{ padding:"12px 28px", borderRadius:12, border:"none", background:"#1a1a1a", color:"#fff", fontSize:15, fontWeight:600, cursor:"pointer" }}>{t.connectBtn}</button>
          </div>
        ) : (
          <>
            <div style={{ display:"flex", gap:6, marginBottom:20, overflowX:"auto", paddingBottom:4 }}>
              {["guia","medidas","fases","proceso","subir"].map(tb => (
                <button key={tb} className={`nav-tab ${tab===tb?"active":""}`} onClick={() => setTab(tb)}>{t.tabs[tb]}</button>
              ))}
            </div>

            {tab === "guia" && (
              <>
                <div className="card">
                  <div style={{ fontSize:20, fontWeight:600, marginBottom:8 }}>{t.guia.title}</div>
                  <div style={{ fontSize:14, color:"#666", lineHeight:1.7 }}>{t.guia.desc}</div>
                </div>
                {t.guia.items.map((item, i) => (
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
                  <div style={{ fontSize:18, fontWeight:600, marginBottom:16 }}>{t.medidas.title}</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                    <div style={{ border:"1px solid #ECEAE2", borderRadius:12, padding:20, textAlign:"center" }}>
                      <div style={{ width:80, height:80, border:"2px solid #DDD", borderRadius:8, margin:"0 auto 14px", background:"#F7F6F2" }} />
                      <div style={{ fontWeight:600, marginBottom:4 }}>{t.medidas.square}</div>
                      <div style={{ fontSize:22, fontWeight:700, fontFamily:"DM Mono", margin:"6px 0" }}>1080×1080</div>
                      <div style={{ fontSize:12, color:"#888", marginBottom:10 }}>{t.medidas.squareSub}</div>
                      <span className="badge" style={{ background:"#EBF1FD", color:"#1D6AE5" }}>{t.medidas.squareType}</span>
                    </div>
                    <div style={{ border:"1px solid #ECEAE2", borderRadius:12, padding:20, textAlign:"center" }}>
                      <div style={{ width:50, height:89, border:"2px solid #DDD", borderRadius:6, margin:"0 auto 14px", background:"#F7F6F2" }} />
                      <div style={{ fontWeight:600, marginBottom:4 }}>{t.medidas.story}</div>
                      <div style={{ fontSize:22, fontWeight:700, fontFamily:"DM Mono", margin:"6px 0" }}>1080×1920</div>
                      <div style={{ fontSize:12, color:"#888", marginBottom:10 }}>{t.medidas.storySub}</div>
                      <span className="badge" style={{ background:"#EBF1FD", color:"#1D6AE5", marginRight:4 }}>Image</span>
                      <span className="badge" style={{ background:"#FDF3DC", color:"#B07D1A" }}>Video</span>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontWeight:600, marginBottom:12 }}>{t.medidas.practices}</div>
                  {t.medidas.practicesList.map((tx, i) => (
                    <div key={i} style={{ fontSize:13, color:"#666", display:"flex", gap:8, marginBottom:8 }}><span style={{ color:"#2A7A3B" }}>✓</span>{tx}</div>
                  ))}
                </div>
              </>
            )}

            {tab === "fases" && (
              <>
                <div className="card">
                  <div style={{ fontSize:18, fontWeight:600, marginBottom:6 }}>{t.fases.title}</div>
                  <div style={{ fontSize:14, color:"#888", lineHeight:1.6 }}>{t.fases.desc}</div>
                </div>
                {t.phaseNames.map(name => {
                  const p = t.phases[name]
                  return (
                    <div key={name} className="card">
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                        <span className="badge" style={{ background:p.bg, color:p.color, fontSize:13 }}>{name}</span>
                        <div style={{ fontSize:14, color:"#666" }}>{p.desc}</div>
                      </div>
                      <div style={{ marginBottom:14 }}>
                        <div style={{ fontSize:12, color:"#999", marginBottom:6, fontWeight:500 }}>{t.fases.contentTypes}</div>
                        <div>{p.examples.map((e,i) => <span key={i} className="tag">{e}</span>)}</div>
                      </div>
                      <div style={{ background:p.bg+"80", borderLeft:`3px solid ${p.color}`, borderRadius:10, padding:14 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:p.color, marginBottom:8 }}>📝 {lang==="es"?"COPYS PARA":"COPIES FOR"} {name.toUpperCase()}</div>
                        <div style={{ fontSize:13, color:"#555", lineHeight:1.6, marginBottom:10 }}>{p.copyNote}</div>
                        <div style={{ fontSize:12, color:"#888", marginBottom:4 }}>{t.fases.example}</div>
                        <div style={{ fontSize:13, display:"grid", gap:4 }}>
                          <div><strong>{t.subir.adTitle}:</strong> "{p.copyTituloEx}"</div>
                          <div><strong>{t.subir.adDesc}:</strong> "{p.copyDescEx}"</div>
                          <div><strong>{t.subir.adBtn}:</strong> "{p.copyBotonEx}"</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </>
            )}

            {tab === "proceso" && (
              <>
                <div className="card">
                  <div style={{ fontSize:18, fontWeight:600, marginBottom:6 }}>{t.proceso.title}</div>
                  <div style={{ fontSize:14, color:"#888", lineHeight:1.6 }}>{t.proceso.desc}</div>
                </div>
                <div className="card">
                  <div style={{ fontWeight:600, marginBottom:14 }}>{t.proceso.learningTitle}</div>
                  {t.proceso.platforms.map((item,i) => (
                    <div key={i} style={{ display:"flex", gap:14, alignItems:"flex-start", padding:16, background:i===0?"#EBF1FD":"#FDF3DC", borderRadius:12, marginBottom:10 }}>
                      <div style={{ textAlign:"center", minWidth:70 }}>
                        <div style={{ fontWeight:600, fontSize:13, color:i===0?"#1D6AE5":"#B07D1A" }}>{item.name}</div>
                        <div style={{ fontSize:22, fontWeight:700, color:i===0?"#1D6AE5":"#B07D1A", margin:"4px 0" }}>{item.time}</div>
                      </div>
                      <div style={{ fontSize:13, color:"#555", lineHeight:1.6, paddingTop:2 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div style={{ fontWeight:600, marginBottom:16 }}>{t.proceso.projTitle}</div>
                  {t.proceso.months.map((item,i) => (
                    <div key={i} style={{ display:"flex" }}>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginRight:16 }}>
                        <div style={{ width:12, height:12, borderRadius:"50%", background:["#1D6AE5","#B07D1A","#2A7A3B"][i], marginTop:4, minHeight:12 }} />
                        {i<2 && <div style={{ width:1, flex:1, background:"#ECEAE2", margin:"4px 0" }} />}
                      </div>
                      <div style={{ paddingBottom:i<2?20:0 }}>
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
                    <div style={{ fontSize:20, fontWeight:600, marginBottom:8 }}>{result.isNewBrand ? t.subir.successNewBrand : t.subir.successUploaded}</div>
                    <div style={{ fontSize:14, color:"#888", marginBottom:6 }}><strong>{result.brand}</strong> / {result.phase} / {result.date}</div>
                    <div style={{ fontSize:13, color:"#aaa", marginBottom:24 }}>{result.filesUploaded} {t.subir.successNote}</div>
                    <a href={result.folderLink} target="_blank" rel="noreferrer" style={{ display:"inline-block", padding:"11px 24px", background:"#1a1a1a", color:"#fff", borderRadius:10, fontSize:14, fontWeight:500, textDecoration:"none", marginBottom:16 }}>{t.subir.viewDrive}</a><br/>
                    <button onClick={() => setResult(null)} style={{ padding:"10px 20px", borderRadius:10, border:"1px solid #DDD", background:"transparent", fontSize:13, cursor:"pointer", color:"#666" }}>{t.subir.uploadMore}</button>
                  </div>
                ) : (
                  <>
                    <div className="card">
                      <div style={{ fontWeight:600, marginBottom:16 }}>{t.subir.brandTitle}</div>
                      <div style={{ marginBottom:14 }}>
                        <label>{t.subir.brandLabel}</label>
                        <input type="text" placeholder={t.subir.brandPlaceholder} value={brand} onChange={e => setBrand(e.target.value)} />
                      </div>
                      <div>
                        <label>{t.subir.emailLabel}</label>
                        <input type="email" placeholder={t.subir.emailPlaceholder} value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
                        <div style={{ fontSize:12, color:"#aaa", marginTop:5 }}>{t.subir.emailNote}</div>
                      </div>
                    </div>

                    <div className="card">
                      <div style={{ fontWeight:600, marginBottom:14 }}>{t.subir.phaseTitle}</div>
                      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                        {t.phaseNames.map(name => {
                          const p = t.phases[name]
                          return <button key={name} className="phase-btn" onClick={() => setPhase(name)} style={phase===name?{ background:p.bg, color:p.color, borderColor:p.color }:{}}>{name}</button>
                        })}
                      </div>
                      {phaseData && <div style={{ marginTop:14, padding:14, background:phaseData.bg, borderRadius:10, fontSize:13, color:"#555", lineHeight:1.6 }}><strong style={{ color:phaseData.color }}>{phase}:</strong> {phaseData.desc}</div>}
                    </div>

                    <div className="card">
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                        <div style={{ fontWeight:600 }}>{t.subir.copysTitle}</div>
                        <span style={{ fontSize:12, color:"#aaa" }}>{copys.length} {lang==="es"?"anuncio(s)":"ad(s)"}</span>
                      </div>
                      {phaseData && <div style={{ fontSize:13, color:"#888", marginBottom:16, lineHeight:1.6 }}>{phaseData.copyNote}</div>}
                      {copys.map((c, i) => (
                        <div key={i} className="copy-block">
                          <div className="copy-number">{t.subir.adLabel} {i+1}</div>
                          {copys.length > 1 && <button className="remove-copy-btn" onClick={() => removeCopy(i)}>×</button>}
                          <div style={{ display:"grid", gap:10 }}>
                            <div>
                              <label>{t.subir.adName}</label>
                              <input type="text" placeholder={t.subir.adNamePlaceholder} value={c.nombre} onChange={e => updateCopy(i,"nombre",e.target.value)} />
                            </div>
                            <div>
                              <label>{t.subir.adTitle} <span style={{ color:"#bbb" }}>{t.subir.adTitleSub}</span></label>
                              <input type="text" placeholder={phaseData ? `${lang==="es"?"Ej":"E.g"}: "${phaseData.copyTituloEx}"` : ""} value={c.titulo} onChange={e => updateCopy(i,"titulo",e.target.value)} maxLength={40} />
                              <div style={{ fontSize:11, color:"#bbb", marginTop:3 }}>{c.titulo.length}/40</div>
                            </div>
                            <div>
                              <label>{t.subir.adDesc}</label>
                              <textarea placeholder={phaseData ? `${lang==="es"?"Ej":"E.g"}: "${phaseData.copyDescEx}"` : ""} value={c.descripcion} onChange={e => updateCopy(i,"descripcion",e.target.value)} style={{ minHeight:60 }} />
                            </div>
                            <div>
                              <label>{t.subir.adBtn}</label>
                              <input type="text" placeholder={phaseData ? `${lang==="es"?"Ej":"E.g"}: "${phaseData.copyBotonEx}"` : ""} value={c.boton} onChange={e => updateCopy(i,"boton",e.target.value)} />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button className="add-copy-btn" onClick={addCopy}>{t.subir.addAd}</button>
                      <button className="word-btn" onClick={downloadWordDoc}>{t.subir.downloadWord}</button>
                    </div>

                    <div className="card">
                      <div style={{ fontWeight:600, marginBottom:14 }}>{t.subir.filesTitle}</div>
                      <div onClick={() => fileRef.current.click()} style={{ border:"2px dashed #DDD", borderRadius:12, padding:"32px 20px", textAlign:"center", cursor:"pointer", background:"#FAFAF7", marginBottom:12 }}
                        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor="#888" }}
                        onDragLeave={e => { e.currentTarget.style.borderColor="#DDD" }}
                        onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor="#DDD"; setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]) }}>
                        <div style={{ fontSize:28, marginBottom:8 }}>☁️</div>
                        <div style={{ fontWeight:500, marginBottom:4 }}>{t.subir.filesDrop}</div>
                        <div style={{ fontSize:12, color:"#aaa" }}>{t.subir.filesSub}</div>
                      </div>
                      <input ref={fileRef} type="file" multiple style={{ display:"none" }} onChange={addFiles} accept="image/*,video/*" />
                      {files.map((f,i) => (
                        <div key={i} className="file-item">
                          <span>{f.type.startsWith("video")?"🎬":"🖼️"}</span>
                          <span style={{ flex:1 }}>{f.name}</span>
                          <span style={{ color:"#aaa", fontSize:12 }}>{f.size>1048576?(f.size/1048576).toFixed(1)+" MB":(f.size/1024).toFixed(0)+" KB"}</span>
                          <button onClick={() => removeFile(i)} style={{ border:"none", background:"none", cursor:"pointer", color:"#bbb", fontSize:18 }}>×</button>
                        </div>
                      ))}
                    </div>

                    <div className="card">
                      <label>{t.subir.notesLabel}</label>
                      <textarea placeholder={t.subir.notesPlaceholder} value={notes} onChange={e => setNotes(e.target.value)} />
                    </div>

                    {error && <div style={{ background:"#FEF0F0", border:"1px solid #FCC", borderRadius:10, padding:14, marginBottom:16, fontSize:13, color:"#C00" }}>⚠️ {error}</div>}

                    <button className="submit-btn" disabled={!canSubmit} onClick={handleSubmit}>
                      {loading ? loadingMsg || t.subir.sendingBtn : t.subir.sendBtn}
                    </button>
                    {loading && <div style={{ textAlign:"center", marginTop:12, fontSize:13, color:"#888" }}>{t.subir.filesWarning}</div>}
                    <div style={{ textAlign:"center", marginTop:12, fontSize:12, color:"#bbb" }}>{t.subir.sendNote}</div>
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
