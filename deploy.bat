@echo off
echo Building the application...
call npm run build

if not exist firebase.json (
  echo Initializing Firebase...
  call npx firebase init hosting
)

echo Deploying to Firebase...
call npx firebase deploy --only hosting

echo Deployment complete! 