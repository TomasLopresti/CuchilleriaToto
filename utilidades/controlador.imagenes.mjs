import fs from 'node:fs/promises'
import path from 'node:path'
import * as modeloImagenes from './modelo.imagenes.mjs'
import { manejarSubidaMultiple, procesarYGuardarImagen } from './subida.imagenes.mjs'

const CARPETA_ARCHIVOS = path.resolve('archivos')

async function borrarArchivoSiExiste(nombre) {
    if (!nombre) return
    try { await fs.unlink(path.join(CARPETA_ARCHIVOS, nombre)) } catch { /* no existía, no pasa nada */ }
}

// Arma el handler POST /:id/imagenes para un tipo ('producto' | 'galeria').
// `obtenerPorId` es la función del modelo correspondiente, para validar que el item exista.
export function crearAgregarImagenes(tipo, obtenerPorId) {
    return function agregarImagenes(req, res) {
        manejarSubidaMultiple(req, res, async (error) => {
            if (error) {
                console.error(`Error de Multer al subir imágenes (${tipo}):`, error.message)
                return res.status(400).json({ error: 'Error al subir las imágenes' })
            }
            try {
                const item = await obtenerPorId(req.params.id)
                if (!item.rows[0]) {
                    res.statusCode = 404
                    return res.json({ error: 'No encontrado' })
                }
                const archivos = req.files || []
                if (!archivos.length) {
                    return res.status(400).json({ error: 'No se recibió ninguna imagen' })
                }
                const actuales = await modeloImagenes.contarImagenesDe(tipo, req.params.id)
                if (actuales + archivos.length > modeloImagenes.MAX_IMAGENES_EXTRA) {
                    return res.status(400).json({ error: `Máximo ${modeloImagenes.MAX_IMAGENES_EXTRA} fotos adicionales por pieza` })
                }

                const nombresArchivo = []
                for (const archivo of archivos) {
                    try {
                        nombresArchivo.push(await procesarYGuardarImagen(archivo))
                    } catch (e) {
                        console.error(`Error al procesar imagen (${tipo}):`, e.message)
                        return res.status(400).json({ error: 'No pudimos procesar alguna de las imágenes. Probá con otro archivo.' })
                    }
                }

                const filas = await modeloImagenes.agregarImagenes(tipo, req.params.id, nombresArchivo)
                res.statusCode = 201
                return res.json(filas)
            } catch (e) {
                console.error(`Error al agregar imágenes (${tipo}):`, e.message)
                res.statusCode = 500
                return res.json({ error: 'Error al agregar las imágenes' })
            }
        })
    }
}

// Arma el handler DELETE /:id/imagenes/:imagenId para un tipo.
export function crearEliminarImagen(tipo) {
    return async function eliminarImagen(req, res) {
        try {
            const fila = await modeloImagenes.eliminarImagen(tipo, req.params.imagenId)
            if (!fila) {
                res.statusCode = 404
                return res.json({ error: 'Imagen no encontrada' })
            }
            await borrarArchivoSiExiste(fila.archivo)
            return res.json({ mensaje: 'Imagen eliminada' })
        } catch (e) {
            console.error(`Error al eliminar imagen (${tipo}):`, e.message)
            res.statusCode = 500
            return res.json({ error: 'Error al eliminar la imagen' })
        }
    }
}

// Para usar al borrar un producto/foto entero: limpia sus imágenes extra (BD + disco).
export async function limpiarImagenesDe(tipo, itemId) {
    const filas = await modeloImagenes.eliminarImagenesDe(tipo, itemId)
    await Promise.all(filas.map(fila => borrarArchivoSiExiste(fila.archivo)))
}
