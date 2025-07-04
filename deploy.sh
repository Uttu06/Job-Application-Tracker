#!/bin/bash

# Build the application
echo "Building the application..."
npm run build

# Initialize Firebase if not already done
if [ ! -f "firebase.json" ]; then
  echo "Initializing Firebase..."
  npx firebase init hosting
fi

# Deploy to Firebase
echo "Deploying to Firebase..."
npx firebase deploy --only hosting

echo "Deployment complete!" 