import { Router } from "express";
import * as Chat from "./chat.service.js";

const router = Router();

// Get all chats for current user
router.get("/mine", Chat.getMyChats);

// Get total unread count (for navbar badge)
router.get("/unread-count", Chat.getUnreadCount);

// Create or get existing private chat
router.post("/private", Chat.getOrCreatePrivateChat);

// Get single chat details
router.get("/:chatId", Chat.getChatById);

// Get messages for a chat (paginated)
router.get("/:chatId/messages", Chat.getMessages);

// Send a message (REST fallback — primary path is Socket.IO)
router.post("/:chatId/messages", Chat.sendMessage);

// Mark chat as read
router.put("/:chatId/read", Chat.markAsRead);

// Edit a message
router.put("/messages/:messageId", Chat.editMessage);

// Soft-delete a message
router.delete("/messages/:messageId", Chat.deleteMessage);

export default router;
