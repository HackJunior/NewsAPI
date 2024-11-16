const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://AdminJunior:yP6%238kz%21WqT9vN3m@143.198.191.121:27017/PortalNews')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

app.listen(PORT, '0.0.0.0', () => {
  console.log('Servidor corriendo en el puerto 3000');
});