import pool from '../../db/connection.js';

// ═══════════════════════════════════════════
// PRIVATE CHAT — Get or Create
// ═══════════════════════════════════════════

/**
 * Find an existing private chat between exactly two users,
 * or create one if none exists.
 * Returns the full chat object.
 */
export const getOrCreatePrivateChat = async (req, res) => {
    const userId = Number(req.headers['x-user-id']);
    const { otherUserId } = req.body;

    if (!userId || !otherUserId) {
        return res.status(400).json({ ok: false, message: 'Both user IDs required' });
    }

    const conn = await pool.getConnection();
    try {
        // Look for an existing private chat that has EXACTLY these 2 members
        const [existing] = await conn.query(`
            SELECT c.chat_id FROM Chat c
            WHERE c.type = 'private'
              AND (SELECT COUNT(*) FROM ChatMember cm WHERE cm.chat_id = c.chat_id AND cm.is_active = TRUE) = 2
              AND EXISTS (SELECT 1 FROM ChatMember cm WHERE cm.chat_id = c.chat_id AND cm.user_id = ? AND cm.is_active = TRUE)
              AND EXISTS (SELECT 1 FROM ChatMember cm WHERE cm.chat_id = c.chat_id AND cm.user_id = ? AND cm.is_active = TRUE)
            LIMIT 1
        `, [userId, Number(otherUserId)]);

        let chatId;

        if (existing.length > 0) {
            chatId = existing[0].chat_id;
        } else {
            // Create new private chat
            const [chatResult] = await conn.query(
                'INSERT INTO Chat (type, created_by) VALUES (?, ?)',
                ['private', userId]
            );
            chatId = chatResult.insertId;

            // Add both members
            await conn.query(
                'INSERT INTO ChatMember (chat_id, user_id, role) VALUES (?, ?, ?), (?, ?, ?)',
                [chatId, userId, 'member', chatId, Number(otherUserId), 'member']
            );
        }

        // Return chat with member info
        const chat = await getChatDetails(conn, chatId, userId);
        res.json({ ok: true, data: chat });
    } catch (err) {
        console.error('getOrCreatePrivateChat error:', err);
        res.status(500).json({ ok: false, message: err.message });
    } finally {
        conn.release();
    }
};


// ═══════════════════════════════════════════
// GET ALL CHATS FOR CURRENT USER
// ═══════════════════════════════════════════

export const getMyChats = async (req, res) => {
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ ok: false, message: 'Unauthorized' });

    try {
        const [chats] = await pool.query(`
            SELECT 
                c.chat_id,
                c.type,
                c.created_at,
                c.last_message_at,
                c.workshop_id,
                c.mentorship_id,
                -- Last message info
                m.content AS last_message_content,
                m.message_type AS last_message_type,
                m.sender_id AS last_message_sender_id,
                -- For private chats: the OTHER user's info
                CASE WHEN c.type = 'private' THEN ou.FName ELSE NULL END AS other_user_fname,
                CASE WHEN c.type = 'private' THEN ou.LName ELSE NULL END AS other_user_lname,
                CASE WHEN c.type = 'private' THEN ou.ProfileImage ELSE NULL END AS other_user_image,
                CASE WHEN c.type = 'private' THEN ou.User_id ELSE NULL END AS other_user_id,
                CASE WHEN c.type = 'private' THEN ou.Type ELSE NULL END AS other_user_type,
                -- For workshop chats: workshop title
                CASE WHEN c.type = 'workshop' THEN w.Title ELSE NULL END AS workshop_title,
                -- For mentorship chats: mentorship description
                CASE WHEN c.type = 'mentorship' THEN mt.Description ELSE NULL END AS mentorship_title,
                -- Unread count
                (
                    SELECT COUNT(*) FROM Message msg
                    WHERE msg.chat_id = c.chat_id
                      AND msg.sender_id != ?
                      AND msg.deleted_at IS NULL
                      AND msg.sent_at > COALESCE(cm.last_read_at, '1970-01-01')
                ) AS unread_count,
                -- Member count (for groups)
                (SELECT COUNT(*) FROM ChatMember cm2 WHERE cm2.chat_id = c.chat_id AND cm2.is_active = TRUE) AS member_count
            FROM ChatMember cm
            JOIN Chat c ON c.chat_id = cm.chat_id
            LEFT JOIN Message m ON m.message_id = c.last_message_id
            -- For private chats, get the OTHER member's info
            LEFT JOIN ChatMember ocm ON ocm.chat_id = c.chat_id AND ocm.user_id != ? AND c.type = 'private'
            LEFT JOIN user ou ON ou.User_id = ocm.user_id
            -- For workshop chats
            LEFT JOIN Workshop w ON w.Workshop_id = c.workshop_id
            -- For mentorship chats
            LEFT JOIN Mentorship mt ON mt.Mentorship_id = c.mentorship_id
            WHERE cm.user_id = ? AND cm.is_active = TRUE
            ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
        `, [userId, userId, userId]);

        res.json({ ok: true, data: chats });
    } catch (err) {
        console.error('getMyChats error:', err);
        res.status(500).json({ ok: false, message: err.message });
    }
};


