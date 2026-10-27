import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import UserModel, { IUser } from '../models/User.ts';
import ComplaintModel, { IComplaint, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../models/Complaint.ts';
import ComplaintActivityModel, { IComplaintActivity } from '../models/ComplaintActivity.ts';
import NotificationModel, { INotification } from '../models/Notification.ts';

// In-memory data store cache for resilient operation
interface InMemoryStore {
  users: Array<any>;
  complaints: Array<any>;
  activities: Array<any>;
  notifications: Array<any>;
  initialized: boolean;
}

const memoryStore: InMemoryStore = {
  users: [],
  complaints: [],
  activities: [],
  notifications: [],
  initialized: false,
};

let complaintSequence = 1005;

export async function initDatabaseStore() {
  if (memoryStore.initialized) return;

  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  const userPasswordHash = await bcrypt.hash('User@123456', 10);

  const adminId = '6501a1b2c3d4e5f600000001';
  const user1Id = '6501a1b2c3d4e5f600000002';
  const user2Id = '6501a1b2c3d4e5f600000003';

  const defaultUsers = [
    {
      _id: adminId,
      name: 'Alexander Wright',
      email: 'admin@resolvedesk.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      createdAt: new Date('2026-01-10T08:00:00Z'),
      updatedAt: new Date('2026-01-10T08:00:00Z'),
    },
    {
      _id: user1Id,
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@acme.org',
      passwordHash: userPasswordHash,
      role: 'user',
      createdAt: new Date('2026-01-15T09:30:00Z'),
      updatedAt: new Date('2026-01-15T09:30:00Z'),
    },
    {
      _id: user2Id,
      name: 'David Chen',
      email: 'david.chen@acme.org',
      passwordHash: userPasswordHash,
      role: 'user',
      createdAt: new Date('2026-02-01T11:15:00Z'),
      updatedAt: new Date('2026-02-01T11:15:00Z'),
    },
  ];

  const defaultComplaints = [
    {
      _id: '6501b1b2c3d4e5f600000001',
      complaintNumber: 'CMP-2026-1001',
      title: 'Server Room B primary HVAC unit leaking condensate water',
      description: 'The overhead split HVAC unit in Server Room B has begun leaking condensate near Rack 4. Moisture levels are elevated and posing a short-circuit risk to enterprise SAN storage nodes.',
      category: 'Infrastructure',
      priority: 'High',
      status: 'In Progress',
      locationOrDepartment: 'Building 2 - Server Room B',
      createdBy: user1Id,
      createdByName: 'Sarah Jenkins',
      createdByEmail: 'sarah.jenkins@acme.org',
      assignedTo: 'Facilities & Maintenance',
      internalNotes: 'Dispatched emergency HVAC technician on Oct 26. Drain pipe clearance in progress.',
      resolutionNotes: '',
      createdAt: new Date('2026-10-25T14:30:00Z'),
      updatedAt: new Date('2026-10-26T09:15:00Z'),
    },
    {
      _id: '6501b1b2c3d4e5f600000002',
      complaintNumber: 'CMP-2026-1002',
      title: 'VPN gateway authentication timeout during morning shift handover',
      description: 'Multiple remote engineers in the Southeast Asia branch report persistent 504 timeouts when authenticating through the primary SSL VPN gateway between 08:30 and 09:15 AM.',
      category: 'Technical Issue',
      priority: 'High',
      status: 'Pending',
      locationOrDepartment: 'Global IT / Remote Access',
      createdBy: user1Id,
      createdByName: 'Sarah Jenkins',
      createdByEmail: 'sarah.jenkins@acme.org',
      assignedTo: 'IT Operations',
      internalNotes: 'Pending RADIUS authentication server latency logs analysis.',
      resolutionNotes: '',
      createdAt: new Date('2026-10-26T08:45:00Z'),
      updatedAt: new Date('2026-10-26T08:45:00Z'),
    },
    {
      _id: '6501b1b2c3d4e5f600000003',
      complaintNumber: 'CMP-2026-1003',
      title: 'Floor 3 Boardroom video conference ceiling mic array distorted',
      description: 'During client briefings in Boardroom 3A, remote participants hear severe audio buzzing and intermittent clipping from the ceiling beamforming mic array.',
      category: 'Maintenance',
      priority: 'Medium',
      status: 'Resolved',
      locationOrDepartment: 'Building 1 - Boardroom 3A',
      createdBy: user2Id,
      createdByName: 'David Chen',
      createdByEmail: 'david.chen@acme.org',
      assignedTo: 'AV Support Team',
      internalNotes: 'Dante PoE switch port replaced and firmware re-flashed.',
      resolutionNotes: 'Replaced faulty PoE injector cable and calibrated DSP mixer gains. Audio test passed cleanly with remote Zoom test room.',
      resolvedAt: new Date('2026-10-24T16:00:00Z'),
      resolvedBy: adminId,
      createdAt: new Date('2026-10-23T10:00:00Z'),
      updatedAt: new Date('2026-10-24T16:00:00Z'),
    },
    {
      _id: '6501b1b2c3d4e5f600000004',
      complaintNumber: 'CMP-2026-1004',
      title: 'Duplicate license subscription charge on department credit line',
      description: 'The quarterly billing statement shows two consecutive billings of $1,450 for the enterprise developer tooling seat pack instead of the agreed single renewal invoice.',
      category: 'Billing',
      priority: 'Medium',
      status: 'Resolved',
      locationOrDepartment: 'Engineering Operations / Finance',
      createdBy: user1Id,
      createdByName: 'Sarah Jenkins',
      createdByEmail: 'sarah.jenkins@acme.org',
      assignedTo: 'Finance & Accounts',
      internalNotes: 'Vendor billing support ticket #89284 opened.',
      resolutionNotes: 'Credit note CN-8921 issued by vendor finance and applied to November billing cycle. Excess charge reversed.',
      resolvedAt: new Date('2026-10-22T11:30:00Z'),
      resolvedBy: adminId,
      createdAt: new Date('2026-10-20T13:20:00Z'),
      updatedAt: new Date('2026-10-22T11:30:00Z'),
    },
    {
      _id: '6501b1b2c3d4e5f600000005',
      complaintNumber: 'CMP-2026-1005',
      title: 'Request for personal electric scooter charging outlet in level 1 lobby',
      description: 'Requesting permission and a dedicated 120V outlet to charge personal mobility electric scooters directly inside the visitor lobby reception area.',
      category: 'Other',
      priority: 'Low',
      status: 'Rejected',
      locationOrDepartment: 'Main Lobby Level 1',
      createdBy: user2Id,
      createdByName: 'David Chen',
      createdByEmail: 'david.chen@acme.org',
      assignedTo: 'Facilities Management',
      internalNotes: 'Violates municipal building fire code 44.2 for lithium battery storage in egress zones.',
      resolutionNotes: 'Per corporate safety regulations and facility fire codes, high-capacity battery charging is prohibited in public reception corridors. Dedicated secure charging racks are available in Parking Bay B3.',
      resolvedAt: new Date('2026-10-21T15:00:00Z'),
      resolvedBy: adminId,
      createdAt: new Date('2026-10-21T09:10:00Z'),
      updatedAt: new Date('2026-10-21T15:00:00Z'),
    },
  ];

  const defaultActivities = [
    {
      _id: '6501c1b2c3d4e5f600000001',
      complaint: '6501b1b2c3d4e5f600000001',
      actor: user1Id,
      actorName: 'Sarah Jenkins',
      actorRole: 'user',
      action: 'Submitted',
      previousValue: '',
      newValue: 'Pending',
      note: 'Complaint registered via portal',
      createdAt: new Date('2026-10-25T14:30:00Z'),
    },
    {
      _id: '6501c1b2c3d4e5f600000002',
      complaint: '6501b1b2c3d4e5f600000001',
      actor: adminId,
      actorName: 'Alexander Wright',
      actorRole: 'admin',
      action: 'Assigned',
      previousValue: 'Unassigned',
      newValue: 'Facilities & Maintenance',
      note: 'Assigned to emergency facilities dispatch',
      createdAt: new Date('2026-10-25T15:10:00Z'),
    },
    {
      _id: '6501c1b2c3d4e5f600000003',
      complaint: '6501b1b2c3d4e5f600000001',
      actor: adminId,
      actorName: 'Alexander Wright',
      actorRole: 'admin',
      action: 'Status Changed',
      previousValue: 'Pending',
      newValue: 'In Progress',
      note: 'Technicians on site assessing drain blockages',
      createdAt: new Date('2026-10-26T09:15:00Z'),
    },
    {
      _id: '6501c1b2c3d4e5f600000004',
      complaint: '6501b1b2c3d4e5f600000002',
      actor: user1Id,
      actorName: 'Sarah Jenkins',
      actorRole: 'user',
      action: 'Submitted',
      previousValue: '',
      newValue: 'Pending',
      note: 'Complaint registered via portal',
      createdAt: new Date('2026-10-26T08:45:00Z'),
    },
    {
      _id: '6501c1b2c3d4e5f600000005',
      complaint: '6501b1b2c3d4e5f600000003',
      actor: user2Id,
      actorName: 'David Chen',
      actorRole: 'user',
      action: 'Submitted',
      previousValue: '',
      newValue: 'Pending',
      note: 'Complaint registered via portal',
      createdAt: new Date('2026-10-23T10:00:00Z'),
    },
    {
      _id: '6501c1b2c3d4e5f600000006',
      complaint: '6501b1b2c3d4e5f600000003',
      actor: adminId,
      actorName: 'Alexander Wright',
      actorRole: 'admin',
      action: 'Resolved',
      previousValue: 'In Progress',
      newValue: 'Resolved',
      note: 'Replaced faulty PoE injector cable and calibrated DSP mixer gains.',
      createdAt: new Date('2026-10-24T16:00:00Z'),
    },
  ];

  const defaultNotifications = [
    {
      _id: '6501d1b2c3d4e5f600000001',
      user: user1Id,
      complaint: '6501b1b2c3d4e5f600000001',
      complaintNumber: 'CMP-2026-1001',
      message: 'Status updated to In Progress for Server Room B primary HVAC unit',
      isRead: false,
      createdAt: new Date('2026-10-26T09:15:00Z'),
    },
    {
      _id: '6501d1b2c3d4e5f600000002',
      user: user1Id,
      complaint: '6501b1b2c3d4e5f600000002',
      complaintNumber: 'CMP-2026-1002',
      message: 'Complaint CMP-2026-1002 has been received and is queued for IT Operations review',
      isRead: false,
      createdAt: new Date('2026-10-26T08:45:00Z'),
    },
    {
      _id: '6501d1b2c3d4e5f600000003',
      user: user1Id,
      complaint: '6501b1b2c3d4e5f600000004',
      complaintNumber: 'CMP-2026-1004',
      message: 'Complaint CMP-2026-1004 has been marked as Resolved with credit note applied',
      isRead: true,
      createdAt: new Date('2026-10-22T11:30:00Z'),
    },
    {
      _id: '6501d1b2c3d4e5f600000004',
      user: user2Id,
      complaint: '6501b1b2c3d4e5f600000003',
      complaintNumber: 'CMP-2026-1003',
      message: 'Complaint CMP-2026-1003 has been Resolved by AV Support Team',
      isRead: false,
      createdAt: new Date('2026-10-24T16:00:00Z'),
    },
  ];

  memoryStore.users = defaultUsers;
  memoryStore.complaints = defaultComplaints;
  memoryStore.activities = defaultActivities;
  memoryStore.notifications = defaultNotifications;
  memoryStore.initialized = true;

  // If connected to real MongoDB, synchronize initial records
  if (mongoose.connection.readyState === 1) {
    try {
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        console.log('🌱 Seeding initial MongoDB records...');
        await UserModel.insertMany(defaultUsers);
        await ComplaintModel.insertMany(defaultComplaints);
        await ComplaintActivityModel.insertMany(defaultActivities);
        await NotificationModel.insertMany(defaultNotifications);
        console.log('✅ MongoDB successfully seeded with starter enterprise data!');
      }
    } catch (err) {
      console.warn('Note: MongoDB seed check skipped:', err);
    }
  }
}

