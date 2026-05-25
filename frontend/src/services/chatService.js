import api from './api';

export const chatService = {
  // Get all chats for current user
  getMyChats: () => api.get('/chats/mine'),

  // Get total unread count
  getUnreadCount: () => api.get('/chats/unread-count'),

  // Create or get existing private chat
  getOrCreatePrivateChat: (otherUserId) =>
    api.post('/chats/private', { otherUserId }),

  // Get single chat details
  getChatById: (chatId) => api.get(`/chats/${chatId}`),

  // Get messages (paginated)
  getMessages: (chatId, { before, limit = 50 } = {}) => {
    const params = new URLSearchParams();
    if (before) params.set('before', before);
    if (limit) params.set('limit', limit);
    return api.get(`/chats/${chatId}/messages?${params.toString()}`);
  },

  // Send message via REST (fallback if socket is down)
  sendMessage: (chatId, { content, messageType = 'text', attachmentUrl }) =>
    api.post(`/chats/${chatId}/messages`, { content, messageType, attachmentUrl }),

  // Mark chat as read
  markAsRead: (chatId) => api.put(`/chats/${chatId}/read`),

  // Edit a message
  editMessage: (messageId, content) =>
    api.put(`/chats/messages/${messageId}`, { content }),

  // Delete a message
  deleteMessage: (messageId) => api.delete(`/chats/messages/${messageId}`),
};
