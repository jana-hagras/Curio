import { Router } from "express";
import * as OrderItem from "./orderItem.service.js";

const router = Router();

router.get("/search", OrderItem.searchOrderItems);
router.post("/", OrderItem.createOrderItem);
router.get("/", OrderItem.getOrderItemsByOrder);
router.delete("/", OrderItem.deleteOrderItem);
router.put("/", OrderItem.updateOrderItem);

export default router;
