import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { authenticate, requireMember } from '../middleware/auth.js';
import { logAudit, AUDIT_ACTIONS } from '../utils/audit.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// GET all flugbuch entries (Members only)
router.get('/', authenticate, requireMember, async (req, res) => {
  try {
    const { from, to, pilotId } = req.query;

    let queryText = `
      SELECT f.*, u.first_name, u.last_name, u.member_number
      FROM flugbuch_entries f
      LEFT JOIN users u ON f.pilot_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (from) {
      queryText += ` AND f.start_time >= $${paramIndex}`;
      params.push(from);
      paramIndex++;
    }

    if (to) {
      queryText += ` AND f.start_time <= $${paramIndex}`;
      params.push(to);
      paramIndex++;
    }

    if (pilotId) {
      queryText += ` AND f.pilot_id = $${paramIndex}`;
      params.push(pilotId);
      paramIndex++;
    }

    queryText += ` ORDER BY f.start_time DESC`;

    const result = await query(queryText, params);

    res.json({
      success: true,
      entries: result.rows
    });
  } catch (error) {
    logger.error('Get flugbuch entries error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Laden der Flugbuch-Einträge' });
  }
});

// CREATE flugbuch entry (Members only)
router.post('/', [
  authenticate,
  requireMember,
  body('pilotName').trim().notEmpty(),
  body('startTime').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { pilotName, aircraftType, aircraftName, startTime, endTime, notes } = req.body;

    // Calculate duration if endTime provided
    let durationMinutes = null;
    if (endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      durationMinutes = Math.round((end - start) / 60000);
    }

    const result = await query(
      `INSERT INTO flugbuch_entries 
       (pilot_id, pilot_name, aircraft_type, aircraft_name, start_time, end_time, duration_minutes, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, pilotName, aircraftType, aircraftName, startTime, endTime, durationMinutes, notes]
    );

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.FLIGHT_LOGGED,
      entityType: 'flugbuch_entry',
      entityId: result.rows[0].id,
      req
    });

    res.status(201).json({
      success: true,
      message: 'Flugbuch-Eintrag erfolgreich erstellt',
      entry: result.rows[0]
    });
  } catch (error) {
    logger.error('Create flugbuch entry error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Erstellen des Flugbuch-Eintrags' });
  }
});

// UPDATE flugbuch entry
router.put('/:id', authenticate, requireMember, async (req, res) => {
  try {
    const { id } = req.params;
    const { endTime, notes } = req.body;

    // Get current entry
    const current = await query('SELECT * FROM flugbuch_entries WHERE id = $1', [id]);
    
    if (current.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Eintrag nicht gefunden' });
    }

    // Only pilot or admin can update
    if (current.rows[0].pilot_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ success: false, message: 'Keine Berechtigung' });
    }

    let durationMinutes = current.rows[0].duration_minutes;
    if (endTime) {
      const start = new Date(current.rows[0].start_time);
      const end = new Date(endTime);
      durationMinutes = Math.round((end - start) / 60000);
    }

    const result = await query(
      `UPDATE flugbuch_entries 
       SET end_time = COALESCE($1, end_time),
           duration_minutes = COALESCE($2, duration_minutes),
           notes = COALESCE($3, notes)
       WHERE id = $4
       RETURNING *`,
      [endTime, durationMinutes, notes, id]
    );

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.FLIGHT_UPDATED,
      entityType: 'flugbuch_entry',
      entityId: id,
      req
    });

    res.json({
      success: true,
      message: 'Flugbuch-Eintrag erfolgreich aktualisiert',
      entry: result.rows[0]
    });
  } catch (error) {
    logger.error('Update flugbuch entry error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Aktualisieren des Flugbuch-Eintrags' });
  }
});

// DELETE flugbuch entry
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Get current entry
    const current = await query('SELECT pilot_id FROM flugbuch_entries WHERE id = $1', [id]);
    
    if (current.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Eintrag nicht gefunden' });
    }

    // Only pilot or admin can delete
    if (current.rows[0].pilot_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ success: false, message: 'Keine Berechtigung' });
    }

    await query('DELETE FROM flugbuch_entries WHERE id = $1', [id]);

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.FLIGHT_DELETED,
      entityType: 'flugbuch_entry',
      entityId: id,
      req
    });

    res.json({
      success: true,
      message: 'Flugbuch-Eintrag erfolgreich gelöscht'
    });
  } catch (error) {
    logger.error('Delete flugbuch entry error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Löschen des Flugbuch-Eintrags' });
  }
});

export default router;
