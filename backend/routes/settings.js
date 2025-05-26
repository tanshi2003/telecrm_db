const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const ExotelConfig = require('../models/ExotelConfig');
const responseFormatter = require('../utils/responseFormatter');

// Debug middleware
router.use((req, res, next) => {
    console.log('Settings Route:', {
        method: req.method,
        path: req.path,
        body: req.body,
        headers: req.headers
    });
    next();
});

// Get Exotel configuration
router.get('/exotel', authenticateToken, async (req, res) => {
    console.log('GET /exotel route hit');
    try {
        ExotelConfig.getConfig((err, results) => {
            if (err) {
                console.error('Error fetching Exotel config:', err);
                return res.status(500).json(responseFormatter(false, 'Failed to fetch Exotel configuration'));
            }
            
            if (!results || results.length === 0) {
                return res.status(404).json(responseFormatter(false, 'Exotel configuration not found'));
            }

            // Mask the token for security
            const config = results[0];
            config.token = '********';
            
            res.json(responseFormatter(true, 'Exotel configuration retrieved successfully', config));
        });
    } catch (error) {
        console.error('Error in getExotelConfig:', error);
        res.status(500).json(responseFormatter(false, error.message));
    }
});

// Update Exotel configuration
router.post('/exotel', authenticateToken, async (req, res) => {
    console.log('POST /exotel route hit');
    try {
        const { sid, token, phone_number } = req.body;
        console.log('Request body:', { sid, token, phone_number });

        // Validate required fields
        if (!sid || !token || !phone_number) {
            return res.status(400).json(responseFormatter(false, 'All fields are required'));
        }

        ExotelConfig.updateConfig({ sid, token, phone_number }, (err, result) => {
            if (err) {
                console.error('Error updating Exotel config:', err);
                return res.status(500).json(responseFormatter(false, 'Failed to update Exotel configuration'));
            }

            res.json(responseFormatter(true, 'Exotel configuration updated successfully'));
        });
    } catch (error) {
        console.error('Error in updateExotelConfig:', error);
        res.status(500).json(responseFormatter(false, error.message));
    }
});

module.exports = router;