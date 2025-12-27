const express = require('express');
const db = require('../db/database');
const router = express.Router();

/**
 * GET /api/workflows
 * Query params:
 *  - platform (optional): YouTube, Forum, Google
 *  - country (optional): US, IN, Global
 */
router.get('/workflows', (req, res) => {
    const { platform, country } = req.query;

    let query = `SELECT * FROM workflows`;
    const params = [];
    const conditions = [];

    if (platform) {
        conditions.push(`platform = ?`);
        params.push(platform);
    }

    if (country) {
        conditions.push(`country = ?`);
        params.push(country);
    }

    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY popularity_score DESC`;

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error fetching workflows:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Parse popularity_metrics from JSON string to object
        const data = rows.map(row => ({
            ...row,
            popularity_metrics: JSON.parse(row.popularity_metrics)
        }));

        res.json({
            count: data.length,
            data: data
        });
    });
});

module.exports = router;
