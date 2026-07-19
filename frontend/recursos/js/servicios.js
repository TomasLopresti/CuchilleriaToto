async function obtenerDatos(url) {
    const resultado = await fetch(url)
    return await resultado.json()
}

export { obtenerDatos }