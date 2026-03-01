const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });
const User = require('../models/User');

// Mapping old values to new values
const departmentMapping = {
  'Electronics': 'Information Technology',
  'Mechanical': 'Science',
  'Civil': 'Science',
  'Electrical': 'Information Technology',
  'Other': 'Other'
};

const courseMapping = {
  'B.Tech': 'BSc Computer Science',
  'M.Tech': 'MSc Computer Science',
  'BCA': 'BSc Computer Science',
  'MCA': 'MSc Computer Science',
  'MBA': 'BMS',
  'B.Sc': 'BSc IT',
  'M.Sc': 'MSc IT',
  'B.Com': 'BCom',
  'M.Com': 'MCom',
  'MA': 'BA',
  'B.E': 'BSc Computer Science',
  'M.E': 'MSc Computer Science',
  'Other': 'Other'
};

async function updateUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    let updated = 0;

    for (const user of users) {
      let needsUpdate = false;

      // Update department if it's an old value
      if (user.department && departmentMapping[user.department]) {
        console.log(`Updating ${user.email}: ${user.department} -> ${departmentMapping[user.department]}`);
        user.department = departmentMapping[user.department];
        needsUpdate = true;
      }

      // Update course if it's an old value
      if (user.course && courseMapping[user.course]) {
        console.log(`Updating ${user.email}: ${user.course} -> ${courseMapping[user.course]}`);
        user.course = courseMapping[user.course];
        needsUpdate = true;
      }

      if (needsUpdate) {
        await user.save({ validateBeforeSave: false });
        updated++;
      }
    }

    console.log(`✅ Updated ${updated} users`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateUsers();
