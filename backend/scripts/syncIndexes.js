import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, closeDB } from '../src/config/db.js';
import '../src/models/User.js';
import '../src/models/POTW.js';
import '../src/models/Submission.js';
import '../src/models/Notification.js';
import '../src/models/RegistrationRequest.js';
import '../src/models/RatingHistory.js';
import '../src/models/AuditLog.js';
import '../src/models/PasswordResetToken.js';
import '../src/models/Post.js';

dotenv.config();

try {
  await connectDB();
  const models = Object.values(mongoose.models);
  for (const model of models) {
    await model.syncIndexes();
    console.log(`Indexes synchronized: ${model.modelName}`);
  }
} catch (error) {
  console.error('Index synchronization failed:', error.message);
  process.exitCode = 1;
} finally {
  await closeDB();
}
