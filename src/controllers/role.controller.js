import Role from '../models/Role.model.js'
import User from '../models/User.model.js'
import { ROLE_PERMISSIONS, ROLE_LABELS } from '../constants/permissions.js'
import { invalidateRoleCache } from '../utils/rolePermissionsCache.js'

// Seed the 4 system roles to MongoDB on startup (upsert — safe to call repeatedly)
export async function seedSystemRoles() {
  const systemRoles = [
    { slug: 'it_admin',           name: ROLE_LABELS.it_admin,           description: 'Full system access — can manage users, roles, and all incidents.' },
    { slug: 'dispatcher',         name: ROLE_LABELS.dispatcher,         description: 'Receives and dispatches reported incidents to field teams.' },
    { slug: 'sms_intake_officer', name: ROLE_LABELS.sms_intake_officer, description: 'Logs incidents received over the phone or via SMS.' },
    { slug: 'field_officer',      name: ROLE_LABELS.field_officer,      description: 'Responds to assigned incidents in the field.' },
  ]

  for (const r of systemRoles) {
    await Role.findOneAndUpdate(
      { slug: r.slug },
      {
        $setOnInsert: {          // only set permissions on first creation
          name:        r.name,
          description: r.description,
          permissions: ROLE_PERMISSIONS[r.slug] || [],
        },
      },
      { upsert: true, returnDocument: 'after' }
    )
  }
}

// GET /api/roles
export const getRoles = async (req, res) => {
  const roles = await Role.find().sort({ createdAt: 1 })
  res.status(200).json({ roles })
}

// POST /api/roles
export const createRole = async (req, res) => {
  const { name, description, permissions } = req.body

  if (!name?.trim()) {
    return res.status(400).json({ message: 'Role name is required' })
  }

  const slug = name.trim().toLowerCase().replace(/\s+/g, '_')

  const exists = await Role.findOne({ slug })
  if (exists) {
    return res.status(400).json({ message: 'A role with this name already exists' })
  }

  const role = await Role.create({
    name: name.trim(),
    slug,
    description: description?.trim(),
    permissions: Array.isArray(permissions) ? permissions : [],
  })

  invalidateRoleCache()
  res.status(201).json({ message: 'Role created successfully', role })
}

// DELETE /api/roles/:id
export const deleteRole = async (req, res) => {
  const role = await Role.findById(req.params.id)
  if (!role) {
    return res.status(404).json({ message: 'Role not found' })
  }

  const assignedCount = await User.countDocuments({ role: role.slug })
  if (assignedCount > 0) {
    return res.status(400).json({
      message: `Cannot delete: ${assignedCount} user${assignedCount > 1 ? 's are' : ' is'} still assigned to this role. Reassign them first.`,
    })
  }

  await role.deleteOne()
  invalidateRoleCache()
  res.status(200).json({ message: 'Role deleted successfully' })
}

// PATCH /api/roles/:id
export const updateRole = async (req, res) => {
  const { name, description, permissions } = req.body

  const update = {}
  if (name !== undefined) {
    update.name = name.trim()
    update.slug = name.trim().toLowerCase().replace(/\s+/g, '_')
  }
  if (description !== undefined) update.description = description.trim()
  if (permissions !== undefined) update.permissions = Array.isArray(permissions) ? permissions : []

  const role = await Role.findByIdAndUpdate(req.params.id, update, {
    returnDocument: 'after',
    runValidators: true,
  })

  if (!role) {
    return res.status(404).json({ message: 'Role not found' })
  }

  invalidateRoleCache()
  res.status(200).json({ message: 'Role updated successfully', role })
}
