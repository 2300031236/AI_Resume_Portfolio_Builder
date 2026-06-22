import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="pt-16">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div
            onClick={toggleSidebar}
            className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden"
          ></div>
        )}
        <main className="min-h-[calc(100vh-4rem)] p-4 transition-all duration-200 md:ml-64 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
