import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon, 
  ClipboardDocumentListIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: `/dashboard/${user?.role}`, current: true },
  ];

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <Disclosure as="nav" className="bg-white border-b border-blue-100 shadow-sm">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <div className="flex items-center">
                <div className="-ml-2 mr-2 flex items-center md:hidden">
                  <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                
                <div className="flex flex-shrink-0 items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <ClipboardDocumentListIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="hidden sm:block">
                      <h1 className="text-xl font-bold text-gray-900">ATS</h1>
                      <p className="text-xs text-gray-500">Application Tracking</p>
                    </div>
                    <h1 className="sm:hidden text-xl font-bold text-gray-900">ATS</h1>
                  </div>
                </div>

                <div className="hidden md:ml-8 md:flex md:items-center md:space-x-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        item.current 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700 border-transparent',
                        'border rounded-lg px-4 py-2 text-sm font-medium transition duration-200 ease-in-out'
                      )}
                      aria-current={item.current ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {user && (
                  <div className="hidden md:flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700 bg-blue-50 px-3 py-1 rounded-full capitalize">
                      {user.role}
                    </span>
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200">
                      <BellIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Menu as="div" className="relative">
                    <div>
                      <Menu.Button className="relative flex items-center space-x-3 rounded-lg bg-white p-2 text-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200">
                        <span className="sr-only">Open user menu</span>
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <UserCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                        </div>
                        {user && (
                          <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-gray-900">{user.email}</p>
                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                          </div>
                        )}
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-white py-2 shadow-lg ring-1 ring-gray-200 focus:outline-none">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                          <p className="text-sm text-gray-500 capitalize">{user?.role} Account</p>
                        </div>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={logout}
                              className={classNames(
                                active ? 'bg-blue-50 text-blue-700' : 'text-gray-700',
                                'block px-4 py-2 text-sm w-full text-left transition duration-200'
                              )}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden bg-white border-t border-blue-100">
            <div className="space-y-1 px-4 pb-3 pt-2">
              {user && (
                <div className="flex items-center space-x-3 px-2 py-3 border-b border-blue-100 mb-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
              )}
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={classNames(
                    item.current 
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                      : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700',
                    'block rounded-md px-3 py-2 text-base font-medium transition duration-200'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}