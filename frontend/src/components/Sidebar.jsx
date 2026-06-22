import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  ScanEye,
  MailCheck,
  Globe,
  Compass,
  Wrench,
  UserCircle,
  LogOut,
  Sparkles
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout, user } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/resume-builder', label: 'Resume Builder', icon: FileText },
    { to: '/ats-analyzer', label: 'ATS Analyzer', icon: ScanEye },
    { to: '/cover-letter', label: 'Cover Letter', icon: MailCheck },
    { to: '/portfolio-builder', label: 'Portfolio Generator', icon: Globe },
    { to: '/career-advisor', label: 'Career Advisor', icon: Compass },
    { to: '/ai-tools', label: 'AI Tools', icon: Wrench },
    { to: '/profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-slate-200/50 bg-white/80 pt-16 backdrop-blur-md transition-transform dark:border-slate-800/50 dark:bg-slate-900/85 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-full flex-col justify-between px-3 py-4">
        <ul className="space-y-2 font-medium">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={toggleSidebar}
                  className={({ isActive }) =>
                    `flex items-center rounded-xl p-3 text-slate-700 transition-all duration-200 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-indigo-400 ${
                      isActive
                        ? 'bg-indigo-50/80 text-indigo-600 shadow-sm shadow-indigo-100/50 dark:bg-indigo-950/40 dark:text-indigo-400 dark:shadow-none'
                        : ''
                    }`
                  }
                >
                  <Icon className="h-5 w-5 mr-3 transition-transform duration-200 group-hover:scale-110" />
                  <span>{link.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-slate-200/50 pt-4 dark:border-slate-800/50">
          {user && (
            <div className="mb-4 flex items-center px-3 py-2">
              <img
                src={user.profileImageUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                alt="Profile"
                className="h-10 w-10 rounded-full border border-slate-300 object-cover dark:border-slate-700"
              />
              <div className="ml-3 overflow-hidden">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="flex w-full items-center rounded-xl p-3 text-sm font-medium text-rose-600 transition-colors duration-200 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
