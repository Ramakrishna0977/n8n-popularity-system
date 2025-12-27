const googleTrends = require('google-trends-api');
const db = require('../db/database');

const KEYWORDS = [
    'n8n slack workflow',
    'n8n whatsapp automation',
    'n8n gmail automation'
];

const GEO_MAP = {
    'US': 'US',
    'IN': 'IN'
};

const fetchTrendsData = async () => {
    console.log('Starting Google Trends Collection...');

    for (const keyword of KEYWORDS) {
        for (const [key, geo] of Object.entries(GEO_MAP)) {
            try {
                // Fetch interest over time (last 3 months to see trend)
                // Note: google-trends-api returns JSON string
                const resultStr = await googleTrends.interestOverTime({
                    keyword: keyword,
                    geo: geo,
                    startTime: new Date(Date.now() - (60 * 24 * 60 * 60 * 1000)) // 60 days
                });

                const result = JSON.parse(resultStr);

                if (!result.default || !result.default.timelineData || result.default.timelineData.length === 0) {
                    continue;
                }

                const timeline = result.default.timelineData;

                // Get latest meaningful data point
                const latestData = timeline[timeline.length - 1];
                const interestScore = latestData.value[0]; // array of values per keyword

                // Determine trend direction (comparing start of 60 days to now)
                const startData = timeline[0];
                const startScore = startData.value[0];

                let direction = 'Stable';
                if (interestScore > startScore + 10) direction = 'Up';
                else if (interestScore < startScore - 10) direction = 'Down';

                // Filter: interest > 40
                if (interestScore <= 40) {
                    continue;
                }

                // Simulating score calculation for trends since it maps differently
                // Weighted score: interest * 1.0 (since max is 100)
                const score = interestScore;

                const workflowData = {
                    workflow: keyword,
                    platform: 'Google',
                    country: key,
                    popularity_metrics: JSON.stringify({
                        interest_score: interestScore,
                        trend_direction: direction,
                        geo: geo
                    }),
                    source_url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(keyword)}&geo=${geo}`,
                    popularity_score: score,
                    last_updated: new Date().toISOString()
                };

                await upsertWorkflow(workflowData);

            } catch (error) {
                console.error(`Error fetching trends for ${keyword} in ${geo}:`, error.message);
            }
        }
    }
    console.log('Google Trends Collection Completed.');
};

const upsertWorkflow = (data) => {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO workflows (workflow, platform, country, popularity_metrics, source_url, popularity_score, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(source_url) DO UPDATE SET
                popularity_metrics = excluded.popularity_metrics,
                popularity_score = excluded.popularity_score,
                last_updated = excluded.last_updated
        `;

        const params = [
            data.workflow,
            data.platform,
            data.country,
            data.popularity_metrics,
            data.source_url,
            data.popularity_score,
            data.last_updated
        ];

        db.run(query, params, (err) => {
            if (err) {
                console.error(`Error upserting Trends workflow ${data.workflow}:`, err.message);
            }
            resolve();
        });
    });
};

module.exports = { fetchTrendsData };
