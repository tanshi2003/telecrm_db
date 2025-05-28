const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
const leadRoutes = require("./leadRoutes");
const adminRoutes = require("./adminRoutes");
const managerRoutes = require("./managerRoutes");

router.use("/users", userRoutes);
router.use("/leads", leadRoutes);
router.use("/admins", adminRoutes);
router.use("/managers", managerRoutes);

module.exports = router;