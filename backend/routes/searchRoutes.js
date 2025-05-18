const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");
const { authenticateToken } = require("../middlewares/auth");

router.get("/", authenticateToken, searchController.search);
router.get("/suggestions", authenticateToken, searchController.getSuggestions);
module.exports = router;