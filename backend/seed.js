const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Team = require('./models/Team');

// Load env vars
dotenv.config();

const users = [
  {
    name: "Aisha Sharma",
    email: "aisha@demo.com",
    password: "password123",
    country: "India",
    state: "Punjab",
    isEmailVerified: true,
    onboardingCompleted: true,
    bio: "Full-stack architect specializing in clean React & Next.js aesthetics. I drink too much chai and love hackathons.",
    campus: { college: "Thapar Institute", city: "Patiala", region: "PB", department: "Computer Science", graduationYear: 2024 },
    experienceLevel: { overall: "Expert", yearsOfCoding: 5 },
    skills: [
      { name: "React", level: "Expert", verified: true },
      { name: "Next.js", level: "Advanced", verified: true },
      { name: "MongoDB", level: "Intermediate", verified: false }
    ],
    availabilityHours: 20
  },
  {
    name: "Rahul Verma",
    email: "rahul@demo.com",
    password: "password123",
    country: "India",
    state: "Punjab",
    isEmailVerified: true,
    onboardingCompleted: true,
    bio: "Backend developer constructing scalable APIs in Node.js. Always optimizing database queries.",
    campus: { college: "Chitkara University", city: "Rajpura", region: "PB", department: "Software Eng", graduationYear: 2025 },
    experienceLevel: { overall: "Advanced", yearsOfCoding: 3 },
    skills: [
      { name: "Node.js", level: "Expert", verified: true },
      { name: "Express", level: "Advanced", verified: true },
      { name: "PostgreSQL", level: "Intermediate", verified: false }
    ],
    availabilityHours: 15
  },
  {
    name: "Rishi Singh",
    email: "rishi@demo.com",
    password: "password123",
    country: "India",
    state: "Punjab",
    isEmailVerified: true,
    onboardingCompleted: true,
    bio: "AI and Systems programming aficionado. Exploring Rust and NLP.",
    campus: { college: "PEC", city: "Chandigarh", region: "PB", department: "Computer Science", graduationYear: 2023 },
    experienceLevel: { overall: "Expert", yearsOfCoding: 6 },
    skills: [
      { name: "Rust", level: "Advanced", verified: true },
      { name: "Python", level: "Expert", verified: true },
      { name: "Machine Learning", level: "Advanced", verified: true }
    ],
    availabilityHours: 35
  },
  {
    name: "Alex Rivera",
    email: "alex@demo.com",
    password: "password123",
    country: "USA",
    state: "California",
    isEmailVerified: true,
    onboardingCompleted: true,
    bio: "Frontend maestro. If it doesn't run at 60fps, it's broken.",
    campus: { college: "Stanford", city: "Stanford", region: "CA", department: "HCI", graduationYear: 2025 },
    experienceLevel: { overall: "Intermediate", yearsOfCoding: 2 },
    skills: [
      { name: "Figma", level: "Expert", verified: true },
      { name: "UI/UX", level: "Advanced", verified: false },
      { name: "React", level: "Intermediate", verified: false }
    ],
    availabilityHours: 20
  },
  {
    name: "Sarah Chen",
    email: "sarah@demo.com",
    password: "password123",
    country: "USA",
    state: "MA",
    isEmailVerified: true,
    onboardingCompleted: true,
    bio: "Machine learning enthusiast specializing in NLP and generative AI.",
    campus: { college: "MIT", city: "Cambridge", region: "MA", department: "AI/ML", graduationYear: 2024 },
    experienceLevel: { overall: "Expert", yearsOfCoding: 6 },
    skills: [
      { name: "Python", level: "Expert", verified: true },
      { name: "TensorFlow", level: "Advanced", verified: true }
    ],
    availabilityHours: 35
  },
  {
    name: "Simran Kaur",
    email: "simran@demo.com",
    password: "password123",
    country: "India",
    state: "Punjab",
    isEmailVerified: true,
    onboardingCompleted: true,
    bio: "Web3 Developer and Blockchain enthusiast building the decentralized future.",
    campus: { college: "GNDU", city: "Amritsar", region: "PB", department: "Computer Science", graduationYear: 2026 },
    experienceLevel: { overall: "Advanced", yearsOfCoding: 3 },
    skills: [
      { name: "Solidity", level: "Advanced", verified: true },
      { name: "Ethereum", level: "Expert", verified: true }
    ],
    availabilityHours: 30
  },
  {
    name: "Priya Patel",
    email: "priya@demo.com",
    password: "password123",
    country: "India",
    state: "Maharashtra",
    isEmailVerified: true,
    onboardingCompleted: true,
    bio: "Mobile app developer building cross-platform experiences.",
    campus: { college: "IIT Bombay", city: "Mumbai", region: "MH", department: "Software Engineering", graduationYear: 2024 },
    experienceLevel: { overall: "Intermediate", yearsOfCoding: 4 },
    skills: [
      { name: "Flutter", level: "Advanced", verified: true },
      { name: "React Native", level: "Intermediate", verified: false }
    ],
    availabilityHours: 25
  },
  {
    name: "David Kim",
    email: "david@demo.com",
    password: "password123",
    country: "Canada",
    state: "Ontario",
    isEmailVerified: true,
    onboardingCompleted: true,
    bio: "Cloud infrastructure and DevOps engineer. Securing the pipeline.",
    campus: { college: "University of Waterloo", city: "Waterloo", region: "ON", department: "Systems", graduationYear: 2023 },
    experienceLevel: { overall: "Advanced", yearsOfCoding: 5 },
    skills: [
      { name: "AWS", level: "Expert", verified: true },
      { name: "Docker", level: "Advanced", verified: true },
      { name: "Kubernetes", level: "Intermediate", verified: false }
    ],
    availabilityHours: 15
  },
  {
    name: "Neha Gupta",
    email: "neha@demo.com",
    password: "password123",
    country: "India",
    state: "Delhi",
    isEmailVerified: true,
    onboardingCompleted: true,
    bio: "Data Scientist obsessed with visualizing invisible patterns.",
    campus: { college: "Delhi University", city: "Delhi", region: "DL", department: "Data Science", graduationYear: 2025 },
    experienceLevel: { overall: "Advanced", yearsOfCoding: 4 },
    skills: [
      { name: "Python", level: "Expert", verified: true },
      { name: "Data Visualization", level: "Advanced", verified: true },
      { name: "SQL", level: "Advanced", verified: true }
    ],
    availabilityHours: 20
  },
  {
    name: "Karan Singh",
    email: "karan@demo.com",
    password: "password123",
    country: "India",
    state: "Punjab",
    isEmailVerified: true,
    onboardingCompleted: true,
    bio: "Full-Stack developer focused on intuitive enterprise applications.",
    campus: { college: "LPU", city: "Jalandhar", region: "PB", department: "Computer Applications", graduationYear: 2023 },
    experienceLevel: { overall: "Intermediate", yearsOfCoding: 2 },
    skills: [
      { name: "JavaScript", level: "Advanced", verified: true },
      { name: "Angular", level: "Intermediate", verified: false }
    ],
    availabilityHours: 40
  },
  {
    name: "Wei Chen",
    email: "wei@demo.com",
    password: "password123",
    country: "Singapore",
    state: "Singapore",
    isEmailVerified: true,
    onboardingCompleted: true,
    bio: "Cybersecurity analyst, red teamer, and CTF player.",
    campus: { college: "NUS", city: "Singapore", region: "SG", department: "Cybersecurity", graduationYear: 2024 },
    experienceLevel: { overall: "Expert", yearsOfCoding: 5 },
    skills: [
      { name: "Ethical Hacking", level: "Advanced", verified: true },
      { name: "C++", level: "Expert", verified: true }
    ],
    availabilityHours: 10
  },
  {
    name: "Manpreet Kaur",
    email: "manpreet@demo.com",
    password: "password123",
    country: "India",
    state: "Punjab",
    isEmailVerified: true,
    onboardingCompleted: true,
    bio: "Creative technologist blending art and code using Three.js and WebGL.",
    campus: { college: "Chandigarh University", city: "Mohali", region: "PB", department: "Interactive Media", graduationYear: 2026 },
    experienceLevel: { overall: "Advanced", yearsOfCoding: 4 },
    skills: [
      { name: "Three.js", level: "Advanced", verified: true },
      { name: "CSS/SASS", level: "Expert", verified: true },
      { name: "React", level: "Intermediate", verified: false }
    ],
    availabilityHours: 25
  }
];

const seedDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/devmatch');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Clear existing data
    await User.deleteMany();
    await Team.deleteMany();
    console.log('Database cleared.');

    // Seed users
    const salt = await bcrypt.genSalt(10);
    const createdUsers = [];

    for (let u of users) {
      const hashedPassword = await bcrypt.hash(u.password, salt);
      const user = await User.create({
        ...u,
        passwordHash: hashedPassword
      });
      createdUsers.push(user);
    }
    console.log(`${createdUsers.length} users seeded.`);

    // Seed teams
    const team1 = await Team.create({
      name: "AI Innovators",
      hackathonTrack: "Artificial Intelligence",
      maxSize: 4,
      requiredSkills: ["Python", "React", "Machine Learning"],
      minExperienceLevel: "Intermediate",
      description: "Building an AI-powered code reviewer for the upcoming national hackathon.",
      leader: createdUsers[1]._id, // Sarah Chen
      members: [createdUsers[1]._id, createdUsers[2]._id] // Sarah and David
    });

    const team2 = await Team.create({
      name: "Web3 Wizards",
      hackathonTrack: "Blockchain/Web3",
      maxSize: 3,
      requiredSkills: ["Solidity", "React", "Node.js"],
      minExperienceLevel: "Advanced",
      description: "Creating a decentralized platform for open-source project funding.",
      leader: createdUsers[0]._id, // Alex Rivera
      members: [createdUsers[0]._id] // Just Alex for now
    });

    // Update users with their new team IDs
    await User.findByIdAndUpdate(createdUsers[1]._id, { teamId: team1._id });
    await User.findByIdAndUpdate(createdUsers[2]._id, { teamId: team1._id });
    await User.findByIdAndUpdate(createdUsers[0]._id, { teamId: team2._id });

    console.log('Teams seeded.');
    
    console.log('\n--- DEMO ACCOUNTS ---');
    console.log('Login: alex@demo.com / password123 (Full-stack)');
    console.log('Login: sarah@demo.com / password123 (AI/ML)');
    console.log('---------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Error with seed data:', error);
    process.exit(1);
  }
};

seedDatabase();
