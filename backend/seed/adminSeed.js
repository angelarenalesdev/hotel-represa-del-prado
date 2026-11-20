const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Usuario = require('../models/Usuario');

// Crea el usuario administrador a partir de las variables ADMIN_EMAIL y ADMIN_PASSWORD del archivo .env
const crearAdmin = async () => {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        console.log('Define ADMIN_EMAIL y ADMIN_PASSWORD en backend/.env para crear el administrador.');
        return;
    }

    try {
        const adminExiste = await Usuario.findOne({ email });

        if (adminExiste) {
            console.log(`El usuario administrador ${email} ya existe`);
            return;
        }

        await Usuario.create({
            nombre: process.env.ADMIN_NOMBRE || 'Administrador',
            email,
            password,
            rol: 'admin',
            activo: true
        });

        console.log(`Usuario administrador creado: ${email}`);
    } catch (error) {
        console.error('Error al crear administrador:', error.message);
    }
};

// Permite ejecutarlo directamente con: npm run seed:admin
if (require.main === module) {
    const mongoose = require('mongoose');
    const connectDB = require('../config/db');
    connectDB()
        .then(crearAdmin)
        .finally(() => mongoose.disconnect());
}

module.exports = crearAdmin;