// ═══════════════════════════════════════════
// GET MESSAGES FOR A CHAT (paginated)
// ═══════════════════════════════════════════

export const getMessages = async (req, res) => {
    const userId = Number(req.headers['x-user-id']);
    const chatId = Number(req.params.chatId);
    const beforeId = req.query.before ? Number(req.query.before) : null;
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    if (!userId) return res.status(401).json({ ok: false, message: 'Unauthorized' });

    try {
        // Verify user is a member of this chat
        const [membership] = await pool.query(
            'SELECT id FROM ChatMember WHERE chat_id = ? AND user_id = ? AND is_active = TRUE',
            [chatId, userId]
        );
        if (membership.length === 0) {
            return res.status(403).json({ ok: false, message: 'Not a member of this chat' });
        }

        let query = `
            SELECT 
                msg.message_id,
                msg.chat_id,
                msg.sender_id,
                msg.content,
                msg.message_type,
                msg.attachment_url,
                msg.sent_at,
                msg.edited_at,
                msg.deleted_at,
                msg.status,
                u.FName AS sender_fname,
                u.LName AS sender_lname,
                u.ProfileImage AS sender_image,
                u.Type AS sender_type
            FROM Message msg
            JOIN user u ON u.User_id = msg.sender_id
            WHERE msg.chat_id = ?
        `;
        const params = [chatId];

        if (beforeId) {
            query += ' AND msg.message_id < ?';
            params.push(beforeId);
        }

        query += ' ORDER BY msg.message_id DESC LIMIT ?';
        params.push(limit);

        const [messages] = await pool.query(query, params);

        // Return in chronological order (oldest first)
        res.json({ ok: true, data: messages.reverse() });
    } catch (err) {
        console.error('getMessages error:', err);
        res.status(500).json({ ok: false, message: err.message });
    }
};


// ═══════════════════════════════════════════
// SEND A MESSAGE (REST fallback)
// ═══════════════════════════════════════════

