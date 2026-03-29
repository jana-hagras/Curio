import { Router } from "express";
import * as MarketItem from "./marketItem.service.js";

const router = Router();

router.post("/", MarketItem.createItem);
router.get("/all", MarketItem.getAllItems);
router.get("/", MarketItem.getItemById);
router.get("/artisan", MarketItem.getItemsByArtisan);
router.get('/search', MarketItem.searchItems);
router.put("/", MarketItem.updateItem);
router.delete("/", MarketItem.deleteItem);

export default router;
