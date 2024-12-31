const mongoose = require('mongoose');

let retryCount = 0;
const maxRetries = 10;

// Verbindung herstellen mit Retry-Logik
const mongoDB = () => {
  console.log('Attempting to connect to MongoDB...');
  mongoose.connect(process.env.CONN_STR, {})
  .catch((err) => {
    retryCount++;
    if (retryCount < maxRetries) {
      console.error(`MongoDB connection failed. Retrying (${retryCount}/${maxRetries}) in 5 seconds...`, err);
      setTimeout(mongoDB, 5000);
    } else {
      console.error('Max retries reached. Could not connect to MongoDB.');
    }
  });
};

// Ereignisse für Debugging und Überwachung
mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to DB: [${mongoose.connection.name} on ${mongoose.connection.host}:${mongoose.connection.port}]`);
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected. Retrying...');
  mongoDB();
});

module.exports = { connectMongoDBWithRetry: mongoDB };
