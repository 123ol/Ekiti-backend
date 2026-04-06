import { Router } from 'express'
import { getAlerts, getAlert, createAlert, updateAlert, deleteAlert } from '../controllers/alert.controller.js'
import { protect, requirePermission } from '../middlewares/auth.middleware.js'

const router = Router()

// Public — anyone can read active alerts
router.get('/', getAlerts)
router.get('/:id', getAlert)

// Protected — only users with send_alert permission can create/edit/delete alerts
router.post('/', protect, requirePermission('send_alert'), createAlert)
router.patch('/:id', protect, requirePermission('send_alert'), updateAlert)
router.delete('/:id', protect, requirePermission('send_alert'), deleteAlert)

export default router
