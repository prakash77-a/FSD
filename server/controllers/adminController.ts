import { Request, Response } from 'express';
import {
  findComplaints,
  findComplaintById,
  updateComplaintAdmin,
  getAdminAnalytics,
} from '../services/dbStore.ts';
import { ComplaintStatus } from '../models/Complaint.ts';

const VALID_STATUSES: ComplaintStatus[] = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

export async function getAdminDashboard(req: Request, res: Response) {
  try {
    const data = await getAdminAnalytics();
    res.json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error loading administrator dashboard.' });
  }
}

export async function getAllComplaints(req: Request, res: Response) {
  try {
    const { status, category, priority, search, page, limit, sort } = req.query;

    const result = await findComplaints({
      status: status as string,
      category: category as string,
      priority: priority as string,
      search: search as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sort: sort === 'oldest' ? 'oldest' : 'newest',
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error('Admin all complaints error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error retrieving all complaints.' });
  }
}

export async function updateComplaintStatus(req: Request, res: Response) {
  try {
    const admin = req.user!;
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
      return;
    }

    if ((status === 'Resolved' || status === 'Rejected') && (!resolutionNotes || !resolutionNotes.trim())) {
      res.status(400).json({
        success: false,
        message: `Resolution notes are required when marking a complaint as ${status}.`,
      });
      return;
    }

    const updated = await updateComplaintAdmin(
      id,
      { _id: admin._id, name: admin.name, role: 'admin' },
      {
        status,
        resolutionNotes: resolutionNotes ? resolutionNotes.trim() : '',
      }
    );

    if (!updated) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    res.json({
      success: true,
      message: `Complaint ${updated.complaintNumber} updated to ${status}.`,
      complaint: updated,
    });
  } catch (err: any) {
    console.error('Update complaint status error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error updating status.' });
  }
}

export async function assignComplaint(req: Request, res: Response) {
  try {
    const admin = req.user!;
    const { id } = req.params;
    const { assignedTo } = req.body;

    if (!assignedTo || !assignedTo.trim()) {
      res.status(400).json({
        success: false,
        message: 'Please provide a department or administrator to assign this complaint to.',
      });
      return;
    }

    const updated = await updateComplaintAdmin(
      id,
      { _id: admin._id, name: admin.name, role: 'admin' },
      {
        assignedTo: assignedTo.trim(),
      }
    );

    if (!updated) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    res.json({
      success: true,
      message: `Complaint assigned to ${assignedTo.trim()}.`,
      complaint: updated,
    });
  } catch (err: any) {
    console.error('Assign complaint error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error assigning complaint.' });
  }
}

export async function addInternalNote(req: Request, res: Response) {
  try {
    const admin = req.user!;
    const { id } = req.params;
    const { internalNotes } = req.body;

    if (!internalNotes || !internalNotes.trim()) {
      res.status(400).json({ success: false, message: 'Internal note cannot be empty.' });
      return;
    }

    const updated = await updateComplaintAdmin(
      id,
      { _id: admin._id, name: admin.name, role: 'admin' },
      {
        internalNotes: internalNotes.trim(),
      }
    );

    if (!updated) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    res.json({
      success: true,
      message: 'Internal administrative note added successfully.',
      complaint: updated,
    });
  } catch (err: any) {
    console.error('Add internal note error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error recording internal note.' });
  }
}
