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


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());
app.use(express.json());

function generateToken(username) {
    return jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
}
function authenticateAndRenewToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido o expirado' });

        const now = Math.floor(Date.now() / 1000); 
        const timeLeft = user.exp - now;

        if (timeLeft < 300) { 
            const newToken = generateToken(user.username);
            res.setHeader('x-new-token', newToken);
        }
        req.user = user;
        next();
    });
}

app.use('/api',authenticateAndRenewToken,imagen);
app.use('/api',login);
app.use('/api',authenticateAndRenewToken ,news);
app.use('/api',authenticateAndRenewToken ,survey);
app.use('/api',authenticateAndRenewToken ,users);


app.use('/api', authenticateAndRenewToken, (req, res) => {
    res.json({ message: 'Acceso concedido', user: req.user });
});

mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?authSource=admin`)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

app.listen(process.env.PORT, '0.0.0.0', () => {
  console.log('Servidor corriendo en el puerto 3000');
});