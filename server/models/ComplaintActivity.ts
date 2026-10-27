import mongoose, { Schema, Document } from 'mongoose';

export interface IComplaintActivity extends Document {
  complaint: mongoose.Types.ObjectId | string;
  actor: mongoose.Types.ObjectId | string;
  actorName: string;
  actorRole: 'user' | 'admin';
  action:
    | 'Submitted'
    | 'Status Changed'
    | 'Assigned'
    | 'Internal Note Added'
    | 'Resolved'
    | 'Rejected';
  previousValue?: string;
  newValue?: string;
  note?: string;
  createdAt: Date;
}

const ComplaintActivitySchema = new Schema<IComplaintActivity>(
  {
    complaint: {
      type: Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorName: {
      type: String,
      required: true,
    },
    actorRole: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'Submitted',
        'Status Changed',
        'Assigned',
        'Internal Note Added',
        'Resolved',
        'Rejected',
      ],
    },
    previousValue: {
      type: String,
      default: '',
    },
    newValue: {
      type: String,
      default: '',
    },
    note: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ComplaintActivitySchema.index({ complaint: 1, createdAt: -1 });

export const ComplaintActivityModel =
  mongoose.models.ComplaintActivity ||
  mongoose.model<IComplaintActivity>('ComplaintActivity', ComplaintActivitySchema);
export default ComplaintActivityModel;
