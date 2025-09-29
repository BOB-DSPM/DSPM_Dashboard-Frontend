import React from 'react';

const Sidebar = ({ tabs, activeTab, setActiveTab }) => (
  <div className="w-60 bg-white shadow-sm border-r">
    <div className="flex flex-col py-4 mt-12">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium text-left ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-600 border-r-4 border-blue-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-8 h-5" />
            <span>{tab.name}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export default Sidebar;
