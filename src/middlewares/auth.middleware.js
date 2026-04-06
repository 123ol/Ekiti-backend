import jwt from 'jsonwebtoken'
import User from '../models/User.model.js'
import { getRolePermissions } from '../utils/rolePermissionsCache.js'

/**
 * Require a valid JWT. Attaches req.user on success.
 */
export const protect = async (req, res, next) => {
  let token
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized — no token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')

    if (!req.user) {
      return res.status(401).json({ message: 'User no longer exists' })
    }
    if (req.user.status === 'inactive') {
      return res.status(403).json({ message: 'Account has been deactivated' })
    }

    next()
  } catch {
    return res.status(401).json({ message: 'Not authorized — token invalid or expired' })
  }
}

/**
 * Try to attach req.user from a token but never block the request.
 * Used on public endpoints that also serve authenticated staff (e.g. SMS intake).
 */
export const optionalAuth = async (req, res, next) => {
  let token
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password')
    } catch {
      // Silently ignore — public requests have no token
    }
  }

  next()
}

/**
 * Middleware factory. Call as requirePermission('assign_incident').
 * Must be used after protect(). Reads permissions from the DB-backed cache
 * so that IT admin edits to roles take effect without a server restart.
 */
export const requirePermission = (permission) => async (req, res, next) => {
  const permissions = await getRolePermissions(req.user?.role)
  if (!permissions.includes(permission)) {
    return res.status(403).json({
      message: `Forbidden: '${permission}' permission required`,
    })
  }
  next()
}
