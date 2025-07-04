import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Building2, 
  Calendar, 
  PieChart, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  Plus 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  currentPage: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const [isCollapsed, setIsCollapsed] = useState(!isOpen);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/applications', label: 'Applications', icon: <Briefcase size={20} /> },
    { path: '/companies', label: 'Companies', icon: <Building2 size={20} /> },
    { path: '/interviews', label: 'Interviews', icon: <Calendar size={20} /> },
    { path: '/analytics', label: 'Analytics', icon: <PieChart size={20} /> },
    { path: '/profile', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-width duration-300 ease-in-out flex flex-col h-full`}
    >
      {/* Sidebar Header */}
      <div className="px-4 py-5 flex items-center justify-between">
        {!isCollapsed && (
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            Job Tracker
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ChevronLeft 
            className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
          />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out ${
                  isActive 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-500' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <div className="mr-3">{item.icon}</div>
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}

        {/* Quick Add Application Button */}
        <div className="pt-4 px-1">
          <NavLink
            to="/applications/new"
            className="flex items-center justify-center py-2 rounded-md bg-primary-500 hover:bg-primary-600 text-white"
          >
            {isCollapsed ? (
              <Plus size={20} />
            ) : (
              <>
                <Plus size={18} className="mr-2" />
                <span>New Application</span>
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center py-2 px-3 w-full rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150 ease-in-out"
        >
          <LogOut size={20} className="mr-3" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 