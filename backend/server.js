const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const crearAdmin = require('./seed/adminSeed');
const path = require('path');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cabanas', require('./routes/cabanaRoutes'));
app.use('/api/inventario', require('./routes/inventarioRoutes'));
app.use('/api/reservas', require('./routes/reservaRoutes'));

// Servir el frontend (solo las carpetas públicas, nunca backend/ ni el .env)
const raiz = path.join(__dirname, '..');
['css', 'img', 'js', 'pages', 'admin'].forEach(carpeta => {
    app.use('/' + carpeta, express.static(path.join(raiz, carpeta)));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(raiz, 'index.html'));
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
