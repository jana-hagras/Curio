import { Router } from "express";
import * as Gallery from "./Gallery.service.js";

const router = Router();

router.get("/search", Gallery.searchGallery);
router.post("/", Gallery.createGallery);        // Create image
router.get("/all", Gallery.getAllImages);       // Get all images
router.get("/", Gallery.getGalleryByProject);  // Get images by project_id via ?id=
router.put("/", Gallery.updateGallery);        // Update image via ?id=
router.delete("/", Gallery.deleteGallery);     // Delete image via ?id=

export default router;