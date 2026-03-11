import { Router } from "express";
import * as OrderItem from "./orderItem.service.js";

const router = Router();

router.post("/", OrderItem.createOrderItem);
router.get("/", OrderItem.getOrderItemsByOrder);
router.delete("/", OrderItem.deleteOrderItem);

export default router;
