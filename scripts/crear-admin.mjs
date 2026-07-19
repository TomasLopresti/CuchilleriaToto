import bcrypt from 'bcryptjs'
import '../iniciar.env.mjs'
import pool from '../utilidades/conexion.bd.mjs'

async function crearAdmin() {
    const usuario = process.env.ADMIN_USER
    const pass = process.env.ADMIN_PASS

    if (!usuario || !pass) {
        console.error('✗ Definí ADMIN_USER y ADMIN_PASS en el .env antes de correr este script.')
        process.exitCode = 1
        return
    }
    if (pass.length < 12) {
        console.error('✗ ADMIN_PASS es muy corta. Usá al menos 12 caracteres.')
        process.exitCode = 1
        return
    }

    try {
        const hash = bcrypt.hashSync(pass, 12)
        await pool.query(
            `INSERT INTO usuarios (username, password_hash) VALUES ($1, $2)
             ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
            [usuario, hash]
        )
        console.log(`✓ Usuario administrador "${usuario}" creado/actualizado.`)
    } catch (error) {
        console.error('✗ Error al crear el admin:', error.message)
        process.exitCode = 1
    } finally {
        await pool.end()
    }
}

crearAdmin()
