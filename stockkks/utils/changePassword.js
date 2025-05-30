import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { fileURLToPath } from 'url';
import path from 'path';
import readline from 'readline';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to update admin password
async function changeAdminPassword(newPassword) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected for password update');
    
    // Find admin user
    const admin = await User.findOne({ username: 'admin' });
    
    if (!admin) {
      console.log('Admin user not found. Run the seedAdmin.js script first to create an admin account.');
      mongoose.disconnect();
      return;
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    admin.password = hashedPassword;
    await admin.save();
    
    console.log('Admin password updated successfully');
    mongoose.disconnect();
  } catch (err) {
    console.error('Error updating admin password:', err);
    process.exit(1);
  }
}

// Get new password from command line
rl.question('Enter new admin password: ', (newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    console.log('Password must be at least 6 characters long');
    rl.close();
    return;
  }
  
  rl.question('Confirm new password: ', (confirmPassword) => {
    if (newPassword !== confirmPassword) {
      console.log('Passwords do not match');
      rl.close();
      return;
    }
    
    changeAdminPassword(newPassword)
      .then(() => rl.close())
      .catch(err => {
        console.error('Error:', err);
        rl.close();
      });
  });
});

rl.on('close', () => {
  process.exit(0);
});
