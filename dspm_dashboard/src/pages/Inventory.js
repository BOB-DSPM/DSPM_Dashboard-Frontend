import React from 'react';
import { useInventory } from '../hooks/useInventory';
import InventoryList from '../components/inventory/InventoryList';

const Inventory = ({ activeTab }) => {
  const { inventoryData, loadingInventory, error } = useInventory(activeTab);
  
  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 rounded-lg bg-red-100 text-red-700">
          <p className="font-medium">오류 발생</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}
      
      <InventoryList inventoryData={inventoryData} loading={loadingInventory} />
    </div>
  );
};

export default Inventory;