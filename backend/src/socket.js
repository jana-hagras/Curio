import { Server } from 'socket.io';
import pool from './db/connection.js';

let io;

export function getIO() {
    return io;
}

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
        pingInterval: 25000,
        pingTimeout: 60000,
    });

    io.on('connection', async (socket) => {
        const userId = Number(socket.handshake.query.userId);

        if (!userId) {
            console.log('Socket rejected: no userId');
            socket.disconnect(true);
            return;
        }

        console.log(`🔌 User ${userId} connected (socket: ${socket.id})`);

        // Join personal room for targeted events
        socket.join(`user:${userId}`);

        // ─── JOIN ALL CHAT ROOMS ───
        socket.on('join_chats', async () => {
            try {
                const [memberships] = await pool.query(
                    'SELECT chat_id FROM ChatMember WHERE user_id = ? AND is_active = TRUE',
                    [userId]
                );
                for (const m of memberships) {
                    socket.join(`chat:${m.chat_id}`);
                }
                socket.emit('chats_joined', { chatIds: memberships.map(m => m.chat_id) });
                console.log(`  User ${userId} joined ${memberships.length} chat rooms`);
            } catch (err) {
                console.error('join_chats error:', err.message);
            }
        });

        // ─── JOIN A SPECIFIC CHAT ROOM ───
        socket.on('join_chat', (chatId) => {
            socket.join(`chat:${chatId}`);
        });

        // ─── SEND MESSAGE (primary real-time path) ───
        socket.on('send_message', async (data) => {
            const { chatId, content, messageType = 'text', attachmentUrl } = data;

            if (!chatId || (!content && !attachmentUrl)) {
                socket.emit('error', { message: 'Invalid message data' });
                return;
            }

            const conn = await pool.getConnection();
            try {
                // Verify membership
                const [membership] = await conn.query(
                    'SELECT id FROM ChatMember WHERE chat_id = ? AND user_id = ? AND is_active = TRUE',
                    [chatId, userId]
                );
                if (membership.length === 0) {
                    socket.emit('error', { message: 'Not a member of this chat' });
                    return;
                }

                // Insert message
                const [result] = await conn.query(
                    `INSERT INTO Message (chat_id, sender_id, content, message_type, attachment_url) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [chatId, userId, content || null, messageType, attachmentUrl || null]
                );

                const messageId = result.insertId;

                // Update chat's last_message pointer
                await conn.query(
                    'UPDATE Chat SET last_message_id = ?, last_message_at = CURRENT_TIMESTAMP WHERE chat_id = ?',
                    [messageId, chatId]
                );

                // Fetch the full message with sender info
                const [messages] = await conn.query(`
                    SELECT 
                        msg.message_id, msg.chat_id, msg.sender_id, msg.content,
                        msg.message_type, msg.attachment_url, msg.sent_at, msg.edited_at,
                        msg.deleted_at, msg.status,
                        u.FName AS sender_fname, u.LName AS sender_lname,
                        u.ProfileImage AS sender_image, u.Type AS sender_type
                    FROM Message msg
                    JOIN user u ON u.User_id = msg.sender_id
                    WHERE msg.message_id = ?
                `, [messageId]);

                const message = messages[0];

                // Broadcast to all members of the chat room
                io.to(`chat:${chatId}`).emit('new_message', message);

                // Also notify members in their personal rooms (for unread badge updates)
                const [members] = await conn.query(
                    'SELECT user_id FROM ChatMember WHERE chat_id = ? AND user_id != ? AND is_active = TRUE',
                    [chatId, userId]
                );
                for (const member of members) {
                    io.to(`user:${member.user_id}`).emit('unread_update', { chatId });
                }

            } catch (err) {
                console.error('send_message socket error:', err.message);
                socket.emit('error', { message: 'Failed to send message' });
            } finally {
                conn.release();
            }
        });

        // ─── TYPING INDICATORS ───
        socket.on('typing_start', ({ chatId }) => {
            socket.to(`chat:${chatId}`).emit('user_typing', { chatId, userId, typing: true });
        });

        socket.on('typing_stop', ({ chatId }) => {
            socket.to(`chat:${chatId}`).emit('user_typing', { chatId, userId, typing: false });
        });

        // ─── MARK AS READ ───
        socket.on('mark_read', async ({ chatId }) => {
            try {
                await pool.query(
                    'UPDATE ChatMember SET last_read_at = CURRENT_TIMESTAMP WHERE chat_id = ? AND user_id = ?',
                    [chatId, userId]
                );
                socket.to(`chat:${chatId}`).emit('messages_read', { chatId, userId });
            } catch (err) {
                console.error('mark_read socket error:', err.message);
            }
        });

        // ─── DISCONNECT ───
        socket.on('disconnect', (reason) => {
            console.log(`🔌 User ${userId} disconnected (${reason})`);
        });
    });

    console.log('Socket.IO initialized ⚡');
    return io;
}
