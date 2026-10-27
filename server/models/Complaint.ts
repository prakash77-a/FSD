import mongoose, { Schema, Document } from 'mongoose';

export type ComplaintCategory =
  | 'Infrastructure'
  | 'Technical Issue'
  | 'Maintenance'
  | 'Staff or Service'
  | 'Billing'
  | 'Other';

export type ComplaintPriority = 'Low' | 'Medium' | 'High';

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';

export interface IComplaint extends Document {
  complaintNumber: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  locationOrDepartment?: string;
  createdBy: mongoose.Types.ObjectId | string;
  createdByName?: string;
  createdByEmail?: string;
  assignedTo?: string; // department or admin name
  internalNotes?: string;
  resolutionNotes?: string;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    complaintNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a complaint title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Infrastructure',
        'Technical Issue',
        'Maintenance',
        'Staff or Service',
        'Billing',
        'Other',
      ],
      index: true,
    },
    priority: {
      type: String,
      required: [true, 'Please select a priority'],
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    locationOrDepartment: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    createdByName: {
      type: String,
      default: '',
    },
    createdByEmail: {
      type: String,
      default: '',
    },
    assignedTo: {
      type: String,
      default: 'Unassigned',
      trim: true,
    },
    internalNotes: {
      type: String,
      default: '',
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast search and filtering
ComplaintSchema.index({ status: 1, createdAt: -1 });
ComplaintSchema.index({ createdBy: 1, createdAt: -1 });

export const ComplaintModel =
  mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema);
export default ComplaintModel;
