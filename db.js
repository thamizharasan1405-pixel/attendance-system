const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'db.json');
const MONGO_URI = process.env.MONGODB_URI; // set this on your host to enable permanent cloud storage

let mongoCollectionPromise = null;

// Lazily require + connect to MongoDB only if a connection string is configured.
// This means the "mongodb" package is only needed when MONGODB_URI is set -
// local development with the JSON file still works with zero extra installs.
function getMongoCollection() {
  if (!mongoCollectionPromise) {
    mongoCollectionPromise = (async () => {
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(MONGO_URI);
      await client.connect();
      const db = client.db('attendance_system');
      return db.collection('state');
    })();
  }
  return mongoCollectionPromise;
}

async function readDB() {
  if (MONGO_URI) {
    const col = await getMongoCollection();
    let doc = await col.findOne({ _id: 'main' });
    if (!doc) {
      // First run against a fresh MongoDB - seed it from the local demo data once.
      const seed = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      await col.insertOne({ _id: 'main', ...seed });
      return seed;
    }
    delete doc._id;
    return doc;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

async function writeDB(db) {
  if (MONGO_URI) {
    const col = await getMongoCollection();
    await col.replaceOne({ _id: 'main' }, { _id: 'main', ...db }, { upsert: true });
    return;
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

module.exports = { readDB, writeDB };
