const express = require('express');
const { chatWithGPT } = require('../services/chatService');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { message } = req.body;
        const response = await chatWithGPT(message);

        res.json({
            success: true,
            response: response,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

module.exports = router;
