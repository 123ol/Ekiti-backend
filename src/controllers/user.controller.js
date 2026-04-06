import User from '../models/User.model.js'
import Role from '../models/Role.model.js'

// GET /api/users
export const getUsers = async (req, res) => {
  const filter = {}
  if (req.query.role) filter.role = req.query.role
  if (req.query.status) filter.status = req.query.status

  // ?permission=xxx  — return users whose role has that permission
  if (req.query.permission) {
    const matchingRoles = await Role.find({ permissions: req.query.permission }).lean()
    const slugs = matchingRoles.map((r) => r.slug)
    filter.role = { $in: slugs }
  }

  const users = await User.find(filter).sort({ createdAt: -1 })
  res.status(200).json({ users })
}

// POST /api/users
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, agency } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password and role are required' })
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() })
    if (exists) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    // Look up the role label from the Role collection
    const roleDoc = await Role.findOne({ slug: role })
    const roleLabel = roleDoc ? roleDoc.name : role

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      roleLabel,
      agency: agency?.trim(),
    })

    res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleLabel: user.roleLabel,
        agency: user.agency,
        status: user.status,
        createdAt: user.createdAt,
      },
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/users/:id
export const getUser = async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }
  res.status(200).json({ user })
}

// PATCH /api/users/:id  — edit user details
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, agency, password } = req.body

    const user = await User.findById(req.params.id).select('+password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (name)   user.name   = name.trim()
    if (agency !== undefined) user.agency = agency?.trim() || ''

    if (email && email.toLowerCase().trim() !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase().trim() })
      if (exists) return res.status(400).json({ message: 'Email already in use' })
      user.email = email.toLowerCase().trim()
    }

    if (role && role !== user.role) {
      user.role = role
      const roleDoc = await Role.findOne({ slug: role })
      user.roleLabel = roleDoc ? roleDoc.name : role
    }

    if (password && password.length >= 6) {
      user.password = password   // pre-save hook will hash it
    }

    await user.save()

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleLabel: user.roleLabel,
        agency: user.agency,
        status: user.status,
      },
    })
  } catch (err) {
    next(err)
  }
}

// PATCH /api/users/:id/status  — toggle active ↔ inactive
export const toggleUserStatus = async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: 'You cannot deactivate your own account' })
  }

  const user = await User.findById(req.params.id)
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  user.status = user.status === 'active' ? 'inactive' : 'active'
  await user.save()

  res.status(200).json({
    message: `User ${user.status === 'active' ? 'activated' : 'deactivated'} successfully`,
    user,
  })
}
