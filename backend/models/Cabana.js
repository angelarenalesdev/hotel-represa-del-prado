const mongoose = require('mongoose');

const CabanaSchema = new mongoose.Schema({
    numero: {
        type: String,
        required: true,
        unique: true
    },
    tipo: {
        type: String,
        enum: ['normal', 'premium', 'black', 'golden'],
        required: true
    },
    capacidad: {
        type: Number,
        required: true,
        default: 2
    },
    precioNoche: {
        type: Number,
        required: true
    },
    estado: {
        type: String,
        enum: ['disponible', 'ocupada', 'mantenimiento', 'limpieza'],
        default: 'disponible'
    },
    descripcion: String,
    comodidades: [String],
    ocupantes: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Cabana', CabanaSchema);
