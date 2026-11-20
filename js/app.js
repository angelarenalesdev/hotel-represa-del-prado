const API_URL = 'http://localhost:5000/api';

// Precios de los planes
const preciosPlanes = {
    normal: 250000,
    premium: 380000,
    black: 520000,
    golden: 750000
};

const nombresPlanes = {
    normal: 'Plan Normal',
    premium: 'Plan Premium',
    black: 'Plan Black',
    golden: 'Plan Golden'
};

let pickerEntrada = null;
let pickerSalida = null;

const formatoCOP = (valor) => '$' + valor.toLocaleString('es-CO');
const formatoFecha = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });

// Seleccionar plan desde las tarjetas
function seleccionarPlan(plan) {
    document.getElementById('plan').value = plan;
    document.getElementById('reservas').scrollIntoView({ behavior: 'smooth', block: 'start' });
    calcularPrecio();
}

// Actualizar el resumen lateral (plan, fechas, huéspedes)
function actualizarResumen(noches) {
    const plan = document.getElementById('plan').value;
    const entrada = document.getElementById('fechaEntrada').value;
    const salida = document.getElementById('fechaSalida').value;
    const adultos = parseInt(document.getElementById('adultos').value) || 0;
    const ninos = parseInt(document.getElementById('ninos').value) || 0;

    document.getElementById('resumenPlan').textContent = plan ? nombresPlanes[plan] : '—';
    document.getElementById('resumenPrecioNoche').textContent = plan ? formatoCOP(preciosPlanes[plan]) : '—';
    document.getElementById('resumenFechas').textContent =
        entrada && salida ? `${formatoFecha(entrada)} → ${formatoFecha(salida)}` : (entrada ? `Desde ${formatoFecha(entrada)}` : '—');
    document.getElementById('resumenNoches').textContent = noches > 0 ? `${noches} noche${noches > 1 ? 's' : ''}` : '—';

    let huespedes = `${adultos} adulto${adultos === 1 ? '' : 's'}`;
    if (ninos > 0) huespedes += `, ${ninos} niño${ninos === 1 ? '' : 's'}`;
    document.getElementById('resumenHuespedes').textContent = huespedes;
}

// Calcular precio total
function calcularPrecio() {
    const plan = document.getElementById('plan').value;
    const fechaEntrada = document.getElementById('fechaEntrada').value;
    const fechaSalida = document.getElementById('fechaSalida').value;
    const precioTotalSpan = document.getElementById('precioTotal');
    let noches = 0;

    precioTotalSpan.classList.remove('text-danger');
    if (plan) marcarInvalido('plan', false);
    if (fechaEntrada) marcarInvalido('fechaEntrada', false);
    if (fechaSalida) marcarInvalido('fechaSalida', false);

    if (plan && fechaEntrada && fechaSalida) {
        const entrada = new Date(fechaEntrada + 'T00:00:00');
        const salida = new Date(fechaSalida + 'T00:00:00');
        const dias = Math.round((salida - entrada) / (1000 * 3600 * 24));

        if (dias > 0) {
            noches = dias;
            precioTotalSpan.textContent = formatoCOP(preciosPlanes[plan] * dias) + ' COP';
        } else {
            precioTotalSpan.textContent = 'La fecha de salida debe ser posterior a la de entrada';
            precioTotalSpan.classList.add('text-danger');
        }
    } else {
        precioTotalSpan.textContent = '$0';
    }

    actualizarResumen(noches);
}

// Calendarios con Flatpickr (en español); guardan la fecha como AAAA-MM-DD
function iniciarCalendarios() {
    if (typeof flatpickr === 'undefined') {
        // Si el CDN no carga, se usa el selector de fecha del navegador
        ['fechaEntrada', 'fechaSalida'].forEach(id => { document.getElementById(id).type = 'date'; });
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fechaEntrada').min = hoy;
        document.getElementById('fechaSalida').min = hoy;
        document.getElementById('fechaEntrada').addEventListener('change', function () {
            document.getElementById('fechaSalida').min = this.value;
            calcularPrecio();
        });
        document.getElementById('fechaSalida').addEventListener('change', calcularPrecio);
        return;
    }

    const opciones = {
        locale: flatpickr.l10ns.es || 'default',
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'j \\de F, Y',
        minDate: 'today',
        disableMobile: true
    };

    pickerSalida = flatpickr('#fechaSalida', { ...opciones, onChange: calcularPrecio });
    pickerEntrada = flatpickr('#fechaEntrada', {
        ...opciones,
        onChange: (fechas) => {
            if (fechas[0]) {
                const minSalida = new Date(fechas[0]);
                minSalida.setDate(minSalida.getDate() + 1);
                pickerSalida.set('minDate', minSalida);
                if (pickerSalida.selectedDates[0] && pickerSalida.selectedDates[0] < minSalida) pickerSalida.clear();
                if (!pickerSalida.selectedDates[0]) pickerSalida.open();
            }
            calcularPrecio();
        }
    });
}

