import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { logAudit, AUDIT_ACTIONS } from '../utils/audit.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// GET all articles (public: only published, admin: all)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT a.*, u.first_name, u.last_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Non-admin can only see published articles
    if (!req.user || !req.user.is_admin) {
      queryText += ` AND a.is_published = true AND a.published_at <= CURRENT_TIMESTAMP`;
    }

    if (category) {
      queryText += ` AND a.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      queryText += ` AND (a.title ILIKE $${paramIndex} OR a.content ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY a.published_at DESC, a.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    res.json({
      success: true,
      articles: result.rows
    });
  } catch (error) {
    logger.error('Get articles error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Laden der Artikel' });
  }
});

// GET single article
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    let queryText = `
      SELECT a.*, u.first_name, u.last_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.id = $1
    `;

    if (!req.user || !req.user.is_admin) {
      queryText += ` AND a.is_published = true`;
    }

    const result = await query(queryText, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Artikel nicht gefunden' });
    }

    // Increment view count
    await query('UPDATE articles SET view_count = view_count + 1 WHERE id = $1', [id]);

    res.json({
      success: true,
      article: result.rows[0]
    });
  } catch (error) {
    logger.error('Get article error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Laden des Artikels' });
  }
});

// CREATE article (Admin only)
router.post('/', [
  authenticate,
  requireAdmin,
  body('title').trim().notEmpty(),
  body('content').trim().notEmpty(),
  body('slug').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, slug, content, excerpt, category, featuredImage, isPublished, metaDescription } = req.body;

    const result = await query(
      `INSERT INTO articles (title, slug, content, excerpt, category, featured_image, 
       is_published, published_at, meta_description, author_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [title, slug, content, excerpt, category, featuredImage, 
       isPublished, isPublished ? new Date() : null, metaDescription, req.user.id]
    );

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.ARTICLE_CREATED,
      entityType: 'article',
      entityId: result.rows[0].id,
      req
    });

    res.status(201).json({
      success: true,
      message: 'Artikel erfolgreich erstellt',
      article: result.rows[0]
    });
  } catch (error) {
    logger.error('Create article error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Erstellen des Artikels' });
  }
});

// UPDATE article (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, excerpt, category, featuredImage, isPublished, metaDescription } = req.body;

    const result = await query(
      `UPDATE articles 
       SET title = COALESCE($1, title),
           slug = COALESCE($2, slug),
           content = COALESCE($3, content),
           excerpt = COALESCE($4, excerpt),
           category = COALESCE($5, category),
           featured_image = COALESCE($6, featured_image),
           is_published = COALESCE($7, is_published),
           published_at = CASE WHEN $7 = true AND is_published = false THEN CURRENT_TIMESTAMP ELSE published_at END,
           meta_description = COALESCE($8, meta_description)
       WHERE id = $9
       RETURNING *`,
      [title, slug, content, excerpt, category, featuredImage, isPublished, metaDescription, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Artikel nicht gefunden' });
    }

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.ARTICLE_UPDATED,
      entityType: 'article',
      entityId: id,
      req
    });

    res.json({
      success: true,
      message: 'Artikel erfolgreich aktualisiert',
      article: result.rows[0]
    });
  } catch (error) {
    logger.error('Update article error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Aktualisieren des Artikels' });
  }
});

// DELETE article (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM articles WHERE id = $1 RETURNING title', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Artikel nicht gefunden' });
    }

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.ARTICLE_DELETED,
      entityType: 'article',
      entityId: id,
      details: { title: result.rows[0].title },
      req
    });

    res.json({
      success: true,
      message: 'Artikel erfolgreich gelöscht'
    });
  } catch (error) {
    logger.error('Delete article error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Löschen des Artikels' });
  }
});

export default router;
