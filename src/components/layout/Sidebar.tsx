import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Tv, Settings, Building2, Film, CreditCard, CheckSquare, FileSpreadsheet, FileText, PlayCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'traffic_admin';

  // Navigation links
  const mainNavLinks = [
    {
      name: 'Dashboard',
      to: '/dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: 'Orders',
      to: '/orders',
      icon: <ClipboardList size={20} />,
    },
    {
      name: 'Campaigns',
      to: '/campaigns',
      icon: <Tv size={20} />,
    },
  ];

  // Additional links
  const additionalLinks = [
    {
      name: 'Brands',
      to: '/brands',
      icon: <Building2 size={20} />,
    },
    {
      name: 'Media',
      to: '/media',
      icon: <Film size={20} />,
    },
    {
      name: 'Payment Methods',
      to: '/payment-methods',
      icon: <CreditCard size={20} />,
    },

  ];

  // Admin only links
  const adminLinks = [
    {
      name: 'Drafts',
      to: '/admin/drafts',
      icon: <FileText size={20} />,
    },
    {
      name: 'Approvals',
      to: '/admin/approvals',
      icon: <CheckSquare size={20} />,
    },
    {
      name: 'Media Approvals',
      to: '/admin/media-approvals',
      icon: <PlayCircle size={20} />,
    },
    {
      name: 'Reconciliation',
      to: '/admin/reconciliation',
      icon: <FileSpreadsheet size={20} />,
    },
    {
      name: 'Settings',
      to: '/admin/settings',
      icon: <Settings size={20} />,
    },
  ];

  const activeClass = "bg-blue-700 text-white";
  const inactiveClass = "text-gray-500 hover:bg-gray-100";
  
  return (
    <aside className="w-64 h-screen sticky top-0 bg-white border-r border-gray-200 hidden md:block">
      <div className="h-full px-3 py-4 overflow-y-auto">
        <ul className="space-y-2 font-medium">
          {mainNavLinks.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.to}
                className={({ isActive }) => `
                  flex items-center p-2 rounded-lg
                  ${isActive ? activeClass : inactiveClass}
                `}
              >
                {link.icon}
                <span className="ml-3">{link.name}</span>
              </NavLink>
            </li>
          ))}
          
          <li className="pt-4 mt-4 border-t border-gray-200">
            <span className="text-xs font-semibold text-gray-400 px-2">RESOURCES</span>
          </li>
          
          {additionalLinks.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.to}
                className={({ isActive }) => `
                  flex items-center p-2 rounded-lg
                  ${isActive ? activeClass : inactiveClass}
                `}
              >
                {link.icon}
                <span className="ml-3">{link.name}</span>
              </NavLink>
            </li>
          ))}
          
          {isAdmin && (
            <>
              <li className="pt-4 mt-4 border-t border-gray-200">
                <span className="text-xs font-semibold text-gray-400 px-2">ADMIN</span>
              </li>
              {adminLinks.map((link) => (
                <li key={link.name}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) => `
                      flex items-center p-2 rounded-lg
                      ${isActive ? activeClass : inactiveClass}
                    `}
                  >
                    {link.icon}
                    <span className="ml-3">{link.name}</span>
                  </NavLink>
                </li>
              ))}
            </>
          )}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;