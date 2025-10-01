import React from 'react';
import { useInventory } from '../hooks/useInventory';
import InventoryList from '../components/inventory/InventoryList';

const Inventory = ({ activeTab }) => {
  const { inventoryData, loadingInventory, healthStatus, error } = useInventory(activeTab);
  
  return (
    <div className="space-y-4">
      {/* Health Status 표시 */}
      {healthStatus && (
        <div className={`p-4 rounded-lg ${
          healthStatus === 'healthy' ? 'bg-green-100 text-green-700' :
          healthStatus === 'unhealthy' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {healthStatus === 'healthy' && '✓ Health check passed'}
          {healthStatus === 'unhealthy' && '⚠ Health check failed'}
          {healthStatus === 'error' && '✗ Connection error'}
          {error && <p className="text-sm mt-1">{error}</p>}
        </div>
      )}
      
      <InventoryList inventoryData={inventoryData} loading={loadingInventory} />
    </div>
  );
};

export default Inventory;