export const sendMessage = async (req, res) => {
    const userId = Number(req.headers['x-user-id']);
    const chatId = Number(req.params.chatId);
    const { content, messageType = 'text', attachmentUrl } = req.body;

    if (!userId) return res.status(401).json({ ok: false, message: 'Unauthorized' });
    if (!content && !attachmentUrl) {
        return res.status(400).json({ ok: false, message: 'Message content required' });
    }

    const conn = await pool.getConnection();
    try {
        // Verify membership
        const [membership] = await conn.query(
            'SELECT id FROM ChatMember WHERE chat_id = ? AND user_id = ? AND is_active = TRUE',
            [chatId, userId]
        );
        if (membership.length === 0) {
            return res.status(403).json({ ok: false, message: 'Not a member of this chat' });
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

        res.status(201).json({ ok: true, data: messages[0] });
    } catch (err) {
        console.error('sendMessage error:', err);
        res.status(500).json({ ok: false, message: err.message });
    } finally {
        conn.release();
    }
};


// ═══════════════════════════════════════════
// MARK CHAT AS READ
// ═══════════════════════════════════════════

export const markAsRead = async (req, res) => {
    const userId = Number(req.headers['x-user-id']);
    const chatId = Number(req.params.chatId);

    if (!userId) return res.status(401).json({ ok: false, message: 'Unauthorized' });

    try {
        await pool.query(
            'UPDATE ChatMember SET last_read_at = CURRENT_TIMESTAMP WHERE chat_id = ? AND user_id = ?',
            [chatId, userId]
        );
        res.json({ ok: true });
    } catch (err) {
        console.error('markAsRead error:', err);
        res.status(500).json({ ok: false, message: err.message });
    }
};


// ═══════════════════════════════════════════
// GET TOTAL UNREAD COUNT (for navbar badge)
// ═══════════════════════════════════════════

export const getUnreadCount = async (req, res) => {
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ ok: false, message: 'Unauthorized' });

    try {
        const [rows] = await pool.query(`
            SELECT COALESCE(SUM(unread), 0) AS total_unread FROM (
                SELECT 
                    (SELECT COUNT(*) FROM Message msg
                     WHERE msg.chat_id = cm.chat_id
                       AND msg.sender_id != ?
                       AND msg.deleted_at IS NULL
                       AND msg.sent_at > COALESCE(cm.last_read_at, '1970-01-01')
                    ) AS unread
                FROM ChatMember cm
                WHERE cm.user_id = ? AND cm.is_active = TRUE
            ) counts
        `, [userId, userId]);

        res.json({ ok: true, data: { totalUnread: rows[0].total_unread } });
    } catch (err) {
        console.error('getUnreadCount error:', err);
        res.status(500).json({ ok: false, message: err.message });
    }
};


// ═══════════════════════════════════════════
// SOFT-DELETE A MESSAGE
// ═══════════════════════════════════════════

export const deleteMessage = async (req, res) => {
    const userId = Number(req.headers['x-user-id']);
    const messageId = Number(req.params.messageId);

    if (!userId) return res.status(401).json({ ok: false, message: 'Unauthorized' });

    try {
        // Only the sender can delete their own message
        const [result] = await pool.query(
            'UPDATE Message SET deleted_at = CURRENT_TIMESTAMP, content = NULL WHERE message_id = ? AND sender_id = ?',
            [messageId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ ok: false, message: 'Message not found or not yours' });
        }

        res.json({ ok: true });
    } catch (err) {
        console.error('deleteMessage error:', err);
        res.status(500).json({ ok: false, message: err.message });
    }
};


// ═══════════════════════════════════════════
// EDIT A MESSAGE
// ═══════════════════════════════════════════

export const editMessage = async (req, res) => {
    const userId = Number(req.headers['x-user-id']);
    const messageId = Number(req.params.messageId);
    const { content } = req.body;

    if (!userId) return res.status(401).json({ ok: false, message: 'Unauthorized' });
    if (!content) return res.status(400).json({ ok: false, message: 'Content required' });

    try {
        const [result] = await pool.query(
            'UPDATE Message SET content = ?, edited_at = CURRENT_TIMESTAMP WHERE message_id = ? AND sender_id = ? AND deleted_at IS NULL',
            [content, messageId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ ok: false, message: 'Message not found or not yours' });
        }

        res.json({ ok: true });
    } catch (err) {
        console.error('editMessage error:', err);
        res.status(500).json({ ok: false, message: err.message });
    }
};


// ═══════════════════════════════════════════
// GET CHAT DETAILS (single chat with members)
// ═══════════════════════════════════════════

