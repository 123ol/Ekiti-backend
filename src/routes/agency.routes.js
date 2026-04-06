import { Router } from 'express'
import { getAgencies, createAgency, updateAgency, deleteAgency } from '../controllers/agency.controller.js'
import { protect, requirePermission } from '../middlewares/auth.middleware.js'

const router = Router()

// Anyone authenticated can read agencies (needed for user creation form)
router.get('/', protect, getAgencies)

// Only admins can create / edit / delete
const guard = [protect, requirePermission('manage_users')]
router.post('/',        ...guard, createAgency)
router.patch('/:id',   ...guard, updateAgency)
router.delete('/:id',  ...guard, deleteAgency)

export default router
