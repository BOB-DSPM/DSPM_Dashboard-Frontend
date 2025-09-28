import React from 'react';
import { useInventory } from '../hooks/useInventory';
import InventoryList from '../components/inventory/InventoryList';

const Inventory = ({ activeTab }) => {
  const { inventoryData, loadingInventory } = useInventory(activeTab);
  return <InventoryList inventoryData={inventoryData} loading={loadingInventory} />;
};

export default Inventory;
