const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true
    },
    // Game State
    points: { type: Number, default: 1000 },
    energy: { type: Number, default: 100 },
    inventory: {
        banana: { type: Number, default: 0 },
        fish: { type: Number, default: 0 },
        clothes: { type: Number, default: 0 }
    },
    // Positional Data (Persisted optionally, mainly used for initial spawn)
    position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        z: { type: Number, default: 15 }
    },
    rotationY: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
