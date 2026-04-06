const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const run = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/devmatch');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Inject all users into the LIVE POOL
    const result = await User.updateMany({}, { 
        $set: { 
            isLocalParticipant: true, 
            hackathonId: 'CU-HACK-2026' 
        } 
    });

    console.log(`Successfully injected ${result.modifiedCount} users into Hackathon Mode (CU-HACK-2026)!`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

run();
