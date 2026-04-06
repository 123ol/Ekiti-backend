import { Router } from 'express'
import { login, getMe, changePassword } from '../controllers/auth.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/login', login)
router.get('/me', protect, getMe)
router.patch('/password', protect, changePassword)

export default router
