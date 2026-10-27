import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import UserModel from '../models/User.ts';
import ComplaintModel from '../models/Complaint.ts';
import ComplaintActivityModel from '../models/ComplaintActivity.ts';
import NotificationModel from '../models/Notification.ts';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/complaint_management';

async function seed() {
  console.log(`🔌 Connecting to MongoDB: ${MONGODB_URI}...`);
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected.');

  console.log('🧹 Clearing existing collections...');
  await Promise.all([
    UserModel.deleteMany({}),
    ComplaintModel.deleteMany({}),
    ComplaintActivityModel.deleteMany({}),
    NotificationModel.deleteMany({}),
  ]);

  console.log('🔑 Hashing credentials...');
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  const userPasswordHash = await bcrypt.hash('User@123456', 10);

  console.log('👤 Creating enterprise users...');
  const admin = await UserModel.create({
    name: 'Alexander Wright',
    email: 'admin@resolvedesk.com',
    passwordHash: adminPasswordHash,
    role: 'admin',
  });

  const user1 = await UserModel.create({
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@acme.org',
    passwordHash: userPasswordHash,
    role: 'user',
  });

  const user2 = await UserModel.create({
    name: 'David Chen',
    email: 'david.chen@acme.org',
    passwordHash: userPasswordHash,
    role: 'user',
  });

  console.log('📋 Creating complaints...');
  const c1 = await ComplaintModel.create({
    complaintNumber: 'CMP-2026-1001',
    title: 'Server Room B primary HVAC unit leaking condensate water',
    description: 'The overhead split HVAC unit in Server Room B has begun leaking condensate near Rack 4. Moisture levels are elevated and posing a short-circuit risk to enterprise SAN storage nodes.',
    category: 'Infrastructure',
    priority: 'High',
    status: 'In Progress',
    locationOrDepartment: 'Building 2 - Server Room B',
    createdBy: user1._id,
    createdByName: user1.name,
    createdByEmail: user1.email,
    assignedTo: 'Facilities & Maintenance',
    internalNotes: 'Dispatched emergency HVAC technician on Oct 26. Drain pipe clearance in progress.',
  });

  const c2 = await ComplaintModel.create({
    complaintNumber: 'CMP-2026-1002',
    title: 'VPN gateway authentication timeout during morning shift handover',
    description: 'Multiple remote engineers in the Southeast Asia branch report persistent 504 timeouts when authenticating through the primary SSL VPN gateway between 08:30 and 09:15 AM.',
    category: 'Technical Issue',
    priority: 'High',
    status: 'Pending',
    locationOrDepartment: 'Global IT / Remote Access',
    createdBy: user1._id,
    createdByName: user1.name,
    createdByEmail: user1.email,
    assignedTo: 'IT Operations',
    internalNotes: 'Pending RADIUS authentication server latency logs analysis.',
  });

  const c3 = await ComplaintModel.create({
    complaintNumber: 'CMP-2026-1003',
    title: 'Floor 3 Boardroom video conference ceiling mic array distorted',
    description: 'During client briefings in Boardroom 3A, remote participants hear severe audio buzzing and intermittent clipping from the ceiling beamforming mic array.',
    category: 'Maintenance',
    priority: 'Medium',
    status: 'Resolved',
    locationOrDepartment: 'Building 1 - Boardroom 3A',
    createdBy: user2._id,
    createdByName: user2.name,
    createdByEmail: user2.email,
    assignedTo: 'AV Support Team',
    resolutionNotes: 'Replaced faulty PoE injector cable and calibrated DSP mixer gains. Audio test passed cleanly with remote Zoom test room.',
    resolvedAt: new Date(),
    resolvedBy: admin._id,
  });

  console.log('📜 Adding activity history & notifications...');
  await ComplaintActivityModel.create([
    {
      complaint: c1._id,
      actor: user1._id,
      actorName: user1.name,
      actorRole: 'user',
      action: 'Submitted',
      newValue: 'Pending',
      note: 'Complaint registered via portal',
    },
    {
      complaint: c1._id,
      actor: admin._id,
      actorName: admin.name,
      actorRole: 'admin',
      action: 'Assigned',
      previousValue: 'Unassigned',
      newValue: 'Facilities & Maintenance',
      note: 'Assigned to emergency facilities dispatch',
    },
    {
      complaint: c1._id,
      actor: admin._id,
      actorName: admin.name,
      actorRole: 'admin',
      action: 'Status Changed',
      previousValue: 'Pending',
      newValue: 'In Progress',
      note: 'Technicians on site assessing drain blockages',
    },
  ]);

  await NotificationModel.create([
    {
      user: user1._id,
      complaint: c1._id,
      complaintNumber: c1.complaintNumber,
      message: 'Status updated to In Progress for Server Room B primary HVAC unit',
      isRead: false,
    },
    {
      user: user1._id,
      complaint: c2._id,
      complaintNumber: c2.complaintNumber,
      message: 'Complaint CMP-2026-1002 has been received and is queued for IT Operations review',
      isRead: false,
    },
  ]);

  console.log('🎉 Seed complete! Default accounts created:');
  console.log('   Admin: admin@resolvedesk.com / Admin@123456');
  console.log('   User 1: sarah.jenkins@acme.org / User@123456');
  console.log('   User 2: david.chen@acme.org / User@123456');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
