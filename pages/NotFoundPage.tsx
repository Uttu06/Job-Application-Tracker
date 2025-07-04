
import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';
import Button from '../components/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
      <img src="https://picsum.photos/300/200?grayscale&blur=2" alt="Confused robot" className="w-64 h-auto mb-8 rounded-lg shadow-lg" />
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">Oops! Page Not Found.</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to={ROUTES.DASHBOARD}>
        <Button variant="primary" size="lg">
          Go to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
