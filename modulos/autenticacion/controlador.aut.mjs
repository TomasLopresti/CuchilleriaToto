import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import * as modelo from './modelo.aut.mjs'

const DURACION_SESION_MS = 30 * 60 * 1000 // 30 minutos de inactividad

function emitirCookieSesion(res, usuario) {
    const token = jwt.sign(
        { id: usuario.id, usuario: usuario.username },
        process.env.JWT_FIRMA,
        { expiresIn: DURACION_SESION_MS / 1000 }
    )
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        signed: true,
        maxAge: DURACION_SESION_MS
    })
}

export async function autenticar(req, res) {
    const { usuario, pass } = req.body
    if (!usuario || !pass) {
        return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' })
    }
    try {
        const resultado = await modelo.buscarPorUsername(usuario)
        const usuarioBD = resultado.rows[0]
        if (!usuarioBD) {
            return res.sendStatus(401)
        }

        const verificado = await bcrypt.compare(pass, usuarioBD.password_hash)
        if (!verificado) {
            return res.sendStatus(401)
        }

        emitirCookieSesion(res, usuarioBD)
        return res.redirect('/admin')
    } catch (error) {
        console.log(error)
        return res.sendStatus(500)
    }
}


export function logout(req, res) {
    res.clearCookie('token')
    return res.redirect('/login')
}


export function verificarAcceso(req, res, next) {
    const token = req.signedCookies['token']
    const esApi = req.originalUrl.startsWith('/api')

    if (!token) {
        return esApi
            ? res.status(401).json({ error: 'No autorizado. Iniciá sesión.' })
            : res.redirect('/login')
    }
    jwt.verify(token, process.env.JWT_FIRMA, (error, decoded) => {
        if (error) {
            return esApi
                ? res.status(401).json({ error: 'Sesión expirada. Volvé a iniciar sesión.' })
                : res.redirect('/login')
        }
        req.usuario = decoded
        // Sesión deslizante: cada request autenticado renueva el vencimiento,
        // así el timeout es por inactividad y no un límite fijo desde el login.
        emitirCookieSesion(res, { id: decoded.id, username: decoded.usuario })
        next()
    })
}
