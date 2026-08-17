require("dotenv").config();

const requiredEnv = [
  "DATABASE_URL"
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.DATABASE_URL,

  twilioSid: process.env.TWILIO_SID || "",
  twilioAuth: process.env.TWILIO_AUTH || "",
  twilioPhone: process.env.TWILIO_PHONE || "",

  encryptionKey: process.env.ENCRYPTION_KEY || ""
};