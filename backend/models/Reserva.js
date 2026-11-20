const mongoose = require('mongoose');

const ReservaSchema = new mongoose.Schema({
    cliente: {
        nombre: { type: String, required: true },
        email: { type: String, required: true },
        telefono: { type: String, required: true }
    },
    cabana: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cabana'
    },
    plan: {
        type: String,
        enum: ['normal', 'premium', 'black', 'golden'],
        required: true
    },
    fechaEntrada: {
        type: Date,
        required: true
    },
    fechaSalida: {
        type: Date,
        required: true
    },
    adultos: {
        type: Number,
        required: true
    },
    ninos: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    estado: {
        type: String,
        enum: ['pendiente', 'confirmada', 'checkin', 'checkout', 'cancelada'],
        default: 'pendiente'
    },
    observaciones: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Reserva', ReservaSchema);
