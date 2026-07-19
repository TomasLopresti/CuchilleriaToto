let overlay, imgEl, contadorEl, btnPrev, btnNext, btnCerrar
let imagenes = []
let indice = 0

function construirOverlay() {
  overlay = document.createElement('div')
  overlay.className = 'lightbox-overlay'
  overlay.innerHTML = `
    <button type="button" class="lightbox-btn lightbox-cerrar" aria-label="Cerrar">×</button>
    <button type="button" class="lightbox-btn lightbox-prev" aria-label="Foto anterior">←</button>
    <img class="lightbox-img" alt="Foto ampliada">
    <button type="button" class="lightbox-btn lightbox-next" aria-label="Foto siguiente">→</button>
    <p class="lightbox-contador"></p>
  `
  document.body.appendChild(overlay)
  imgEl = overlay.querySelector('.lightbox-img')
  contadorEl = overlay.querySelector('.lightbox-contador')
  btnPrev = overlay.querySelector('.lightbox-prev')
  btnNext = overlay.querySelector('.lightbox-next')
  btnCerrar = overlay.querySelector('.lightbox-cerrar')

  btnCerrar.addEventListener('click', cerrarLightbox)
  overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrarLightbox() })
  btnPrev.addEventListener('click', () => mostrar(indice - 1))
  btnNext.addEventListener('click', () => mostrar(indice + 1))
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('activo')) return
    if (e.key === 'Escape') cerrarLightbox()
    if (e.key === 'ArrowLeft') mostrar(indice - 1)
    if (e.key === 'ArrowRight') mostrar(indice + 1)
  })
}

function mostrar(i) {
  indice = (i + imagenes.length) % imagenes.length
  imgEl.src = `/archivos/${imagenes[indice]}`
  const varias = imagenes.length > 1
  contadorEl.textContent = varias ? `${indice + 1} / ${imagenes.length}` : ''
  btnPrev.style.display = varias ? 'flex' : 'none'
  btnNext.style.display = varias ? 'flex' : 'none'
}

export function abrirLightbox(listaImagenes, indiceInicial = 0) {
  if (!listaImagenes || !listaImagenes.length) return
  if (!overlay) construirOverlay()
  imagenes = listaImagenes
  overlay.classList.add('activo')
  mostrar(indiceInicial)
}

function cerrarLightbox() {
  if (overlay) overlay.classList.remove('activo')
}
