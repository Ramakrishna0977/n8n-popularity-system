require('dotenv').config();
const { fetchYouTubeData } = require('../collectors/youtubeCollector');
const { fetchForumData } = require('../collectors/forumCollector');
const { fetchTrendsData } = require('../collectors/trendsCollector');
const db = require('../db/database');

const runManualCollection = async () => {
    console.log('Starting Manual Data Collection...');

    // Ensure DB connection is ready (though file-based sqlite is usually instant)

    try {
        console.log('--- YouTube ---');
        await fetchYouTubeData();
        console.log('\n--- Forum ---');
        await fetchForumData();
        console.log('\n--- Google Trends ---');
        await fetchTrendsData();
    } catch (error) {
        console.error('Error in manual collection:', error);
    }

    console.log('\nManual Collection Finished.');
    console.log('You can now query /api/workflows');
};

runManualCollection();
