import express from 'express';
import { query } from '../config/database.js';
import { authenticate, requireAdmin, requireMember, optionalAuth } from '../middleware/auth.js';
import { createUpload, deleteFile } from '../middleware/upload.js';
import { logAudit, AUDIT_ACTIONS } from '../utils/audit.js';
import { logger } from '../utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// GET all galleries
router.get('/galleries', optionalAuth, async (req, res) => {
  try {
    let queryText = `
      SELECT g.*, u.first_name, u.last_name,
             (SELECT COUNT(*) FROM images WHERE gallery_id = g.id) as image_count
      FROM image_galleries g
      LEFT JOIN users u ON g.created_by = u.id
      WHERE 1=1
    `;

    if (!req.user) {
      queryText += ` AND g.is_public = true`;
    }

    queryText += ` ORDER BY g.created_at DESC`;

    const result = await query(queryText);

    res.json({
      success: true,
      galleries: result.rows
    });
  } catch (error) {
    logger.error('Get galleries error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Laden der Galerien' });
  }
});

// CREATE gallery (Admin only)
router.post('/galleries', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, isPublic } = req.body;

    const result = await query(
      `INSERT INTO image_galleries (title, description, is_public, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description, isPublic !== false, req.user.id]
    );

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.GALLERY_CREATED,
      entityType: 'gallery',
      entityId: result.rows[0].id,
      req
    });

    res.status(201).json({
      success: true,
      message: 'Galerie erfolgreich erstellt',
      gallery: result.rows[0]
    });
  } catch (error) {
    logger.error('Create gallery error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Erstellen der Galerie' });
  }
});

// GET images in gallery
router.get('/galleries/:galleryId/images', optionalAuth, async (req, res) => {
  try {
    const { galleryId } = req.params;

    // Check gallery exists and access
    const galleryResult = await query(
      'SELECT is_public FROM image_galleries WHERE id = $1',
      [galleryId]
    );

    if (galleryResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Galerie nicht gefunden' });
    }

    if (!req.user && !galleryResult.rows[0].is_public) {
      return res.status(403).json({ success: false, message: 'Keine Berechtigung' });
    }

    const result = await query(
      `SELECT i.*, u.first_name, u.last_name
       FROM images i
       LEFT JOIN users u ON i.uploaded_by = u.id
       WHERE i.gallery_id = $1
       ORDER BY i.sort_order ASC, i.created_at DESC`,
      [galleryId]
    );

    res.json({
      success: true,
      images: result.rows
    });
  } catch (error) {
    logger.error('Get images error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Laden der Bilder' });
  }
});

// UPLOAD image (Admin only)
router.post('/galleries/:galleryId/images', authenticate, requireAdmin, createUpload('images', 10), async (req, res) => {
  try {
    const { galleryId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Keine Dateien hochgeladen' });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const result = await query(
        `INSERT INTO images 
         (gallery_id, filename, file_path, file_size, mime_type, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          galleryId,
          file.filename,
          `/uploads/images/${file.filename}`,
          file.size,
          file.mimetype,
          req.user.id
        ]
      );

      uploadedImages.push(result.rows[0]);

      await logAudit({
        userId: req.user.id,
        userEmail: req.user.email,
        action: AUDIT_ACTIONS.IMAGE_UPLOADED,
        entityType: 'image',
        entityId: result.rows[0].id,
        details: { galleryId, filename: file.filename },
        req
      });
    }

    res.status(201).json({
      success: true,
      message: 'Bilder erfolgreich hochgeladen',
      images: uploadedImages
    });
  } catch (error) {
    logger.error('Upload images error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Hochladen der Bilder' });
  }
});

// DELETE image (Admin only)
router.delete('/images/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT file_path FROM images WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Bild nicht gefunden' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '..', '..', result.rows[0].file_path.replace('/uploads/', 'Saves/'));
    deleteFile(filePath);

    // Delete from database
    await query('DELETE FROM images WHERE id = $1', [id]);

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.IMAGE_DELETED,
      entityType: 'image',
      entityId: id,
      req
    });

    res.json({
      success: true,
      message: 'Bild erfolgreich gelöscht'
    });
  } catch (error) {
    logger.error('Delete image error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Löschen des Bildes' });
  }
});

export default router;
