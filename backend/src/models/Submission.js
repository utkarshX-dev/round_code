import mongoose from 'mongoose';

const problemSubmissionSchema = new mongoose.Schema(
  {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Problem reference is required'],
    },
    language: {
      type: String,
      required: [true, 'Programming language is required'],
      enum: ['C++', 'Python', 'JavaScript', 'Java', 'Other'],
      default: 'C++',
    },
    code: {
      type: String,
      required: [true, 'Source code is required'],
    },
    timeComplexity: {
      type: String,
      required: [true, 'Time complexity is required'],
      trim: true,
    },
    spaceComplexity: {
      type: String,
      required: [true, 'Space complexity is required'],
      trim: true,
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: ['LeetCode', 'Codeforces', 'CodeChef', 'GeeksforGeeks', 'HackerRank', 'Other'],
    },
    submissionLink: {
      type: String,
      trim: true,
      default: '',
    },
    driveLink: {
      type: String,
      trim: true,
      default: '',
    },
    score: {
      type: Number,
      default: 0,
      min: [0, 'Score cannot be negative'],
    },
    maxScore: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    feedback: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: true }
);

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    potwId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'POTW',
      required: true,
    },
    problems: {
      type: [problemSubmissionSchema],
      validate: {
        validator: function (problems) {
          return Array.isArray(problems) && problems.length === 3;
        },
        message: 'A submission must contain all 3 solved questions',
      },
    },
    totalScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 6,
    },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'reviewed'],
      default: 'submitted',
    },
    reopenHistory: [
      {
        reopenedAt: { type: Date, default: Date.now },
        reopenedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String, default: '' },
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One submission per member per POTW
submissionSchema.index({ userId: 1, potwId: 1 }, { unique: true });
submissionSchema.index({ status: 1 });
submissionSchema.index({ potwId: 1, status: 1, submittedAt: 1 });
submissionSchema.index({ userId: 1, status: 1, reviewedAt: -1 });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
