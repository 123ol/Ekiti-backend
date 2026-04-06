import { Router } from 'express'
import {
  getSummary,
  getWeekly,
  getByChannel,
  getByAgency,
  getByLGA,
  getByType,
} from '../controllers/report.controller.js'
import { protect, requirePermission } from '../middlewares/auth.middleware.js'

const router = Router()

const guard = [protect, requirePermission('view_reports')]

router.get('/summary',    ...guard, getSummary)
router.get('/weekly',     ...guard, getWeekly)
router.get('/by-channel', ...guard, getByChannel)
router.get('/by-agency',  ...guard, getByAgency)
router.get('/by-lga',     ...guard, getByLGA)
router.get('/by-type',    ...guard, getByType)

export default router
