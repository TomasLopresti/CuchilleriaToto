import { abrirLightbox } from './lightbox.js'

const NUMERO_WS = "3512428444"

function escapeHtml(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

// Junta la portada (imagen) con las fotos adicionales (imagenes) en una sola lista
function todasLasFotos(item) {
  const extra = (item.imagenes || []).map(i => i.archivo)
  return [item.imagen, ...extra].filter(Boolean)
}

function badgeFotos(cantidad) {
  return cantidad > 1 ? `<span class="badge-fotos">📷 ${cantidad}</span>` : ''
}

function imagenOPlaceholder(imagen, alt, claseImg, emoji) {
  if (imagen) return `<img src="/archivos/${imagen}" alt="${escapeHtml(alt)}" class="${claseImg}">`
  return `<div class="img-placeholder">${emoji}</div>`
}

function renderizarCardsProductos(lista, contenedor) {
  contenedor.innerHTML = ''
  if (!lista.length) {
    contenedor.innerHTML = '<p class="estado-vacio">Todavía no hay productos cargados.</p>'
    return
  }
  lista.forEach(producto => {
    const fotos = todasLasFotos(producto)
    const mensajeWs = encodeURIComponent(
      `Hola! Me interesa el *${producto.nombre}* que vi en el catálogo:\n` +
      `• Medidas: ${producto.medidas || '-'}\n` +
      `• Material: ${producto.material || '-'}\n` +
      `• Mango: ${producto.cabo || '-'}\n` +
      `• Precio: $${Number(producto.precio).toLocaleString('es-AR')}\n\n` +
      `¿Podrías enviarme más información?`
    )
    const urlWs = `https://wa.me/${NUMERO_WS}?text=${mensajeWs}`

    const articulo = document.createElement('article')
    articulo.className = 'card-producto'
    articulo.innerHTML = `
      <div class="card-producto-img-wrap${fotos.length > 0 ? ' tiene-mas-fotos' : ''}">
        ${imagenOPlaceholder(producto.imagen, producto.nombre, 'card-producto-img', '🔪')}
        ${badgeFotos(fotos.length)}
      </div>
      <div class="card-producto-cuerpo">
        <p class="card-producto-nombre">${escapeHtml(producto.nombre)}</p>
        <div class="card-producto-tags">
          ${producto.medidas ? `<span class="card-producto-tag">${escapeHtml(producto.medidas)}</span>` : ''}
          ${producto.material ? `<span class="card-producto-tag">${escapeHtml(producto.material)}</span>` : ''}
          ${producto.cabo ? `<span class="card-producto-tag">${escapeHtml(producto.cabo)}</span>` : ''}
        </div>
        <p class="card-producto-precio">$${Number(producto.precio).toLocaleString('es-AR')}</p>
        <a class="btn-ws-catalogo" href="${urlWs}" target="_blank" rel="noopener">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="18" height="18" fill="currentColor"><path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.737 5.561 2.142 7.974L0 32l8.286-2.108A15.93 15.93 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 0 1-6.784-1.857l-.486-.29-5.028 1.279 1.306-4.886-.317-.5A13.268 13.268 0 0 1 2.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.306-9.917c-.4-.2-2.366-1.167-2.733-1.3-.367-.133-.633-.2-.9.2-.267.4-1.033 1.3-1.267 1.567-.233.267-.467.3-.867.1-.4-.2-1.687-.622-3.213-1.98-1.188-1.058-1.99-2.365-2.223-2.765-.233-.4-.025-.617.175-.817.18-.18.4-.467.6-.7.2-.233.267-.4.4-.667.133-.267.067-.5-.033-.7-.1-.2-.9-2.167-1.233-2.967-.325-.78-.655-.673-.9-.686l-.767-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.367-1.4 3.333s1.433 3.867 1.633 4.133c.2.267 2.82 4.307 6.833 6.033.955.413 1.7.66 2.28.845.958.305 1.83.262 2.52.159.769-.114 2.366-.967 2.7-1.9.333-.933.333-1.733.233-1.9-.1-.167-.367-.267-.767-.467z"/></svg>
          Consultar por este cuchillo
        </a>
      </div>
    `
    const $imgWrap = articulo.querySelector('.card-producto-img-wrap')
    if (fotos.length) {
      $imgWrap.addEventListener('click', () => abrirLightbox(fotos, 0))
    }
    contenedor.appendChild(articulo)
  })
}

function renderizarGaleria(lista, contenedor) {
  contenedor.innerHTML = ''
  if (!lista.length) {
    contenedor.innerHTML = '<p class="estado-vacio">Todavía no hay fotos cargadas.</p>'
    return
  }
  lista.forEach(item => {
    const fotos = todasLasFotos(item)
    const figura = document.createElement('div')
    figura.className = 'galeria-item' + (fotos.length > 0 ? ' tiene-mas-fotos' : '')
    figura.innerHTML = `
      ${imagenOPlaceholder(item.imagen, item.nombre, '', '🖼')}
      ${badgeFotos(fotos.length)}
      <span>${escapeHtml(item.nombre)}</span>
    `
    if (fotos.length) {
      figura.addEventListener('click', () => abrirLightbox(fotos, 0))
    }
    contenedor.appendChild(figura)
  })
}

export { renderizarCardsProductos, renderizarGaleria }
