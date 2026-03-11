import { Router } from "express";
import * as Request from "./request.service.js";

const router = Router();

router.post("/", Request.createRequest);
router.get("/all", Request.getAllRequests);
router.get("/", Request.getRequestById);
router.get("/buyer", Request.getRequestsByBuyer);
router.put("/", Request.updateRequest);
router.delete("/", Request.deleteRequest);

export default router;
