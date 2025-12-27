const cron = require('node-cron');
const { fetchYouTubeData } = require('../collectors/youtubeCollector');
const { fetchForumData } = require('../collectors/forumCollector');
const { fetchTrendsData } = require('../collectors/trendsCollector');

const startScheduler = () => {
    console.log('Scheduler started. Jobs scheduled for daily execution at midnight.');

    // Schedule task to run at midnight (0 0 * * *)
    cron.schedule('0 0 * * *', async () => {
        const now = new Date().toISOString();
        console.log(`[${now}] Running scheduled tasks...`);

        try {
            console.log('Step 1: Fetching YouTube Data');
            await fetchYouTubeData();

            console.log('Step 2: Fetching Forum Data');
            await fetchForumData();

            console.log('Step 3: Fetching Google Trends Data');
            await fetchTrendsData();

            console.log(`[${new Date().toISOString()}] All scheduled tasks completed successfully.`);
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Error during scheduled tasks:`, error.message);
        }
    });
};

module.exports = { startScheduler };
