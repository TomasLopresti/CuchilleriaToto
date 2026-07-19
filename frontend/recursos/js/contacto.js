document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contacto-form');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    try {
      const nombre = (document.getElementById('id-nombre') || {}).value || '';
      const email = (document.getElementById('id-mail') || {}).value || '';
      const mensaje = (document.getElementById('id-mensaje') || {}).value || '';

      if (!nombre || !email || !mensaje) {
        alert('Por favor completá todos los campos.');
        return;
      }

      const destinatario = 'cuchilleriatoto@gmail.com';
      const asunto = 'Consulta desde web - ' + nombre;
      let cuerpo = '';
      cuerpo += 'Nombre: ' + nombre + '\n';
      cuerpo += 'Email: ' + email + '\n\n';
      cuerpo += 'Mensaje:\n' + mensaje + '\n';

      const mailto = 'mailto:' + encodeURIComponent(destinatario)
                    + '?subject=' + encodeURIComponent(asunto)
                    + '&body=' + encodeURIComponent(cuerpo);

      console.log('mailto generado:', mailto);
      window.open(mailto, '_blank');

    } catch (err) {
      console.error('Error al procesar el formulario:', err);
      alert('Ocurrió un error. Mirá la consola para más detalles.');
    }
  });
});