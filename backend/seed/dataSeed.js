const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const Cabana = require('../models/Cabana');
const Inventario = require('../models/Inventario');
const connectDB = require('../config/db');

connectDB();

const cabanasIniciales = [
    { numero: 'C-01', tipo: 'normal', capacidad: 2, precioNoche: 250000, estado: 'disponible' },
    { numero: 'C-02', tipo: 'normal', capacidad: 2, precioNoche: 250000, estado: 'disponible' },
    { numero: 'C-03', tipo: 'premium', capacidad: 4, precioNoche: 380000, estado: 'disponible' },
    { numero: 'C-04', tipo: 'premium', capacidad: 4, precioNoche: 380000, estado: 'disponible' },
    { numero: 'C-05', tipo: 'black', capacidad: 6, precioNoche: 520000, estado: 'disponible' },
    { numero: 'C-06', tipo: 'golden', capacidad: 8, precioNoche: 750000, estado: 'disponible' }
];

const inventarioInicial = [
    { producto: 'Agua Embotellada', categoria: 'bebidas', stockActual: 50, stockMinimo: 20, unidadMedida: 'botella', precioUnitario: 2000 },
    { producto: 'Gaseosas', categoria: 'bebidas', stockActual: 30, stockMinimo: 15, unidadMedida: 'botella', precioUnitario: 3500 },
    { producto: 'Toallas', categoria: 'amenities', stockActual: 25, stockMinimo: 30, unidadMedida: 'unidad', precioUnitario: 15000 },
    { producto: 'Jabón', categoria: 'amenities', stockActual: 40, stockMinimo: 20, unidadMedida: 'unidad', precioUnitario: 3500 },
    { producto: 'Detergente', categoria: 'limpieza', stockActual: 8, stockMinimo: 15, unidadMedida: 'litro', precioUnitario: 12000 },
    { producto: 'Papel Higiénico', categoria: 'amenities', stockActual: 12, stockMinimo: 25, unidadMedida: 'rollo', precioUnitario: 2500 }
];

const seedData = async () => {
    try {
        await Cabana.deleteMany();
        await Inventario.deleteMany();
        
        await Cabana.insertMany(cabanasIniciales);
        await Inventario.insertMany(inventarioInicial);
        
        console.log('Datos iniciales insertados correctamente');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedData();
