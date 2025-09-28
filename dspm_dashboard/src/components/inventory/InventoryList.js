import React from 'react';
import { Database } from 'lucide-react';

const InventoryList = ({ inventoryData, loading }) => {
  if (loading) return <div>Loading inventory...</div>;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Data Resources Inventory</h3>
      <div className="space-y-3">
        {inventoryData.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Database className="w-5 h-5 text-gray-500" />
              <span className="font-medium">{item.name}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{item.type}</span>
            </div>
            <span className="font-semibold">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryList;
