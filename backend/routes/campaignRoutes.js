const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignController");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");

router.post("/", auth, role(["Admin", "Manager"]), campaignController.createCampaign);
router.get("/", auth, campaignController.getCampaigns);
router.get("/:id", auth, campaignController.getCampaignById);
router.put("/:id", auth, role(["Admin", "Manager"]), campaignController.updateCampaign);
router.delete("/:id", auth, role(["Admin"]), campaignController.deleteCampaign);
router.get("/progress/:id", auth, campaignController.getCampaignProgress);

module.exports = router;
