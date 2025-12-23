import React from "react";
import DashboardLayout from "../../layout/dashboardLayout";

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <div className='space-y-4'>
        <h1 className='text-2xl font-semibold text-gray-800'>Dashboard</h1>
        <p className='text-gray-600'>
          Welcome to the admin dashboard. Overview and statistics will be displayed here.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
