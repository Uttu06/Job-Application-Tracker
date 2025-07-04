# Job Application Tracker - Deployment Guide

## 🚀 Firebase Hosting Deployment

### Prerequisites
- Node.js installed on your local machine
- Firebase CLI installed globally: `npm install -g firebase-tools`
- Firebase project created (✅ Already done)

### Step-by-Step Deployment

#### 1. Download and Setup Locally
1. Download this project to your local machine
2. Navigate to the project directory
3. Install dependencies: `npm install`

#### 2. Firebase Authentication
```bash
# Login to Firebase (opens browser)
firebase login

# Verify you're logged in
firebase projects:list
```

#### 3. Initialize Firebase Project
```bash
# Connect to your Firebase project
firebase use job-application-tracker-1b0fd
```

#### 4. Build and Deploy
```bash
# Build the application
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### 🔧 Configuration Files Already Set Up
- ✅ `firebase.json` - Hosting configuration
- ✅ `.env.local` - Firebase environment variables
- ✅ `dist/` folder - Built application (after npm run build)

### 🌐 After Deployment
Your app will be available at:
`https://job-application-tracker-1b0fd.web.app`

### 🔄 Future Updates
To update your deployed app:
1. Make changes to your code
2. Run: `npm run build`
3. Run: `firebase deploy --only hosting`

## 📱 GitHub Repository Setup

### 1. Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Name it: `job-application-tracker`
4. Don't initialize with README (we already have files)
5. Click "Create repository"

### 2. Connect Local Repository to GitHub
```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/job-application-tracker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 🔒 Security Notes
- ✅ `.env.local` is excluded from Git (contains sensitive Firebase keys)
- ✅ `.env.example` is included as a template for other developers
- ✅ `node_modules/` and `dist/` are excluded from Git

### 🆘 Troubleshooting

#### Firebase Login Issues
```bash
# If login fails, try:
firebase logout
firebase login --reauth
```

#### Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

#### Permission Issues
```bash
# Check Firebase project access
firebase projects:list

# Switch project if needed
firebase use --add
```

### 📞 Need Help?
If you encounter any issues:
1. Check the Firebase Console for error logs
2. Verify your Firebase project settings
3. Ensure all environment variables are correct
4. Check that Firebase Hosting is enabled in your project

