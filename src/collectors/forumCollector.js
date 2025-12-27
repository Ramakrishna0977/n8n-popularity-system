const axios = require('axios');
const db = require('../db/database');
const { calculateScore } = require('../utils/popularityScore');

const FORUM_BASE_URL = process.env.FORUM_BASE_URL || 'https://community.n8n.io';

const fetchForumData = async () => {
    console.log('Starting Forum Collection...');
    try {
        await fetchTopics('latest.json');
        await fetchTopics('search.json?q=n8n');
    } catch (error) {
        console.error('Error during Forum Collection:', error.message);
    }
    console.log('Forum Collection Completed.');
};

const fetchTopics = async (endpoint) => {
    const url = `${FORUM_BASE_URL}/${endpoint}`;
    try {
        const response = await axios.get(url);
        let topics = [];

        if (response.data.topic_list && response.data.topic_list.topics) {
            topics = response.data.topic_list.topics;
        } else if (response.data.topics) {
            topics = response.data.topics;
        }

        for (const topic of topics) {
            const replies = topic.posts_count - 1; // posts_count includes the original post
            const views = topic.views;
            const likeCount = topic.like_count;

            // Filter: replies > 5, views > 300
            if (replies <= 5 || views <= 300) {
                continue;
            }

            const score = calculateScore(views, likeCount, replies);

            const workflowData = {
                workflow: topic.title,
                platform: 'Forum',
                country: 'Global', // Forums are generally global
                popularity_metrics: JSON.stringify({
                    views,
                    like_count: likeCount,
                    reply_count: replies,
                    unique_contributors: topic.posters ? topic.posters.length : 0
                }),
                source_url: `${FORUM_BASE_URL}/t/${topic.slug}/${topic.id}`,
                popularity_score: score,
                last_updated: new Date().toISOString()
            };

            await upsertWorkflow(workflowData);
        }
    } catch (error) {
        console.error(`Error fetching topics from ${url}:`, error.message);
    }
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

        db.run(query, params, function (err) {
            if (err) {
                console.error(`Error upserting Forum workflow ${data.source_url}:`, err.message);
                resolve(); // Resolve anyway to continue
            } else {
                resolve();
            }
        });
    });
};

module.exports = { fetchForumData };
