const express = require('express');
const Survey = require('../models/Survey'); // Importa el modelo de encuesta
const router = express.Router();


const getActiveSurveyWithResults = async () => {
    try {
        const survey = await Survey.findOne({ isActive: true });
        if (!survey) return { success: false, message: 'No active survey found' };

        const totalVotes = survey.yesVotes + survey.noVotes;
        const yesPercentage = totalVotes > 0 ? ((survey.yesVotes / totalVotes) * 100).toFixed(2) : 0;
        const noPercentage = totalVotes > 0 ? ((survey.noVotes / totalVotes) * 100).toFixed(2) : 0;

        return {
            success: true,
            survey: {
                title: survey.title,
                yesVotes: survey.yesVotes,
                noVotes: survey.noVotes,
                totalVotes,
                percentages: {
                    yes: `${yesPercentage}%`,
                    no: `${noPercentage}%`
                }
            }
        };
    } catch (error) {
        return { success: false, message: 'Error fetching active survey', error };
    }
};
const getAllSurveys = async () => {
    try {
        const surveys = await Survey.find({});
        return { success: true, surveys };
    } catch (error) {
        return { success: false, message: 'Error fetching surveys', error };
    }
};
const addVote = async (surveyId, voteType) => {
    try {
        const update = voteType === 'yes' 
            ? { $inc: { yesVotes: 1 } }
            : { $inc: { noVotes: 1 } };

        const survey = await Survey.findByIdAndUpdate(surveyId, update, { new: true });
        if (!survey) return { success: false, message: 'Survey not found' };

        return { success: true, message: `Vote added to ${voteType}`, survey };
    } catch (error) {
        return { success: false, message: 'Error adding vote', error };
    }
};

router.get('/surveys/active', async (req, res) => {
    const result = await getActiveSurveyWithResults();
    res.status(result.success ? 200 : 404).json(result);
});
router.get('/surveys', async (req, res) => {
    const result = await getAllSurveys();
    res.status(result.success ? 200 : 500).json(result);
});
router.post('/surveys/:id/vote', async (req, res) => {
    const { id } = req.params;
    const { voteType } = req.body; 
    if (!['yes', 'no'].includes(voteType)) {
        return res.status(400).json({ success: false, message: 'Invalid vote type' });
    }
    const result = await addVote(id, voteType);
    res.status(result.success ? 200 : 404).json(result);
});
router.post('/surveys', async (req, res) => {
    const { title } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'El título es obligatorio.' });
    }
    try {
        // Desactivar cualquier survey activo
        await Survey.updateMany({ isActive: true }, { isActive: false });

        // Crear el nuevo survey (isActive será true por defecto)
        const newSurvey = new Survey({ title });
        await newSurvey.save();

        res.status(201).json({
            message: 'Survey creado con éxito.',
            survey: newSurvey
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al crear el survey.' });
    }
});


module.exports = router;
