const form = document.getElementById('form')
const error = document.getElementById('error')
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  error.style.display = 'none'
  const usuario = document.getElementById('usuario').value
  const pass = document.getElementById('pass').value
  const res = await fetch('/autenticar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, pass })
  })
  if (res.ok && res.redirected) {
    window.location.href = res.url
  } else if (res.status === 429) {
    error.textContent = 'Demasiados intentos. Esperá unos minutos y volvé a probar.'
    error.style.display = 'block'
  } else {
    error.textContent = 'Usuario o contraseña incorrectos.'
    error.style.display = 'block'
    form.reset()
  }
})