// Navbar transparente sobre el hero y sólida al bajar
function iniciarNavbar() {
    const nav = document.getElementById('mainNav');
    const actualizar = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    actualizar();
    window.addEventListener('scroll', actualizar, { passive: true });

    // Cerrar el menú móvil al elegir una opción
    document.querySelectorAll('#navbarNav a').forEach(a => a.addEventListener('click', () => {
        const menu = bootstrap.Collapse.getInstance(document.getElementById('navbarNav'));
        if (menu) menu.hide();
    }));
}

function marcarInvalido(id, invalido) {
    const campo = document.getElementById(id);
    campo.classList.toggle('is-invalid', invalido);
    if (campo._flatpickr && campo._flatpickr.altInput) campo._flatpickr.altInput.classList.toggle('is-invalid', invalido);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function () {
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 700, once: true, offset: 60 });
        // Si la página se abre directamente en una sección (#reservas), mostrar lo que ya está en pantalla
        window.addEventListener('load', () => {
            AOS.refresh();
            window.dispatchEvent(new Event('scroll'));
        });
        // Respaldo: si un elemento entra en pantalla sin evento de scroll, se muestra igual
        if ('IntersectionObserver' in window) {
            const observador = new IntersectionObserver((entradas) => {
                entradas.forEach(entrada => {
                    if (entrada.isIntersecting) {
                        entrada.target.classList.add('aos-animate');
                        observador.unobserve(entrada.target);
                    }
                });
            }, { threshold: 0.05 });
            document.querySelectorAll('[data-aos]').forEach(el => observador.observe(el));
        }
    }

    if (typeof Swiper !== 'undefined') {
        new Swiper('.experiencias-swiper', {
            slidesPerView: 1.15,
            spaceBetween: 18,
            grabCursor: true,
            autoplay: { delay: 4500, disableOnInteraction: false },
            pagination: { el: '.swiper-pagination', clickable: true },
            breakpoints: { 576: { slidesPerView: 2.1 }, 992: { slidesPerView: 3.2, spaceBetween: 24 } }
        });
    }

    iniciarNavbar();
    iniciarCalendarios();

    document.getElementById('plan').addEventListener('change', calcularPrecio);
    document.getElementById('adultos').addEventListener('input', calcularPrecio);
    document.getElementById('ninos').addEventListener('input', calcularPrecio);
    calcularPrecio();

    // Manejo del formulario
    document.getElementById('reservaForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const form = this;
        const nombre = document.getElementById('nombre').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const email = document.getElementById('email').value.trim();
        const plan = document.getElementById('plan').value;
        const fechaEntrada = document.getElementById('fechaEntrada').value;
        const fechaSalida = document.getElementById('fechaSalida').value;
        const adultos = parseInt(document.getElementById('adultos').value);
        const ninos = parseInt(document.getElementById('ninos').value) || 0;
        const observaciones = document.getElementById('observaciones').value.trim();

        const obligatorios = { nombre, telefono, email, plan, fechaEntrada, fechaSalida, adultos };
        let faltan = false;
        Object.entries(obligatorios).forEach(([id, valor]) => {
            const vacio = !valor;
            marcarInvalido(id, vacio);
            if (vacio) faltan = true;
        });
        if (faltan) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }

        // Validar fechas
        const entrada = new Date(fechaEntrada + 'T00:00:00');
        const salida = new Date(fechaSalida + 'T00:00:00');
        if (salida <= entrada) {
            alert('La fecha de salida debe ser posterior a la fecha de entrada.');
            return;
        }

        const btnSubmit = form.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';

        try {
            const response = await fetch(`${API_URL}/reservas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cliente: { nombre, email, telefono },
                    plan,
                    fechaEntrada,
                    fechaSalida,
                    adultos,
                    ninos,
                    observaciones
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert('No se pudo enviar la reserva: ' + (data.message || 'error desconocido'));
                return;
            }

            // Mostrar modal de confirmación
            new bootstrap.Modal(document.getElementById('confirmModal')).show();

            // Limpiar formulario
            form.reset();
            if (pickerEntrada) pickerEntrada.clear();
            if (pickerSalida) { pickerSalida.clear(); pickerSalida.set('minDate', 'today'); }
            calcularPrecio();
        } catch (error) {
            console.error('Error al enviar la reserva:', error);
            alert('Error de conexión. Verifica que el servidor esté corriendo en el puerto 5000.');
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Confirmar reserva';
        }
    });

    // Quitar la marca roja al corregir un campo
    ['nombre', 'telefono', 'email', 'plan', 'adultos'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => marcarInvalido(id, false));
    });
});
