import * as modelo from './modelo.productos.mjs'
import { manejarSubida as manejarArchivo, procesarYGuardarImagen } from '../../utilidades/subida.imagenes.mjs'
import { crearAgregarImagenes, crearEliminarImagen, limpiarImagenesDe } from '../../utilidades/controlador.imagenes.mjs'

export const agregarImagenes = crearAgregarImagenes('producto', modelo.obtenerProductoPorId)
export const eliminarImagenExtra = crearEliminarImagen('producto')

// LECTURA: todos
export async function obtenerCatalogo(req, res) {
    try {
        const respuesta = await modelo.obtenerCatalogo()
        res.json(respuesta.rows)
    } catch (e) {
        console.error('Error en obtenerCatalogo:', e.message)
        res.statusCode = 500
        res.json({ error: 'Error al obtener el catálogo' })
    }
}

// LECTURA: uno por id
export async function obtenerProductoPorId(req, res) {
    try {
        const respuesta = await modelo.obtenerProductoPorId(req.params.id)
        const producto = respuesta.rows[0]
        if (!producto) {
            res.statusCode = 404
            return res.json({ error: 'Producto no encontrado' })
        }
        return res.json(producto)
    } catch (e) {
        console.error('Error en obtenerProductoPorId:', e.message)
        res.statusCode = 500
        return res.json({ error: 'Error al obtener el producto' })
    }
}

// ALTA (con subida de imagen)
export async function crearProducto(req, res) {
    manejarArchivo(req, res, async (error) => {
        if (error) {
            console.error('Error de Multer al subir archivo (productos):', error.message)
            return res.status(400).json({ error: 'Error al subir el archivo' })
        }
        try {
            let nombreImagen = null
            if (req.file) {
                try {
                    nombreImagen = await procesarYGuardarImagen(req.file)
                } catch (e) {
                    console.error('Error al procesar imagen (productos):', e.message)
                    return res.status(400).json({ error: 'No pudimos procesar esa imagen. Probá con otro archivo.' })
                }
            }
            const datos = {
                nombre:   req.body.nombre,
                medidas:  req.body.medidas,
                material: req.body.material,
                cabo:     req.body.cabo,
                precio:   req.body.precio,
                imagen:   nombreImagen
            }
            if (!datos.nombre || !datos.precio) {
                res.statusCode = 400
                return res.json({ error: 'El nombre y el precio son obligatorios' })
            }
            const respuesta = await modelo.crearProducto(datos)
            res.statusCode = 201
            return res.json(respuesta.rows[0])
        } catch (e) {
            console.error('Error en crearProducto:', e.message)
            res.statusCode = 500
            return res.json({ error: 'Error al crear el producto' })
        }
    })
}

// MODIFICACIÓN (imagen opcional: si no suben una nueva, conserva la anterior)
export async function actualizarProducto(req, res) {
    manejarArchivo(req, res, async (error) => {
        if (error) {
            console.error('Error de Multer al subir archivo (productos):', error.message)
            return res.status(400).json({ error: 'Error al subir el archivo' })
        }
        try {
            const actual = await modelo.obtenerProductoPorId(req.params.id)
            if (!actual.rows[0]) {
                res.statusCode = 404
                return res.json({ error: 'Producto no encontrado' })
            }
            let nombreImagen = actual.rows[0].imagen
            if (req.file) {
                try {
                    nombreImagen = await procesarYGuardarImagen(req.file)
                } catch (e) {
                    console.error('Error al procesar imagen (productos):', e.message)
                    return res.status(400).json({ error: 'No pudimos procesar esa imagen. Probá con otro archivo.' })
                }
            }
            const datos = {
                nombre:   req.body.nombre,
                medidas:  req.body.medidas,
                material: req.body.material,
                cabo:     req.body.cabo,
                precio:   req.body.precio,
                imagen:   nombreImagen
            }
            const respuesta = await modelo.actualizarProducto(req.params.id, datos)
            return res.json(respuesta.rows[0])
        } catch (e) {
            console.error('Error en actualizarProducto:', e.message)
            res.statusCode = 500
            return res.json({ error: 'Error al actualizar el producto' })
        }
    })
}

// BAJA
export async function eliminarUno(req, res) {
    try {
        await limpiarImagenesDe('producto', req.params.id)
        const respuesta = await modelo.eliminarUno(req.params.id)
        if (!respuesta.rows[0]) {
            res.statusCode = 404
            return res.json({ error: 'Producto no encontrado' })
        }
        return res.json({ mensaje: 'Producto eliminado', producto: respuesta.rows[0] })
    } catch (e) {
        console.error('Error en eliminarUno (productos):', e.message)
        res.statusCode = 500
        return res.json({ error: 'Error al eliminar el producto' })
    }
}
