const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
const leadRoutes = require("./leadRoutes");
const adminRoutes = require("./adminRoutes");

router.use("/users", userRoutes);
router.use("/leads", leadRoutes);
router.use("/admins", adminRoutes);

module.exports = router;