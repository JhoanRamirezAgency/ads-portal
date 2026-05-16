# Portal de Anuncios — JhoanRamirez Agency

App web para que los clientes suban contenido directamente a Google Drive organizado por marca, fecha y fase del embudo.

---

## Pasos para deployar

### 1. Crear credenciales de Google

1. Ve a https://console.cloud.google.com
2. Crea un proyecto nuevo (ej: "ads-portal")
3. Ve a "APIs y servicios" → "Biblioteca" y activa:
   - **Google Drive API**
   - **Gmail API**
4. Ve a "APIs y servicios" → "Credenciales" → "Crear credenciales" → **OAuth 2.0 Client ID**
5. Tipo de aplicación: **Aplicación web**
6. En "Orígenes autorizados de JavaScript" agrega:
   - `http://localhost:3000` (para desarrollo)
   - `https://tu-dominio.vercel.app` (para producción)
7. En "URIs de redireccionamiento autorizados" agrega:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://tu-dominio.vercel.app/api/auth/callback/google`
8. Guarda y copia el **Client ID** y **Client Secret**

### 2. Subir a GitHub

```bash
cd ads-portal
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/ads-portal.git
git push -u origin main
```

### 3. Deploy en Vercel

1. Ve a https://vercel.com → New Project → importa tu repo
2. En "Environment Variables" agrega:

| Variable | Valor |
|---|---|
| `GOOGLE_CLIENT_ID` | Tu Client ID de Google |
| `GOOGLE_CLIENT_SECRET` | Tu Client Secret de Google |
| `NEXTAUTH_SECRET` | Una clave aleatoria (genera en https://generate-secret.vercel.app/32) |
| `NEXTAUTH_URL` | `https://tu-dominio.vercel.app` |

3. Deploy → Vercel te da la URL final

### 4. Actualizar Google Console

Regresa a Google Console y agrega la URL de Vercel en los orígenes y redirects autorizados (paso 1, puntos 6 y 7).

---

## ¿Cómo funciona?

1. El cliente entra al portal y se conecta con su cuenta de Google
2. Llena: nombre de la marca, su correo, fase del embudo, copys y sube los archivos
3. Al enviar:
   - Se crea automáticamente en Drive: `Marca / Fecha / Fase`
   - Si la marca ya existe, solo agrega la carpeta nueva adentro
   - La carpeta se comparte con el correo del cliente
   - Se envía email a hi@jhoanramirez.com con todos los detalles

---

## Estructura de carpetas en Drive

```
📁 Good Park NYC
  📁 2026-05-17
    📁 Alcance
      🖼️ video-lifestyle.mp4
      🖼️ foto-taylor.jpg
  📁 2026-06-01
    📁 Conversion
      🖼️ producto-bodegon.jpg
```
