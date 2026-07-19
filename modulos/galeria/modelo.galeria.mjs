import pool from "../../utilidades/conexion.bd.mjs";
import { adjuntarImagenesExtra } from "../../utilidades/modelo.imagenes.mjs";

export async function obtenerTodos() {
    try {
        const resultado = await pool.query('SELECT * FROM galeria ORDER BY id')
        const rows = await adjuntarImagenesExtra('galeria', resultado.rows)
        return { rows }
    } catch (error) {
        console.error('Error al obtener la galería:', error.message)
        throw error
    }
}

export async function obtenerPorId(id) {
    try {
        const resultado = await pool.query('SELECT * FROM galeria WHERE id = $1', [id])
        const rows = await adjuntarImagenesExtra('galeria', resultado.rows)
        return { rows }
    } catch (error) {
        console.error('Error al obtener la foto:', error.message)
        throw error
    }
}

export async function crearUno(datos) {
    const { nombre, imagen } = datos
    try {
        const resultado = await pool.query(
            `INSERT INTO galeria (nombre, imagen) VALUES ($1, $2) RETURNING *`,
            [nombre, imagen]
        )
        return resultado
    } catch (error) {
        console.error('Error al crear la foto:', error.message)
        throw error
    }
}

export async function actualizarUno(id, datos) {
    const { nombre, imagen } = datos
    try {
        const resultado = await pool.query(
            `UPDATE galeria SET nombre = $1, imagen = $2 WHERE id = $3 RETURNING *`,
            [nombre, imagen, id]
        )
        return resultado
    } catch (error) {
        console.error('Error al actualizar la foto:', error.message)
        throw error
    }
}

export async function eliminarUno(id) {
    try {
        const resultado = await pool.query('DELETE FROM galeria WHERE id = $1 RETURNING *', [id])
        return resultado
    } catch (error) {
        console.error('Error al eliminar la foto:', error.message)
        throw error
    }
}