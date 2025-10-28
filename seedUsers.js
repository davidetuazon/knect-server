const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const User = require('./src/features/user/user.model');

const MONGO_URI = 'mongodb://localhost:27017/knect';

async function createUsers(count = 30) {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // 🧹 Optional: clear users before re-seeding
  await User.deleteMany({});
  console.log('🧼 Cleared existing users');

  const users = Array.from({ length: count }, (_, i) => ({
    fullName: faker.person.fullName(),
    age: faker.number.int({ min: 18, max: 50 }),
    email: `user${i}@example.com`,
    password: 'password123',
    profilePhoto: faker.image.avatar(),
  }));

  const createdUsers = await User.insertMany(users);
  console.log(`✅ ${createdUsers.length} users created!`);

  // Add random likes and matches
  for (let user of createdUsers) {
    const likeCount = faker.number.int({ min: 0, max: 5 });
    const matchCount = faker.number.int({ min: 0, max: 3 });

    const others = createdUsers.filter(u => u._id.toString() !== user._id.toString());
    const randomLikes = faker.helpers.arrayElements(others, likeCount);
    const randomMatches = faker.helpers.arrayElements(others, matchCount);

    user.likes = randomLikes.map(u => ({
      user: u._id,
      likedAt: faker.date.past({ years: 2 }),
    }));

    user.matches = randomMatches.map(u => ({
      user: u._id,
      matchedAt: faker.date.past({ years: 1 }),
    }));

    await user.save();
  }

  console.log('✅ Random likes and matches added!');
  await mongoose.connection.close();
  console.log('🔒 Connection closed');
}

createUsers(30).catch(console.error);
