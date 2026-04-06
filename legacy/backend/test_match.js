const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const { createUserVector, calculateCosineSimilarity } = require('./algorithms/cosineSimilarity');

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/devmatch');
    const users = await User.find({ hackathonId: 'CU-HACK-2026', isLocalParticipant: true });
    console.log("Found", users.length, "users.");

    try {
        for (let i = 0; i < users.length; i++) {
        console.log("Checking user:", users[i].name, "Skills:", users[i].skills);
        const v1 = createUserVector(users[i].skills);
        }
        console.log("Successfully created vectors for all users.");
    } catch(err) {
        console.error("Crash!", err);
    }
    process.exit(0);
};

run();
