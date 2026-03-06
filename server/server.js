require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('./models/User');

const DEFAULT_PORT = 8080;
const PORT = Number(process.env.PORT) || DEFAULT_PORT;
const JWT_SECRET = process.env.JWT_SECRET || 'development-only-secret';
const CLIENT_ORIGINS = (process.env.CLIENT_URL || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const DB_STATE = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
};

const app = express();
const server = http.createServer(app);

const isAllowedOrigin = (origin) => {
    if (!origin) return true;
    if (CLIENT_ORIGINS.includes('*')) return true;
    return CLIENT_ORIGINS.includes(origin);
};

const corsOptions = {
    origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT']
};

app.use(cors(corsOptions));
app.use(express.json());

const io = new Server(server, {
    cors: {
        origin(origin, callback) {
            if (isAllowedOrigin(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error(`Origin not allowed by Socket.IO CORS: ${origin}`));
        },
        methods: ['GET', 'POST']
    }
});

const ensureDatabaseConnection = (res) => {
    if (mongoose.connection.readyState !== 1) {
        res.status(503).json({ error: 'Database not connected. Check server/.env MONGO_URI.' });
        return false;
    }

    return true;
};

const connectToDatabase = async () => {
    if (!process.env.MONGO_URI) {
        console.warn('MONGO_URI is missing. Auth and save APIs will not work until it is configured.');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
    }
};

connectToDatabase();

app.get('/api/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        port: PORT,
        database: DB_STATE[mongoose.connection.readyState] ?? 'unknown'
    });
});

app.post('/api/signup', async (req, res) => {
    try {
        if (!ensureDatabaseConnection(res)) return;

        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error during signup' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        if (!ensureDatabaseConnection(res)) return;

        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) return res.status(400).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token,
            user: {
                username: user.username,
                points: user.points,
                energy: user.energy,
                inventory: user.inventory,
                position: user.position,
                rotationY: user.rotationY
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error during login' });
    }
});

app.put('/api/save-state', async (req, res) => {
    try {
        if (!ensureDatabaseConnection(res)) return;

        const { username, points, energy, inventory, position, rotationY } = req.body;
        await User.findOneAndUpdate(
            { username },
            { $set: { points, energy, inventory, position, rotationY } }
        );
        res.status(200).json({ message: 'State saved' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save state' });
    }
});

const players = {};

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join_game', (userData) => {
        players[socket.id] = {
            id: socket.id,
            username: userData.username,
            x: userData.position?.x || (Math.random() * 20 - 10),
            y: userData.position?.y || 0,
            z: userData.position?.z || 15,
            rotationY: userData.rotationY || 0,
            animating: false
        };

        socket.emit('current_players', players);
        socket.broadcast.emit('player_joined', players[socket.id]);
        console.log(`Player joined: ${userData.username} at ${socket.id}`);
    });

    socket.on('player_move', (moveData) => {
        if (players[socket.id]) {
            players[socket.id].x = moveData.x;
            players[socket.id].y = moveData.y;
            players[socket.id].z = moveData.z;
            players[socket.id].rotationY = moveData.rotationY;
            players[socket.id].animating = moveData.animating;

            socket.broadcast.emit('player_moved', players[socket.id]);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        if (players[socket.id]) {
            io.emit('player_left', socket.id);
            delete players[socket.id];
        }
    });
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the existing process or change server/.env PORT.`);
        process.exit(1);
    }

    console.error('Server failed to start:', error);
    process.exit(1);
});

server.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
    console.log(`Allowed client origins: ${CLIENT_ORIGINS.join(', ')}`);
});
