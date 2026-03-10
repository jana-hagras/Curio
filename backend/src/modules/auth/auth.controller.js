import { Router } from "express";
import * as authService from "./auth.service.js";

const router = Router();

// Registration: Handles creating the User + Subtype (Buyer/Artisan)
router.post("/register", authService.register);

// Login: Authenticates and returns joined user data
router.post("/login", authService.login);

// Fetches current session user data
router.get("/me/:id", authService.me);

export default router;