const express = require("express");

const {
  handleSMSReply
} = require("../controllers/webhook.controller");

const router = express.Router();

router.post("/webhook/sms", handleSMSReply);

module.exports = router;