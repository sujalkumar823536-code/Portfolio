const { MongoClient } = require('mongodb');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const databaseName = process.env.MONGODB_DB || 'portfolio';
let connectionPromise;

async function getContactMessagesCollection() {
  if (!connectionPromise) {
    const client = new MongoClient(mongoUri);
    connectionPromise = client.connect()
      .then(() => client.db(databaseName).collection('contact_messages'))
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
}

async function connectToDatabase() {
  await getContactMessagesCollection();
}

async function saveContactMessage({ name, email, message }) {
  const collection = await getContactMessagesCollection();
  const result = await collection.insertOne({
    name,
    email,
    message,
    createdAt: new Date()
  });

  return { success: true, id: result.insertedId };
}

async function getContactMessages() {
  const collection = await getContactMessagesCollection();
  return collection.find().sort({ createdAt: -1 }).toArray();
}

module.exports = {
  connectToDatabase,
  saveContactMessage,
  getContactMessages
};