export const getChatById = async (req, res) => {
    const userId = Number(req.headers['x-user-id']);
    const chatId = Number(req.params.chatId);

    if (!userId) return res.status(401).json({ ok: false, message: 'Unauthorized' });

    const conn = await pool.getConnection();
    try {
        // Verify membership
        const [membership] = await conn.query(
            'SELECT id FROM ChatMember WHERE chat_id = ? AND user_id = ? AND is_active = TRUE',
            [chatId, userId]
        );
        if (membership.length === 0) {
            return res.status(403).json({ ok: false, message: 'Not a member of this chat' });
        }

        const chat = await getChatDetails(conn, chatId, userId);
        res.json({ ok: true, data: chat });
    } catch (err) {
        console.error('getChatById error:', err);
        res.status(500).json({ ok: false, message: err.message });
    } finally {
        conn.release();
    }
};


// ═══════════════════════════════════════════
// HELPER: Get full chat details
// ═══════════════════════════════════════════

async function getChatDetails(conn, chatId, currentUserId) {
    const [chats] = await conn.query(`
        SELECT 
            c.chat_id, c.type, c.created_at, c.last_message_at,
            c.workshop_id, c.mentorship_id,
            w.Title AS workshop_title,
            mt.Description AS mentorship_title
        FROM Chat c
        LEFT JOIN Workshop w ON w.Workshop_id = c.workshop_id
        LEFT JOIN Mentorship mt ON mt.Mentorship_id = c.mentorship_id
        WHERE c.chat_id = ?
    `, [chatId]);

    if (chats.length === 0) return null;

    const chat = chats[0];

    // Get members
    const [members] = await conn.query(`
        SELECT 
            cm.user_id, cm.role, cm.joined_at, cm.is_active,
            u.FName, u.LName, u.ProfileImage, u.Type, u.Email
        FROM ChatMember cm
        JOIN user u ON u.User_id = cm.user_id
        WHERE cm.chat_id = ? AND cm.is_active = TRUE
    `, [chatId]);

    chat.members = members;

    // For private chats, identify the other user
    if (chat.type === 'private') {
        const other = members.find(m => m.user_id !== currentUserId);
        if (other) {
            chat.other_user = other;
        }
    }

    return chat;
}


// ═══════════════════════════════════════════
// WORKSHOP/MENTORSHIP GROUP CHAT HELPERS
// (used by workshopRegistration service)
// ═══════════════════════════════════════════

export async function createWorkshopGroupChat(conn, workshopId, artisanId) {
    // Check if chat already exists
    const [existing] = await conn.query(
        'SELECT chat_id FROM Chat WHERE workshop_id = ? LIMIT 1',
        [workshopId]
    );

    if (existing.length > 0) {
        return existing[0].chat_id;
    }

    // Create new workshop chat
    const [result] = await conn.query(
        'INSERT INTO Chat (type, created_by, workshop_id) VALUES (?, ?, ?)',
        ['workshop', artisanId, workshopId]
    );
    const chatId = result.insertId;

    // Add artisan as admin
    await conn.query(
        'INSERT INTO ChatMember (chat_id, user_id, role) VALUES (?, ?, ?)',
        [chatId, artisanId, 'admin']
    );

    return chatId;
}

export async function addMemberToWorkshopChat(conn, workshopId, buyerId, senderName) {
    // Find the workshop's chat
    const [chats] = await conn.query(
        'SELECT chat_id FROM Chat WHERE workshop_id = ? LIMIT 1',
        [workshopId]
    );

    if (chats.length === 0) return null;
    const chatId = chats[0].chat_id;

    // Add member (ignore duplicate)
    try {
        await conn.query(
            'INSERT IGNORE INTO ChatMember (chat_id, user_id, role) VALUES (?, ?, ?)',
            [chatId, buyerId, 'member']
        );
    } catch (e) {
        // Duplicate — already a member, that's fine
    }

    // Send system message
    if (senderName) {
        const [msgResult] = await conn.query(
            `INSERT INTO Message (chat_id, sender_id, content, message_type) VALUES (?, ?, ?, 'system')`,
            [chatId, buyerId, `${senderName} joined the workshop`]
        );
        await conn.query(
            'UPDATE Chat SET last_message_id = ?, last_message_at = CURRENT_TIMESTAMP WHERE chat_id = ?',
            [msgResult.insertId, chatId]
        );
    }

    return chatId;
}
