const API_URL = 'http://localhost:5000/api';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorAlert = document.getElementById('errorAlert');
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    
    errorAlert.classList.add('d-none');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Iniciando...';
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            if (data.rol === 'admin') {
                localStorage.setItem('token', data.token);
                localStorage.setItem('usuario', JSON.stringify(data));
                window.location.href = 'dashboard.html';
            } else {
                errorAlert.textContent = 'Acceso denegado. Solo administradores pueden ingresar.';
                errorAlert.classList.remove('d-none');
            }
        } else {
            errorAlert.textContent = data.message || 'Error al iniciar sesión';
            errorAlert.classList.remove('d-none');
        }
    } catch (error) {
        errorAlert.textContent = 'Error de conexión. Verifica que el servidor esté corriendo.';
        errorAlert.classList.remove('d-none');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Iniciar Sesión';
    }
});
