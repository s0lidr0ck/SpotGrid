import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, ChevronDown, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex items-center">
          <button
            data-drawer-target="logo-sidebar"
            data-drawer-toggle="logo-sidebar"
            aria-controls="logo-sidebar"
            type="button"
            className="p-2 mr-3 text-gray-600 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <Menu size={24} />
            <span className="sr-only">Open sidebar</span>
          </button>
          <Link to="/" className="flex items-center">
            <div className="bg-blue-600 text-white p-1.5 rounded mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                <polyline points="17 2 12 7 7 2"></polyline>
              </svg>
            </div>
            <span className="self-center text-xl font-semibold whitespace-nowrap">SpotGrid</span>
          </Link>
        </div>

        <div className="flex items-center md:order-2 relative">
          <button
            type="button"
            className="p-2 mr-3 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <Bell size={20} />
            <span className="sr-only">View notifications</span>
          </button>
          
          <button
            type="button"
            className="flex items-center text-sm bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="user-menu-button"
            aria-expanded={showProfileMenu}
            onClick={toggleProfileMenu}
          >
            <span className="sr-only">Open user menu</span>
            <div className="flex items-center bg-gray-100 p-1 rounded-full">
              <div className="rounded-full overflow-hidden bg-gray-300 flex items-center justify-center h-8 w-8">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex flex-col ml-2 mr-1">
                <span className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</span>
                <span className="text-xs text-gray-500">{user?.role === 'traffic_admin' ? 'Admin' : 'User'}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500 ml-1" />
            </div>
          </button>

          {showProfileMenu && (
            <div
              className="absolute top-full right-0 z-50 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu-button"
            >
              <div className="py-1" role="none">
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;