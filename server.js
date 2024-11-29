const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

const imagen = require('./routes/imagen');
const news = require('./routes/news');
const survey = require('./routes/surveys');
const users = require('./routes/users');
const login = require('./routes/login');

const app = express();
require('dotenv').config();

// Middleware para solicitudes preflight
app.use(cors({
    origin: 'http://localhost', // Cambiar a '*' si necesitas permitir todos los orígenes
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true, // Si necesitas enviar cookies o encabezados de autenticación
}));

app.options('*', cors()); // Manejo explícito de solicitudes OPTIONS

// Middleware para solicitudes estáticas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
    next();
});

app.options('*', (req, res, next) => {
    console.log('Handling OPTIONS request');
    next();
});

// Generador de tokens JWT
function generateToken(username) {
    return jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Middleware de autenticación y renovación de token
function authenticateAndRenewToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido o expirado' });

        const now = Math.floor(Date.now() / 1000);
        const timeLeft = user.exp - now;

        if (timeLeft < 900) {
            const newToken = generateToken(user.username);
            res.setHeader('x-new-token', newToken);
        }
        req.user = user;
        next();
    });
}

// Rutas
app.use('/api', login);
app.use('/api', authenticateAndRenewToken, news);
app.use('/api', authenticateAndRenewToken, survey);
app.use('/api', authenticateAndRenewToken, users);
app.use('/api', authenticateAndRenewToken, imagen);

// Conexión a MongoDB
mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?authSource=admin`)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Inicialización del servidor
app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
});