// User operations
export async function findUserByEmail(email: string, includePassword = false) {
  const normEmail = email.toLowerCase().trim();
  if (mongoose.connection.readyState === 1) {
    const q = UserModel.findOne({ email: normEmail });
    if (includePassword) q.select('+passwordHash');
    return await q.exec();
  }
  const u = memoryStore.users.find((x) => x.email.toLowerCase() === normEmail);
  if (!u) return null;
  const clone = { ...u };
  if (!includePassword) delete clone.passwordHash;
  return clone;
}

export async function findUserById(id: string) {
  if (mongoose.connection.readyState === 1) {
    return await UserModel.findById(id).select('-passwordHash');
  }
  const u = memoryStore.users.find((x) => String(x._id) === String(id));
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
}

export async function createUser(data: { name: string; email: string; passwordHash: string; role?: 'user' | 'admin' }) {
  const normEmail = data.email.toLowerCase().trim();
  if (mongoose.connection.readyState === 1) {
    const user = new UserModel({
      name: data.name.trim(),
      email: normEmail,
      passwordHash: data.passwordHash,
      role: data.role || 'user',
    });
    return await user.save();
  }

  const newUser = {
    _id: new mongoose.Types.ObjectId().toString(),
    name: data.name.trim(),
    email: normEmail,
    passwordHash: data.passwordHash,
    role: data.role || 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryStore.users.push(newUser);
  const { passwordHash, ...rest } = newUser;
  return rest;
}

export async function updateUser(id: string, updates: Partial<{ name: string; passwordHash: string }>) {
  if (mongoose.connection.readyState === 1) {
    return await UserModel.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true }).select('-passwordHash');
  }
  const idx = memoryStore.users.findIndex((x) => String(x._id) === String(id));
  if (idx === -1) return null;
  memoryStore.users[idx] = {
    ...memoryStore.users[idx],
    ...updates,
    updatedAt: new Date(),
  };
  const { passwordHash, ...rest } = memoryStore.users[idx];
  return rest;
}

