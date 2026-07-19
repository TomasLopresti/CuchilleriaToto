import fs from 'node:fs'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import '../iniciar.env.mjs'
import pool from '../utilidades/conexion.bd.mjs'

async function recrear() {
    // Leemos el .sql y sacamos las líneas de psql (\c) que el cliente pg no entiende
    const sql = fs.readFileSync(path.resolve('./__docker-pg/cuchillos.sql'), 'utf8')
        .split('\n')
        .filter(linea => !linea.trim().startsWith('\\'))
        .join('\n')

    try {
        // Borramos las tablas si existen, para recrear de cero
        await pool.query('DROP TABLE IF EXISTS usuarios, galeria, productos, imagenes CASCADE')
        // Creamos tablas + datos de ejemplo desde el .sql
        await pool.query(sql)

        // Usuario admin por defecto, tomado del .env (ADMIN_USER / ADMIN_PASS)
        const usuario = process.env.ADMIN_USER
        const pass = process.env.ADMIN_PASS
        if (usuario && pass) {
            const hash = bcrypt.hashSync(pass, 12)
            await pool.query(
                `INSERT INTO usuarios (username, password_hash) VALUES ($1, $2)
                 ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
                [usuario, hash]
            )
            console.log(`✓ Base de datos recreada. Usuario administrador: ${usuario}`)
        } else {
            console.log('✓ Base de datos recreada. Definí ADMIN_USER/ADMIN_PASS y corré "npm run crear-admin" para crear el usuario administrador.')
        }
    } catch (error) {
        console.error('✗ Error al recrear la BD:', error.message)
        process.exitCode = 1
    } finally {
        await pool.end()
    }
}

recrear()