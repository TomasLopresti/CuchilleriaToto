// Panel de administración — CRUD de productos y galería.
// Las imágenes se suben como archivo (Multer), por eso usamos FormData.

function escapeHtml(valor) {
  return String(valor).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

// Las medidas se guardan como un solo texto ("medidas" en la BD), pero se cargan
// desde dos casilleros numéricos separados (hoja / con cabo). Estas funciones
// arman ese texto con la redacción predeterminada y lo vuelven a separar al editar.
function armarMedidas(hoja, cabo) {
  const partes = []
  if (hoja) partes.push(`${hoja} cm de hoja`)
  if (cabo) partes.push(`${cabo} cm con cabo`)
  return partes.join(' · ')
}
function parsearMedidas(texto) {
  if (!texto) return { hoja: '', cabo: '' }
  const hoja = texto.match(/([\d.,]+)\s*cm\s*de\s*hoja/i)
  const cabo = texto.match(/([\d.,]+)\s*cm\s*con\s*cabo/i)
  return { hoja: hoja ? hoja[1] : '', cabo: cabo ? cabo[1] : '' }
}

function mostrarNotificacion(mensaje, tipo = 'exito') {
  const notif = document.createElement('div')
  notif.className = `notificacion ${tipo}`
  notif.textContent = mensaje
  document.body.appendChild(notif)
  setTimeout(() => notif.remove(), 3200)
}
// Envuelve fetch: si el server responde 401 (sin sesión o token vencido),
// avisa al usuario y lo manda al login. Toda redirección queda dentro de la app.
async function fetchAuth(url, opciones) {
  const res = await fetch(url, opciones)
  if (res.status === 401) {
    mostrarNotificacion('Tu sesión expiró. Volvé a iniciar sesión.', 'error')
    setTimeout(() => { window.location.href = '/login/' }, 1500)
    throw new Error('No autorizado')
  }
  return res
}
// ── FOTOS ADICIONALES (más de una imagen por producto/foto) ──────────
function crearGestorFotosExtra({ prefijo, endpointBase }) {
  const $wrap = document.getElementById(`${prefijo}-fotos-extra-wrap`)
  const $lista = document.getElementById(`${prefijo}-fotos-extra-lista`)
  const $input = document.getElementById(`${prefijo}-fotos-extra-input`)
  const $boton = document.getElementById(`${prefijo}-fotos-extra-agregar`)
  let itemId = null

  function render(imagenes) {
    $lista.innerHTML = imagenes.map(img => `
      <div class="fotos-extra-item" data-imagen-id="${img.id}" data-archivo="${escapeHtml(img.archivo)}">
        <img src="/archivos/${img.archivo}" alt="">
        <button type="button" data-imagen-id="${img.id}" aria-label="Eliminar foto">×</button>
      </div>`).join('')
  }

  function mostrar(id, imagenes) {
    itemId = id
    render(imagenes || [])
    $wrap.style.display = 'block'
  }

  function ocultar() {
    itemId = null
    $lista.innerHTML = ''
    $input.value = ''
    $wrap.style.display = 'none'
  }

  $lista.addEventListener('click', async (e) => {
    const boton = e.target.closest('button[data-imagen-id]')
    if (!boton || !itemId) return
    if (!confirm('¿Eliminar esta foto?')) return
    try {
      const res = await fetchAuth(`${endpointBase}/${itemId}/imagenes/${boton.dataset.imagenId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      boton.closest('.fotos-extra-item').remove()
    } catch { mostrarNotificacion('Error al eliminar la foto', 'error') }
  })

  $boton.addEventListener('click', async () => {
    if (!itemId) return
    const archivos = $input.files
    if (!archivos.length) { mostrarNotificacion('Elegí al menos una foto', 'error'); return }
    const formData = new FormData()
    for (const archivo of archivos) formData.append('archivos', archivo)
    try {
      const res = await fetchAuth(`${endpointBase}/${itemId}/imagenes`, { method: 'POST', body: formData })
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Error al subir las fotos') }
      const nuevas = await res.json()
      const actuales = Array.from($lista.querySelectorAll('.fotos-extra-item')).map(el => ({
        id: el.dataset.imagenId,
        archivo: el.dataset.archivo
      }))
      render([...actuales, ...nuevas])
      $input.value = ''
      mostrarNotificacion('Fotos agregadas correctamente')
    } catch (err) { mostrarNotificacion(err.message, 'error') }
  })

  return { mostrar, ocultar }
}

const fotosExtraCatalogo = crearGestorFotosExtra({ prefijo: 'cat', endpointBase: '/api/v1/productos' })
const fotosExtraGaleria = crearGestorFotosExtra({ prefijo: 'gal', endpointBase: '/api/v1/galeria' })

// ── TABS ────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('activo'))
    document.querySelectorAll('.tab-panel').forEach(p => { p.classList.remove('activo'); p.style.display = 'none' })
    btn.classList.add('activo')
    const panel = document.getElementById(`tab-${btn.dataset.tab}`)
    panel.classList.add('activo')
    panel.style.display = 'block'
  })
})

// ════════════════════════════════════════════════════════════════════
//  CATÁLOGO
// ════════════════════════════════════════════════════════════════════
const API_PROD = '/api/v1/productos'
let catalogoItems = []

cargarCatalogo()

async function cargarCatalogo() {
  const $lista = document.getElementById('lista-catalogo')
  $lista.innerHTML = '<p class="estado-cargando">Cargando productos…</p>'
  try {
    const res = await fetchAuth(API_PROD)
    catalogoItems = await res.json()
    renderTablaProductos()
  } catch {
    $lista.innerHTML = '<p class="estado-vacio">Error al cargar el catálogo.</p>'
  }
}

function renderTablaProductos() {
  const $lista = document.getElementById('lista-catalogo')
  if (!catalogoItems.length) {
    $lista.innerHTML = '<p class="estado-vacio">No hay productos todavía. ¡Agregá el primero!</p>'
    return
  }
  const filas = catalogoItems.map(p => `
    <tr>
      <td>${p.imagen ? `<img src="/archivos/${p.imagen}" alt="${escapeHtml(p.nombre)}" class="tabla-img">` : `<div class="tabla-img-placeholder">🔪</div>`}</td>
      <td><strong>${escapeHtml(p.nombre)}</strong></td>
      <td>${p.medidas ? escapeHtml(p.medidas) : '—'}</td>
      <td>${p.material ? escapeHtml(p.material) : '—'}</td>
      <td>${p.cabo ? escapeHtml(p.cabo) : '—'}</td>
      <td>$${Number(p.precio).toLocaleString('es-AR')}</td>
      <td><div class="tabla-acciones">
        <button class="btn btn-editar" data-accion="editar" data-id="${p.id}">Editar</button>
        <button class="btn btn-eliminar" data-accion="eliminar" data-id="${p.id}">Eliminar</button>
      </div></td>
    </tr>`).join('')
  $lista.innerHTML = `<table class="admin-tabla"><thead><tr>
      <th>Foto</th><th>Nombre</th><th>Medidas</th><th>Material</th><th>Cabo</th><th>Precio</th><th>Acciones</th>
    </tr></thead><tbody>${filas}</tbody></table>`
  $lista.querySelectorAll('.tabla-img').forEach(img => {
    img.addEventListener('error', () => { img.style.display = 'none' })
  })
}
document.getElementById('lista-catalogo').addEventListener('click', (e) => {
  const boton = e.target.closest('[data-accion]')
  if (!boton) return
  if (boton.dataset.accion === 'editar') editarProducto(boton.dataset.id)
  else if (boton.dataset.accion === 'eliminar') eliminarProducto(boton.dataset.id)
})

function abrirFormCatalogo(titulo) {
  document.getElementById('form-catalogo-titulo').textContent = titulo
  document.getElementById('form-catalogo-wrap').style.display = 'block'
  document.getElementById('form-catalogo-wrap').scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}
function cerrarFormCatalogo() {
  document.getElementById('form-catalogo-wrap').style.display = 'none'
  document.getElementById('form-catalogo').reset()
  document.getElementById('cat-id').value = ''
  document.getElementById('cat-preview').style.display = 'none'
  document.getElementById('cat-imagen-actual').style.display = 'none'
  fotosExtraCatalogo.ocultar()
}
document.getElementById('btn-nuevo-catalogo').addEventListener('click', () => { cerrarFormCatalogo(); abrirFormCatalogo('Nuevo producto') })
document.getElementById('btn-cancelar-catalogo').addEventListener('click', cerrarFormCatalogo)

async function editarProducto(id) {
  try {
    const res = await fetchAuth(`${API_PROD}/${id}`)
    const p = await res.json()
    document.getElementById('cat-id').value      = p.id
    document.getElementById('cat-nombre').value   = p.nombre   || ''
    document.getElementById('cat-precio').value   = p.precio   || ''
    const medidas = parsearMedidas(p.medidas)
    document.getElementById('cat-medida-hoja').value = medidas.hoja
    document.getElementById('cat-medida-cabo').value = medidas.cabo
    document.getElementById('cat-material').value = p.material || ''
    document.getElementById('cat-cabo').value     = p.cabo     || ''
    const $prev = document.getElementById('cat-preview')
    const $actual = document.getElementById('cat-imagen-actual')
    if (p.imagen) {
      $prev.src = `/archivos/${p.imagen}`; $prev.style.display = 'block'
      $actual.textContent = 'Imagen actual: ' + p.imagen + ' (subí una nueva solo si querés cambiarla)'
      $actual.style.display = 'block'
    } else { $prev.style.display = 'none'; $actual.style.display = 'none' }
    fotosExtraCatalogo.mostrar(p.id, p.imagenes)
    abrirFormCatalogo('Editar producto')
  } catch { mostrarNotificacion('Error al cargar el producto', 'error') }
}

async function eliminarProducto(id) {
  const item = catalogoItems.find(p => String(p.id) === String(id))
  const nombre = item ? item.nombre : ''
  if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return
  try {
    const res = await fetchAuth(`${API_PROD}/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error()
    mostrarNotificacion('Producto eliminado correctamente'); cargarCatalogo()
  } catch { mostrarNotificacion('Error al eliminar', 'error') }
}

document.getElementById('cat-imagen').addEventListener('change', function() {
  const $prev = document.getElementById('cat-preview')
  const archivo = this.files[0]
  if (archivo) { $prev.src = URL.createObjectURL(archivo); $prev.style.display = 'block' }
})

document.getElementById('form-catalogo').addEventListener('submit', async (e) => {
  e.preventDefault()
  const id = document.getElementById('cat-id').value
  const nombre = document.getElementById('cat-nombre').value.trim()
  const precio = document.getElementById('cat-precio').value
  if (!nombre || !precio) { mostrarNotificacion('Nombre y precio son obligatorios', 'error'); return }
  const formData = new FormData()
  formData.append('nombre', nombre)
  formData.append('precio', precio)
  const medidaHoja = document.getElementById('cat-medida-hoja').value.trim()
  const medidaCabo = document.getElementById('cat-medida-cabo').value.trim()
  formData.append('medidas',  armarMedidas(medidaHoja, medidaCabo))
  formData.append('material', document.getElementById('cat-material').value.trim())
  formData.append('cabo',     document.getElementById('cat-cabo').value.trim())
  const archivo = document.getElementById('cat-imagen').files[0]
  if (archivo) formData.append('archivo', archivo)
  try {
    let res
    if (id) res = await fetchAuth(`${API_PROD}/${id}`, { method: 'PUT', body: formData })
    else    res = await fetchAuth(API_PROD, { method: 'POST', body: formData })
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Error al guardar') }
    mostrarNotificacion(id ? 'Producto actualizado correctamente' : 'Producto agregado correctamente')
    cerrarFormCatalogo(); cargarCatalogo()
  } catch (err) { mostrarNotificacion(err.message, 'error') }
})

// ════════════════════════════════════════════════════════════════════
//  GALERÍA
// ════════════════════════════════════════════════════════════════════
const API_GAL = '/api/v1/galeria'
let galeriaItems = []

cargarGaleria()

async function cargarGaleria() {
  const $lista = document.getElementById('lista-galeria')
  $lista.innerHTML = '<p class="estado-cargando">Cargando galería…</p>'
  try {
    const res = await fetchAuth(API_GAL)
    galeriaItems = await res.json()
    renderTablaGaleria()
  } catch {
    $lista.innerHTML = '<p class="estado-vacio">Error al cargar la galería.</p>'
  }
}

function renderTablaGaleria() {
  const $lista = document.getElementById('lista-galeria')
  if (!galeriaItems.length) {
    $lista.innerHTML = '<p class="estado-vacio">No hay fotos todavía. ¡Agregá la primera!</p>'
    return
  }
  const filas = galeriaItems.map(g => `
    <tr>
      <td>${g.imagen ? `<img src="/archivos/${g.imagen}" alt="${escapeHtml(g.nombre)}" class="tabla-img">` : `<div class="tabla-img-placeholder">🖼</div>`}</td>
      <td><strong>${escapeHtml(g.nombre)}</strong></td>
      <td><div class="tabla-acciones">
        <button class="btn btn-editar" data-accion="editar" data-id="${g.id}">Editar</button>
        <button class="btn btn-eliminar" data-accion="eliminar" data-id="${g.id}">Eliminar</button>
      </div></td>
    </tr>`).join('')
  $lista.innerHTML = `<table class="admin-tabla"><thead><tr>
      <th>Foto</th><th>Nombre</th><th>Acciones</th>
    </tr></thead><tbody>${filas}</tbody></table>`
  $lista.querySelectorAll('.tabla-img').forEach(img => {
    img.addEventListener('error', () => { img.style.display = 'none' })
  })
}
document.getElementById('lista-galeria').addEventListener('click', (e) => {
  const boton = e.target.closest('[data-accion]')
  if (!boton) return
  if (boton.dataset.accion === 'editar') editarGaleria(boton.dataset.id)
  else if (boton.dataset.accion === 'eliminar') eliminarGaleria(boton.dataset.id)
})

function abrirFormGaleria(titulo) {
  document.getElementById('form-galeria-titulo').textContent = titulo
  document.getElementById('form-galeria-wrap').style.display = 'block'
  document.getElementById('form-galeria-wrap').scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}
function cerrarFormGaleria() {
  document.getElementById('form-galeria-wrap').style.display = 'none'
  document.getElementById('form-galeria').reset()
  document.getElementById('gal-id').value = ''
  document.getElementById('gal-preview').style.display = 'none'
  document.getElementById('gal-imagen-actual').style.display = 'none'
  fotosExtraGaleria.ocultar()
}
document.getElementById('btn-nuevo-galeria').addEventListener('click', () => { cerrarFormGaleria(); abrirFormGaleria('Nueva foto') })
document.getElementById('btn-cancelar-galeria').addEventListener('click', cerrarFormGaleria)

async function editarGaleria(id) {
  try {
    const res = await fetchAuth(`${API_GAL}/${id}`)
    const g = await res.json()
    document.getElementById('gal-id').value     = g.id
    document.getElementById('gal-nombre').value = g.nombre || ''
    const $prev = document.getElementById('gal-preview')
    const $actual = document.getElementById('gal-imagen-actual')
    if (g.imagen) {
      $prev.src = `/archivos/${g.imagen}`; $prev.style.display = 'block'
      $actual.textContent = 'Imagen actual: ' + g.imagen + ' (subí una nueva solo si querés cambiarla)'
      $actual.style.display = 'block'
    } else { $prev.style.display = 'none'; $actual.style.display = 'none' }
    fotosExtraGaleria.mostrar(g.id, g.imagenes)
    abrirFormGaleria('Editar foto')
  } catch { mostrarNotificacion('Error al cargar la foto', 'error') }
}

async function eliminarGaleria(id) {
  const item = galeriaItems.find(g => String(g.id) === String(id))
  const nombre = item ? item.nombre : ''
  if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return
  try {
    const res = await fetchAuth(`${API_GAL}/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error()
    mostrarNotificacion('Foto eliminada correctamente'); cargarGaleria()
  } catch { mostrarNotificacion('Error al eliminar', 'error') }
}

document.getElementById('gal-imagen').addEventListener('change', function() {
  const $prev = document.getElementById('gal-preview')
  const archivo = this.files[0]
  if (archivo) { $prev.src = URL.createObjectURL(archivo); $prev.style.display = 'block' }
})

document.getElementById('form-galeria').addEventListener('submit', async (e) => {
  e.preventDefault()
  const id = document.getElementById('gal-id').value
  const nombre = document.getElementById('gal-nombre').value.trim()
  if (!nombre) { mostrarNotificacion('El nombre es obligatorio', 'error'); return }
  const formData = new FormData()
  formData.append('nombre', nombre)
  const archivo = document.getElementById('gal-imagen').files[0]
  if (archivo) formData.append('archivo', archivo)
  try {
    let res
    if (id) res = await fetchAuth(`${API_GAL}/${id}`, { method: 'PUT', body: formData })
    else    res = await fetchAuth(API_GAL, { method: 'POST', body: formData })
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Error al guardar') }
    mostrarNotificacion(id ? 'Foto actualizada correctamente' : 'Foto agregada correctamente')
    cerrarFormGaleria(); cargarGaleria()
  } catch (err) { mostrarNotificacion(err.message, 'error') }
})