const API_URL = 'http://localhost:5000/api';
let token = localStorage.getItem('token');
let usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

// Verificar autenticación
if (!token || usuario.rol !== 'admin') {
    window.location.href = 'login.html';
}

// Mostrar nombre de usuario y fecha
document.getElementById('userName').textContent = usuario.nombre || 'Administrador';
document.getElementById('fechaHoy').textContent = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });

// Menú lateral en celular
const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
function toggleSidebar(abrir) {
    sidebar.classList.toggle('open', abrir);
    sidebarBackdrop.classList.toggle('show', abrir);
}
document.getElementById('btnMenu').addEventListener('click', () => toggleSidebar(true));
sidebarBackdrop.addEventListener('click', () => toggleSidebar(false));

// ---------- Gráficas (Chart.js) ----------
const COLORES = {
    rosa: '#e4559a', fucsia: '#d63384', rosaClaro: '#ffc5d3', tinta: '#2b1a24',
    planes: { normal: '#ffb6c1', premium: '#d63384', black: '#2b1a24', golden: '#d4af37' }
};
let chartOcupacion = null;
let chartPlanes = null;

if (typeof Chart !== 'undefined') {
    Chart.defaults.font.family = "'Poppins', 'Segoe UI', sans-serif";
    Chart.defaults.color = '#6f5a66';
}

function dibujarOcupacion(aforo) {
    if (typeof Chart === 'undefined') return;
    const ocupadas = aforo.ocupadas || 0;
    const libres = Math.max((aforo.total || 0) - ocupadas, 0);
    const datos = [ocupadas, libres];
    document.getElementById('leyendaOcupadas').textContent = ocupadas;
    document.getElementById('leyendaLibres').textContent = libres;

    if (chartOcupacion) {
        chartOcupacion.data.datasets[0].data = datos;
        chartOcupacion.update();
        return;
    }
    chartOcupacion = new Chart(document.getElementById('chartOcupacion'), {
        type: 'doughnut',
        data: {
            labels: ['Ocupadas', 'Libres'],
            datasets: [{ data: datos, backgroundColor: [COLORES.fucsia, COLORES.rosaClaro], borderWidth: 0, borderRadius: 6, spacing: 3 }]
        },
        options: {
            cutout: '74%',
            plugins: { legend: { display: false } }
        }
    });
}

async function cargarGraficaPlanes() {
    if (typeof Chart === 'undefined') return;
    try {
        const res = await fetch(`${API_URL}/reservas`, { headers: { 'Authorization': `Bearer ${token}` } });
        const reservas = await res.json();
        if (!res.ok || !Array.isArray(reservas)) return;

        const planes = ['normal', 'premium', 'black', 'golden'];
        const conteo = planes.map(p => reservas.filter(r => r.plan === p && r.estado !== 'cancelada').length);
        document.getElementById('totalReservasPlan').textContent =
            `${conteo.reduce((a, b) => a + b, 0)} reservas activas`;

        if (chartPlanes) {
            chartPlanes.data.datasets[0].data = conteo;
            chartPlanes.update();
            return;
        }
        chartPlanes = new Chart(document.getElementById('chartPlanes'), {
            type: 'bar',
            data: {
                labels: ['Normal', 'Premium', 'Black', 'Golden'],
                datasets: [{
                    label: 'Reservas',
                    data: conteo,
                    backgroundColor: planes.map(p => COLORES.planes[p]),
                    borderRadius: 10,
                    maxBarThickness: 56
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#f1dde4' }, border: { display: false } }
                }
            }
        });
    } catch (error) {
        console.error('Error al cargar la gráfica de planes:', error);
    }
}

// Navegación entre secciones
document.querySelectorAll('.sidebar-nav .nav-link[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('data-section');
        
        // Actualizar nav activo
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Mostrar sección
        document.querySelectorAll('.content-section').forEach(s => s.classList.add('d-none'));
        document.getElementById(`section-${section}`).classList.remove('d-none');
        
        // Actualizar título
        const titulos = {
            'dashboard': 'Dashboard',
            'cabanas': 'Aforo de Cabañas',
            'inventario': 'Gestión de Inventario',
            'reservas': 'Reservas'
        };
        document.getElementById('sectionTitle').textContent = titulos[section];
        toggleSidebar(false);

        // Cargar datos según sección
        if (section === 'dashboard') cargarDashboard();
        else if (section === 'cabanas') cargarCabanas();
        else if (section === 'inventario') cargarInventario();
        else if (section === 'reservas') cargarReservas();
    });
});

// Cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}

// Cargar Reservas
async function cargarReservas() {
    const tabla = document.getElementById('tablaReservas');
    try {
        const res = await fetch(`${API_URL}/reservas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401) {
            cerrarSesion();
            return;
        }

        const reservas = await res.json();

        if (!res.ok || !Array.isArray(reservas)) {
            tabla.innerHTML = `<tr><td colspan="7" class="text-danger text-center">Error: ${reservas.message || 'No se pudieron cargar las reservas'}</td></tr>`;
            return;
        }

        if (reservas.length === 0) {
            tabla.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay reservas todavía</td></tr>';
            return;
        }

        const colores = {
            pendiente: 'warning',
            confirmada: 'success',
            checkin: 'primary',
            checkout: 'secondary',
            cancelada: 'danger'
        };

        tabla.innerHTML = reservas.map(reserva => {
            const fechaEntrada = new Date(reserva.fechaEntrada).toLocaleDateString('es-CO');
            const fechaSalida = new Date(reserva.fechaSalida).toLocaleDateString('es-CO');
            const cliente = reserva.cliente || {};

            return `
                <tr>
                    <td><strong>${cliente.nombre || '-'}</strong></td>
                    <td>
                        ${cliente.email || '-'}<br>
                        <small>${cliente.telefono || ''}</small>
                    </td>
                    <td class="text-capitalize">${reserva.plan}</td>
                    <td>${fechaEntrada} - ${fechaSalida}</td>
                    <td>${reserva.adultos} adultos, ${reserva.ninos || 0} niños</td>
                    <td>$${(reserva.total || 0).toLocaleString()}</td>
                    <td><span class="badge bg-${colores[reserva.estado] || 'secondary'}">${reserva.estado}</span></td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error al cargar reservas:', error);
        tabla.innerHTML = '<tr><td colspan="7" class="text-danger text-center">Error de conexión con el servidor</td></tr>';
    }
}


// Cargar Dashboard
async function cargarDashboard() {
    try {
        const [aforoRes, inventarioRes] = await Promise.all([
            fetch(`${API_URL}/cabanas/dashboard/aforo`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${API_URL}/inventario/dashboard/inventario`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        const aforo = await aforoRes.json();
        const inventario = await inventarioRes.json();

        document.getElementById('totalCabanas').textContent = aforo.total;
        document.getElementById('cabanasDisponibles').textContent = aforo.disponibles;
        document.getElementById('cabanasOcupadas').textContent = aforo.ocupadas;
        document.getElementById('productosBajoStock').textContent = inventario.productosBajoStock;
        document.getElementById('porcentajeOcupacion').textContent = Math.round(Number(aforo.porcentajeOcupacion) || 0) + '%';

        dibujarOcupacion(aforo);
        cargarGraficaPlanes();

        const tablaBajoStock = document.getElementById('tablaBajoStock');
        tablaBajoStock.innerHTML = '';
        inventario.inventarioBajo.forEach(prod => {
            tablaBajoStock.innerHTML += `
                <tr>
                    <td>${prod.producto}</td>
                    <td>${prod.stockActual} ${prod.unidadMedida}</td>
                    <td>${prod.stockMinimo} ${prod.unidadMedida}</td>
                    <td><span class="badge bg-danger">Bajo Stock</span></td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error al cargar dashboard:', error);
    }
}


// Cargar Cabañas
async function cargarCabanas() {
    try {
        const res = await fetch(`${API_URL}/cabanas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const cabanas = await res.json();
        
        const grid = document.getElementById('cabanasGrid');
        grid.innerHTML = '';
        
        cabanas.forEach(cabana => {
            const estadoClass = cabana.estado;
            const estadoTexto = {
                'disponible': 'Disponible',
                'ocupada': 'Ocupada',
                'mantenimiento': 'Mantenimiento',
                'limpieza': 'Limpieza'
            };
            
            grid.innerHTML += `
                <div class="col-xxl-3 col-xl-4 col-sm-6">
                    <div class="cabana-card ${estadoClass}">
                        <h5 class="mb-2">Cabaña ${cabana.numero}</h5>
                        <p class="mb-1 text-capitalize"><strong>Tipo:</strong> ${cabana.tipo}</p>
                        <p class="mb-1"><strong>Capacidad:</strong> ${cabana.capacidad} personas</p>
                        <p class="mb-2"><strong>Precio:</strong> $${cabana.precioNoche.toLocaleString()}</p>
                        <span class="badge-estado bg-${estadoClass === 'disponible' ? 'success' : estadoClass === 'ocupada' ? 'danger' : estadoClass === 'mantenimiento' ? 'warning' : 'primary'}">
                            ${estadoTexto[cabana.estado]}
                        </span>
                        <div class="mt-2">
                            <select class="form-select form-select-sm" onchange="cambiarEstadoCabana('${cabana._id}', this.value)">
                                <option value="">Cambiar estado</option>
                                <option value="disponible">Disponible</option>
                                <option value="ocupada">Ocupada</option>
                                <option value="mantenimiento">Mantenimiento</option>
                                <option value="limpieza">Limpieza</option>
                            </select>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error al cargar cabañas:', error);
    }
}

// Cambiar estado cabaña
async function cambiarEstadoCabana(id, estado) {
    if (!estado) return;
    
    try {
        const res = await fetch(`${API_URL}/cabanas/${id}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado })
        });
        
        if (res.ok) {
            cargarCabanas();
            cargarDashboard();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Cargar Inventario
async function cargarInventario() {
    try {
        const res = await fetch(`${API_URL}/inventario`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const inventario = await res.json();
        
        const tabla = document.getElementById('tablaInventario');
        tabla.innerHTML = '';
        
        inventario.forEach(prod => {
            const bajoStock = prod.stockActual <= prod.stockMinimo;
            tabla.innerHTML += `
                <tr>
                    <td><strong>${prod.producto}</strong></td>
                    <td class="text-capitalize">${prod.categoria}</td>
                    <td>${prod.stockActual}</td>
                    <td>${prod.stockMinimo}</td>
                    <td>${prod.unidadMedida}</td>
                    <td>$${(prod.precioUnitario || 0).toLocaleString()}</td>
                    <td>
                        <span class="badge ${bajoStock ? 'bg-danger' : 'bg-success'}">
                            ${bajoStock ? 'Bajo Stock' : 'Normal'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="actualizarStock('${prod._id}', ${prod.stockActual})">
                            <i class="bi bi-pencil"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error al cargar inventario:', error);
    }
}

// Actualizar stock
async function actualizarStock(id, stockActual) {
    const nuevoStock = prompt('Nuevo stock:', stockActual);
    if (nuevoStock === null) return;
    
    try {
        const res = await fetch(`${API_URL}/inventario/${id}/stock`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ stockActual: parseInt(nuevoStock) })
        });
        
        if (res.ok) {
            cargarInventario();
            cargarDashboard();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Guardar cabaña
async function guardarCabana() {
    const datos = {
        numero: document.getElementById('cabanaNumero').value,
        tipo: document.getElementById('cabanaTipo').value,
        capacidad: parseInt(document.getElementById('cabanaCapacidad').value),
        precioNoche: parseInt(document.getElementById('cabanaPrecio').value),
        estado: 'disponible'
    };
    
    try {
        const res = await fetch(`${API_URL}/cabanas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        });
        
        if (res.ok) {
            bootstrap.Modal.getInstance(document.getElementById('modalCabana')).hide();
            document.getElementById('formCabana').reset();
            cargarCabanas();
            cargarDashboard();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Guardar producto
async function guardarProducto() {
    const datos = {
        producto: document.getElementById('productoNombre').value,
        categoria: document.getElementById('productoCategoria').value,
        stockActual: parseInt(document.getElementById('productoStock').value),
        stockMinimo: parseInt(document.getElementById('productoStockMin').value),
        unidadMedida: document.getElementById('productoUnidad').value,
        precioUnitario: parseInt(document.getElementById('productoPrecio').value) || 0
    };
    
    try {
        const res = await fetch(`${API_URL}/inventario`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        });
        
        if (res.ok) {
            bootstrap.Modal.getInstance(document.getElementById('modalInventario')).hide();
            document.getElementById('formInventario').reset();
            cargarInventario();
            cargarDashboard();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}



// Cargar dashboard al iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarDashboard();
});

// Refrescar reservas cada 20 segundos si esa sección está visible
setInterval(() => {
    const seccion = document.getElementById('section-reservas');
    if (seccion && !seccion.classList.contains('d-none')) {
        cargarReservas();
    }
}, 20000);