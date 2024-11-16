const express = require('express');
const router = express.Router();

const path = require('path');
const multer = require('multer');


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
router.post('/subirimagen', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No se subió ninguna imagen');
    }
    res.json({
        message: 'Imagen subida con éxito',
        filename: req.file.filename,
  });
});
module.exports = router;
