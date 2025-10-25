import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  DocumentPlusIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon,
  QueueListIcon,
  UsersIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const navigation = {
    applicant: [
      { 
        name: 'Dashboard', 
        href: '/dashboard/applicant', 
        icon: HomeIcon,
        description: 'Overview & Statistics'
      },
      { 
        name: 'New Application', 
        href: '/dashboard/applicant/new', 
        icon: DocumentPlusIcon,
        description: 'Submit Application'
      },
    ],
    bot: [
      { 
        name: 'Dashboard', 
        href: '/dashboard/bot', 
        icon: HomeIcon,
        description: 'Processing Overview'
      },
      { 
        name: 'Process Queue', 
        href: '/dashboard/bot/queue', 
        icon: QueueListIcon,
        description: 'Manage Queue'
      },
    ],
    admin: [
      { 
        name: 'Dashboard', 
        href: '/dashboard/admin', 
        icon: HomeIcon,
        description: 'System Overview'
      },
      { 
        name: 'Applications', 
        href: '/dashboard/admin/applications', 
        icon: DocumentTextIcon,
        description: 'Manage Applications'
      },
      { 
        name: 'Analytics', 
        href: '/dashboard/admin/stats', 
        icon: ChartBarIcon,
        description: 'Reports & Statistics'
      },
      { 
        name: 'Users', 
        href: '/dashboard/admin/users', 
        icon: UsersIcon,
        description: 'User Management'
      },
    ],
  };

  const currentNavigation = navigation[user?.role] || [];

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-600 text-white';
      case 'bot':
        return 'bg-green-600 text-white';
      case 'applicant':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-blue-100 shadow-sm">
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getRoleColor(user?.role)}`}>
              <HomeIcon className="h-6 w-6" />
            </div>
            <div className="text-white">
              <h3 className="text-lg font-semibold">
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Panel
              </h3>
              <p className="text-blue-100 text-sm">Application Tracking System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="mb-4">
            <h4 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Navigation
            </h4>
          </div>
          
          {currentNavigation.map((item, index) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={classNames(
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-3 border-blue-600'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700',
                  'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105'
                )}
              >
                <div className={classNames(
                  isActive ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-blue-100',
                  'flex items-center justify-center w-10 h-10 rounded-lg mr-3 transition-colors duration-200'
                )}>
                  <item.icon
                    className={classNames(
                      isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600',
                      'h-5 w-5 transition-colors duration-200'
                    )}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-blue-100 bg-blue-50">
          <div className="flex items-center space-x-3 px-3 py-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role} Account
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}