import pool from "../../utilidades/conexion.bd.mjs";

// Buscar un usuario por su username
export async function buscarPorUsername(username) {
    try {
        const resultado = await pool.query(
            'SELECT * FROM usuarios WHERE username = $1',
            [username]
        )
        return resultado
    } catch (error) {
        console.error('Error al buscar el usuario:', error.message)
        throw error
    }
}