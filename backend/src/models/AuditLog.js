import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorName: {
      type: String,
      required: true,
    },
    actorRole: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'APPROVE_REGISTRATION',
        'REJECT_REGISTRATION',
        'CREATE_POTW',
        'UPDATE_POTW',
        'REVIEW_SUBMISSION',
        'REOPEN_SUBMISSION',
        'MANUAL_RATING_CHANGE',
        'CREATE_ADMIN',
        'REMOVE_ADMIN',
        'REMOVE_MEMBER',
        'APPLY_PENALTIES',
        'DATABASE_INITIALIZATION',
        'SYSTEM_INIT',
      ],
    },
    targetType: {
      type: String,
      required: true,
    },
    targetId: {
      type: String,
      default: '',
    },
    reason: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
