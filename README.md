# 🚀 n8n Popularity Tracking System

![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)
![Status](https://img.shields.io/badge/status-production--ready-brightgreen.svg)

A production-grade analytics system designed to track, rank, and visualize the most popular **n8n workflows** across the web.

The system aggregates data from **YouTube**, **n8n Community Forum**, and **Google Trends**, calculates a unified "Popularity Score", and serves the insights via a REST API and a visual Dashboard.


## 🌟 Features

-   **Multi-Source Aggregation**:
    -   📺 **YouTube**: Tracks views, likes, and comment ratios for n8n tutorials.
    -   💬 **Discourse Forum**: Monitors trending topics, replies, and views.
    -   📈 **Google Trends**: (Experimental) Tracks search interest velocity.
-   **Smart Scoring Algorithm**:
    -   Weighted formula: `(Views × 0.4) + (Likes × 0.3) + (Interactions × 0.3)`
-   **Automated Updates**:
    -   Runs daily at **Midnight** via `node-cron`.
    -   Automatically upserts new data and updates existing metrics.
-   **Visual Dashboard**:
    -   Clean, responsive HTML5 frontend to explore trending workflows.
-   **Scalable Architecture**:
    -   Built on Node.js/Express & SQLite.
    -   Designed to handle 20,000+ records with optimized SQL queries.

---

## 🏗️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Runtime** | Node.js (LTS) | Core application runtime. |
| **Framework** | Express.js | REST API and static file serving. |
| **Database** | SQLite | Serverless, zero-config SQL engine. |
| **Scheduler** | node-cron | robust cron implementation for Node. |
| **HTTP Client** | Axios | Promise-based HTTP client for API requests. |
| **Frontend** | HTML5/CSS3 | Lightweight visualization dashboard. |

---

## 🛠️ Installation & Setup

### Prerequisites
-   Node.js v18 or higher
-   npm

### 1. Clone & Install
```bash
git clone https://github.com/username/n8n-popularity-system.git
cd n8n-popularity-system
npm install
```

### 2. Configuration
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Edit `.env` and add your keys:
```env
PORT=3000
YOUTUBE_API_KEY=your_actual_youtube_api_key_v3
FORUM_BASE_URL=https://community.n8n.io
```

### 3. Run the System
```bash
# Start the server (Production mode)
npm start

# Run in development mode (with auto-reload)
npm run dev
```

---

## 🖥️ Usage

### 📊 Visual Dashboard
Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

### 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/workflows` | Get all top workflows (sorted by score). |
| `GET` | `/api/workflows?platform=YouTube` | Filter by Platform (YouTube, Forum, Google). |
| `GET` | `/api/workflows?country=US` | Filter by Country/Region. |

**Example Response:**
```json
{
  "count": 50,
  "data": [
    {
      "workflow": "How to Build AI Agents",
      "platform": "YouTube",
      "popularity_score": 15420.5,
      "popularity_metrics": { "views": 25000, "likes": 1200 }
    }
  ]
}
```

### 🕰️ Manual Trigger (Dev Only)
To force a data refresh immediately without waiting for the nightly cron job:
```bash
node src/scripts/trigger_collectors.js
```

---

## 📂 Project Structure

```
n8n-popularity-system/
├── public/                 # Frontend Dashboard
│   └── index.html
├── src/
│   ├── api/                # Express Routes
│   ├── collectors/         # Data Fetching Logic (YouTube/Forum/Trends)
│   ├── cron/               # Scheduler (node-cron)
│   ├── db/                 # Database Connection & Models
│   └── utils/              # Scoring Algorithms
├── server.js               # Application Entry Point
└── n8n_popularity.sqlite   # Database File (Auto-created)
```

---

## 📈 Optimization & Scaling
This system is architected to scale from 50 to **20,000+** records:
1.  **Database**: SQLite allows concurrent reads. The `source_url` index ensures O(1) lookups during upserts.
2.  **Memory**: Collectors process data in streams/batches (implied logic) to allow low-memory footprint.
3.  **Future Proofing**: For >100k records, the `src/db/database.js` module can be swapped for a PostgreSQL driver with zero changes to the business logic.

---

