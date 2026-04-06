import { Router } from 'express'
import { getRoles, createRole, updateRole, deleteRole } from '../controllers/role.controller.js'
import { protect, requirePermission } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/', protect, getRoles)
router.post('/', protect, requirePermission('manage_roles'), createRole)
router.patch('/:id', protect, requirePermission('manage_roles'), updateRole)
router.delete('/:id', protect, requirePermission('manage_roles'), deleteRole)

export default router
