const express = require("express");

const {
  registerGST
} = require("../controllers/register.controller");

const router = express.Router();

router.post("/register", registerGST);

module.exports = router;