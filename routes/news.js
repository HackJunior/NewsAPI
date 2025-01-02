const News = require('../models/News');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/news', async (req, res) => {
  const { category, tags, id,urlIdTitle } = req.query;
  console.log(req.query)

  try {
    const filter = {};

    if (id) {
      const newsItem = await News.findById(id);
      if (!newsItem) {
        return res.status(404).json({ message: 'News not found' });
      }
      return res.status(200).json(newsItem);
    }

    // Filtro por categoría
    if (category) {
      filter.category = category;
    }

    if (urlIdTitle) {
      filter.urlIdTitle = urlIdTitle;
    }
  
    // Filtro por etiquetas
    if (tags) {
      const tagsArray = tags.split(','); 
      filter.tags = { $all: tagsArray }; 
    }

    console.log('filter', filter);

    // Buscar noticias con los filtros proporcionados
    const newsItems = await News.find(filter).sort({ createdAt: -1 });
    res.status(200).json(newsItems);

  } catch (err) {
    res.status(500).json({ message: 'Error fetching news', error: err.message });
  }
});

router.get('/news/top', async (req, res) => {
    const { limit=6,days=3} = req.body; 
    try {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);

        const topArticles = await News.find({
        createdAt: { $gte: dateLimit }, 
        })
        .sort({ timesreaded: -1 }) 
        .limit(limit); 

        res.json(topArticles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching top articles' });
    }
});
  
router.post('/news', async (req, res) => {
  const { title, content, category, image, tags } = req.body;

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

    const urlIdTitle = title
      .replace(/ /g, '-') 
      .toLowerCase()
      .replace('ñ', 'n') 
      .replace(/[áàäâ]/g, 'a') 
      .replace(/[éèëê]/g, 'e') 
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o') 
      .replace(/[úùüû]/g, 'u'); 

    const newNews = new News({ title, content, category, image, tags,urlIdTitle });
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
router.put('/news/:id/read', async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    } 

    try {
        const result = await News.updateOne(
            { _id: id }, 
            { $inc: { timesreaded: 1 } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Article not found' });
        }

        res.json({ message: 'Article read count updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating article read count' });
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
