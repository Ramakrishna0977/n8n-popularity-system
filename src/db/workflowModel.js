const db = require('./database');

const createTable = () => {
    const query = `
    CREATE TABLE IF NOT EXISTS workflows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workflow TEXT NOT NULL,
        platform TEXT NOT NULL,
        country TEXT,
        popularity_metrics TEXT,
        source_url TEXT UNIQUE,
        popularity_score REAL,
        last_updated TEXT
    )
    `;

    db.run(query, (err) => {
        if (err) {
            console.error('Error creating table: ' + err.message);
        } else {
            console.log('Workflows table ready.');
        }
    });
};

module.exports = { createTable };
