import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const inputUri = process.argv[2] || process.env.MONGO_URI;

async function testConnection() {
  console.log('\n===================================================');
  console.log('   MongoDB Connection Diagnostic Test');
  console.log('===================================================\n');

  if (!inputUri || inputUri === 'memory') {
    console.error('❌ Error: No MongoDB connection string provided.');
    console.log('Usage:');
    console.log('  node scripts/testMongo.js "<your_mongodb_connection_string>"');
    console.log('Or set MONGO_URI in backend/.env');
    process.exit(1);
  }

  // Sanitize URI for safe console display (mask password)
  const maskedUri = inputUri.replace(/:([^@]+)@/, ':****@');
  console.log(`Connecting to: ${maskedUri}`);

  if (inputUri.includes('<db_username>')) {
    console.warn('\n⚠️ WARNING: Your URI still contains the placeholder "<db_username>".');
    console.warn('Replace <db_username> with your actual MongoDB Atlas database username!\n');
  }

  try {
    const startTime = Date.now();
    await mongoose.connect(inputUri, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: true,
    });
    const duration = Date.now() - startTime;

    console.log(`\n✅ Successfully connected to MongoDB in ${duration}ms!`);
    console.log(`• Host:      ${mongoose.connection.host}`);
    console.log(`• Port:      ${mongoose.connection.port || 'default'}`);
    console.log(`• Database:  ${mongoose.connection.name}`);
    console.log(`• ReadyState:${mongoose.connection.readyState} (1 = connected)`);

    // Perform ping
    const adminDb = mongoose.connection.db.admin();
    const pingResult = await adminDb.ping();
    console.log('• Ping test: ', pingResult);

    console.log('\n🎉 Your MongoDB Atlas configuration is ready to use with ROUNDCode!\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Connection Failed:');
    console.error(err.message);

    console.log('\n💡 Troubleshooting Tips:');
    if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
      console.log('1. Check your username and password: ensure <db_username> is replaced and password has no unencoded special characters.');
    } else if (err.message.includes('querySrv') || err.message.includes('ENOTFOUND')) {
      console.log('1. SRV DNS lookup failed. Try using the standard 3-host replica set connection string instead.');
      console.log('2. Check your internet connection or try public DNS (8.8.8.8 / 1.1.1.1).');
    } else if (err.message.includes('Server selection timed out')) {
      console.log('1. IP Whitelist issue: In MongoDB Atlas -> Network Access -> Add IP Address -> Add "0.0.0.0/0" (Allow access from anywhere).');
      console.log('2. Check firewall or VPN settings blocking port 27017.');
    }
    console.log('');
    process.exit(1);
  }
}

testConnection();
