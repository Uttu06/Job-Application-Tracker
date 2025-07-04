# GitHub Repository Setup Guide

## 📁 Setting Up Your GitHub Repository

### Step 1: Create Repository on GitHub
1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** button in the top right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `job-application-tracker`
   - **Description**: `A React-based job application tracking system with Firebase backend`
   - **Visibility**: Choose Public or Private
   - **❌ DO NOT** check "Add a README file" (we already have one)
   - **❌ DO NOT** check "Add .gitignore" (we already have one)
   - **❌ DO NOT** choose a license yet (you can add later)
5. Click **"Create repository"**

### Step 2: Connect Your Local Repository
After creating the repository, GitHub will show you commands. Use these:

```bash
# Navigate to your project directory
cd path/to/job-application-tracker

# Add GitHub as remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/job-application-tracker.git

# Rename main branch to 'main' (modern standard)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

### Step 3: Verify Upload
1. Refresh your GitHub repository page
2. You should see all your project files
3. Check that sensitive files are NOT visible:
   - ❌ `.env.local` should NOT be there
   - ✅ `.env.example` should be there
   - ❌ `node_modules/` should NOT be there
   - ❌ `dist/` should NOT be there

## 🔄 Future Updates

### Making Changes and Pushing Updates
```bash
# After making changes to your code
git add .
git commit -m "Description of your changes"
git push origin main
```

### Common Git Commands
```bash
# Check status of your files
git status

# See what changes you've made
git diff

# View commit history
git log --oneline

# Create a new branch for features
git checkout -b feature-name
git push -u origin feature-name
```

## 🌟 Repository Best Practices

### 1. Update README.md
Add information about:
- What the project does
- How to install and run it
- How to contribute
- License information

### 2. Add Topics/Tags
In your GitHub repository:
1. Click the ⚙️ gear icon next to "About"
2. Add topics like: `react`, `typescript`, `firebase`, `job-tracker`, `vite`

### 3. Enable GitHub Pages (Optional)
If you want to host a demo on GitHub Pages:
1. Go to repository Settings
2. Scroll to "Pages" section
3. Select source branch (usually `main`)
4. Choose folder (`/docs` or `/` root)

### 4. Set Up Branch Protection (Recommended)
1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable "Require pull request reviews"

## 🔐 Security Considerations

### Environment Variables
- ✅ `.env.local` is in `.gitignore` (never committed)
- ✅ `.env.example` shows structure without real values
- ✅ Firebase keys are kept secure

### Sensitive Information
Never commit:
- API keys or secrets
- Database passwords
- Personal information
- Large binary files

## 🆘 Troubleshooting

### Authentication Issues
```bash
# If you have 2FA enabled, use personal access token
# Go to GitHub Settings → Developer settings → Personal access tokens
# Generate new token and use it as password when prompted
```

### Permission Denied
```bash
# Check your remote URL
git remote -v

# If using HTTPS and having issues, try SSH
git remote set-url origin git@github.com:YOUR_USERNAME/job-application-tracker.git
```

### Large File Issues
```bash
# If you accidentally committed large files
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch path/to/large/file' --prune-empty --tag-name-filter cat -- --all
```

## 📞 Need Help?
- [GitHub Documentation](https://docs.github.com)
- [Git Handbook](https://guides.github.com/introduction/git-handbook/)
- [GitHub Desktop](https://desktop.github.com/) - GUI alternative to command line

