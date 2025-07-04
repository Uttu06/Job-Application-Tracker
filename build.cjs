const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

console.log(`${colors.blue}=== Job Application Tracker Build Script ===${colors.reset}\n`);

// Check if firestoreCompat.ts exists
const firestoreCompatPath = path.join(__dirname, 'src', 'services', 'firestoreCompat.ts');
if (!fs.existsSync(firestoreCompatPath)) {
  console.error(`${colors.red}Error: firestoreCompat.ts not found at ${firestoreCompatPath}${colors.reset}`);
  console.error(`${colors.yellow}Please create the compatibility layer file before building.${colors.reset}`);
  process.exit(1);
}

// Check if .env.local exists
if (!fs.existsSync(path.join(__dirname, '.env.local'))) {
  console.log(`${colors.yellow}Warning: .env.local file not found.${colors.reset}`);
  console.log('Creating a template .env.local file with mock values...');
  
  const envContent = `VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id`;

  fs.writeFileSync(path.join(__dirname, '.env.local'), envContent);
  console.log(`${colors.green}Created .env.local template.${colors.reset}`);
  console.log(`${colors.yellow}Please update the values in .env.local with your Firebase configuration before deploying.${colors.reset}\n`);
}

// Run the build
try {
  console.log(`${colors.blue}Building the application...${colors.reset}`);
  execSync('npm run build', { stdio: 'inherit' });
  console.log(`${colors.green}Build completed successfully!${colors.reset}\n`);
} catch (error) {
  console.error(`${colors.red}Build failed:${colors.reset}`, error.message);
  process.exit(1);
}

// Check if the build directory exists
if (fs.existsSync(path.join(__dirname, 'dist'))) {
  console.log(`${colors.green}Build directory created at ./dist${colors.reset}`);
  console.log(`${colors.blue}You can now deploy the application using one of the following methods:${colors.reset}`);
  console.log(`${colors.yellow}1. Firebase:${colors.reset} Run 'firebase deploy' or use the deploy script`);
  console.log(`${colors.yellow}2. Vercel:${colors.reset} Run 'vercel'`);
  console.log(`${colors.yellow}3. Netlify:${colors.reset} Run 'netlify deploy'`);
} else {
  console.error(`${colors.red}Error: Build directory not found.${colors.reset}`);
}

console.log(`\n${colors.blue}=== Build Script Complete ===${colors.reset}`); 