const express = require('express');
const router = express.Router();
const Reserva = require('../models/Reserva');
const Cabana = require('../models/Cabana');
const { protect, admin } = require('../middleware/authMiddleware');

// Crear reserva
router.post('/', async (req, res) => {
    try {
        const { cliente, plan, fechaEntrada, fechaSalida, adultos, ninos, cabanaId } = req.body;
        
        const precios = {
            normal: 250000,
            premium: 380000,
            black: 520000,
            golden: 750000
        };
        
        const entrada = new Date(fechaEntrada);
        const salida = new Date(fechaSalida);
        const dias = Math.ceil((salida - entrada) / (1000 * 60 * 60 * 24));
        const total = precios[plan] * dias;
        
        const reserva = await Reserva.create({
            cliente,
            cabana: cabanaId,
            plan,
            fechaEntrada: entrada,
            fechaSalida: salida,
            adultos,
            ninos,
            total,
            observaciones: req.body.observaciones
        });
        
        res.status(201).json(reserva);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Obtener todas las reservas
router.get('/', protect, admin, async (req, res) => {
    try {
        const reservas = await Reserva.find().populate('cabana').sort({ createdAt: -1 });
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Dashboard resumen
router.get('/dashboard/resumen', protect, admin, async (req, res) => {
    try {
        const totalReservas = await Reserva.countDocuments();
        const pendientes = await Reserva.countDocuments({ estado: 'pendiente' });
        const confirmadas = await Reserva.countDocuments({ estado: 'confirmada' });
        const checkin = await Reserva.countDocuments({ estado: 'checkin' });
        
        res.json({
            totalReservas,
            pendientes,
            confirmadas,
            checkin
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
