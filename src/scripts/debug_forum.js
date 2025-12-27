const axios = require('axios');
const db = require('../db/database');

const checkDb = () => {
    db.get("SELECT count(*) as count FROM workflows", (err, row) => {
        if (err) console.error(err);
        else console.log('Current DB Row Count:', row.count);
    });

    db.all("SELECT * FROM workflows LIMIT 5", (err, rows) => {
        if (err) console.error(err);
        else console.log('First 5 rows:', rows);
    });
};

const checkForumAPI = async () => {
    try {
        console.log('Fetching Forum Latest...');
        const res = await axios.get('https://community.n8n.io/latest.json');
        const topics = res.data.topic_list.topics;
        console.log(`Found ${topics.length} topics.`);
        if (topics.length > 0) {
            const t = topics[0];
            console.log('Sample Topic:', {
                title: t.title,
                views: t.views,
                posts_count: t.posts_count,
                like_count: t.like_count
            });

            // Test filter logic
            const replies = t.posts_count - 1;
            const views = t.views;
            console.log(`Would satisfy filter (replies > 5 && views > 300)?`, replies > 5 && views > 300);
        }
    } catch (e) {
        console.error('Forum API Error:', e.message);
    }
};

checkDb();
checkForumAPI();
