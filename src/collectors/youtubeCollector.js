const axios = require('axios');
const db = require('../db/database');
const { calculateScore } = require('../utils/popularityScore');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const API_URL = 'https://www.googleapis.com/youtube/v3/search';
const VIDEO_DETAILS_URL = 'https://www.googleapis.com/youtube/v3/videos';

// Countries to segment by
const REGIONS = ['US', 'IN'];

const fetchYouTubeData = async () => {
    if (!YOUTUBE_API_KEY) {
        console.error('Missing YOUTUBE_API_KEY in environment variables.');
        return;
    }

    console.log('Starting YouTube Collection...');

    for (const region of REGIONS) {
        try {
            // 1. Search for videos
            const searchParams = {
                part: 'snippet',
                q: 'n8n workflow|n8n automation',
                type: 'video',
                maxResults: 50, // Fetch up to 50
                regionCode: region,
                key: YOUTUBE_API_KEY
            };

            const searchRes = await axios.get(API_URL, { params: searchParams });
            const items = searchRes.data.items || [];

            if (items.length === 0) continue;

            // 2. Get Video IDs to fetch stats
            const videoIds = items.map(item => item.id.videoId).join(',');

            // 3. Fetch stats (views, likes, commentCount)
            const statsParams = {
                part: 'statistics,snippet',
                id: videoIds,
                key: YOUTUBE_API_KEY
            };

            const statsRes = await axios.get(VIDEO_DETAILS_URL, { params: statsParams });
            const videos = statsRes.data.items || [];

            // 4. Process and Filter
            for (const video of videos) {
                const stats = video.statistics;
                const views = parseInt(stats.viewCount || '0', 10);
                const likes = parseInt(stats.likeCount || '0', 10);
                const commentCount = parseInt(stats.commentCount || '0', 10);

                // Filter constraints: views > 500, likes > 20
                if (views <= 500 || likes <= 20) {
                    continue;
                }

                const score = calculateScore(views, likes, commentCount);

                const workflowData = {
                    workflow: video.snippet.title,
                    platform: 'YouTube',
                    country: region,
                    popularity_metrics: JSON.stringify({
                        views,
                        likes,
                        comments: commentCount,
                        like_to_view_ratio: (likes / views).toFixed(4),
                        comment_to_view_ratio: (commentCount / views).toFixed(4)
                    }),
                    source_url: `https://www.youtube.com/watch?v=${video.id}`,
                    popularity_score: score,
                    last_updated: new Date().toISOString()
                };

                await upsertWorkflow(workflowData);
            }

        } catch (error) {
            console.error(`Error fetching YouTube data for region ${region}:`, error.message);
            // Don't crash, just log
        }
    }
    console.log('YouTube Collection Completed.');
};

const upsertWorkflow = (data) => {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO workflows (workflow, platform, country, popularity_metrics, source_url, popularity_score, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(source_url) DO UPDATE SET
                workflow = excluded.workflow,
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
                console.error(`Error upserting YouTube workflow ${data.source_url}:`, err.message);
            }
            resolve();
        });
    });
};

module.exports = { fetchYouTubeData };
