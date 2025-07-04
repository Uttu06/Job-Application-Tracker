# Job Application Tracker

A comprehensive web application to track and manage your job applications, interviews, and job search progress.

## Features

- User authentication (login, registration, password reset)
- Job application management (add, edit, delete applications)
- Interview tracking
- Dashboard with statistics and analytics
- Document storage for resumes and cover letters
- Dark/light theme support

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Step 1: Clone the repository

```bash
git clone <repository-url>
cd job-tracker
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password and Google Sign-in)
4. Create a Firestore database
5. Enable Storage
6. Get your Firebase configuration from Project Settings > General > Your Apps > Firebase SDK snippet > Config

### Step 4: Configure environment variables

Create a `.env.local` file in the root directory with the following content:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Replace the placeholder values with your Firebase configuration.

### Step 5: Run the application locally

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Deployment

### Deploy to Firebase Hosting

1. Install Firebase CLI if not already installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Run the deployment script:
   - On Windows: `deploy.bat`
   - On Mac/Linux: `./deploy.sh` (make it executable first with `chmod +x deploy.sh`)

### Alternative Deployment Options

#### Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

#### Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy
   ```

## License

MIT
