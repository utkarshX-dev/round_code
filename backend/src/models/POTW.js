import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
    },
    statement: {
      type: String,
      required: [true, 'Problem statement is required'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: [true, 'Problem difficulty is required'],
    },
    constraints: {
      type: String,
      default: '',
    },
    expectedTimeComplexity: {
      type: String,
      default: '',
    },
    expectedSpaceComplexity: {
      type: String,
      default: '',
    },
    maxScore: {
      type: Number,
      required: true,
      validate: {
        validator: function (val) {
          if (this.difficulty === 'easy') return val === 1;
          if (this.difficulty === 'medium') return val === 2;
          if (this.difficulty === 'hard') return val === 3;
          return true;
        },
        message: 'Problem maxScore must match difficulty (Easy: 1, Medium: 2, Hard: 3)',
      },
    },
  },
  { _id: true }
);

const potwSchema = new mongoose.Schema(
  {
    weekNumber: {
      type: Number,
      required: [true, 'Week number is required'],
    },
    title: {
      type: String,
      required: [true, 'POTW title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    problems: {
      type: [problemSchema],
      validate: {
        validator: function (problems) {
          // Exactly 3 questions required
          return Array.isArray(problems) && problems.length === 3;
        },
        message: 'A POTW must contain exactly 3 problems (Easy, Medium, Hard)',
      },
    },
    publishAt: {
      type: Date,
      required: [true, 'Publish date is required'],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
      validate: {
        validator: function (deadline) {
          return deadline > this.publishAt;
        },
        message: 'Deadline must be later than publish date',
      },
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'active', 'closed'],
      default: 'draft',
    },
    penaltyProcessed: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
potwSchema.index({ status: 1 });
potwSchema.index({ deadline: 1 });

const POTW = mongoose.model('POTW', potwSchema);
export default POTW;
