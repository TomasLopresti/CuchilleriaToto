import { Router } from 'express'
import * as modeloProductos from '../productos/modelo.productos.mjs'
import * as modeloGaleria from '../galeria/modelo.galeria.mjs'

const rutasWeb = new Router()

// Catálogo: todos los productos
rutasWeb.get('/api/catalogo', async (req, res) => {
    try {
        const respuesta = await modeloProductos.obtenerCatalogo()
        res.json(respuesta.rows)
    } catch (e) {
        console.error('Error en /api/catalogo:', e.message)
        res.statusCode = 500
        res.json({ error: 'Error al obtener el catálogo' })
    }
})

// Galería: desde la tabla galeria
rutasWeb.get('/api/galeria', async (req, res) => {
    try {
        const respuesta = await modeloGaleria.obtenerTodos()
        res.json(respuesta.rows)
    } catch (e) {
        console.error('Error en /api/galeria:', e.message)
        res.statusCode = 500
        res.json({ error: 'Error al obtener la galería' })
    }
})

export default rutasWeb