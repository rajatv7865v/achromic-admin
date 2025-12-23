import React from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className='min-h-screen flex flex-col bg-gray-50'>
      <Navbar />
      <div className='flex flex-1'>
        <aside className='w-64 bg-white shadow-md p-4'>
          <Sidebar />
        </aside>
        <main className='flex-1 p-6 overflow-auto'>{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;


