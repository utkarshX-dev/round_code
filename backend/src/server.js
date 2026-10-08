import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initMailer } from "./config/mailer.js";
import POTW from "./models/POTW.js";
import { processPOTWPenalties } from "./utils/penaltyWorker.js";

const PORT = process.env.PORT || 5000;

const checkPOTWDeadlines = async () => {
  try {
    const now = new Date();

    const expiredActivePOTWs = await POTW.find({
      status: "active",
      deadline: { $lte: now },
      penaltyProcessed: false,
    });

    for (const potw of expiredActivePOTWs) {
      console.log(
        `POTW #${potw.weekNumber} deadline passed. Processing no-submission penalties...`
      );

      await processPOTWPenalties(potw._id);

      potw.status = "closed";
      await potw.save();

      console.log(
        `POTW #${potw.weekNumber} marked closed and penalties applied.`
      );
    }
  } catch (err) {
    console.error("Error in POTW deadline worker:", err.message);
  }
};

const startServer = async () => {
  try {
    console.log("🔥 Starting local ROUNDCode server...");

    await connectDB();

    initMailer();

    setInterval(checkPOTWDeadlines, 5 * 60 * 1000);

    app.listen(PORT, () => {
      console.log(`
=================================================
🚀 ROUNDCode REST API Server running on port ${PORT}
⚡ Round Table DTU Coding & Skill Platform
🔗 Health check: http://localhost:${PORT}/health
=================================================
`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

export default app;