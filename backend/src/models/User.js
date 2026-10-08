import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    techStack: [{ type: String, trim: true }],
    githubLink: { type: String, trim: true },
    liveLink: { type: String, trim: true },
  },
  { _id: true }
);

const customProfileSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    dtuEmail: {
      type: String,
      required: [true, 'DTU Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-zA-Z0-9._%+-]+@dtu\.ac\.in$/, 'DTU Email must end with @dtu.ac.in'],
    },
    personalEmail: {
      type: String,
      required: [true, 'Personal Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['member', 'admin', 'super_admin'],
      default: 'member',
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    branch: {
      type: String,
      trim: true,
      default: '',
    },
    batch: {
      type: String,
      trim: true,
      default: '',
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    codingProfiles: {
      leetcode: { type: String, default: '' },
      codeforces: { type: String, default: '' },
      codechef: { type: String, default: '' },
      geeksforgeeks: { type: String, default: '' },
      hackerrank: { type: String, default: '' },
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      portfolio: { type: String, default: '' },
      custom: [customProfileSchema],
    },
    projects: [projectSchema],
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
    },
    potwsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    hasSeenTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe JSON serialization (never leak password)
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);
export default User;
