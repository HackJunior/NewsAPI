const express = require('express');
const mongoose = require('mongoose');
const News = require('./models/News');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join('/app/uploads'));
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname); // Extraer la extensión del archivo original
    const filename = `${Date.now()}-${path.basename(file.originalname, fileExtension)}${fileExtension}`; // Construir el nombre sin agregar la extensión dos veces
    cb(null, filename);
  },
});


const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Tamaño máximo de 5 MB
});

// Middleware para manejar JSON
app.use(express.json());

// Conexión a MongoDB
mongoose.connect('mongodb://mongodb_server:27017/PortalNews')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));


// Ruta para obtener noticias por categoría
app.get('/news', async (req, res) => {
  const { category } = req.query;

  if (!category) {
    return res.status(400).json({ message: 'Category is required' });
  }

  try {
    const newsItems = await News.find({ category });
    res.status(200).json(newsItems);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching news', error: err.message });
  }
});

app.get('/newsTag', async (req, res) => {
  const { tags } = req.query;
  console.log(req.query);

  if (!tags) {
    return res.status(400).json({ message: 'Tag is required' });
  }

  try {
    const newsItems = await News.find({ tags });
    res.status(200).json(newsItems);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching news', error: err.message });
  }
});


// Ruta para agregar una noticiasas
app.post('/addnews', async (req, res) => {
  const { title, content, category, image, tags } = req.body;
  console.log(req.body);

  // Validación simple
  if (!title || !content || !category || !image || !tags) {
    return res.status(400).json({ message: 'Title, content, category, image, and tags are required' });
  }

  try {
    if (tags.includes("Portada")) {
      const existingPortada = await News.findOne({ tags: "Portada" });
      
      if (existingPortada) {
        existingPortada.tags = existingPortada.tags.filter(tag => tag !== "Portada");
        await existingPortada.save();
      }
    }

    // Crea el nuevo documento y guarda en la colección
    const newNews = new News({ title, content, category, image, tags });
    await newNews.save();

    res.status(201).json({ message: 'News created successfully', news: newNews });
  } catch (err) {
    res.status(500).json({ message: 'Error creating news', error: err.message });
  }
});


app.post('/subirimagen', upload.single('image'), (req, res) => {
    console.log('here');
    if (!req.file) {
        return res.status(400).send('No se subió ninguna imagen');
    }
    res.json({
        message: 'Imagen subida con éxito',
        filename: `http://localhost/uploads/${req.file.filename}`,
  });
});


// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log('Servidor corriendo en el puerto 3000');
});