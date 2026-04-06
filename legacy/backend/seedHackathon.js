const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Load env vars
dotenv.config();

const hackathonUsers = [
  {
    name: "Alex Rivera",
    email: "alex.hackathon@demo.com",
    password: "password123",
    campus: { college: "Stanford" },
    state: "CA",
    isEmailVerified: true,
    onboardingCompleted: true,
    experienceLevel: { overall: "Advanced", yearsOfCoding: 3 },
    skills: [
      { name: "React", level: "Advanced" },
      { name: "Node.js", level: "Intermediate" },
      { name: "MongoDB", level: "Beginner" }
    ],
    hackathonId: "CU-HACK-2026",
    isLocalParticipant: true
  },
  {
    name: "Sarah Chen",
    email: "sarah.hackathon@demo.com",
    password: "password123",
    campus: { college: "MIT" },
    state: "MA",
    isEmailVerified: true,
    onboardingCompleted: true,
    experienceLevel: { overall: "Expert", yearsOfCoding: 5 },
    skills: [
      { name: "Python", level: "Expert" },
      { name: "TensorFlow", level: "Expert" },
      { name: "Data Science", level: "Advanced" }
    ],
    hackathonId: "CU-HACK-2026",
    isLocalParticipant: true
  },
  {
    name: "Rishi Singh",
    email: "rishi.hackathon@demo.com",
    password: "password123",
    campus: { college: "PEC" },
    state: "PB",
    isEmailVerified: true,
    onboardingCompleted: true,
    experienceLevel: { overall: "Advanced", yearsOfCoding: 4 },
    skills: [
      { name: "Rust", level: "Advanced" },
      { name: "C++", level: "Expert" }
    ],
    hackathonId: "CU-HACK-2026",
    isLocalParticipant: true
  },
  {
    name: "Neha Gupta",
    email: "neha.hackathon@demo.com",
    password: "password123",
    campus: { college: "Delhi University" },
    state: "DL",
    isEmailVerified: true,
    onboardingCompleted: true,
    experienceLevel: { overall: "Intermediate", yearsOfCoding: 2 },
    skills: [
      { name: "Python", level: "Intermediate" },
      { name: "React", level: "Intermediate" },
      { name: "Figma", level: "Advanced" }
    ],
    hackathonId: "CU-HACK-2026",
    isLocalParticipant: true
  }
];

const seedHackathonDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/devmatch');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    const salt = await bcrypt.genSalt(10);
    const createdUsers = [];

    // Delete ONLY existing mock hackathon users to avoid duplicates
    await User.deleteMany({ email: { $in: hackathonUsers.map(u => u.email) } });

    for (let u of hackathonUsers) {
      const hashedPassword = await bcrypt.hash(u.password, salt);
      const user = await User.create({
        ...u,
        passwordHash: hashedPassword
      });
      createdUsers.push(user);
    }
    
    console.log(`${createdUsers.length} hackathon participants seeded for CU-HACK-2026!`);
    process.exit(0);
  } catch (error) {
    console.error('Error with seed data:', error);
    process.exit(1);
  }
};

seedHackathonDatabase();
