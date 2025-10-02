import { useState, useEffect } from 'react';

export const useInventory = (activeTab) => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);

  useEffect(() => {
    if (activeTab === 'inventory') {
      const fetchInventory = async () => {
        setLoadingInventory(true);
        try {
          const response = await fetch('http://a76fed65d95a44bf7b669ec7b60819ca-1275327048.ap-northeast-2.elb.amazonaws.com/api/analyzer/health');
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
