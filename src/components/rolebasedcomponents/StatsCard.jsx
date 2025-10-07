import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color = 'blue', subtitle = '' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
    teal: 'bg-teal-100 text-teal-600',
    orange: 'bg-orange-100 text-orange-600'
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};
export default StatsCard;