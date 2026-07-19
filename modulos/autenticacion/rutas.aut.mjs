import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import * as controlador from './controlador.aut.mjs'

const rutasAuth = new Router()

// Frena intentos de fuerza bruta contra el login.
const limiteLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 8,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiados intentos. Probá de nuevo en unos minutos.' }
})

rutasAuth.post('/autenticar', limiteLogin, controlador.autenticar)
rutasAuth.get('/logout', controlador.logout)

export default rutasAuth