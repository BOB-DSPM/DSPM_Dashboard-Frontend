import { useState, useEffect } from 'react';

export const useInventory = (activeTab) => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);

  useEffect(() => {
    if (activeTab === 'inventory') {
      const fetchInventory = async () => {
        setLoadingInventory(true);
        try {
          const response = await fetch('http://localhost:3001/inventory');
          const data = await response.json();
          setInventoryData(data);
        } catch (error) {
          console.error('Error fetching inventory data:', error);
        } finally {
          setLoadingInventory(false);
        }
      };
      fetchInventory();
    }
  }, [activeTab]);

  return { inventoryData, loadingInventory };
};
