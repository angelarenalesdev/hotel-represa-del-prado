const mongoose = require('mongoose');

const InventarioSchema = new mongoose.Schema({
    producto: {
        type: String,
        required: true,
        trim: true
    },
    categoria: {
        type: String,
        enum: ['alimentos', 'bebidas', 'limpieza', 'amenities', 'otros'],
        required: true
    },
    stockActual: {
        type: Number,
        required: true,
        default: 0
    },
    stockMinimo: {
        type: Number,
        required: true,
        default: 10
    },
    unidadMedida: {
        type: String,
        default: 'unidad'
    },
    precioUnitario: {
        type: Number,
        default: 0
    },
    proveedor: String,
    ultimaActualizacion: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Inventario', InventarioSchema);
