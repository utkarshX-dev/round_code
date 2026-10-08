import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initMailer } from './config/mailer.js';
import POTW from './models/POTW.js';
import { processPOTWPenalties } from './utils/penaltyWorker.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const checkPOTWDeadlines = async () => {
  try {
    const now = new Date();
    const expiredActivePOTWs = await POTW.find({
      status: 'active',
      deadline: { $lte: now },
      penaltyProcessed: false,
    });

    for (const potw of expiredActivePOTWs) {
      console.log(`POTW #${potw.weekNumber} deadline passed. Processing no-submission penalties...`);
      await processPOTWPenalties(potw._id);
      potw.status = 'closed';
      await potw.save();
      console.log(`POTW #${potw.weekNumber} marked closed and penalties applied.`);
    }
  } catch (err) {
    console.error('Error in POTW deadline worker:', err.message);
  }
};

const startServer = async () => {
  await connectDB();
  initMailer();

  // Periodic deadline worker
  setInterval(checkPOTWDeadlines, 5 * 60 * 1000);

  app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`🚀 ROUNDCode REST API Server running on port ${PORT}`);
    console.log(`⚡ Round Table DTU Coding & Skill Platform`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`=================================================\n`);
  });
};

startServer();
