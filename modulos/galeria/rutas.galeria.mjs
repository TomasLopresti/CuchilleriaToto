import { Router } from 'express'
import * as controlador from './controlador.galeria.mjs'
import { verificarAcceso } from '../autenticacion/controlador.aut.mjs'

const rutasGaleria = new Router()

rutasGaleria.get('/api/v1/galeria', verificarAcceso, controlador.obtenerTodos)
rutasGaleria.get('/api/v1/galeria/:id', verificarAcceso, controlador.obtenerPorId)
rutasGaleria.post('/api/v1/galeria', verificarAcceso, controlador.crearUno)
rutasGaleria.put('/api/v1/galeria/:id', verificarAcceso, controlador.actualizarUno)
rutasGaleria.delete('/api/v1/galeria/:id', verificarAcceso, controlador.eliminarUno)
rutasGaleria.post('/api/v1/galeria/:id/imagenes', verificarAcceso, controlador.agregarImagenes)
rutasGaleria.delete('/api/v1/galeria/:id/imagenes/:imagenId', verificarAcceso, controlador.eliminarImagenExtra)

export default rutasGaleria