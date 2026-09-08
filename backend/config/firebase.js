const admin = require("firebase-admin");
const env = require("./env");
const fs = require("fs");

let db;

if (env.dbProvider === 'firebase') {
  const serviceAccountPath = env.firebaseServiceAccountPath;

  if (!fs.existsSync(serviceAccountPath)) {
    console.error('Firebase serviceAccountKey.json is missing');
    process.exit(1);
  }

  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  db = admin.firestore();
}

module.exports = db;
