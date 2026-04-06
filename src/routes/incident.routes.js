import { Router } from 'express'
import {
  createIncident,
  getIncidents,
  getIncident,
  assignIncident,
  updateStatus,
  deleteIncident,
  addTimeline,
  trackIncident,
  getPublicIncidents,
} from '../controllers/incident.controller.js'
import {
  protect,
  optionalAuth,
  requirePermission,
} from '../middlewares/auth.middleware.js'
import { incidentUpload } from '../middlewares/upload.middleware.js'

const router = Router()

// ── Public routes (no auth required) ──────────────────────────────────────
// All submitted incidents — public-safe fields only (used by app/web public view)
// Supports: ?status= ?lga= ?type= ?page= ?limit=
router.get('/public', getPublicIncidents)

// Look up a single report by incidentId (e.g. INC-003) — for reporter tracking
router.get('/track/:incidentId', trackIncident)

// Submit a new incident (web/app public) or SMS intake (staff, needs auth)
router.post('/', optionalAuth, incidentUpload, createIncident)

// ── Protected routes (staff only) ─────────────────────────────────────────
router.get('/', protect, getIncidents)
router.get('/:id', protect, getIncident)
router.patch('/:id/assign', protect, requirePermission('assign_incident'), assignIncident)
router.patch('/:id/status', protect, requirePermission('update_incident'), updateStatus)
router.delete('/:id', protect, requirePermission('delete_incident'), deleteIncident)
router.post('/:id/timeline', protect, addTimeline)

export default router
