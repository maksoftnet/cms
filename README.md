C:\Projects\cms
│
├── .gitignore
├── README.md
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── src
├── main.ts
├── models
│   ├── Page.ts
│   └── PlatformExtension.ts
├── services
│   ├── postgres.ts
│   └── mongo.ts
└── transport
└── rest
└── page.ts

// === README.md ===

# CMS Sync Platform

Node.js + TypeScript application for synchronizing content between CMS systems, using PostgreSQL and MongoDB as backend data sources.

---

## ✅ I. Initial Installation (on a new machine)

1. **Clone the repository from GitHub**

   ```bash
   git clone https://github.com/YOUR_USERNAME/cms-sync-platform.git
   cd cms-sync-platform
   ```

2. **Install Node.js dependencies**

   ```bash
   npm install
   ```

3. **Start PostgreSQL and MongoDB with Docker**

   ```bash
   docker-compose up -d
   ```

4. **Start the application**

   ```bash
   npx ts-node src/main.ts
   ```

   📌 Alternatively (if you added a script in package.json):

   ```bash
   npm start
   ```

---

## 🔁 II. Daily Workflow (updating and running)

1. Navigate to the project folder:

   ```bash
   cd cms-sync-platform
   ```

2. Pull the latest changes:

   ```bash
   git pull
   ```

3. Install new dependencies if needed:

   ```bash
   npm install
   ```

4. Start Docker services:

   ```bash
   docker-compose up -d
   ```

5. Start the server:

   ```bash
   npx ts-node src/main.ts
   ```

---

✅ Technologies used:

* Node.js + TypeScript
* Express.js (REST API)
* PostgreSQL (relational database)
* MongoDB (flexible NoSQL structure)
* Docker Compose (for local setup)

---

🧠 The `node_modules/` and `dist/` folders are ignored via `.gitignore` and should not be pushed to Git.

---
