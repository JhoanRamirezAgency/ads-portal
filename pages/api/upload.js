import { getToken } from "next-auth/jwt"
import { google } from "googleapis"
import Busboy from "busboy"
import { Readable } from "stream"
import nodemailer from "nodemailer"

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

  if (res.data.files.length > 0) {
    return { id: res.data.files[0].id, isNew: false }
  }

  const meta = { name, mimeType: "application/vnd.google-apps.folder" }
  if (parentId) meta.parents = [parentId]
  else meta.parents = ["root"]

  const created = await drive.files.create({ requestBody: meta, fields: "id" })
  return { id: created.data.id, isNew: true }
}

async function shareFolder(drive, folderId, email) {
  await drive.permissions.create({
    fileId: folderId,
    requestBody: { role: "writer", type: "user", emailAddress: email },
    sendNotificationEmail: false,
  })
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.accessToken) return res.status(401).json({ error: "No autenticado" })

  try {
    const { fields, files } = await parseForm(req)
    const { brand, phase, clientEmail, notes, copyTitulo, copyDescripcion, copyBoton } = fields

    if (!brand || !phase || !clientEmail) {
      return res.status(400).json({ error: "Faltan campos requeridos" })
    }

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )
    auth.setCredentials({ access_token: token.accessToken, refresh_token: token.refreshToken })

    const drive = google.drive({ version: "v3", auth })

    const today = new Date().toISOString().slice(0, 10)

    // 1. Brand folder
    const brandResult = await getOrCreateFolder(drive, brand)
    const brandFolderId = brandResult.id
    const isNewBrand = brandResult.isNew

    // 2. Share brand folder with client
    try { await shareFolder(drive, brandFolderId, clientEmail) } catch (e) {}

    // 3. Date folder inside brand
    const dateResult = await getOrCreateFolder(drive, today, brandFolderId)
    const dateFolderId = dateResult.id

    // 4. Phase folder inside date
    const phaseResult = await getOrCreateFolder(drive, phase, dateFolderId)
    const phaseFolderId = phaseResult.id

    // 5. Upload files
    const uploadedFiles = []
    for (const file of files) {
      const { Readable } = await import("stream")
      const stream = Readable.from(file.buffer)
      const uploaded = await drive.files.create({
        requestBody: { name: file.name, parents: [phaseFolderId] },
        media: { mimeType: file.mimeType || "application/octet-stream", body: stream },
        fields: "id,name,webViewLink",
      })
      uploadedFiles.push(uploaded.data)
    }

    const folderLink = `https://drive.google.com/drive/folders/${phaseFolderId}`

    // 6. Send notification email to agency
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "hi@jhoanramirez.com",
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      },
    })

    const copySection = (copyTitulo || copyDescripcion || copyBoton)
      ? `\n📝 COPYS DEL CONTENIDO\n• Título: ${copyTitulo || "—"}\n• Descripción: ${copyDescripcion || "—"}\n• Botón CTA: ${copyBoton || "—"}`
      : ""

    const emailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <div style="background: #f5f5f0; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
    <h2 style="margin: 0 0 8px; font-size: 20px;">${isNewBrand ? "🆕 Nueva marca creada" : "📁 Nuevo contenido subido"}</h2>
    <p style="margin: 0; color: #666; font-size: 14px;">${new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" })}</p>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px; width: 130px;">Marca</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 600;">${brand}</td></tr>
    <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Fase</td><td style="padding: 10px 0; border-bottom: 1px solid #eee;">${phase}</td></tr>
    <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Email cliente</td><td style="padding: 10px 0; border-bottom: 1px solid #eee;">${clientEmail}</td></tr>
    <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Fecha</td><td style="padding: 10px 0; border-bottom: 1px solid #eee;">${today}</td></tr>
    <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Archivos</td><td style="padding: 10px 0; border-bottom: 1px solid #eee;">${files.length} archivo(s)</td></tr>
    ${notes ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Notas</td><td style="padding: 10px 0; border-bottom: 1px solid #eee;">${notes}</td></tr>` : ""}
  </table>

  ${(copyTitulo || copyDescripcion || copyBoton) ? `
  <div style="background: #fafaf7; border: 1px solid #e8e8e0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
    <p style="margin: 0 0 12px; font-weight: 600; font-size: 14px;">📝 Copys del anuncio</p>
    ${copyTitulo ? `<p style="margin: 0 0 8px; font-size: 13px;"><span style="color: #888;">Título:</span> ${copyTitulo}</p>` : ""}
    ${copyDescripcion ? `<p style="margin: 0 0 8px; font-size: 13px;"><span style="color: #888;">Descripción:</span> ${copyDescripcion}</p>` : ""}
    ${copyBoton ? `<p style="margin: 0; font-size: 13px;"><span style="color: #888;">Botón CTA:</span> ${copyBoton}</p>` : ""}
  </div>
  ` : ""}

  <a href="${folderLink}" style="display: inline-block; background: #1a1a1a; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500;">Ver en Google Drive →</a>

  <p style="margin-top: 24px; font-size: 12px; color: #aaa;">JhoanRamirez Agency · Portal de Anuncios</p>
</div>`

    await transporter.sendMail({
      from: "hi@jhoanramirez.com",
      to: "hi@jhoanramirez.com",
      subject: isNewBrand ? `🆕 Nueva marca: ${brand}` : `📁 Nuevo contenido: ${brand} / ${phase}`,
      html: emailHtml,
    })

    return res.status(200).json({
      success: true,
      isNewBrand,
      folderLink,
      filesUploaded: uploadedFiles.length,
      brand,
      phase,
      date: today,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
