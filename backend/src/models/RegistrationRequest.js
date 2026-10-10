import mongoose from 'mongoose';

const registrationRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    dtuEmail: {
      type: String,
      required: [true, 'DTU Email is required'],
      lowercase: true,
      trim: true,
      match: [/^[a-zA-Z0-9._%+-]+@dtu\.ac\.in$/, 'DTU Email must end with @dtu.ac.in'],
    },
    personalEmail: {
      type: String,
      required: [true, 'Personal Email is required'],
      lowercase: true,
      trim: true,
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      trim: true,
    },
    batch: {
      type: String,
      required: [true, 'Batch is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for easy lookups
registrationRequestSchema.index({ status: 1, createdAt: -1 });
registrationRequestSchema.index({ dtuEmail: 1 });
registrationRequestSchema.index({ personalEmail: 1 });

const RegistrationRequest = mongoose.model('RegistrationRequest', registrationRequestSchema);
export default RegistrationRequest;
