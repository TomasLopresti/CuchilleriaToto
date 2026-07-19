import { Router } from "express";
import * as controlador from './controlador.productos.mjs'
import { verificarAcceso } from '../autenticacion/controlador.aut.mjs'

const rutasProductos = new Router()

rutasProductos.get('/api/v1/productos', verificarAcceso, controlador.obtenerCatalogo)
rutasProductos.get('/api/v1/productos/:id', verificarAcceso, controlador.obtenerProductoPorId)
rutasProductos.delete('/api/v1/productos/:id', verificarAcceso, controlador.eliminarUno)
rutasProductos.post('/api/v1/productos', verificarAcceso, controlador.crearProducto)
rutasProductos.put('/api/v1/productos/:id', verificarAcceso, controlador.actualizarProducto)
rutasProductos.post('/api/v1/productos/:id/imagenes', verificarAcceso, controlador.agregarImagenes)
rutasProductos.delete('/api/v1/productos/:id/imagenes/:imagenId', verificarAcceso, controlador.eliminarImagenExtra)

export default rutasProductos