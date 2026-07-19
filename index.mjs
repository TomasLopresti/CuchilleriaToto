import express from 'express'
import path from 'node:path'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import './iniciar.env.mjs'
import rutasModuloProducto from './modulos/productos/rutas.productos.mjs'
import rutasModuloGaleria from './modulos/galeria/rutas.galeria.mjs'
import rutasWeb from './modulos/web/rutas.web.mjs'
import rutasAuth from './modulos/autenticacion/rutas.aut.mjs'
import { verificarAcceso } from './modulos/autenticacion/controlador.aut.mjs'

const PUERTO = process.env.PORT || process.env.PUERTO || 3000
const PRODUCCION = process.env.NODE_ENV === 'production'

const app = express()

// Si en producción el servidor queda detrás de un proxy (nginx, etc.) que
// termina el HTTPS, esto permite detectar correctamente conexiones seguras.
if (PRODUCCION) {
    app.set('trust proxy', 1)
    app.use((req, res, next) => {
        if (!req.secure) {
            return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`)
        }
        next()
    })
}

app.use(helmet({
    // HSTS solo tiene sentido (y solo lo respetan los navegadores) sobre HTTPS real.
    hsts: PRODUCCION,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'blob:'],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'self'"],
            // Solo forzar HTTPS en producción: en local el server habla HTTP puro.
            upgradeInsecureRequests: PRODUCCION ? [] : null
        }
    }
}))

// Límite general de peticiones por IP, para mitigar abuso/DoS básico.
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(process.env.COOKIE_FIRMA))

app.use(rutasAuth)

app.use(rutasModuloProducto)
app.use(rutasModuloGaleria)
app.use(rutasWeb)

app.get(['/admin', '/admin.html'], verificarAcceso, (req, res) => {
    res.sendFile(path.resolve('./frontend/admin.html'))
})

app.use('/login', express.static(path.resolve('./frontend/login')))

app.use(express.static(path.resolve('./frontend')))

app.use('/archivos', express.static(path.resolve('./archivos')))

app.listen(PUERTO, () => {
    console.log(`Servidor en http://localhost:${PUERTO}`)
})