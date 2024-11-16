const News = require('./models/News');
const express = require('express');
const router = express.Router();

router.get('/news', async (req, res) => {
  const { category, tags } = req.query;

  try {
    const filter = {};
    if (category) {
      filter.category = category;
    }

    if (tags) {
      const tagsArray = tags.split(','); 
      filter.tags = { $all: tagsArray }; 
    }

  
    const newsItems = await News.find(filter);
    res.status(200).json(newsItems);

  } catch (err) {
    res.status(500).json({ message: 'Error fetching news', error: err.message });
  }
});
router.post('/news', async (req, res) => {
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
router.put('/news/:id', async (req, res) => {
  const { id } = req.params;
  const { title, category, tags, content } = req.body;

  // Validar formato del ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    // Buscar y actualizar la noticia
    const updatedNews = await News.findByIdAndUpdate(
      id,
      { title, category, tags, content },
      { new: true, runValidators: true }
    );

    if (!updatedNews) {
      return res.status(404).json({ message: 'News item not found' });
    }

    res.status(200).json({ message: 'News updated successfully', data: updatedNews });
  } catch (err) {
    res.status(500).json({ message: 'Error updating news', error: err.message });
  }
});
router.delete('/news/:id', async (req, res) => {
  const { id } = req.params;

  // Validar formato del ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    // Buscar y eliminar la noticia
    const deletedNews = await News.findByIdAndDelete(id);

    if (!deletedNews) {
      return res.status(404).json({ message: 'News item not found' });
    }

    res.status(200).json({ message: 'News deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting news', error: err.message });
  }
});

module.exports = router;
