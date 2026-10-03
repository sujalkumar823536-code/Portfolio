const fs = require('fs/promises');
const path = require('path');
const { MongoClient } = require('mongodb');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const databaseName = process.env.MONGODB_DB || 'portfolio';
const messagesJsonPath = path.join(__dirname, 'message.json');
let connectionPromise;
let exportPromise = Promise.resolve();

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

  await exportContactMessages();

  return { success: true, id: result.insertedId };
}

function exportContactMessages() {
  exportPromise = exportPromise.catch(() => {}).then(async () => {
    const collection = await getContactMessagesCollection();
    const messages = await collection.find().sort({ createdAt: -1 }).toArray();
    await fs.writeFile(messagesJsonPath, `${JSON.stringify(messages, null, 2)}\n`);
  });

  return exportPromise;
}

module.exports = {
  connectToDatabase,
  saveContactMessage,
  exportContactMessages
};
