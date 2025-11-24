require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const readline = require('readline');

// Get Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Validate Firebase config
const requiredEnvVars = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\n💡 Please create a .env file based on .env.example');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Helper function to get password securely from command line
function getPasswordFromInput() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Enter password (input will be hidden): ', (password) => {
      rl.close();
      resolve(password);
    });
    
    // Hide password input (works on Unix systems)
    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
    }
  });
}

async function createSuperAdmin() {
  try {
    // Get email and password from command line arguments or environment variables
    const email = process.argv[2] || process.env.SUPERADMIN_EMAIL;
    const password = process.argv[3] || process.env.SUPERADMIN_PASSWORD;
    
    if (!email) {
      console.error('❌ Email is required!');
      console.log('Usage: node create-superadmin.js <email> [password]');
      console.log('   Or set SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD in .env file');
      process.exit(1);
    }
    
    let finalPassword = password;
    if (!finalPassword) {
      console.log('Password not provided. Please enter it securely:');
      finalPassword = await getPasswordFromInput();
      
      if (!finalPassword) {
        console.error('❌ Password is required!');
        process.exit(1);
      }
    }
    
    // Validate password strength
    if (finalPassword.length < 8) {
      console.error('❌ Password must be at least 8 characters long!');
      process.exit(1);
    }
    
    console.log('Creating superadmin account...');
    
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      finalPassword
    );
    
    console.log('✅ Superadmin account created successfully!');
    console.log('📧 Email:', email);
    console.log('🆔 UID:', userCredential.user.uid);
    console.log('\n📝 Next steps:');
    
    console.log('1. Copy the UID above');
    console.log('2. Open admin-panel/src/contexts/AuthContext.tsx');
    console.log('3. Replace the superAdminUids array with:');
    console.log(`   const superAdminUids = ['${userCredential.user.uid}'];`);
    console.log('4. Save the file and restart your admin panel');
    console.log(`5. Login with ${email} / [your password]`);
    
    // Security reminder
    console.log('\n🔒 Security Reminder:');
    console.log('   - Never commit .env file to version control');
    console.log('   - Change the default password after first login');
    console.log('   - Use a strong, unique password');
    
  } catch (error) {
    console.error('❌ Error creating superadmin account:', error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n💡 The email already exists. You can:');
      console.log('1. Go to Firebase Console > Authentication > Users');
      console.log('2. Find superadmin@gmail.com');
      console.log('3. Copy the UID from there');
      console.log('4. Use that UID in your AuthContext.tsx file');
    }
  }
}

createSuperAdmin(); 