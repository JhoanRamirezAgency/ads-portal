import { getToken } from "next-auth/jwt"
import { google } from "googleapis"
import Busboy from "busboy"

export const config = { api: { bodyParser: false } }

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers })
    const fields = {}
    const files = []
    bb.on("field", (name, val) => { fields[name] = val })
    bb.on("file", (name, stream, info) => {
      const chunks = []
      stream.on("data", d => chunks.push(d))
      stream.on("end", () => files.push({ name: info.filename, mimeType: info.mimeType, buffer: Buffer.concat(chunks) }))
    })
    bb.on("finish", () => resolve({ fields, files }))
    bb.on("error", reject)
    req.pipe(bb)
  })
}

async function getOrCreateFolder(drive, name, parentId = null) {
  const q = parentId
    ? `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
    : `name='${name}' and mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false`
  const res = await drive.files.list({ q, fields: "files(id,name)", spaces: "drive" })
  if (res.data.files.length > 0) return { id: res.data.files[0].id, isNew: false }
  const meta = { name, mimeType: "application/vnd.google-apps.folder", parents: parentId ? [parentId] : ["root"] }
  const created = await drive.files.create({ requestBody: meta, fields: "id" })
  return { id: created.data.id, isNew: true }
}

async function shareFolder(drive, folderId, email) {
  try {
    await drive.permissions.create({
      fileId: folderId,
      requestBody: { role: "writer", type: "user", emailAddress: email },
      sendNotificationEmail: false,
    })
  } catch (e) { console.log("Share error (non-fatal):", e.message) }
}

function makeEmailBody({ to, from, subject, html }) {
  const msg = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    html,
  ].join("\n")
  return Buffer.from(msg).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function getAuth(token) {
  const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)
  auth.setCredentials({ access_token: token.accessToken, refresh_token: token.refreshToken })
  return auth
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.accessToken) return res.status(401).json({ error: "No autenticado" })

  try {
    const { fields, files } = await parseForm(req)
    const auth = getAuth(token)
    const drive = google.drive({ version: "v3", auth })

    // --- FILE ONLY (upload single file to existing folder) ---
    if (fields.fileOnly === "true") {
      const file = files[0]
      if (!file || !fields.phaseFolderId) return res.status(400).json({ error: "Missing file or folder" })
      const { Readable } = await import("stream")
      const stream = Readable.from(file.buffer)
      await drive.files.create({
        requestBody: { name: file.name, parents: [fields.phaseFolderId] },
        media: { mimeType: file.mimeType || "application/octet-stream", body: stream },
        fields: "id",
      })
      return res.status(200).json({ success: true })
    }

    // --- EMAIL ONLY ---
    if (fields.emailOnly === "true") {
      const { brand, phase, clientEmail, notes, phaseFolderId, isNewBrand, filesCount } = fields
      const copys = fields.copys ? JSON.parse(fields.copys) : []
      const folderLink = `https://drive.google.com/drive/folders/${phaseFolderId}`
      const today = new Date().toLocaleDateString("es-CO", { timeZone: "America/Bogota" })

      const copysRows = copys.map((c, i) => `
        <tr style="background:${i%2===0?"#fafaf7":"#fff"}">
          <td style="padding:10px;border:1px solid #eee;font-weight:600">${i+1}. ${c.nombre||"Sin nombre"}</td>
          <td style="padding:10px;border:1px solid #eee">${c.titulo||"—"}</td>
          <td style="padding:10px;border:1px solid #eee">${c.descripcion||"—"}</td>
          <td style="padding:10px;border:1px solid #eee">${c.boton||"—"}</td>
        </tr>`).join("")

      const emailHtml = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a">
  <div style="background:#f5f5f0;border-radius:12px;padding:24px;margin-bottom:20px">
    <h2 style="margin:0 0 8px;font-size:20px">${isNewBrand==="true"?"🆕 Nueva marca creada":"📁 Nuevo contenido subido"}</h2>
    <p style="margin:0;color:#666;font-size:14px">${today}</p>
  </div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
    <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:13px;width:130px">Marca</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${brand}</td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:13px">Fase</td><td style="padding:10px 0;border-bottom:1px solid #eee">${phase}</td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:13px">Cliente</td><td style="padding:10px 0;border-bottom:1px solid #eee">${clientEmail}</td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:13px">Archivos</td><td style="padding:10px 0;border-bottom:1px solid #eee">${filesCount}</td></tr>
    ${notes?`<tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:13px">Notas</td><td style="padding:10px 0;border-bottom:1px solid #eee">${notes}</td></tr>`:""}
  </table>
  ${copys.length > 0 ? `
  <div style="margin-bottom:20px">
    <p style="font-weight:600;font-size:14px;margin-bottom:12px">📝 Copys de los anuncios</p>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <tr style="background:#1a1a1a;color:white">
        <th style="padding:10px;border:1px solid #eee;text-align:left">Anuncio</th>
        <th style="padding:10px;border:1px solid #eee;text-align:left">Título</th>
        <th style="padding:10px;border:1px solid #eee;text-align:left">Descripción</th>
        <th style="padding:10px;border:1px solid #eee;text-align:left">Botón</th>
      </tr>
      ${copysRows}
    </table>
  </div>` : ""}
  <a href="${folderLink}" style="display:inline-block;background:#1a1a1a;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500">Ver en Google Drive →</a>
  <p style="margin-top:24px;font-size:12px;color:#aaa">JhoanRamirez Agency · Portal de Anuncios</p>
</div>`

      const gmail = google.gmail({ version: "v1", auth })
      const raw = makeEmailBody({
        to: "hi@jhoanramirez.com",
        from: token.email || "hi@jhoanramirez.com",
        subject: isNewBrand === "true" ? `🆕 Nueva marca: ${brand}` : `📁 Nuevo contenido: ${brand} / ${phase}`,
        html: emailHtml,
      })
      await gmail.users.messages.send({ userId: "me", requestBody: { raw } })
      return res.status(200).json({ success: true })
    }

    // --- META ONLY (create folders, share, return folder IDs) ---
    if (fields.metaOnly === "true") {
      const { brand, phase, clientEmail } = fields
      if (!brand || !phase || !clientEmail) return res.status(400).json({ error: "Faltan campos" })
      const today = new Date().toISOString().slice(0, 10)

      const brandResult = await getOrCreateFolder(drive, brand)
      await shareFolder(drive, brandResult.id, clientEmail)
      const dateResult = await getOrCreateFolder(drive, today, brandResult.id)
      const phaseResult = await getOrCreateFolder(drive, phase, dateResult.id)

      return res.status(200).json({
        success: true,
        brandFolderId: brandResult.id,
        dateFolderId: dateResult.id,
        phaseFolderId: phaseResult.id,
        isNewBrand: brandResult.isNew,
      })
    }

    return res.status(400).json({ error: "Invalid request type" })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