// Complaint operations
export async function createComplaint(data: {
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  locationOrDepartment?: string;
  createdBy: string;
  createdByName: string;
  createdByEmail: string;
}) {
  complaintSequence += 1;
  const complaintNumber = `CMP-2026-${complaintSequence}`;

  if (mongoose.connection.readyState === 1) {
    const complaint = new ComplaintModel({
      complaintNumber,
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category,
      priority: data.priority,
      status: 'Pending',
      locationOrDepartment: data.locationOrDepartment?.trim() || '',
      createdBy: data.createdBy,
      createdByName: data.createdByName,
      createdByEmail: data.createdByEmail,
      assignedTo: 'Unassigned',
    });
    const saved = await complaint.save();

    // Log activity
    await ComplaintActivityModel.create({
      complaint: saved._id,
      actor: data.createdBy,
      actorName: data.createdByName,
      actorRole: 'user',
      action: 'Submitted',
      newValue: 'Pending',
      note: 'Complaint submitted to system',
    });

    // Notify user
    await NotificationModel.create({
      user: data.createdBy,
      complaint: saved._id,
      complaintNumber: saved.complaintNumber,
      message: `Your complaint ${saved.complaintNumber} (${saved.title}) has been submitted and registered as Pending.`,
      isRead: false,
    });

    return saved;
  }

  const newComplaint = {
    _id: new mongoose.Types.ObjectId().toString(),
    complaintNumber,
    title: data.title.trim(),
    description: data.description.trim(),
    category: data.category,
    priority: data.priority,
    status: 'Pending',
    locationOrDepartment: data.locationOrDepartment?.trim() || '',
    createdBy: data.createdBy,
    createdByName: data.createdByName,
    createdByEmail: data.createdByEmail,
    assignedTo: 'Unassigned',
    internalNotes: '',
    resolutionNotes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  memoryStore.complaints.unshift(newComplaint);

  // Add activity
  memoryStore.activities.unshift({
    _id: new mongoose.Types.ObjectId().toString(),
    complaint: newComplaint._id,
    actor: data.createdBy,
    actorName: data.createdByName,
    actorRole: 'user',
    action: 'Submitted',
    previousValue: '',
    newValue: 'Pending',
    note: 'Complaint submitted to system',
    createdAt: new Date(),
  });

  // Add notification
  memoryStore.notifications.unshift({
    _id: new mongoose.Types.ObjectId().toString(),
    user: data.createdBy,
    complaint: newComplaint._id,
    complaintNumber: newComplaint.complaintNumber,
    message: `Your complaint ${newComplaint.complaintNumber} has been received and registered as Pending.`,
    isRead: false,
    createdAt: new Date(),
  });

  return newComplaint;
}

export async function findComplaints(filter: {
  userId?: string;
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest';
}) {
  const page = Math.max(1, Number(filter.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(filter.limit) || 10));
  const skip = (page - 1) * limit;

  if (mongoose.connection.readyState === 1) {
    const query: any = {};
    if (filter.userId) query.createdBy = filter.userId;
    if (filter.status && filter.status !== 'All') query.status = filter.status;
    if (filter.category && filter.category !== 'All') query.category = filter.category;
    if (filter.priority && filter.priority !== 'All') query.priority = filter.priority;
    if (filter.search) {
      const regex = new RegExp(filter.search.trim(), 'i');
      query.$or = [{ complaintNumber: regex }, { title: regex }, { locationOrDepartment: regex }];
    }

    const sortOrder = filter.sort === 'oldest' ? 1 : -1;
    const [items, total] = await Promise.all([
      ComplaintModel.find(query).sort({ createdAt: sortOrder }).skip(skip).limit(limit),
      ComplaintModel.countDocuments(query),
    ]);

    return {
      complaints: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  let list = [...memoryStore.complaints];

  if (filter.userId) {
    list = list.filter((c) => String(c.createdBy) === String(filter.userId));
  }
  if (filter.status && filter.status !== 'All') {
    list = list.filter((c) => c.status === filter.status);
  }
  if (filter.category && filter.category !== 'All') {
    list = list.filter((c) => c.category === filter.category);
  }
  if (filter.priority && filter.priority !== 'All') {
    list = list.filter((c) => c.priority === filter.priority);
  }
  if (filter.search) {
    const s = filter.search.toLowerCase().trim();
    list = list.filter(
      (c) =>
        c.complaintNumber.toLowerCase().includes(s) ||
        c.title.toLowerCase().includes(s) ||
        (c.locationOrDepartment && c.locationOrDepartment.toLowerCase().includes(s))
    );
  }

  const sortOrder = filter.sort === 'oldest' ? 1 : -1;
  list.sort((a, b) => (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * sortOrder);

  const total = list.length;
  const paginated = list.slice(skip, skip + limit);

  return {
    complaints: paginated,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function findComplaintById(id: string) {
  if (mongoose.connection.readyState === 1) {
    return await ComplaintModel.findById(id);
  }
  return memoryStore.complaints.find((c) => String(c._id) === String(id) || c.complaintNumber === id) || null;
}

export async function getComplaintActivities(complaintId: string) {
  if (mongoose.connection.readyState === 1) {
    return await ComplaintActivityModel.find({ complaint: complaintId }).sort({ createdAt: -1 });
  }
  return memoryStore.activities
    .filter((a) => String(a.complaint) === String(complaintId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateComplaintAdmin(
  complaintId: string,
  actor: { _id: string; name: string; role: 'admin' },
  updates: {
    status?: ComplaintStatus;
    assignedTo?: string;
    internalNotes?: string;
    resolutionNotes?: string;
  }
) {
  const current = await findComplaintById(complaintId);
  if (!current) return null;

  const currentId = String(current._id);

  // Status change
  if (updates.status && updates.status !== current.status) {
    const prevStatus = current.status;
    const newStatus = updates.status;

    let actionName: any = 'Status Changed';
    if (newStatus === 'Resolved') actionName = 'Resolved';
    if (newStatus === 'Rejected') actionName = 'Rejected';

    const note = updates.resolutionNotes || `Status updated from ${prevStatus} to ${newStatus}`;

    // Add activity
    if (mongoose.connection.readyState === 1) {
      await ComplaintActivityModel.create({
        complaint: currentId,
        actor: actor._id,
        actorName: actor.name,
        actorRole: 'admin',
        action: actionName,
        previousValue: prevStatus,
        newValue: newStatus,
        note,
      });

      await NotificationModel.create({
        user: current.createdBy,
        complaint: currentId,
        complaintNumber: current.complaintNumber,
        message: `Complaint ${current.complaintNumber} status changed to ${newStatus}${
          updates.resolutionNotes ? `: "${updates.resolutionNotes}"` : '.'
        }`,
        isRead: false,
      });
    } else {
      memoryStore.activities.unshift({
        _id: new mongoose.Types.ObjectId().toString(),
        complaint: currentId,
        actor: actor._id,
        actorName: actor.name,
        actorRole: 'admin',
        action: actionName,
        previousValue: prevStatus,
        newValue: newStatus,
        note,
        createdAt: new Date(),
      });

      memoryStore.notifications.unshift({
        _id: new mongoose.Types.ObjectId().toString(),
        user: String(current.createdBy),
        complaint: currentId,
        complaintNumber: current.complaintNumber,
        message: `Complaint ${current.complaintNumber} status changed to ${newStatus}${
          updates.resolutionNotes ? `: "${updates.resolutionNotes}"` : '.'
        }`,
        isRead: false,
        createdAt: new Date(),
      });
    }
  }

  // Assignment change
  if (updates.assignedTo && updates.assignedTo !== current.assignedTo) {
    const prevAssigned = current.assignedTo || 'Unassigned';
    const newAssigned = updates.assignedTo;

    if (mongoose.connection.readyState === 1) {
      await ComplaintActivityModel.create({
        complaint: currentId,
        actor: actor._id,
        actorName: actor.name,
        actorRole: 'admin',
        action: 'Assigned',
        previousValue: prevAssigned,
        newValue: newAssigned,
        note: `Complaint assigned to ${newAssigned}`,
      });
    } else {
      memoryStore.activities.unshift({
        _id: new mongoose.Types.ObjectId().toString(),
        complaint: currentId,
        actor: actor._id,
        actorName: actor.name,
        actorRole: 'admin',
        action: 'Assigned',
        previousValue: prevAssigned,
        newValue: newAssigned,
        note: `Complaint assigned to ${newAssigned}`,
        createdAt: new Date(),
      });
    }
  }

  // Internal note added
  if (updates.internalNotes && updates.internalNotes !== current.internalNotes) {
    if (mongoose.connection.readyState === 1) {
      await ComplaintActivityModel.create({
        complaint: currentId,
        actor: actor._id,
        actorName: actor.name,
        actorRole: 'admin',
        action: 'Internal Note Added',
        note: updates.internalNotes,
      });
    } else {
      memoryStore.activities.unshift({
        _id: new mongoose.Types.ObjectId().toString(),
        complaint: currentId,
        actor: actor._id,
        actorName: actor.name,
        actorRole: 'admin',
        action: 'Internal Note Added',
        note: updates.internalNotes,
        createdAt: new Date(),
      });
    }
  }

  // Update complaint document
  const docUpdates: any = { ...updates, updatedAt: new Date() };
  if (updates.status === 'Resolved' || updates.status === 'Rejected') {
    docUpdates.resolvedAt = new Date();
    docUpdates.resolvedBy = actor._id;
  }

  if (mongoose.connection.readyState === 1) {
    return await ComplaintModel.findByIdAndUpdate(currentId, docUpdates, { new: true });
  }

  const idx = memoryStore.complaints.findIndex((c) => String(c._id) === currentId);
  if (idx !== -1) {
    memoryStore.complaints[idx] = {
      ...memoryStore.complaints[idx],
      ...docUpdates,
    };
    return memoryStore.complaints[idx];
  }
  return null;
}

export async function getDashboardStats(userId?: string) {
  if (mongoose.connection.readyState === 1) {
    const baseMatch: any = {};
    if (userId) baseMatch.createdBy = new mongoose.Types.ObjectId(userId);

    const counts = await ComplaintModel.aggregate([
      { $match: baseMatch },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const stats: Record<string, number> = {
      total: 0,
      Pending: 0,
      'In Progress': 0,
      Resolved: 0,
      Rejected: 0,
    };

    counts.forEach((item) => {
      stats[item._id] = item.count;
      stats.total += item.count;
    });

    return stats;
  }

  let list = memoryStore.complaints;
  if (userId) {
    list = list.filter((c) => String(c.createdBy) === String(userId));
  }

  const stats = {
    total: list.length,
    Pending: list.filter((c) => c.status === 'Pending').length,
    'In Progress': list.filter((c) => c.status === 'In Progress').length,
    Resolved: list.filter((c) => c.status === 'Resolved').length,
    Rejected: list.filter((c) => c.status === 'Rejected').length,
  };

  return stats;
}

export async function getAdminAnalytics() {
  const stats = await getDashboardStats();

  if (mongoose.connection.readyState === 1) {
    const [categories, priorities, recentComplaints] = await Promise.all([
      ComplaintModel.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      ComplaintModel.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      ComplaintModel.find().sort({ createdAt: -1 }).limit(6),
    ]);

    return {
      stats,
      categoryDistribution: categories.map((c) => ({ category: c._id, count: c.count })),
      priorityDistribution: priorities.map((p) => ({ priority: p._id, count: p.count })),
      recentComplaints,
    };
  }

  const categoryMap: Record<string, number> = {};
  const priorityMap: Record<string, number> = {};

  memoryStore.complaints.forEach((c) => {
    categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
    priorityMap[c.priority] = (priorityMap[c.priority] || 0) + 1;
  });

  const categoryDistribution = Object.entries(categoryMap).map(([category, count]) => ({
    category,
    count,
  }));

  const priorityDistribution = Object.entries(priorityMap).map(([priority, count]) => ({
    priority,
    count,
  }));

  const recentComplaints = [...memoryStore.complaints]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return {
    stats,
    categoryDistribution,
    priorityDistribution,
    recentComplaints,
  };
}

// Notifications
export async function getUserNotifications(userId: string) {
  if (mongoose.connection.readyState === 1) {
    const notifications = await NotificationModel.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await NotificationModel.countDocuments({ user: userId, isRead: false });
    return { notifications, unreadCount };
  }

  const list = memoryStore.notifications
    .filter((n) => String(n.user) === String(userId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = list.filter((n) => !n.isRead).length;
  return { notifications: list, unreadCount };
}

export async function markNotificationAsRead(id: string, userId: string) {
  if (mongoose.connection.readyState === 1) {
    return await NotificationModel.findOneAndUpdate({ _id: id, user: userId }, { isRead: true }, { new: true });
  }

  const item = memoryStore.notifications.find((n) => String(n._id) === String(id) && String(n.user) === String(userId));
  if (item) item.isRead = true;
  return item;
}

export async function markAllNotificationsAsRead(userId: string) {
  if (mongoose.connection.readyState === 1) {
    await NotificationModel.updateMany({ user: userId, isRead: false }, { isRead: true });
    return true;
  }

  memoryStore.notifications.forEach((n) => {
    if (String(n.user) === String(userId)) n.isRead = true;
  });
  return true;
}
