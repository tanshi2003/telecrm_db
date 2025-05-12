const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");
const authMiddleware = require("../middlewares/auth");

router.get("/", authMiddleware, searchController.search);
router.get("/suggestions", authMiddleware, searchController.getSuggestions);
module.exports = router;