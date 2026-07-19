import * as modelo from './modelo.galeria.mjs'
import { manejarSubida as manejarArchivo, procesarYGuardarImagen } from '../../utilidades/subida.imagenes.mjs'
import { crearAgregarImagenes, crearEliminarImagen, limpiarImagenesDe } from '../../utilidades/controlador.imagenes.mjs'

export const agregarImagenes = crearAgregarImagenes('galeria', modelo.obtenerPorId)
export const eliminarImagenExtra = crearEliminarImagen('galeria')

export async function obtenerTodos(req, res) {
    try {
        const respuesta = await modelo.obtenerTodos()
        res.json(respuesta.rows)
    } catch (e) {
        console.error('Error en obtenerTodos (galeria):', e.message)
        res.statusCode = 500
        res.json({ error: 'Error al obtener la galería' })
    }
}

export async function obtenerPorId(req, res) {
    try {
        const respuesta = await modelo.obtenerPorId(req.params.id)
        const item = respuesta.rows[0]
        if (!item) {
            res.statusCode = 404
            return res.json({ error: 'Foto no encontrada' })
        }
        return res.json(item)
    } catch (e) {
        console.error('Error en obtenerPorId (galeria):', e.message)
        res.statusCode = 500
        return res.json({ error: 'Error al obtener la foto' })
    }
}

export async function crearUno(req, res) {
    manejarArchivo(req, res, async (error) => {
        if (error) {
            console.error('Error de Multer al subir archivo (galeria):', error.message)
            return res.status(400).json({ error: 'Error al subir el archivo' })
        }
        try {
            let nombreImagen = null
            if (req.file) {
                try {
                    nombreImagen = await procesarYGuardarImagen(req.file)
                } catch (e) {
                    console.error('Error al procesar imagen (galeria):', e.message)
                    return res.status(400).json({ error: 'No pudimos procesar esa imagen. Probá con otro archivo.' })
                }
            }
            const datos = {
                nombre: req.body.nombre,
                imagen: nombreImagen
            }
            if (!datos.nombre) {
                res.statusCode = 400
                return res.json({ error: 'El nombre es obligatorio' })
            }
            const respuesta = await modelo.crearUno(datos)
            res.statusCode = 201
            return res.json(respuesta.rows[0])
        } catch (e) {
            console.error('Error en crearUno (galeria):', e.message)
            res.statusCode = 500
            return res.json({ error: 'Error al crear la foto' })
        }
    })
}

export async function actualizarUno(req, res) {
    manejarArchivo(req, res, async (error) => {
        if (error) {
            console.error('Error de Multer al subir archivo (galeria):', error.message)
            return res.status(400).json({ error: 'Error al subir el archivo' })
        }
        try {
            const actual = await modelo.obtenerPorId(req.params.id)
            if (!actual.rows[0]) {
                res.statusCode = 404
                return res.json({ error: 'Foto no encontrada' })
            }
            let nombreImagen = actual.rows[0].imagen
            if (req.file) {
                try {
                    nombreImagen = await procesarYGuardarImagen(req.file)
                } catch (e) {
                    console.error('Error al procesar imagen (galeria):', e.message)
                    return res.status(400).json({ error: 'No pudimos procesar esa imagen. Probá con otro archivo.' })
                }
            }
            const datos = {
                nombre: req.body.nombre,
                imagen: nombreImagen
            }
            const respuesta = await modelo.actualizarUno(req.params.id, datos)
            return res.json(respuesta.rows[0])
        } catch (e) {
            console.error('Error en actualizarUno (galeria):', e.message)
            res.statusCode = 500
            return res.json({ error: 'Error al actualizar la foto' })
        }
    })
}

export async function eliminarUno(req, res) {
    try {
        await limpiarImagenesDe('galeria', req.params.id)
        const respuesta = await modelo.eliminarUno(req.params.id)
        if (!respuesta.rows[0]) {
            res.statusCode = 404
            return res.json({ error: 'Foto no encontrada' })
        }
        return res.json({ mensaje: 'Foto eliminada', item: respuesta.rows[0] })
    } catch (e) {
        console.error('Error en eliminarUno (galeria):', e.message)
        res.statusCode = 500
        return res.json({ error: 'Error al eliminar la foto' })
    }
}
