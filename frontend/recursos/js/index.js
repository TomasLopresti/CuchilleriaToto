import { renderizarCardsProductos, renderizarGaleria } from './vista.js'
import { obtenerDatos } from './servicios.js'

const $destacados = document.querySelector('.destacados-lista')
const $catalogoLista = document.querySelector('.catalogo-lista')
const $galeriaLista = document.querySelector('.galeria-lista')

;(async function init() {
  try {
    if ($destacados) {
      $destacados.innerHTML = '<p class="estado-cargando">Cargando…</p>'
      const productos = await obtenerDatos('/api/catalogo')
      renderizarCardsProductos(productos.slice(0, 3), $destacados)
    }
    if ($catalogoLista) {
      $catalogoLista.innerHTML = '<p class="estado-cargando">Cargando catálogo…</p>'
      const productos = await obtenerDatos('/api/catalogo')
      renderizarCardsProductos(productos, $catalogoLista)
    }
    if ($galeriaLista) {
      $galeriaLista.innerHTML = '<p class="estado-cargando">Cargando galería…</p>'
      const galeria = await obtenerDatos('/api/galeria')
      renderizarGaleria(galeria, $galeriaLista)
    }
  } catch (e) {
    console.log(e.message)
    if ($destacados) $destacados.innerHTML = '<p class="estado-vacio">Error al cargar el catálogo.</p>'
    if ($catalogoLista) $catalogoLista.innerHTML = '<p class="estado-vacio">Error al cargar el catálogo.</p>'
    if ($galeriaLista) $galeriaLista.innerHTML = '<p class="estado-vacio">Error al cargar la galería.</p>'
  }
})()
