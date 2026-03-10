import { Router } from "express";
import * as userService from "./user.service.js";

const router = Router();


router.get("/all", userService.getAllUsers);
router.get("/", userService.getUserById);
router.put("/", userService.updateUser);
router.delete("/", userService.deleteUser);

export default router;