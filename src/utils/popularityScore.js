/**
 * Calculate popularity score based on weighted metrics.
 * 
 * Score Formula:
 * (views * 0.4) + (likes * 0.3) + (comments/replies * 0.3)
 * 
 * @param {number} views - Number of views
 * @param {number} likes - Number of likes
 * @param {number} interactions - Number of comments or replies
 * @returns {number} - Calculated score
 */
const calculateScore = (views, likes, interactions) => {
    // Ensure all inputs are treated as numbers, default to 0 if missing/invalid
    const v = Number(views) || 0;
    const l = Number(likes) || 0;
    const i = Number(interactions) || 0;

    return (v * 0.4) + (l * 0.3) + (i * 0.3);
};

module.exports = { calculateScore };
