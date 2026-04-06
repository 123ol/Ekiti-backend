import { Router } from 'express'
import { getUsers, createUser, getUser, updateUser, toggleUserStatus } from '../controllers/user.controller.js'
import { protect, requirePermission } from '../middlewares/auth.middleware.js'

const router = Router()

const manageGuard = [protect, requirePermission('manage_users')]

// Reading users only requires authentication (dispatchers need this for assignment)
router.get('/',             protect,           getUsers)
router.get('/:id',          protect,           getUser)

// Writing requires manage_users permission
router.post('/',            ...manageGuard,    createUser)
router.patch('/:id',        ...manageGuard,    updateUser)
router.patch('/:id/status', ...manageGuard,    toggleUserStatus)

export default router
