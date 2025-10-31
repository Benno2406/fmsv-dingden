import express from 'express';
import { query } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// GET user notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const { unreadOnly } = req.query;

    let queryText = `
      SELECT * FROM notifications
      WHERE user_id = $1
    `;

    if (unreadOnly === 'true') {
      queryText += ` AND is_read = false`;
    }

    queryText += ` ORDER BY created_at DESC LIMIT 50`;

    const result = await query(queryText, [req.user.id]);

    res.json({
      success: true,
      notifications: result.rows
    });
  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Laden der Benachrichtigungen' });
  }
});

// MARK notification as read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE notifications 
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Benachrichtigung nicht gefunden' });
    }

    res.json({
      success: true,
      notification: result.rows[0]
    });
  } catch (error) {
    logger.error('Mark notification as read error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Aktualisieren der Benachrichtigung' });
  }
});

// MARK all notifications as read
router.post('/read-all', authenticate, async (req, res) => {
  try {
    await query(
      `UPDATE notifications 
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND is_read = false`,
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Alle Benachrichtigungen als gelesen markiert'
    });
  } catch (error) {
    logger.error('Mark all notifications as read error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Aktualisieren der Benachrichtigungen' });
  }
});

// DELETE notification
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Benachrichtigung nicht gefunden' });
    }

    res.json({
      success: true,
      message: 'Benachrichtigung erfolgreich gelöscht'
    });
  } catch (error) {
    logger.error('Delete notification error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Löschen der Benachrichtigung' });
  }
});

export default router;
