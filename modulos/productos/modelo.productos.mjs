import pool from "../../utilidades/conexion.bd.mjs";
import { adjuntarImagenesExtra } from "../../utilidades/modelo.imagenes.mjs";

// LECTURA: todos
export async function obtenerCatalogo() {
    try {
        const resultado = await pool.query('SELECT * FROM productos ORDER BY id')
        const rows = await adjuntarImagenesExtra('producto', resultado.rows)
        return { rows }
    } catch (error) {
        console.error('Error al obtener el catálogo:', error.message)
        throw error
    }
}

// LECTURA: uno por id
export async function obtenerProductoPorId(id) {
    try {
        const resultado = await pool.query('SELECT * FROM productos WHERE id = $1', [id])
        const rows = await adjuntarImagenesExtra('producto', resultado.rows)
        return { rows }
    } catch (error) {
        console.error('Error al obtener el producto:', error.message)
        throw error
    }
}

// ALTA
export async function crearProducto(datos) {
    const { nombre, medidas, material, cabo, precio, imagen } = datos
    try {
        const resultado = await pool.query(
            `INSERT INTO productos (nombre, medidas, material, cabo, precio, imagen)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [nombre, medidas, material, cabo, precio, imagen]
        )
        return resultado
    } catch (error) {
        console.error('Error al crear el producto:', error.message)
        throw error
    }
}

// MODIFICACIÓN
export async function actualizarProducto(id, datos) {
    const { nombre, medidas, material, cabo, precio, imagen } = datos
    try {
        const resultado = await pool.query(
            `UPDATE productos
             SET nombre = $1, medidas = $2, material = $3, cabo = $4, precio = $5, imagen = $6
             WHERE id = $7
             RETURNING *`,
            [nombre, medidas, material, cabo, precio, imagen, id]
        )
        return resultado
    } catch (error) {
        console.error('Error al actualizar el producto:', error.message)
        throw error
    }
}

// BAJA
export async function eliminarUno(id) {
    try {
        const resultado = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING *', [id])
        return resultado
    } catch (error) {
        console.error('Error al eliminar el producto:', error.message)
        throw error
    }
}