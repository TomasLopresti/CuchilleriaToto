import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs/promises'
import crypto from 'node:crypto'
import sharp from 'sharp'
import convertirHeic from 'heic-convert'
import { CARPETA_ARCHIVOS } from './rutas.archivos.mjs'

const ANCHO_MAXIMO = 1600
const CALIDAD_JPEG = 82
const TAMANIO_MAXIMO_BYTES = 15 * 1024 * 1024 // 15MB

// Muchos navegadores no mandan un mimetype "image/*" para .heic/.heif (mandan
// application/octet-stream o directamente nada), así que además del mimetype
// aceptamos por extensión. La validación real pasa después, al intentar
// decodificar el archivo en procesarYGuardarImagen: si no es una imagen de
// verdad, falla ahí y se rechaza igual.
const EXTENSIONES_IMAGEN = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif', '.heic', '.heif', '.avif']

const subirArchivo = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: TAMANIO_MAXIMO_BYTES },
    fileFilter: (req, file, cb) => {
        const esImagenPorMime = file.mimetype.startsWith('image/')
        const esImagenPorExtension = EXTENSIONES_IMAGEN.includes(path.extname(file.originalname).toLowerCase())
        cb(null, esImagenPorMime || esImagenPorExtension)
    }
})

// Middleware para usar en las rutas: subirArchivo.single('archivo')
export const manejarSubida = subirArchivo.single('archivo')

// Middleware para subir varias fotos extra de una: subirArchivo.array('archivos', 8)
export const manejarSubidaMultiple = subirArchivo.array('archivos', 8)

function esHeic(file) {
    const nombre = file.originalname.toLowerCase()
    return file.mimetype === 'image/heic' || file.mimetype === 'image/heif'
        || nombre.endsWith('.heic') || nombre.endsWith('.heif')
}

// Recibe el archivo que dejó Multer en memoria (cualquier formato, incluido
// el HEIC/HEIF que sacan los iPhone), lo normaliza a JPEG liviano y lo
// guarda en /archivos. Devuelve el nombre de archivo generado.
export async function procesarYGuardarImagen(file) {
    let bufferOrigen = file.buffer
    if (esHeic(file)) {
        bufferOrigen = await convertirHeic({ buffer: bufferOrigen, format: 'JPEG', quality: 1 })
    }

    const bufferFinal = await sharp(bufferOrigen)
        .rotate() // respeta la orientación EXIF de las fotos de celular
        .resize({ width: ANCHO_MAXIMO, withoutEnlargement: true })
        .jpeg({ quality: CALIDAD_JPEG })
        .toBuffer()

    const nombreArchivo = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.jpg`
    await fs.mkdir(CARPETA_ARCHIVOS, { recursive: true })
    await fs.writeFile(path.join(CARPETA_ARCHIVOS, nombreArchivo), bufferFinal)
    return nombreArchivo
}
