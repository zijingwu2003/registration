// server.js
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// 允许跨域（这样 tiiny.host / 本地网页都能访问）
app.use(cors());
app.use(express.json());

// === 1. 连接 MongoDB Atlas ===
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set. Please configure it in Render environment variables.');
}

const client = new MongoClient(process.env.MONGODB_URI);
let registrationsCollection;

async function initDb() {
  try {
    await client.connect();

    // 这里的 'rewear' 是数据库名，你可以改成别的名字
    const db = client.db('rewear');

    // 这里的 'registrations' 是集合名（类似表名）
    registrationsCollection = db.collection('registrations');

    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
}

initDb();

// === 2. 报名接口：写入 MongoDB ===
app.post('/api/register', async (req, res) => {
  try {
    if (!registrationsCollection) {
      return res.status(503).json({ ok: false, error: 'Database not ready yet' });
    }

    const { name, email, phone, itemType, experience } = req.body;

    const doc = {
      name,
      email,
      phone,
      itemType,
      experience,
      createdAt: new Date(),
    };

    await registrationsCollection.insertOne(doc);

    console.log('✅ New registration inserted:', doc);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('❌ Error inserting registration:', err);
    res.status(500).json({ ok: false, error: 'Database error' });
  }
});

// === 3. 查询所有报名：从 MongoDB 读出来 ===
app.get('/api/registrations', async (req, res) => {
  try {
    if (!registrationsCollection) {
      return res.status(503).json({ ok: false, error: 'Database not ready yet' });
    }

    const docs = await registrationsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(docs);
  } catch (err) {
    console.error('❌ Error fetching registrations:', err);
    res.status(500).json({ ok: false, error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
