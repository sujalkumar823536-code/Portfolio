const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const dbFilePath = path.join(__dirname, 'portfolio.db');
const messagesJsonPath = path.join(__dirname, 'message.json');

let sqlFactory = null;

async function ensureSqlFactory() {
  if (!sqlFactory) {
    sqlFactory = await initSqlJs();
  }

  return sqlFactory;
}

async function getDatabase() {
  const SQL = await ensureSqlFactory();
  let database;

  if (fs.existsSync(dbFilePath)) {
    const fileBuffer = fs.readFileSync(dbFilePath);
    database = new SQL.Database(new Uint8Array(fileBuffer));
  } else {
    database = new SQL.Database();
  }

  database.run(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return database;
}

async function saveContactMessage({ name, email, message }) {
  const db = await getDatabase();

  db.run(
    'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
    [name, email, message]
  );

  const binary = db.export();
  fs.writeFileSync(dbFilePath, Buffer.from(binary));
  await exportContactMessages();

  return { success: true };
}

async function getContactMessages() {
  const db = await getDatabase();
  const result = db.exec('SELECT id, name, email, message, created_at FROM contact_messages ORDER BY id DESC');

  return result[0]?.values
    ? result[0].values.map(([id, name, email, message, created_at]) => ({
        id,
        name,
        email,
        message,
        created_at
      }))
    : [];
}

async function exportContactMessages() {
  const messages = await getContactMessages();
  fs.writeFileSync(messagesJsonPath, `${JSON.stringify(messages, null, 2)}\n`);
}

module.exports = {
  saveContactMessage,
  getContactMessages,
  exportContactMessages
};
