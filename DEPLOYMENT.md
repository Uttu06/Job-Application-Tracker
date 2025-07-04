# Job Application Tracker Deployment Guide

This guide provides detailed instructions for deploying the Job Application Tracker application to various hosting platforms.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Firebase account (for Firebase deployment)
- Git (for version control)

## Setup Before Deployment

1. **Firebase Configuration**

   Before deploying, you need to set up your Firebase project and update the configuration:

   1. Go to [Firebase Console](https://console.firebase.google.com/)
   2. Create a new project (or use an existing one)
   3. Enable Authentication (Email/Password and Google Sign-in)
   4. Create a Firestore database
   5. Enable Storage
   6. Get your Firebase configuration from Project Settings > General > Your Apps > Firebase SDK snippet > Config
   7. Create a `.env.local` file in the project root with the following content:

      ```
      VITE_FIREBASE_API_KEY=your_api_key
      VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
      VITE_FIREBASE_PROJECT_ID=your_project_id
      VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
      VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
      VITE_FIREBASE_APP_ID=your_app_id
      VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
      ```

   8. Update the `.firebaserc` file with your Firebase project ID:

      ```json
      {
        "projects": {
          "default": "your-firebase-project-id"
        }
      }
      ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Build the Application**

   ```bash
   npm run prepare-build
   ```

   This will create a production build in the `dist` directory.

## Deployment Options

### Option 1: Firebase Hosting (Recommended)

Firebase Hosting provides fast and secure hosting for web applications.

1. **Install Firebase CLI (if not already installed)**

   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**

   ```bash
   firebase login
   ```

3. **Deploy to Firebase**

   ```bash
   npm run deploy:firebase
   ```

   Or use the deployment script:

   - On Windows: `deploy.bat`
   - On Mac/Linux: `./deploy.sh` (make it executable first with `chmod +x deploy.sh`)

4. **Access Your Deployed Application**

   After successful deployment, Firebase will provide a URL where your application is hosted (typically `https://your-project-id.web.app`).

### Option 2: Vercel

Vercel is a cloud platform for static sites and serverless functions.

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy to Vercel**

   ```bash
   npm run deploy:vercel
   ```

   Or directly:

   ```bash
   vercel
   ```

4. **Configure Environment Variables**

   After the first deployment, go to the Vercel dashboard, select your project, and add the environment variables from your `.env.local` file.

### Option 3: Netlify

Netlify is a web developer platform with an intuitive git-based workflow.

1. **Install Netlify CLI**

   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**

   ```bash
   netlify login
   ```

3. **Deploy to Netlify**

   ```bash
   npm run deploy:netlify
   ```

   Or directly:

   ```bash
   netlify deploy
   ```

4. **Configure Environment Variables**

   After deployment, go to the Netlify dashboard, select your project, and add the environment variables from your `.env.local` file under Site settings > Build & deploy > Environment.

## Post-Deployment Steps

1. **Set Up Custom Domain (Optional)**

   All three platforms (Firebase, Vercel, and Netlify) support custom domains. Follow their respective documentation to set up your domain.

2. **Configure Security Rules**

   For Firebase, make sure to set up proper security rules for Firestore and Storage to protect your data.

3. **Test Your Application**

   After deployment, thoroughly test all features of your application to ensure everything works as expected.

## Troubleshooting

### Common Issues

1. **Blank Screen After Deployment**
   - Check browser console for errors
   - Verify that all environment variables are correctly set
   - Ensure Firebase configuration is correct

2. **Authentication Issues**
   - Verify that Authentication is enabled in Firebase Console
   - Check that the correct authentication methods are enabled

3. **Database Access Issues**
   - Check Firestore security rules
   - Verify database paths in your code

### Getting Help

If you encounter issues not covered in this guide, you can:

1. Check the Firebase, Vercel, or Netlify documentation
2. Search for solutions on Stack Overflow
3. Open an issue in the project repository

## Maintenance

After deployment, regularly:

1. Update dependencies to fix security vulnerabilities
2. Monitor application performance and errors
3. Back up your Firestore database

## Continuous Deployment

For a more streamlined workflow, consider setting up continuous deployment:

- **Firebase**: Connect to GitHub and set up automatic deployments on pushes to the main branch
- **Vercel**: Link your GitHub repository for automatic deployments
- **Netlify**: Connect to your Git provider for automatic builds and deployments

This will ensure that your application is always up-to-date with the latest changes in your repository. 