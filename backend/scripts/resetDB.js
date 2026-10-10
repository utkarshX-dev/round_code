import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../src/models/User.js';
import POTW from '../src/models/POTW.js';
import Submission from '../src/models/Submission.js';
import RatingHistory from '../src/models/RatingHistory.js';
import Notification from '../src/models/Notification.js';
import AuditLog from '../src/models/AuditLog.js';
import RegistrationRequest from '../src/models/RegistrationRequest.js';
import PasswordResetToken from '../src/models/PasswordResetToken.js';
import { connectRedis, disconnectRedis } from '../src/config/redis.js';
import { clearLeaderboardCache } from '../src/utils/cache.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

// Parse optional CLI arguments: --name, --dtuEmail, --personalEmail, --password
function parseCliArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--') && args[i + 1] && !args[i + 1].startsWith('--')) {
      const key = args[i].replace(/^--/, '');
      parsed[key] = args[i + 1];
      i++;
    }
  }
  return parsed;
}

const cliArgs = parseCliArgs();

const SUPER_ADMIN = {
  name: cliArgs.name || process.env.SUPER_ADMIN_NAME || 'Super Admin RoundCode',
  dtuEmail: cliArgs.dtuEmail || process.env.SUPER_ADMIN_DTU_EMAIL || 'president.rt@dtu.ac.in',
  personalEmail: cliArgs.personalEmail || process.env.SUPER_ADMIN_PERSONAL_EMAIL || 'superadmin@roundtabledtu.in',
  password: cliArgs.password || process.env.SUPER_ADMIN_PASSWORD || 'Password@123',
  role: 'super_admin',
  accountStatus: 'active',
  branch: cliArgs.branch || 'Computer Engineering',
  batch: cliArgs.batch || '2023',
  bio: 'President at Round Table DTU. Super Administrator with authority to onboard administrators and manage the platform.',
  skills: ['System Architecture', 'C++', 'Algorithms', 'Distributed Systems'],
  codingProfiles: {
    github: 'https://github.com/roundtable-dtu',
    linkedin: 'https://linkedin.com/company/round-table-dtu',
  },
};

async function reinitializeDatabase() {
  const uri = process.env.MONGO_URI;

  console.log(`\n${colors.cyan}${colors.bold}=============================================================`);
  console.log(`  🔄 ROUNDCode - Database Reinitialization Script`);
  console.log(`=============================================================${colors.reset}\n`);

  if (!uri) {
    console.error(`${colors.red}❌ Error: MONGO_URI is missing from backend/.env${colors.reset}`);
    process.exit(1);
  }

  const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
  console.log(`Connecting to: ${colors.dim}${maskedUri}${colors.reset}`);

  try {
    const connStartTime = Date.now();
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: true,
    });
    console.log(`Connected to MongoDB in ${Date.now() - connStartTime}ms (${mongoose.connection.name})\n`);

    await connectRedis();

    console.log(`${colors.yellow}🧹 Step 1: Purging all existing collections...${colors.reset}`);

    const [
      usersDeleted,
      potwsDeleted,
      submissionsDeleted,
      ratingHistoryDeleted,
      notificationsDeleted,
      auditsDeleted,
      requestsDeleted,
      tokensDeleted,
    ] = await Promise.all([
      User.deleteMany({}),
      POTW.deleteMany({}),
      Submission.deleteMany({}),
      RatingHistory.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      RegistrationRequest.deleteMany({}),
      PasswordResetToken.deleteMany({}),
    ]);

    await clearLeaderboardCache();

    console.log(`  • Users cleared:                 ${usersDeleted.deletedCount}`);
    console.log(`  • POTWs cleared:                   ${potwsDeleted.deletedCount}`);
    console.log(`  • Submissions cleared:             ${submissionsDeleted.deletedCount}`);
    console.log(`  • Rating History cleared:          ${ratingHistoryDeleted.deletedCount}`);
    console.log(`  • Notifications cleared:           ${notificationsDeleted.deletedCount}`);
    console.log(`  • Audit Logs cleared:              ${auditsDeleted.deletedCount}`);
    console.log(`  • Registration Requests cleared:   ${requestsDeleted.deletedCount}`);
    console.log(`  • Password Reset Tokens cleared:   ${tokensDeleted.deletedCount}`);

    console.log(`\n${colors.cyan}👑 Step 2: Creating exclusive Super Admin account...${colors.reset}`);

    const superAdmin = await User.create(SUPER_ADMIN);

    console.log(`  ✅ Super Admin created with ID: ${superAdmin._id}`);

    console.log(`\n${colors.cyan}📝 Step 3: Logging initial audit record and welcome notice...${colors.reset}`);

    await AuditLog.create({
      actorId: superAdmin._id,
      actorName: superAdmin.name,
      actorRole: superAdmin.role,
      action: 'DATABASE_INITIALIZATION',
      targetType: 'System',
      targetId: superAdmin._id.toString(),
      details: {
        message: 'Database reinitialized to clean state with Super Admin only',
        superAdminEmail: superAdmin.personalEmail,
        timestamp: new Date().toISOString(),
      },
    });

    await Notification.create({
      userId: superAdmin._id,
      type: 'system',
      title: 'Welcome to ROUNDCode',
      message: 'Database reinitialized successfully. You can now onboard Admins and publish weekly challenges.',
      link: '/admin/admins',
      isRead: false,
    });

    console.log(`\n${colors.green}${colors.bold}=============================================================`);
    console.log(`  🎉 DATABASE REINITIALIZED SUCCESSFULLY!`);
    console.log(`=============================================================${colors.reset}\n`);

    console.log(`${colors.bold}🔑 Super Admin Credentials:${colors.reset}`);
    console.log(`  • ${colors.bold}Name:${colors.reset}           ${superAdmin.name}`);
    console.log(`  • ${colors.bold}Personal Email:${colors.reset} ${colors.green}${SUPER_ADMIN.personalEmail}${colors.reset}  (Use this to log in)`);
    console.log(`  • ${colors.bold}DTU Email:${colors.reset}      ${SUPER_ADMIN.dtuEmail}`);
    console.log(`  • ${colors.bold}Password:${colors.reset}       ${colors.green}${SUPER_ADMIN.password}${colors.reset}`);
    console.log(`  • ${colors.bold}Role:${colors.reset}           ${colors.magenta}${superAdmin.role}${colors.reset}`);

    console.log(`\n${colors.bold}🚀 Next Steps:${colors.reset}`);
    console.log(`  1. Log in at:          ${colors.cyan}http://localhost:3000/login${colors.reset}`);
    console.log(`  2. Manage / Add Admins:${colors.cyan}http://localhost:3000/admin/admins${colors.reset}`);
    console.log(`  3. Post First POTW:    ${colors.cyan}http://localhost:3000/admin/potws${colors.reset}`);
    console.log(`  4. Review Members:     ${colors.cyan}http://localhost:3000/admin/registrations${colors.reset}\n`);

    await mongoose.disconnect();
    await disconnectRedis();
    process.exit(0);
  } catch (error) {
    console.error(`\n${colors.red}❌ Database reinitialization failed:${colors.reset}`, error);
    try {
      await mongoose.disconnect();
    } catch {}
    await disconnectRedis();
    process.exit(1);
  }
}

reinitializeDatabase();
