import React from 'react';

const FacultyDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Welcome to Faculty Dashboard
              </h2>
              <p className="text-gray-500">
                Faculty dashboard content will be implemented here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;