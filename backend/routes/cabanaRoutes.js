const express = require('express');
const router = express.Router();
const Cabana = require('../models/Cabana');
const { protect, admin } = require('../middleware/authMiddleware');

// Obtener todas las cabañas
router.get('/', protect, async (req, res) => {
    try {
        const cabanas = await Cabana.find().sort({ numero: 1 });
        res.json(cabanas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Dashboard de aforo
router.get('/dashboard/aforo', protect, admin, async (req, res) => {
    try {
        const total = await Cabana.countDocuments();
        const disponibles = await Cabana.countDocuments({ estado: 'disponible' });
        const ocupadas = await Cabana.countDocuments({ estado: 'ocupada' });
        const mantenimiento = await Cabana.countDocuments({ estado: 'mantenimiento' });
        const limpieza = await Cabana.countDocuments({ estado: 'limpieza' });
        
        const porcentajeOcupacion = total > 0 ? ((ocupadas / total) * 100).toFixed(1) : 0;
        
        res.json({
            total,
            disponibles,
            ocupadas,
            mantenimiento,
            limpieza,
            porcentajeOcupacion
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Crear cabaña
router.post('/', protect, admin, async (req, res) => {
    try {
        const cabana = await Cabana.create(req.body);
        res.status(201).json(cabana);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Actualizar estado de cabaña
router.put('/:id/estado', protect, admin, async (req, res) => {
    try {
        const cabana = await Cabana.findById(req.params.id);
        if (cabana) {
            cabana.estado = req.body.estado;
            const cabanaActualizada = await cabana.save();
            res.json(cabanaActualizada);
        } else {
            res.status(404).json({ message: 'Cabaña no encontrada' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
