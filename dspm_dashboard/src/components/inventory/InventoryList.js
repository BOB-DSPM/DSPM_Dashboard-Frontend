import React from 'react';
import { Database } from 'lucide-react';

const InventoryList = ({ inventoryData, loading }) => {
  if (loading) return <div>Loading inventory...</div>;

  console.log('InventoryList received:', inventoryData, 'isArray:', Array.isArray(inventoryData));

  // 데이터가 배열이 아니거나 비어있을 때
  if (!Array.isArray(inventoryData) || inventoryData.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Data Resources Inventory</h3>
        <p className="text-gray-500 text-center py-8">No inventory data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Data Resources Inventory</h3>
      <div className="space-y-3">
        {inventoryData.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Database className="w-5 h-5 text-gray-500" />
              <span className="font-medium">{item.name || 'Unknown'}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {item.type || 'N/A'}
              </span>
            </div>
            <span className="font-semibold">{item.count || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryList;
