import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { logAudit, AUDIT_ACTIONS } from '../utils/audit.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// GET all events
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { from, to, isPublic } = req.query;

    let queryText = `
      SELECT e.*, u.first_name, u.last_name
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Non-members can only see public events
    if (!req.user) {
      queryText += ` AND e.is_public = true`;
    } else if (isPublic !== undefined && req.user.is_admin) {
      queryText += ` AND e.is_public = $${paramIndex}`;
      params.push(isPublic === 'true');
      paramIndex++;
    }

    if (from) {
      queryText += ` AND e.start_date >= $${paramIndex}`;
      params.push(from);
      paramIndex++;
    }

    if (to) {
      queryText += ` AND e.start_date <= $${paramIndex}`;
      params.push(to);
      paramIndex++;
    }

    queryText += ` ORDER BY e.start_date ASC`;

    const result = await query(queryText, params);

    res.json({
      success: true,
      events: result.rows
    });
  } catch (error) {
    logger.error('Get events error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Laden der Termine' });
  }
});

// CREATE event (Admin only)
router.post('/', [
  authenticate,
  requireAdmin,
  body('title').trim().notEmpty(),
  body('startDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, startDate, endDate, allDay, location, isPublic } = req.body;

    const result = await query(
      `INSERT INTO events (title, description, start_date, end_date, all_day, location, is_public, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, description, startDate, endDate, allDay, location, isPublic !== false, req.user.id]
    );

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.EVENT_CREATED,
      entityType: 'event',
      entityId: result.rows[0].id,
      req
    });

    res.status(201).json({
      success: true,
      message: 'Termin erfolgreich erstellt',
      event: result.rows[0]
    });
  } catch (error) {
    logger.error('Create event error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Erstellen des Termins' });
  }
});

// UPDATE event (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, allDay, location, isPublic } = req.body;

    const result = await query(
      `UPDATE events 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           start_date = COALESCE($3, start_date),
           end_date = COALESCE($4, end_date),
           all_day = COALESCE($5, all_day),
           location = COALESCE($6, location),
           is_public = COALESCE($7, is_public)
       WHERE id = $8
       RETURNING *`,
      [title, description, startDate, endDate, allDay, location, isPublic, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Termin nicht gefunden' });
    }

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.EVENT_UPDATED,
      entityType: 'event',
      entityId: id,
      req
    });

    res.json({
      success: true,
      message: 'Termin erfolgreich aktualisiert',
      event: result.rows[0]
    });
  } catch (error) {
    logger.error('Update event error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Aktualisieren des Termins' });
  }
});

// DELETE event (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM events WHERE id = $1 RETURNING title', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Termin nicht gefunden' });
    }

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.EVENT_DELETED,
      entityType: 'event',
      entityId: id,
      details: { title: result.rows[0].title },
      req
    });

    res.json({
      success: true,
      message: 'Termin erfolgreich gelöscht'
    });
  } catch (error) {
    logger.error('Delete event error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Löschen des Termins' });
  }
});

export default router;
