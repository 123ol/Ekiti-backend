/**
 * In-memory cache for role permissions.
 * Populated from the database so the IT admin's edits take effect
 * without restarting the server.
 *
 * Usage:
 *   await warmRoleCache()       — call once on startup after DB connects
 *   getRolePermissions(slug)    — returns string[] for a role slug
 *   invalidateRoleCache()       — call after any role is updated
 */

import Role from '../models/Role.model.js'
import { ROLE_PERMISSIONS } from '../constants/permissions.js'

let _cache = null   // Map<slug, string[]> | null

/** Load all roles from MongoDB into the in-memory cache. */
export async function warmRoleCache() {
  const roles = await Role.find().lean()
  _cache = new Map()
  for (const role of roles) {
    _cache.set(role.slug, role.permissions || [])
  }
}

/** Clear the cache so the next call to getRolePermissions re-fetches from DB. */
export function invalidateRoleCache() {
  _cache = null
}

/**
 * Get permissions for a role slug.
 * Falls back to the hardcoded ROLE_PERMISSIONS if the DB role isn't found.
 * If the cache is cold, re-warms it synchronously from DB.
 */
export async function getRolePermissions(slug) {
  if (_cache === null) {
    await warmRoleCache()
  }
  if (_cache.has(slug)) {
    return _cache.get(slug)
  }
  // Fallback for slugs not yet seeded to DB
  return ROLE_PERMISSIONS[slug] || []
}
