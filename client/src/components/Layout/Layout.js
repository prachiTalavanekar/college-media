import React from 'react';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {

  return (
    <div className="bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Mobile Header */}
      <Header />
      
      {/* Main Content */}
      <main className="main-content">
        <div className="mobile-container">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Layout;