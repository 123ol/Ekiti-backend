/**
 * Database seeder — run with: node seed/seed.js
 * Seeds: 4 roles, 4 users, 6 sample incidents (matching frontend mock data)
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') })

import User from '../src/models/User.model.js'
import Role from '../src/models/Role.model.js'
import Incident from '../src/models/Incident.model.js'
import Counter from '../src/models/Counter.model.js'
import Alert from '../src/models/Alert.model.js'

const ROLES_DATA = [
  {
    name: 'IT Admin',
    slug: 'it_admin',
    description: 'Full system access: users, roles, reports, incident management.',
    permissions: [
      'view_dashboard', 'view_incidents', 'assign_incident', 'update_incident',
      'delete_incident', 'manage_users', 'manage_roles', 'view_reports',
    ],
  },
  {
    name: 'Dispatcher',
    slug: 'dispatcher',
    description: 'Assigns and manages incidents across field agencies.',
    permissions: ['view_dashboard', 'view_incidents', 'assign_incident', 'update_incident'],
  },
  {
    name: 'SMS Intake Officer',
    slug: 'sms_intake_officer',
    description: 'Processes incoming SMS incident reports.',
    permissions: ['view_dashboard', 'create_sms_incident'],
  },
  {
    name: 'Field Officer',
    slug: 'field_officer',
    description: 'Handles assigned incidents in the field.',
    permissions: ['view_dashboard', 'view_assigned_incidents'],
  },
]

const USERS_DATA = [
  {
    name: 'Admin User',
    email: 'admin@ekiti.gov.ng',
    password: 'password',
    role: 'it_admin',
    roleLabel: 'IT Admin',
    agency: 'Ekiti State Government',
  },
  {
    name: 'John Dispatcher',
    email: 'dispatcher@ekiti.gov.ng',
    password: 'password',
    role: 'dispatcher',
    roleLabel: 'Dispatcher',
    agency: 'Emergency Management Agency',
  },
  {
    name: 'Sarah Adeyemi',
    email: 'sms@ekiti.gov.ng',
    password: 'password',
    role: 'sms_intake_officer',
    roleLabel: 'SMS Intake Officer',
    agency: 'Communication Centre',
  },
  {
    name: 'Officer Bello',
    email: 'officer@ekiti.gov.ng',
    password: 'password',
    role: 'field_officer',
    roleLabel: 'Field Officer',
    agency: 'Nigeria Police Force',
  },
]

const buildIncidents = (officerBelloId, fieldTeamAlphaId) => [
  {
    incidentId: 'INC-001',
    title: 'Armed Robbery at Ado-Ekiti Market',
    description: 'Three armed men robbed traders at the main Ado-Ekiti market. One person was injured during the incident. Witnesses report the suspects fled towards the motor park area.',
    type: 'security',
    location: 'Ado-Ekiti Central Market, Ekiti State',
    lga: 'Ado-Ekiti',
    status: 'in_progress',
    priority: 'high',
    channel: 'sms',
    agency: 'Nigeria Police Force',
    assignedTo: officerBelloId,
    reporter: 'Sarah Adeyemi',
    reporterPhone: '+2348012345678',
    media: [
      { type: 'image', caption: 'Scene photo – market stall', filename: 'IMG_20260330_0930.jpg', url: '' },
      { type: 'image', caption: 'Injured trader at scene', filename: 'IMG_20260330_0931.jpg', url: '' },
      { type: 'video', caption: 'CCTV clip from market gate', filename: 'VID_20260330_0928.mp4', url: '', duration: '0:52' },
    ],
    timeline: [
      { action: 'Incident created via SMS', time: new Date('2026-03-30T09:30:00Z'), by: 'Sarah Adeyemi' },
      { action: 'Assigned to Officer Bello', time: new Date('2026-03-30T09:45:00Z'), by: 'John Dispatcher' },
      { action: 'Officer en route to scene', time: new Date('2026-03-30T10:00:00Z'), by: 'Officer Bello' },
    ],
    createdAt: new Date('2026-03-30T09:30:00Z'),
    updatedAt: new Date('2026-03-30T10:00:00Z'),
  },
  {
    incidentId: 'INC-002',
    title: 'Building ollapse in Ikere-Ekiti',
    description: 'A two-storey residential building has collapsed trapping an estimated 10 persons inside. Neighbours and bystanders are attempting to assist. Heavy equipment required.',
    type: 'other',
    location: 'Ikere-Ekiti, Ekiti State',
    lga: 'Ikere',
    status: 'pending',
    priority: 'critical',
    channel: 'web',
    agency: 'Nigeria Civil Defence Corps',
    assignedTo: null,
    reporter: 'System',
    reporterPhone: '+2348098765432',
    injured: '10',
    media: [
      { type: 'image', caption: 'Collapsed structure – front view', filename: 'IMG_20260331_0715.jpg', url: '' },
      { type: 'image', caption: 'Rescue attempt by neighbours', filename: 'IMG_20260331_0718.jpg', url: '' },
      { type: 'image', caption: 'Debris extent', filename: 'IMG_20260331_0720.jpg', url: '' },
      { type: 'video', caption: 'Reporter video from scene', filename: 'VID_20260331_0716.mp4', url: '', duration: '1:14' },
    ],
    timeline: [
      { action: 'Incident reported via web portal', time: new Date('2026-03-31T07:15:00Z'), by: 'System' },
    ],
    createdAt: new Date('2026-03-31T07:15:00Z'),
    updatedAt: new Date('2026-03-31T07:15:00Z'),
  },
  {
    incidentId: 'INC-003',
    title: 'Flooding in Oye-Ekiti',
    description: 'Heavy overnight rainfall has caused widespread flooding across residential areas. Several homes evacuated. Roads leading to Ikole impassable.',
    type: 'flood',
    location: 'Oye-Ekiti, Ekiti State',
    lga: 'Oye',
    status: 'resolved',
    priority: 'medium',
    channel: 'app',
    agency: 'Nigeria Fire Service',
    assignedTo: officerBelloId, // field_officer closest match for demo
    reporter: 'System',
    reporterPhone: '+2348056781234',
    displaced: '20',
    media: [
      { type: 'image', caption: 'Flooded street – main road', filename: 'IMG_20260328_1400.jpg', url: '' },
      { type: 'video', caption: 'Evacuation operation footage', filename: 'VID_20260328_1530.mp4', url: '', duration: '2:08' },
    ],
    timeline: [
      { action: 'Incident reported via mobile app', time: new Date('2026-03-28T14:00:00Z'), by: 'System' },
      { action: 'Assigned to Field Team Alpha', time: new Date('2026-03-28T14:20:00Z'), by: 'John Dispatcher' },
      { action: 'Field team arrived on scene', time: new Date('2026-03-28T15:00:00Z'), by: 'Officer Bello' },
      { action: 'Residents evacuated safely', time: new Date('2026-03-28T18:00:00Z'), by: 'Officer Bello' },
      { action: 'Status changed from In Progress to Resolved', time: new Date('2026-03-29T08:30:00Z'), by: 'John Dispatcher' },
    ],
    createdAt: new Date('2026-03-28T14:00:00Z'),
    updatedAt: new Date('2026-03-29T08:30:00Z'),
  },
  {
    incidentId: 'INC-004',
    title: 'Road Traffic Accident on Ado-Iworoko Road',
    description: 'A tanker truck carrying petroleum products has overturned blocking both lanes. Two persons confirmed injured. Risk of fire if not handled urgently.',
    type: 'accident',
    location: 'Ado-Iworoko Road, Ekiti State',
    lga: 'Ado-Ekiti',
    status: 'in_progress',
    priority: 'high',
    channel: 'sms',
    agency: 'Federal Road Safety Corps',
    assignedTo: officerBelloId,
    reporter: 'Sarah Adeyemi',
    reporterPhone: '+2348023456789',
    injured: '2',
    isOngoing: true,
    media: [
      { type: 'image', caption: 'Overturned tanker', filename: 'IMG_20260401_0645.jpg', url: '' },
      { type: 'image', caption: 'Traffic congestion', filename: 'IMG_20260401_0647.jpg', url: '' },
    ],
    timeline: [
      { action: 'Incident reported via SMS', time: new Date('2026-04-01T06:45:00Z'), by: 'Sarah Adeyemi' },
      { action: 'Assigned to Officer Bello', time: new Date('2026-04-01T07:00:00Z'), by: 'John Dispatcher' },
    ],
    createdAt: new Date('2026-04-01T06:45:00Z'),
    updatedAt: new Date('2026-04-01T07:00:00Z'),
  },
  {
    incidentId: 'INC-005',
    title: 'Gas Cylinder Explosion – Efon-Alaaye',
    description: 'A gas cylinder exploded at a residential property causing fire damage to two adjoining buildings. Three persons sustained minor burns. Fire has been partially contained by neighbours.',
    type: 'fire',
    location: 'Efon-Alaaye, Ekiti State',
    lga: 'Efon',
    status: 'pending',
    priority: 'high',
    channel: 'web',
    agency: 'Nigeria Fire Service',
    assignedTo: null,
    reporter: 'System',
    reporterPhone: '+2348034567890',
    injured: '3',
    media: [
      { type: 'image', caption: 'Fire damage to building exterior', filename: 'IMG_20260401_0810.jpg', url: '' },
      { type: 'image', caption: 'Damaged gas cylinder', filename: 'IMG_20260401_0812.jpg', url: '' },
      { type: 'video', caption: 'Witness phone recording', filename: 'VID_20260401_0811.mp4', url: '', duration: '0:38' },
    ],
    timeline: [
      { action: 'Incident reported via web portal', time: new Date('2026-04-01T08:10:00Z'), by: 'System' },
    ],
    createdAt: new Date('2026-04-01T08:10:00Z'),
    updatedAt: new Date('2026-04-01T08:10:00Z'),
  },
  {
    incidentId: 'INC-006',
    title: 'Missing Persons Report – Ijero-Ekiti',
    description: 'A family of three reported missing after failing to return home from a local market. Last seen at approximately 4pm near Ijero central market area.',
    type: 'security',
    location: 'Ijero-Ekiti, Ekiti State',
    lga: 'Ijero',
    status: 'resolved',
    priority: 'low',
    channel: 'app',
    agency: 'Nigeria Police Force',
    assignedTo: officerBelloId,
    reporter: 'System',
    reporterPhone: '+2348045678901',
    media: [
      { type: 'image', caption: 'Photo of missing family (provided by reporter)', filename: 'IMG_20260325_1100.jpg', url: '' },
    ],
    timeline: [
      { action: 'Report submitted via mobile app', time: new Date('2026-03-25T11:00:00Z'), by: 'System' },
      { action: 'Investigation opened', time: new Date('2026-03-25T11:30:00Z'), by: 'John Dispatcher' },
      { action: 'Family located and confirmed safe', time: new Date('2026-03-26T09:00:00Z'), by: 'Officer Bello' },
      { action: 'Status changed from In Progress to Resolved', time: new Date('2026-03-26T09:00:00Z'), by: 'John Dispatcher' },
    ],
    createdAt: new Date('2026-03-25T11:00:00Z'),
    updatedAt: new Date('2026-03-26T09:00:00Z'),
  },
]

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Role.deleteMany({}),
      Incident.deleteMany({}),
      Counter.deleteMany({}),
      Alert.deleteMany({}),
    ])
    console.log('🗑️  Cleared existing data')

    // Seed roles
    await Role.insertMany(ROLES_DATA)
    console.log('✅ Roles seeded')

    // Seed users (passwords are hashed by the pre-save hook)
    const createdUsers = []
    for (const userData of USERS_DATA) {
      const user = await new User(userData).save()
      createdUsers.push(user)
    }
    console.log('✅ Users seeded')

    const adminUser = createdUsers.find((u) => u.email === 'admin@ekiti.gov.ng')
    const officerBello = createdUsers.find((u) => u.email === 'officer@ekiti.gov.ng')

    // Seed incidents
    const incidents = buildIncidents(officerBello._id, officerBello._id)
    await Incident.insertMany(incidents)
    console.log('✅ Incidents seeded')

    // Set counter to 6 so the next generated ID is INC-007
    await Counter.create({ _id: 'incidentId', seq: 6 })
    console.log('✅ Counter initialised at 6')

    // Seed alerts (matching mock data in the app alerts screen)
    await Alert.insertMany([
      {
        title: 'Flash Flood Warning',
        body: 'Heavy rainfall expected in Ijero and Ilejemeje LGAs. Residents in low-lying areas should evacuate immediately.',
        lga: 'Ijero-Ekiti',
        severity: 'critical',
        icon: 'water',
        isActive: true,
        createdBy: adminUser._id,
        createdAt: new Date('2026-04-02T08:00:00Z'),
      },
      {
        title: 'Road Obstruction — Ado-Iyin Road',
        body: 'A fatal road traffic accident has blocked the Ado-Iyin highway. Motorists advised to use alternative routes.',
        lga: 'Ado-Ekiti',
        severity: 'high',
        icon: 'car',
        isActive: true,
        createdBy: adminUser._id,
        createdAt: new Date('2026-04-02T07:15:00Z'),
      },
      {
        title: 'Market Fire — Ikere',
        body: 'Fire outbreak reported at Ikere Central Market. Fire service and emergency teams are on site.',
        lga: 'Ikere-Ekiti',
        severity: 'moderate',
        icon: 'flame',
        isActive: true,
        createdBy: adminUser._id,
        createdAt: new Date('2026-04-02T06:00:00Z'),
      },
      {
        title: 'Power Outage — Oye-Ekiti',
        body: 'Prolonged electricity outage affecting Oye-Ekiti. EKEDC teams have been deployed. Hospitals advised to activate backup generators.',
        lga: 'Oye-Ekiti',
        severity: 'moderate',
        icon: 'flash-off',
        isActive: true,
        createdBy: adminUser._id,
        createdAt: new Date('2026-04-01T20:00:00Z'),
      },
      {
        title: 'Health Advisory — Cholera Prevention',
        body: 'Following recent flooding, residents are advised to boil water before drinking and maintain hygiene to prevent cholera outbreak.',
        lga: null, // applies to all LGAs
        severity: 'low',
        icon: 'medical',
        isActive: true,
        createdBy: adminUser._id,
        createdAt: new Date('2026-04-01T12:00:00Z'),
      },
    ])
    console.log('✅ Alerts seeded')

    console.log('\n🎉 Seeding complete!')
    console.log('─────────────────────────────────────')
    console.log('Demo login credentials (password: password):')
    USERS_DATA.forEach((u) => console.log(`  ${u.roleLabel.padEnd(22)} ${u.email}`))
    console.log('─────────────────────────────────────')

    process.exit(0)
  } catch (err) {
    console.error('❌ Seeding failed:', err.message)
    process.exit(1)
  }
}

seed()
