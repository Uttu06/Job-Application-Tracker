import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  Mail, 
  Key, 
  Moon, 
  Sun, 
  Save,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import Card from '../../components/Card';

const ProfilePage: React.FC = () => {
  const { user, updateUserProfile, resetPassword } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsUpdating(true);
    setError(null);
    setSuccess(null);
    
    try {
      await updateUserProfile(displayName);
      setSuccess('Profile updated successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    
    setIsResettingPassword(true);
    setError(null);
    setSuccess(null);
    
    try {
      await resetPassword(user.email);
      setSuccess('Password reset email sent. Check your inbox!');
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setDropdownOpen(false);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Profile Card */}
        <Card className="col-span-1 p-6">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-white">
            <UserIcon className="mr-2 h-5 w-5" />
            User Profile
          </h2>
          
          {(error || success) && (
            <div className={`mb-4 rounded-md p-3 ${error ? 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
              <div className="flex items-center">
                {error ? (
                  <AlertTriangle className="mr-2 h-5 w-5" />
                ) : (
                  <CheckCircle className="mr-2 h-5 w-5" />
                )}
                <p>{error || success}</p>
              </div>
          </div>
        )}
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Display Name
                </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                  <UserIcon className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Your name"
                />
                </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  disabled
                  className="block w-full rounded-md border-gray-300 bg-gray-100 pl-10 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Email cannot be changed directly. Contact support for assistance.
              </p>
            </div>
            
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                  Save Changes
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={isResettingPassword}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {isResettingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Email...
              </>
            ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Reset Password
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>
        
        {/* Application Settings Card */}
        <Card className="col-span-1 p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Application Settings
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Theme
              </label>
              <div className="relative mt-2">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  <span className="flex items-center">
                    {theme === 'dark' && <Moon className="mr-2 h-4 w-4" />}
                    {theme === 'light' && <Sun className="mr-2 h-4 w-4" />}
                    {theme === 'system' && (
                      <div className="mr-2 flex h-4 w-4 items-center justify-center">
                        <Moon className="absolute h-3 w-3 origin-top-right -translate-x-1 rotate-45" />
                        <Sun className="absolute h-3 w-3 origin-bottom-left translate-x-1 -rotate-45" />
                      </div>
                    )}
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </span>
                </button>
                
                {dropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg dark:bg-gray-800">
                    <div className="py-1">
                      <button
                        type="button"
                        className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleThemeChange('light')}
                      >
                        <Sun className="mr-2 h-4 w-4" />
                        Light
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleThemeChange('dark')}
                      >
                        <Moon className="mr-2 h-4 w-4" />
                        Dark
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleThemeChange('system')}
                      >
                        <div className="mr-2 flex h-4 w-4 items-center justify-center">
                          <Moon className="absolute h-3 w-3 origin-top-right -translate-x-1 rotate-45" />
                          <Sun className="absolute h-3 w-3 origin-bottom-left translate-x-1 -rotate-45" />
                        </div>
                        System
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Choose your preferred theme mode
              </p>
            </div>
            
            {/* Additional settings can be added here */}
          </div>
        </Card>
      </div>
      
      {/* Account Management */}
      <Card className="mt-6 p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Account Management
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Export Your Data</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Download all your job applications and related data
            </p>
            <button
              type="button"
              className="mt-2 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              Export Data
            </button>
          </div>

          <div className="border-t pt-4 dark:border-gray-700">
            <h3 className="text-lg font-medium text-red-600 dark:text-red-400">Danger Zone</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              type="button"
              className="mt-2 inline-flex items-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              Delete Account
            </button>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
