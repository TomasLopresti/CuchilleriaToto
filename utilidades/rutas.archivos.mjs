import path from 'node:path'

// Carpeta donde se guardan las imágenes subidas. En Railway esto apunta a un
// Volume persistente (ej. RUTA_ARCHIVOS=/data/archivos) para que las fotos
// sobrevivan a los redeploys. En local, sin la variable, usa ./archivos como siempre.
export const CARPETA_ARCHIVOS = path.resolve(process.env.RUTA_ARCHIVOS || 'archivos')
