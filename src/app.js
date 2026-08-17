const express = require("express");
const cors = require("cors");

const registerRoutes = require("./routes/register.routes");
const dbRoutes = require("./routes/db.routes");
const webhookRoutes = require("./routes/webhook.routes");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "GSTSecureX Backend",
    status: "running"
  });
});

app.use("/api", registerRoutes);
app.use("/api", dbRoutes);
app.use("/api", webhookRoutes);
module.exports = app;