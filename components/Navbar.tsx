
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME, ROUTES } from '../constants';
import Button from './Button';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error("Logout failed", error);
      // Handle logout error display if needed
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to={user ? ROUTES.DASHBOARD : ROUTES.LOGIN} className="text-2xl font-bold text-primary">
              {APP_NAME}
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <NavLink to={ROUTES.DASHBOARD}>Dashboard</NavLink>
                <NavLink to={ROUTES.APPLICATIONS}>Applications</NavLink>
                {/* <NavLink to={ROUTES.COMPANIES}>Companies</NavLink> */}
                {/* <NavLink to={ROUTES.INTERVIEWS}>Interviews</NavLink> */}
                {/* <NavLink to={ROUTES.ANALYTICS}>Analytics</NavLink> */}
                <NavLink to={ROUTES.PROFILE}>Profile</NavLink>
                <Button onClick={handleLogout} variant="secondary" size="sm">Logout</Button>
              </>
            ) : (
              <>
                <NavLink to={ROUTES.LOGIN}>Login</NavLink>
                <NavLink to={ROUTES.REGISTER}>Register</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children }) => {
  // `isActive` can be used from `useMatch` or `useLocation` if specific styling is needed
  return (
    <Link
      to={to}
      className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
    >
      {children}
    </Link>
  );
};


export default Navbar;
