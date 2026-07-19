import pool from './conexion.bd.mjs'

export const MAX_IMAGENES_EXTRA = 8

// Trae las imágenes extra de un solo item (ordenadas)
export async function obtenerImagenesDe(tipo, itemId) {
    return pool.query(
        'SELECT id, archivo FROM imagenes WHERE tipo = $1 AND item_id = $2 ORDER BY orden, id',
        [tipo, itemId]
    )
}

// Trae las imágenes extra de varios items a la vez (para listados), agrupadas por item_id
export async function obtenerImagenesDeVarios(tipo, itemIds) {
    if (!itemIds.length) return new Map()
    const resultado = await pool.query(
        'SELECT id, item_id, archivo FROM imagenes WHERE tipo = $1 AND item_id = ANY($2) ORDER BY orden, id',
        [tipo, itemIds]
    )
    const porItem = new Map()
    for (const fila of resultado.rows) {
        if (!porItem.has(fila.item_id)) porItem.set(fila.item_id, [])
        porItem.get(fila.item_id).push({ id: fila.id, archivo: fila.archivo })
    }
    return porItem
}

// Adjunta el array `imagenes` a cada fila de una lista de productos/galeria
export async function adjuntarImagenesExtra(tipo, filas) {
    const porItem = await obtenerImagenesDeVarios(tipo, filas.map(f => f.id))
    return filas.map(fila => ({ ...fila, imagenes: porItem.get(fila.id) || [] }))
}

export async function contarImagenesDe(tipo, itemId) {
    const resultado = await pool.query(
        'SELECT COUNT(*)::int AS total FROM imagenes WHERE tipo = $1 AND item_id = $2',
        [tipo, itemId]
    )
    return resultado.rows[0].total
}

export async function agregarImagenes(tipo, itemId, nombresArchivo) {
    const filas = []
    const actuales = await contarImagenesDe(tipo, itemId)
    for (let i = 0; i < nombresArchivo.length; i++) {
        const resultado = await pool.query(
            `INSERT INTO imagenes (tipo, item_id, archivo, orden) VALUES ($1, $2, $3, $4)
             RETURNING id, archivo`,
            [tipo, itemId, nombresArchivo[i], actuales + i]
        )
        filas.push(resultado.rows[0])
    }
    return filas
}

// Borra una imagen extra puntual. Devuelve el nombre de archivo para poder borrarlo del disco.
export async function eliminarImagen(tipo, imagenId) {
    const resultado = await pool.query(
        'DELETE FROM imagenes WHERE tipo = $1 AND id = $2 RETURNING archivo',
        [tipo, imagenId]
    )
    return resultado.rows[0]
}

// Borra todas las imágenes extra de un item (cuando se borra el producto/foto entero).
// Devuelve los nombres de archivo para poder borrarlos del disco.
export async function eliminarImagenesDe(tipo, itemId) {
    const resultado = await pool.query(
        'DELETE FROM imagenes WHERE tipo = $1 AND item_id = $2 RETURNING archivo',
        [tipo, itemId]
    )
    return resultado.rows
}
