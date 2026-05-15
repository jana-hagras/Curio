import { Router } from "express";
import * as Milestone from "./milestone.service.js";
import { extractUser, requireArtisan, requireMilestoneOwner } from "../../middleware/auth.js";

const router = Router();

// Read routes — open to all roles
router.get("/search", Milestone.searchMilestones);
router.get("/request", Milestone.getMilestonesByRequest);
router.get("/", Milestone.getMilestoneById);

// Mutation routes — artisan-only with ownership validation
router.post("/", extractUser, requireArtisan, Milestone.createMilestone);
router.put("/complete", extractUser, requireArtisan, requireMilestoneOwner, Milestone.completeMilestone);
router.put("/", extractUser, requireArtisan, requireMilestoneOwner, Milestone.updateMilestone);
router.delete("/", extractUser, requireArtisan, requireMilestoneOwner, Milestone.deleteMilestone);

export default router;
