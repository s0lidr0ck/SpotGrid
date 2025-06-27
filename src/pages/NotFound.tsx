import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center">
          <div className="bg-blue-600 text-white p-3 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
              <polyline points="17 2 12 7 7 2"></polyline>
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          404 - Page Not Found
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Button as={Link} to="/" className="w-full">
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;