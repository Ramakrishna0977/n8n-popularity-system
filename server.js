require('dotenv').config();
const express = require('express');
const { createTable } = require('./src/db/workflowModel');
const routes = require('./src/api/routes');
const scheduler = require('./src/cron/scheduler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize Database
createTable();

// Routes
app.use('/api', routes);

// Start Cron
scheduler.startScheduler();

app.get('/', (req, res) => {
    res.send('n8n Popularity System API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
