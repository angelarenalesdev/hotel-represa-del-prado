const express = require('express');
const router = express.Router();
const Inventario = require('../models/Inventario');
const { protect, admin } = require('../middleware/authMiddleware');

// Obtener todo el inventario
router.get('/', protect, async (req, res) => {
    try {
        const inventario = await Inventario.find().sort({ categoria: 1, producto: 1 });
        res.json(inventario);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Dashboard de inventario
router.get('/dashboard/inventario', protect, admin, async (req, res) => {
    try {
        const totalProductos = await Inventario.countDocuments();
        const productosBajoStock = await Inventario.countDocuments({ 
            $expr: { $lte: ['$stockActual', '$stockMinimo'] } 
        });
        const productosAgotados = await Inventario.countDocuments({ stockActual: 0 });
        
        const inventarioBajo = await Inventario.find({ 
            $expr: { $lte: ['$stockActual', '$stockMinimo'] } 
        }).limit(10);
        
        res.json({
            totalProductos,
            productosBajoStock,
            productosAgotados,
            inventarioBajo
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Crear producto
router.post('/', protect, admin, async (req, res) => {
    try {
        const producto = await Inventario.create(req.body);
        res.status(201).json(producto);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Actualizar stock
router.put('/:id/stock', protect, admin, async (req, res) => {
    try {
        const producto = await Inventario.findById(req.params.id);
        if (producto) {
            producto.stockActual = req.body.stockActual;
            producto.ultimaActualizacion = Date.now();
            const productoActualizado = await producto.save();
            res.json(productoActualizado);
        } else {
            res.status(404).json({ message: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
